// wsl-api.js
// WSL Web Services API utilities
// https://wslwebservices.leg.wa.gov/

import { XMLParser } from 'https://cdn.jsdelivr.net/npm/fast-xml-parser@4.5.1/+esm';
import { flatten } from 'https://cdn.jsdelivr.net/npm/flat@6.0.0/+esm';

const parser = new XMLParser({ ignoreNameSpace: true, parseAttributeValue: true });

const BASE = 'https://wslwebservices.leg.wa.gov';

const ABBR = {
    'Companions.Companion.': 'c.',
    'CurrentStatus.': 'cs.',
    'ShortLegislationType.': 'slt.',
    'Sponsors.': 'ps.',
    'RCW.': 'r.'
};

export const endpoints = {
    legislation: (sinceDate) => `${BASE}/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${sinceDate}`,
    prefiles: () => `${BASE}/LegislationService.asmx/GetPrefiledLegislation`,
    sponsors: (biennium) => `${BASE}/SponsorService.asmx/GetSponsors?biennium=${biennium}`,
    rcw: (biennium, billId) => `${BASE}/LegislationService.asmx/GetRcwCitesAffected?biennium=${biennium}&billId=${billId}`
};

export const sanitize = v => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    if (v === true || v === 'true') return '1';
    if (v === false || v === 'false') return '0';
    let val = String(v).trim();
    if (val.startsWith('0001-01-01')) return null;
    const iso = val.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split('-');
        return `${+m}/${+d}/${y}`;
    }
    return val;
};

export const transform = r => {
    if (!r) return null;
    const f = flatten(r), out = {};
    for (let k in f) {
        let key = k.trim();
        if (['Companions', '', '\r', 'PK_Count'].includes(key)) continue;
        let val = sanitize(f[key]);
        if (val === null) continue;
        Object.entries(ABBR).forEach(([long, short]) => {
            if (key.startsWith(long)) key = key.replace(long, short);
        });
        out[key] = val;
    }
    return out;
};

export const consolidate = (recs, pk = 'BillId') => {
    const g = {};
    recs.forEach(r => { if (r?.[pk]) (g[r[pk]] = g[r[pk]] || []).push(r); });
    return Object.entries(g).map(([id, grp]) => {
        if (grp.length === 1) return { PK_Count: '1', ...grp[0] };
        const res = { PK_Count: String(grp.length) };
        const keys = [...new Set(grp.flatMap(Object.keys))];
        keys.forEach(k => {
            const v = [...new Set(grp.map(x => x[k]).filter(y => y != null))];
            res[k] = v.length > 1 ? v.sort().join('|') : v[0];
        });
        return res;
    });
};

const findArray = obj => {
    if (Array.isArray(obj)) return obj;
    if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj)) {
            const found = findArray(v);
            if (found) return found;
        }
    }
    return null;
};

export const fetchAndParse = async (url) => {
    const res = await fetch(url);
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const arr = findArray(parsed) || [parsed];
    return arr.map(transform).filter(Boolean);
};

// Convenience fetchers
export const getLegislation = (sinceDate) => fetchAndParse(endpoints.legislation(sinceDate));
export const getPrefiles = () => fetchAndParse(endpoints.prefiles());
export const getSponsors = (biennium) => fetchAndParse(endpoints.sponsors(biennium));
export const getRcw = (biennium, billId) => fetchAndParse(endpoints.rcw(biennium, billId));

export { ABBR };
