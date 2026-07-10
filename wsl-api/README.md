# wsl-api/

Everything from and around the Washington State Legislature web services
(`wslwebservices.leg.wa.gov`): the API's documentation, raw endpoint pulls,
derived joins, and the live per-biennium snapshots consumed by the
[web-tools wsl pages](https://github.com/mehrlander/web-tools/tree/main/pages/wsl-sync).

## Layout

```
wsl-api/
├── schema/          API documentation: API_CATALOG.json (machine-readable),
│                    API_REFERENCE.md, data dictionary, types/enums, WSDL specs
├── data/            Endpoint pulls, named by API method, plus derived joins
│   ├── GetLegislationSinceHistorical/   json/ + csv/, 9 biennia, 40K+ bills
│   ├── GetAllDocumentsByClass/          per-biennium document catalogs (URLs
│   │                                    into lawfilesext.leg.wa.gov)
│   ├── GetLegislationIntroducedSince.json, GetRcwCitesAffected.json
│   ├── LegislationSinceWithRcw.{json,csv} + scanner page (derived join)
│   ├── grouped_2025-26.json + generate-grouped.html (derived grouping)
│   └── index.json   metadata catalog with bill counts and file sizes
├── tools/           fetch/transform helpers, including the wsl-api.js
│                    kit lineage under tools/archive/
├── snapshots/       live per-biennium stores (see below)
└── fetch-data.mjs   the snapshot fetcher (see below)
```

Document-derived scans (content extracts, term indexes, topic sets) live in
[`../bills/`](../bills/), not here: this folder is API records and their
joins, `bills/` is what came out of the documents themselves.

## Historical pulls

`data/GetLegislationSinceHistorical/` holds full bill records by biennium:

| Biennium | Bills | | Biennium | Bills |
|---|---|---|---|---|
| 2009-10 | 2,318 | | 2019-20 | 5,766 |
| 2011-12 | 5,003 | | 2021-22 | 3,390 |
| 2013-14 | 4,906 | | 2023-24 | 4,800 |
| 2015-16 | 5,216 | | 2025-26 | 3,184 |
| 2017-18 | 5,577 | | **Total** | **40,160** |

These are point-in-time pulls. For the open biennium, the fresh data is in
`snapshots/`, not here.

## Snapshots

`snapshots/<biennium>/` holds the six stores the web-tools pages load at
boot: `legislation`, `prefiles`, `sponsors`, `rcws` (RCW cites affected per
bill, including the pension classification), `history`, `actions` (the last
two fetched only for pension/adjacent bills). `meta.json` records when the
snapshot was fetched and its counts.

[`fetch-data.mjs`](fetch-data.mjs) produces them (`npm run wsl-fetch`; see
its header for flags). Parsing is not implemented here: the script fetches
web-tools' dependency-free `lib/kits/wsl-core.js` at run time and executes
it exactly as the browser pages do, so both runtimes always run identical
transform and classification code.

The [`WSL fetch` Action](../.github/workflows/wsl-fetch.yml) runs it on a
session-aware schedule (daily December through April, monthly heartbeat
otherwise) and commits the result. Manual dispatch from the Actions tab
takes a biennium, a per-bill fetch cap, and a --full flag.
