# bills/texts/index/

Structured metadata extracted from the full-text corpus in `bills/texts/`.
One JSONL file per biennium from 2001-02 forward, plus five cross-cutting reports.

The corpus itself is raw HTM and XML bill documents (138,706 files, 4.29 GB).
This directory is the derived, queryable layer: **133,160 document records,
one line per indexed source file** (69,280 HTM, 63,880 XML), one record per file. It
carries no bill text, only extracted fields, so it is cheap to load and grep.

Both formats are indexed. HTM is rendered from the same bills as the XML, but
it is the human-readable artifact and, from 2015-16 forward, it carries
RCW hyperlinks the XML lacks. Each source file gets its own record, tagged by
`fmt`, so the two extractions can be compared (see `agreement-report.md`).

## Per-biennium index files

`<biennium>.jsonl` — one JSON object per source document, one per line, sorted
by (chamber, bill number, version, format). Every biennium holds both HTM and
XML records except 2001-02, which is HTM only (the server has no XML that far
back).

### Record schema

| Key | Type | Meaning |
|---|---|---|
| `f` | string | Path relative to `bills/texts/`, e.g. `2025-26/Xml/House/1000.xml` |
| `bill` | int | Bill number parsed from the filename |
| `ver` | string | Version suffix after the bill number: `""` (base), `S`, `S2`, `S.E`, `E`, etc. See `version-suffixes.md` |
| `id` | string\|null | Bill id in canonical short form, e.g. `HB 1000`, `ESHB 1000`, `2SSB 5000`. Uniform across both formats and all biennia |
| `type` | string\|null | Source document type: `bill`/`introLN` (XML) or `null` (HTM has none) |
| `session` | string\|null | Session string, e.g. `2025 Regular Session`, `2011 1st Special Session` |
| `sponsors` | string\|null | Sponsor line, whitespace-normalized, preserving `(originally sponsored by ...)` and `by request of ...` |
| `desc` | string\|null | Short description. XML uses the BriefDescription element; HTM uses the "AN ACT Relating to ..." title clause, so wording and capitalization differ slightly between the two formats for the same bill |
| `rcw` | array | `{"cite": "43.155.020", "action": "amend"}` for each RCW section the bill **acts on**, with action code; `[]` if none. See extraction note below |
| `secs` | int\|null | Count of bill sections |
| `bytes` | int | Source file size on disk |
| `fmt` | string | `Htm` or `Xml` |
| `rcw_links` | array | HTM only: the RCW cites the document **hyperlinks** (normalized `cite=` values), distinct, in document order. Populated 2015-16 forward; `[]` for older HTM and all XML |

Example twin records (`HB 1000`, 2025-26), HTM then XML:

```json
{"f":"2025-26/Htm/House/1000.htm","bill":1000,"ver":"","id":"HB 1000","type":null,"session":"2025 Regular Session","sponsors":"Representatives Walsh, ...","desc":"expanding the circumstances ...","rcw":[{"cite":"9.94A.535","action":"amend"}],"secs":1,"bytes":19819,"fmt":"Htm","rcw_links":["9.94A.535","9.94A.537","9.94A.585","..."]}
{"f":"2025-26/Xml/House/1000.xml","bill":1000,"ver":"","id":"HB 1000","type":"bill","session":"2025 Regular Session","sponsors":"Representatives Walsh, ...","desc":"Expanding the circumstances ...","rcw":[{"cite":"9.94A.535","action":"amend"}],"secs":1,"bytes":18952,"fmt":"Xml","rcw_links":[]}
```

### Coverage

| Biennium | HTM | XML | Records |
|---|--:|--:|--:|
| 2001-02 | 5,397 | 0 | 5,397 |
| 2003-04 | 5,778 | 5,778 | 11,556 |
| 2005-06 | 6,202 | 6,199 | 12,401 |
| 2007-08 | 6,471 | 6,471 | 12,942 |
| 2009-10 | 6,089 | 6,089 | 12,178 |
| 2011-12 | 5,132 | 5,132 | 10,264 |
| 2013-14 | 5,088 | 5,088 | 10,176 |
| 2015-16 | 5,407 | 5,407 | 10,814 |
| 2017-18 | 5,474 | 5,474 | 10,948 |
| 2019-20 | 5,633 | 5,633 | 11,266 |
| 2021-22 | 3,416 | 3,416 | 6,832 |
| 2023-24 | 4,504 | 4,504 | 9,008 |
| 2025-26 | 4,689 | 4,689 | 9,378 |
| **Total** | **69,280** | **63,880** | **133,160** |

Record count equals source file count for every biennium and format (verified).

## The RCW fields

Two RCW fields, and the distinction matters:

- **`rcw`** is the **acted-on set**: the RCW sections the bill amends, reenacts,
  repeals, recodifies, or decodifies, each with an action code
  (in HTM, `amend`, `reen`, `repeal`, `recod`, `decod`). For HTM it is parsed from the
  enacting-clause title ("AN ACT Relating to ...; amending RCW a, b; repealing
  RCW c; ..."), which by the state constitution's title requirement enumerates
  exactly the sections acted on. This is the authoritative amendment list. HTM
  and XML agree on this set for 99.3% of shared documents.

- **`rcw_links`** (HTM, 2015-16 forward) is the set of RCW cites the document
  **hyperlinks**. It is *not* the acted-on set: only about 64% of bills have
  their full acted-on set hyperlinked, and the links also include body
  cross-references. Use it as an enrichment and a cross-check, not as the
  amendment list.

The XML `rcw` field carries some cites with a **null action**; the cross-check
shows these are predominantly body cross-references the XML extraction picked
up, not acted-on sections. Filter XML `rcw` to non-null action, or use the HTM
`rcw`, for a clean acted-on set. See `agreement-report.md`.

## Reports

- `agreement-report.md` — full-corpus HTM vs XML cross-check. id and session
  match 100%; acted-on RCW set matches 99.3%; documents the hyperlink caveat
  and the XML null-action cross-references.
- `integrity-report.md` — the corpus checked against `manifest.json`. All
  138,706 files present, sizes exact, nothing missing, no file under 200 bytes.
- `version-suffixes.md` — taxonomy of the 18 filename version suffixes,
  each decoded and verified against a real document's long title.
- `format-notes.md` — parsing survey of the HTM generations and the two XML
  schema eras, including the amendatory strike/underline markup transition.
- `coverage-report.md` — the text corpus cross-checked against the WSL API
  metadata. Where the API pull is complete, the text import has no missing bills.

## Provenance and method

The HTM records were built by a single dispatching parser
(`fetch-texts` sibling tooling, run 2026-07-13) that sniffs the HTM generation
per file and works from rendered plain text with field-comment assist, scraping
RCW hyperlinks where present. It was validated against the XML index at each
step: id, session, and the acted-on RCW set were cross-checked on samples and
then over the full corpus before the build. The XML records were carried over
from the earlier XML census and augmented here with `fmt`, `rcw_links`, and the
normalized `id`.

Notes for anyone extending this:

- **`id` is now uniform.** The earlier split (long form pre-2021, short form
  after) is resolved: every record, both formats, uses canonical short form
  built from the document's own long title. Version prefixes follow WA
  convention (`ESHB`, `2SHB`, `E2SHB`, `2ESHB`, ...).
- **`desc` differs by format** for the same bill, because XML uses the
  BriefDescription element and HTM uses the AN ACT title clause. This is
  inherent to the sources, not an extraction inconsistency.
- **The XML `rcw` field is a candidate for the same title-based cleanup** used
  for HTM, which would drop its null-action cross-references.

## Rebuilding

This directory is the artifact, not the toolchain; the parser scripts live in
the build session, not the repo. To rebuild or extend, write a single
dispatching parser that sniffs the root element (`<html>` vs old-DTD `<Bill>`
vs namespaced `<Bill>`) per file; `format-notes.md` gives the dispatch strategy,
and for HTM the enacting-clause title is the reliable acted-on RCW source.
