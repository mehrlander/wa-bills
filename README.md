# wa-bills

The data home and research archive for Washington State legislation: bill
metadata, corpus scans, deep per-bill studies, fiscal notes, and the RCW.

This repo holds data; the pages that display it live in
[mehrlander/web-tools](https://github.com/mehrlander/web-tools) and fetch
from here. Code shared between the two (the WSL parsing and classification
kit) lives in web-tools; this repo's fetcher pulls it at run time. Domain
reference docs (like the bill hierarchy guide) are canonical here, and
web-tools points to them.

## The map

| Folder | What it is |
|---|---|
| [`wsl-api/`](wsl-api/) | The WSL web-services corpus: API schema, raw endpoint pulls (40K+ bills, 9 biennia), derived joins, and the live per-biennium [snapshots](wsl-api/README.md#snapshots) that the web-tools pages consume |
| [`bills/`](bills/) | Everything derived from bill documents: corpus-wide scans (content extracts, term indexes, topic sets) and [`studies/`](bills/studies/), ten bills analyzed in depth |
| [`fiscal-notes/`](fiscal-notes/) | OFM fiscal note data, 2011-12 through 2023-24, with the paste-join tool that populates it |
| [`rcw/`](rcw/) | The Revised Code of Washington: titles, chapters, full cite hierarchy, plus the pension chapter mapping |
| [`projects/`](projects/) | One-shot analysis experiments over the studied bills (viewers, databases, extractors). Exploratory, unmaintained, kept for reference |
| [`docs/`](docs/) | Domain reference (the [bill hierarchy guide](docs/hierarchy.md)) and dated repo surveys |
| [`archive/`](archive/) | Superseded copies whose live homes are now web-tools. See [ARCHIVE.md](archive/ARCHIVE.md) before touching anything here |

Top-level [`LegislationTrackerGH.html`](LegislationTrackerGH.html) is the
DRS bill tracker page; it loads from `wsl-api/data/` and `bills/content/`.

## Conventions

- **A corpus folder carries its own tools.** The fetch, join, and scan
  helpers live beside the data they populate (`fiscal-notes/fn-paste-join.html`,
  `wsl-api/fetch-data.mjs`, the scan pages inside `bills/`). No separate
  tools tree.
- **Scans go wide, studies go deep.** A scan visits every bill and keeps a
  few extracted fields or term counts; a study keeps everything about one
  bill. Both live under `bills/`.
- **Full bill texts are not stored.** The only raw bill documents here are
  the ten studies' `raw/` folders. `wsl-api/data/GetAllDocumentsByClass/`
  is the catalog of URLs to every document on `lawfilesext.leg.wa.gov`.
  `.gitignore` blocks `*.xml`/`*.htm`/`*.pdf` on purpose: adding bill
  documents requires a deliberate `git add -f`, so a bulk import is a
  decision, not an accident.

## Freshness

The [`WSL fetch` Action](.github/workflows/wsl-fetch.yml) refreshes
`wsl-api/snapshots/` on a session-aware schedule: daily December through
April (prefiling plus session), monthly heartbeat otherwise. The heartbeat
commit doubles as a freshness receipt: the history records "checked the
API on this date, nothing changed."
