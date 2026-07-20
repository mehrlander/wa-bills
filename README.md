# wa-bills

The data home and research archive for Washington State legislation: bill
metadata, corpus scans, full bill texts, fiscal notes, and the RCW.

This repo holds data; the pages that display it live in
[mehrlander/web-tools](https://github.com/mehrlander/web-tools) and fetch
from here. Code shared between the two (the WSL parsing and classification
kit) lives in web-tools; this repo's fetcher pulls it at run time. Domain
reference docs (like the bill hierarchy guide) are canonical here, and
web-tools points to them.

## Quick start

### I want to explore bills interactively
- **Legislation Tracker:** [`LegislationTrackerGH.html`](LegislationTrackerGH.html)

### I want to query bill data
- **WSL metadata (by biennium):** [`wsl-api/data/`](wsl-api/data/)
- **Full bill texts (corpus):** [`bills/texts/`](bills/texts/)

### I want to understand the repository
- **WSL corpus guide:** [`wsl-api/README.md`](wsl-api/README.md)
- **Bill corpus guide:** [`bills/README.md`](bills/README.md)
- **Bill hierarchy reference:** [`hierarchy.md`](hierarchy.md)

## The map

| Folder | What it is |
|---|---|
| [`wsl-api/`](wsl-api/) | The WSL web-services corpus: API schema, raw endpoint pulls (40K+ bills, 18 biennia), derived joins, and the live per-biennium [snapshots](wsl-api/README.md#snapshots) that the web-tools pages consume |
| [`bills/`](bills/) | Everything derived from bill documents: the full-text corpus ([`texts/`](bills/texts/)) and corpus-wide scans (content extracts, term indexes, topic sets) |
| [`fiscal-notes/`](fiscal-notes/) | OFM fiscal note data, 2011-12 through 2023-24, with the paste-join tool that populates it |
| [`rcw/`](rcw/) | The Revised Code of Washington: titles, chapters, full cite hierarchy, plus the pension chapter mapping |
| [`probes/`](probes/) | Dated, point-in-time repo surveys: a [documentation-claims audit](probes/audit-2026-07.md), notes on the retired [`projects/` experiments](probes/projects-retired-2026-07.md) and [`bills/studies/`](probes/studies-retired-2026-07.md), the [per-study data audit](probes/studies-audit-2026-07.md) behind that retirement, and a [large-files survey](probes/large-files-survey-2026-02.md). Each answers "what was true when checked," not a living reference |
| [`archive/`](archive/) | Superseded copies whose live homes are now web-tools. See [ARCHIVE.md](archive/ARCHIVE.md) before touching anything here |

Top-level [`hierarchy.md`](hierarchy.md) is the bill paragraph-numbering
reference: general and undated, unlike the dated surveys in `probes/`.

Top-level [`LegislationTrackerGH.html`](LegislationTrackerGH.html) is the
DRS bill tracker page; it loads from `wsl-api/data/` and `bills/content/`.

## Conventions

- **A corpus folder carries its own tools.** The fetch, join, and scan
  helpers live beside the data they populate (`fiscal-notes/fn-paste-join.html`,
  `wsl-api/fetch-data.mjs`, the scan pages inside `bills/`). No separate
  tools tree.
- **Scans go wide.** A scan visits every bill and keeps a few extracted
  fields or term counts; the scan pages live under `bills/`. (A per-bill
  deep-study tree, `bills/studies/`, was retired 2026-07-20; see
  [`probes/studies-retired-2026-07.md`](probes/studies-retired-2026-07.md).)
- **Full bill texts live in `bills/texts/`.** Imported 2026-07-11/12:
  all House and Senate bill documents, fourteen biennia (1999-00
  through 2025-26; XML from 2003-04), the full reach of the server's
  bill archive, verified against the source directory listings.
  `.gitignore` still blocks `*.xml`/`*.htm`/`*.pdf` everywhere else, so
  bill documents outside `bills/texts/` remain a deliberate `git add -f`
  decision.

## Freshness

The [`WSL fetch` Action](.github/workflows/wsl-fetch.yml) refreshes
`wsl-api/snapshots/` on a session-aware schedule: daily December through
April (prefiling plus session), monthly heartbeat otherwise. The heartbeat
commit doubles as a freshness receipt: the history records "checked the
API on this date, nothing changed."
