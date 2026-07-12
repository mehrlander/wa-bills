# bills/texts/index/

Structured metadata extracted from the full-text corpus in `bills/texts/`.
One JSONL file per biennium plus four cross-cutting reports. Built
2026-07-12 by a fan-out of parsing agents, one slice of the corpus each.

The corpus itself is raw HTM and XML bill documents (133,160 files, 4.08 GB).
This directory is the derived, queryable layer: 69,277 document records,
one line per source file, sized at roughly 38 MB total. It carries no bill
text, only extracted fields, so it is cheap to load and grep.

## Per-biennium index files

`<biennium>.jsonl` — one JSON object per source document, one per line.
Records are sorted by (chamber, bill number, version). For 2001-02 the
source is HTM (the server has no XML that far back); for 2003-04 forward
the source is XML.

### Record schema

| Key | Type | Meaning |
|---|---|---|
| `f` | string | Path relative to `bills/texts/`, e.g. `2025-26/Xml/House/1000.xml` |
| `bill` | int | Bill number parsed from the filename |
| `ver` | string | Version suffix after the bill number: `""` (base), `S`, `S2`, `S.E`, `E`, etc. See `version-suffixes.md` |
| `id` | string\|null | The document's own bill id line (see caveat below) |
| `type` | string\|null | Document type attribute; `null` for 2001-02 HTM |
| `session` | string\|null | Session string, e.g. `2025 Regular Session`, `2011 1st Special Session` |
| `sponsors` | string\|null | Sponsor line, whitespace-normalized, preserving `(originally sponsored by ...)` and `by request of ...` |
| `desc` | string\|null | Brief description / AN ACT relating-to clause |
| `rcw` | array | `{"cite": "43.155.020", "action": "amend"}` for each RCW section the bill acts on; `[]` if none |
| `secs` | int\|null | Count of bill sections |
| `bytes` | int | Source file size on disk |

Example (`2025-26/Xml/House/1000.xml`):

```json
{"f":"2025-26/Xml/House/1000.xml","bill":1000,"ver":"","id":"HB 1000","type":"bill","session":"2025 Regular Session","sponsors":"Representatives Walsh, Marshall, ...","desc":"Expanding the circumstances that may constitute a major violation of the uniform controlled substances act.","rcw":[{"cite":"9.94A.535","action":"amend"}],"secs":1,"bytes":18952}
```

### Coverage

| Biennium | Source | Records |
|---|---|--:|
| 2001-02 | HTM | 5,397 |
| 2003-04 | XML | 5,778 |
| 2005-06 | XML | 6,199 |
| 2007-08 | XML | 6,471 |
| 2009-10 | XML | 6,089 |
| 2011-12 | XML | 5,132 |
| 2013-14 | XML | 5,088 |
| 2015-16 | XML | 5,407 |
| 2017-18 | XML | 5,474 |
| 2019-20 | XML | 5,633 |
| 2021-22 | XML | 3,416 |
| 2023-24 | XML | 4,504 |
| 2025-26 | XML | 4,689 |
| **Total** | | **69,277** |

Record count equals the source file count for every biennium (verified). The
69,277 records span 46,477 distinct (biennium, chamber, bill) instruments and
carry 295,049 RCW cite instances; 53,186 records (77%) touch at least one RCW
section.

## Reports

- `integrity-report.md` — the corpus checked against `manifest.json`. All
  133,160 files present, sizes exact, nothing missing or extra, no file under
  200 bytes. The corpus verifies clean.
- `version-suffixes.md` — taxonomy of the 18 filename version suffixes
  (substitute stage `S`/`S2`/..., engrossment stage `E`/`E2`/...), each decoded
  and verified against a real document's long title.
- `format-notes.md` — a parsing-oriented survey of the format generations, for
  whoever builds extraction tooling next. Documents the HTM generations, the two
  XML schema eras, and where the transition falls.
- `coverage-report.md` — the text corpus cross-checked against the WSL API
  metadata (`wsl-api/`). Where the API pull is complete (2011-12 through
  2023-24), the text import has no missing bills; the metadata-only residual is
  appointments, resolutions, memorials, and initiatives that carry no bill text.

## Provenance notes and caveats

The index was built by four XML census agents (three biennia each), one HTM
agent (2001-02), and four report agents, run as a single fan-out. Each agent
inspected its slice, wrote a parser, and self-verified line counts and JSON
validity. Zero parse failures across all 69,277 records.

Two schema eras underlie the XML. The older LSC DTD schema (root
`<Bill type="introLN">`, `IntroducedBillHeader`) covers 2003-04 through 2013-14.
The newer 2012 namespaced schema (`<Bill type="bill"
xmlns="http://leg.wa.gov/2012/document">`, `BillHeading`/`ShortBillId`) covers
2015-16 forward. `format-notes.md` has the detail.

Known inconsistencies to reconcile before treating the index as uniform:

- **`id` format varies by era.** Long form (`HOUSE BILL 1000`) for 2001-02
  through 2019-20; short form (`HB 1000`) for 2021-22 through 2025-26. The two
  newer-schema agents chose different source elements (`LongBillId` vs
  `ShortBillId`). Normalize on read if you need one form.
- **`type` vocabulary varies.** `null` for 2001-02 HTM; `introLN` for the older
  XML; `bill` for the newer XML. It reflects the source document's own type
  attribute, not a normalized classification.
- **`action` vocabulary varies.** The XML census passes through the source's
  action codes (`amend`, `repeal`, `reen`, `recod`, `remd`, `decod`, `new`,
  `uncod`, ...). The 2001-02 HTM agent used the coarser set the source text
  supports (`amend`, `repeal`, `reenact`). Map to a common vocabulary before
  aggregating actions across the HTM/XML boundary.
- A small number of RCW cites carry `action: "new"` or `"uncod"` because `Cite`
  markup occasionally appears inside new or uncodified section bodies; these are
  references within added text, not amendments to existing law.

## Rebuilding

The per-agent parser scripts were written to the session scratchpad, not the
repo, so this directory is the artifact, not the toolchain. To rebuild or
extend, re-run the fan-out or write a single dispatching parser that sniffs the
root element (`<html>` vs old-DTD `<Bill>` vs namespaced `<Bill>`) per file;
`format-notes.md` gives the dispatch strategy.
