#!/usr/bin/env node
// fetch-data.mjs — fetcher for the WSL snapshot stores.
//
// Fetches the six stores the web-tools wsl pages consume, from Node (no
// CORS), and writes them as JSON under wsl-api/snapshots/<biennium>/.
// This repo (wa-bills) is the data home; the pages that display the
// snapshot live in mehrlander/web-tools (pages/wsl-sync/) and fetch it
// from here.
//
// Parsing is NOT reimplemented: web-tools' lib/kits/wsl-core.js is
// dependency-free, so this script fetches it from web-tools at run time and
// executes it exactly as the browser's gh.load does (a `new Function('gh',
// src)` body), injecting the same-version npm packages (fast-xml-parser@4.5.1,
// flat@6) through `makeParsers`. This script and the pages run the identical
// transform/classify code; the code home stays web-tools, the data home here.
//
// Usage (from repo root, after npm install):
//   npm run wsl-fetch                  incremental: refetch lists, fill missing
//   npm run wsl-fetch -- --full        refetch everything, including rcws
//   node wsl-api/fetch-data.mjs --since 1/1/2025 --biennium 2025-26 --limit 50
//   node wsl-api/fetch-data.mjs --core <url>   override the wsl-core.js source
//
// Requires direct network access to wslwebservices.leg.wa.gov and
// raw.githubusercontent.com (Node 18+ has global fetch). In a Claude Code
// web session the WSL host is typically blocked; the tell is an HTTP 403
// with `x-deny-reason: host_not_allowed`. The GitHub Action in this repo
// runs with open egress.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { flatten } from 'flat';

const here = path.dirname(fileURLToPath(import.meta.url));

// --- CLI ---------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name, dflt) => {
    const i = args.indexOf('--' + name);
    return i >= 0 ? args[i + 1] : dflt;
};
const BIENNIUM = opt('biennium', '2025-26');
// The legislation endpoint is date-based, not biennium-scoped; default the
// lower bound to the biennium's own start year so a past-year fetch reaches
// back far enough (and no further than needed).
const SINCE = opt('since', `1/1/${BIENNIUM.split('-')[0]}`);
const LIMIT = +opt('limit', 0);            // 0 = no cap on per-bill fetches
const CONCURRENCY = +opt('concurrency', 4);
const FULL = args.includes('--full');
// The parsing/classification core lives in web-tools; fetched, not vendored,
// so the two runtimes can't drift.
const CORE_URL = opt('core',
    'https://raw.githubusercontent.com/mehrlander/web-tools/main/lib/kits/wsl-core.js');

// Per-biennium output dir, so each biennium archives alongside the others
// (snapshots/2025-26/, snapshots/2023-24/, …) instead of overwriting.
const dataDir = path.join(here, 'snapshots', BIENNIUM);

// --- Store I/O ----------------------------------------------------------
const readStore = (name, empty) => {
    const p = path.join(dataDir, name + '.json');
    if (FULL || !existsSync(p)) return empty;
    return JSON.parse(readFileSync(p, 'utf8'));
};
const writeStore = (name, value) => {
    writeFileSync(path.join(dataDir, name + '.json'), JSON.stringify(value));
    const n = Array.isArray(value) ? value.length : Object.keys(value).length;
    console.log(`  wrote snapshots/${BIENNIUM}/${name}.json (${n} ${Array.isArray(value) ? 'items' : 'keys'})`);
};

const fetchText = async (url) => {
    const r = await fetch(url);
    if (!r.ok) {
        const deny = r.headers.get('x-deny-reason');
        throw new Error(`${r.status} on ${url}${deny ? ` (x-deny-reason: ${deny} — host not on the network allowlist)` : ''}`);
    }
    return r.text();
};

// Small fetch pool for the per-bill loops.
const pool = async (items, worker) => {
    let i = 0, done = 0;
    const run = async () => {
        while (i < items.length) {
            const item = items[i++];
            await worker(item);
            if (++done % 25 === 0 || done === items.length)
                process.stdout.write(`\r  ${done}/${items.length}`);
        }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
    if (items.length) process.stdout.write('\n');
};

// --- Main ---------------------------------------------------------------
// Run the dependency-free core exactly as the browser does — gh.load executes
// it as a `new Function('gh', src)` body — then inject Node's npm XML libs
// through makeParsers. Same bytes as the pages, no source rewrite.
const coreSrc = await fetchText(CORE_URL);
new Function('gh', coreSrc)({});
const core = globalThis.wslCore;
const { URLS, consolidate, getBillNumber } = core;
const { parseLegislationXml, parsePrefilesXml, parseSponsorsXml,
        parseRcwXml, parseHistoryXml, parseActionsXml } = core.makeParsers({ XMLParser, flatten });

mkdirSync(dataDir, { recursive: true });

console.log(`Biennium ${BIENNIUM}, since ${SINCE}${FULL ? ', --full refetch' : ' (incremental)'}`);

// 1. The three single-call stores — always refetched (cheap).
// `GetLegislationIntroducedSince` is date-based, so a since-date that reaches
// into a prior biennium returns those bills too — and BillId isn't unique
// across biennia, so filter to the target biennium before consolidate merges.
console.log('Legislation…');
const legislation = consolidate(parseLegislationXml(await fetchText(URLS.legislation(SINCE)))
    .filter(b => b.Biennium === BIENNIUM));
writeStore('legislation', legislation);

console.log('Prefiles…');
const prefiles = consolidate(parsePrefilesXml(await fetchText(URLS.prefiles()))
    .filter(b => b.Biennium === BIENNIUM));
writeStore('prefiles', prefiles);

console.log('Sponsors…');
writeStore('sponsors', parseSponsorsXml(await fetchText(URLS.sponsors(BIENNIUM))));

// 2. RCW cites — per-bill, incremental over existing rcws.json.
const allBills = [...legislation, ...prefiles];
const rcws = readStore('rcws', {});
let missing = allBills.filter(b => b.BillId && !rcws[b.BillId]);
if (LIMIT) missing = missing.slice(0, LIMIT);
console.log(`RCW cites: ${Object.keys(rcws).length} cached, fetching ${missing.length} of ${allBills.length} bills…`);
await pool(missing, async (b) => {
    const r = parseRcwXml(await fetchText(URLS.rcwFor(encodeURIComponent(b.BillId), BIENNIUM)), b.BillId);
    if (r) rcws[r.BillId] = r;
});
writeStore('rcws', rcws);

// 3. History + actions — only for bills classified pension/adjacent,
//    mirroring wsl-sync.html's summary mode.
const relevant = [...new Set(allBills
    .filter(b => {
        const r = rcws[b.BillId];
        return r && (r.isPension === '1' || (r.AdjacentLabels || '') !== '');
    })
    .map(getBillNumber).filter(Boolean))];

const history = readStore('history', {});
const needH = relevant.filter(n => !history[n]);
console.log(`History: fetching ${needH.length} of ${relevant.length} pension/adjacent bills…`);
await pool(needH, async (n) => {
    history[n] = parseHistoryXml(await fetchText(URLS.historyFor(n, BIENNIUM)), n) || [];
});
writeStore('history', history);

const actions = readStore('actions', {});
const needA = relevant.filter(n => !actions[n]);
console.log(`Actions: fetching ${needA.length} of ${relevant.length} pension/adjacent bills…`);
await pool(needA, async (n) => {
    actions[n] = parseActionsXml(await fetchText(URLS.actionsFor(n, BIENNIUM)), n) || [];
});
writeStore('actions', actions);

writeStore('meta', {
    fetchedAt: new Date().toISOString(),
    biennium: BIENNIUM,
    sinceDate: SINCE,
    counts: {
        legislation: legislation.length,
        prefiles: prefiles.length,
        rcws: Object.keys(rcws).length,
        history: Object.keys(history).length,
        actions: Object.keys(actions).length
    }
});
console.log('Done.');
