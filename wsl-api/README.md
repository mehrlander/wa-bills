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
│   ├── GetLegislationSinceHistorical/   json/ + csv/, 18 biennia, 95K+ records
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

`data/GetLegislationSinceHistorical/` holds full legislation records by
biennium, back to the WSL API's floor. `csv/` is the flattened raw pull (all
legislation types, every version, one row each); `json/` is the condensed
derivative (bills only, grouped by number, with a `versions[]` array and a
`final{}` disposition carrying passage, veto, chapter, and effective date).
Counts below are `csv/` rows.

| Biennium | Records | | Biennium | Records |
|---|---|---|---|---|
| 1991-92 | 4,951 | | 2009-10 | 5,954 |
| 1993-94 | 4,934 | | 2011-12 | 5,003 |
| 1995-96 | 5,306 | | 2013-14 | 4,906 |
| 1997-98 | 5,569 | | 2015-16 | 5,216 |
| 1999-00 | 5,427 | | 2017-18 | 5,577 |
| 2001-02 | 5,292 | | 2019-20 | 5,766 |
| 2003-04 | 5,594 | | 2021-22 | 3,390 |
| 2005-06 | 6,066 | | 2023-24 | 4,801 |
| 2007-08 | 6,398 | | 2025-26 | 5,245 |
| | | | **Total** | **95,395** |

### Provenance

All 18 biennia come from one pull. `GetLegislationByYear` reports the API's
floor in its own error text for earlier years ("Information is only available
back to 1991"), and a single `GetLegislationIntroducedSince` call with any
`sinceDate` at or before 1991-01-01 returns every biennium the service has,
1991-92 through the current one, in one response:

```
curl "https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=1990-01-01"
```

That response is ~165 MB of XML and is not checked in; only the derived
`csv/` and `json/` are kept. `tools/extract_historical_bulk.py` splits the
XML into per-biennium CSVs matching the column set here, and
`tools/transform_bills.py` builds the JSON from those CSVs. Pulled
2026-07-15.

The single early-`sinceDate` pull matters for completeness. `sinceDate`
filters on introduction date, so a pull dated inside a biennium's second
calendar year silently drops every bill whose life ended in the first year,
including bills enacted in the first (long) session. An earlier per-biennium
process left 2009-10 in exactly that state: it held only bills introduced in
2010, 312 enactments all stamped "Laws of 2010," with the entire 2009
enactment cohort (578 laws) absent. Regenerating all 18 biennia from the one
bulk pull removes that class of gap and puts every biennium on the same
footing. The middle biennia (2011-12 through 2023-24) were already pulled
with an early enough `sinceDate` and came out essentially unchanged; 2009-10
and the open 2025-26 are the ones the regeneration materially corrected or
freshened.

These are point-in-time pulls. For the open biennium, the continuously
refreshed data is in `snapshots/`, not here.

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
