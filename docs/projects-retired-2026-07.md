# Retired: the `projects/` experiments

**Date:** 2026-07-19

The `projects/` tree was removed from the working tree on this date. It held
sixteen one-shot analysis experiments, built early while the author was first
using Claude Code on the web, each a separate session pointed at a budget bill
with a loose prompt to do something interesting. The full tree remains in git
history and is browsable at the last commit that contained it,
[`47dfded83`](https://github.com/mehrlander/wa-bills/tree/47dfded83/projects)
(`git show 47dfded83:projects/<path>` locally).

## Why they were retired

An agent-by-agent assessment on 2026-07-19 found no ongoing value:

- **They no longer run.** Eight of the sixteen produced output once but read
  their source bill XML from directories that were never committed, so a re-run
  now processes zero files. One never ran at all (`wa-budget-automation`, whose
  code imports across a `src/` layout that does not exist on disk). The seven
  that do run are generic paste-one-bill-in-a-textbox HTML pages with no bundled
  data.
- **The mature corpus supersedes all of them.** `bills/texts/` holds the
  full-text corpus across all eighteen biennia against their nine or ten
  cherry-picked files; `bills/studies/` does richer per-bill extraction on the
  same bills; `wsl-api/` carries the metadata. The `proviso-search-tool`
  prototype, for instance, is a dataless version of
  `bills/studies/SB-5167-S/extracted-data/proviso-search.html`, which ships with
  11,986 real extracted provisos.
- **Several outputs are misleading, not merely stale.** `analyze-bill-structures`
  documents HTM markup the real files do not use; `appropriations-timeline`
  reports a nonsensical $1,251B by double-summing line items;
  `map-agencies-programs` reports $0.00 total and 3,460 malformed agency names.
  Left browsable, these misinform a reader.

Nearly every project targets the same ten bills: budget bills 5167, 5187, 5195,
5200, 5693, 5950, and 5092, and policy bills 1210, 1281, and 1320. Three are
explicit v1/v2/v3 restatements of a single analysis idea. The set reads as
repeated first attempts at one problem, since superseded.

## Ideas noted

A few recurring concepts are recorded here so the retirement does not lose them.
The caveat is that several, especially the specified data schemas, most likely
reflect the original prompt rather than an independent finding, so they are
noted, not endorsed.

- **A budget line-item relational model.** Two projects converged on
  agencies to programs to accounts to appropriations, keyed by fund and fiscal
  year, with provisos as typed rows and a cross-references table. The
  convergence is the only reason it is worth a line.
- **Direct appropriation extraction from the bill XML** schema
  (`Appropriations/Appropriation/AccountName/DollarAmount`), rather than scraping
  fiscal PDFs or prose.
- **Cross-bill statutory analysis:** flagging statutes amended by two or more
  concurrent bills (a drafting-conflict signal single-bill studies cannot
  surface), and ranking bill pairs by shared citations.
- **Budget-version diff keyed by account plus fiscal year,** rolling per-line
  dollar deltas up to an agency total, so a version comparison is numeric rather
  than textual.
- **Two text techniques:** TF-IDF similarity across a bill's own sections to
  flag templated language, and a regex proviso-category taxonomy (the taxonomy
  already survives, refined, in the SB-5167 study).

## The sixteen

**analysis/**

- `analyze-bill-patterns-1` -- regex-parsed 10 bills into appropriation, agency,
  and account JSON with a browser explorer. Source XML uncommitted; no longer
  runs.
- `analyze-bill-patterns-2` -- a self-declared v2 of the above over 9 bills.
  Same approach, narrower.
- `analyze-bill-structures` -- prose guides on bill structure plus a partial
  extraction library and a 10-bill index. The HTM-format guide describes markup
  the real files do not use.
- `bill-language-analysis-tool` -- a single HTML page running client-side text
  analysis (n-grams, TF-IDF, readability) on pasted XML. Generic, no data.

**database/**

- `wa-budget-automation` -- a Node/SQLite parser for ESSB 5167 into normalized
  budget tables. Never ran (broken `src/` imports). The schema is the one item
  of note.
- `wa-budget-bills-database` -- a hand-compiled metadata table of 27 budget
  bills plus an elaborate, never-implemented content schema. Metadata superseded
  by `wsl-api/`.

**specialized/**

- `appropriations-timeline` -- a three-stage per-agency, cross-biennia funding
  pipeline. Totals are nonsensical and agency names are mangled.
- `budget-appropriations-explorer` -- a single HTML page turning pasted XML into
  a grid and charts. Generic, unverified schema.
- `map-agencies-programs` -- a Python regex scrape of agencies and funding into a
  D3 network. Broken outputs ($0 total, malformed entities); the action-verb
  taxonomy is the one idea.
- `map-wa-legal-site` -- a Python and Actions scaffold to download bill files.
  Never ran; the acquisition is subsumed by `bills/` and `wsl-api/`.
- `parse-statutory-references` -- a regex RCW/WAC citation parser over 9 bills
  with a citation network. Stale; superseded by the studies and `rcw/`. The
  cross-bill hotspot idea is noted above.

**viewers/**

- `budget-bill-comparison` -- a browser tool diffing two budget bills'
  appropriations by agency. The most domain-specific of the set; the natural
  reference if a maintained budget-diff view is ever built.
- `legislation-browser` -- an HTML page listing bill metadata by biennium from
  the `wsl-api/` CSVs. A thin re-display of mature data.
- `legislative-diff-viewer` -- an HTML page diffing pasted texts. A stock
  diff-match-patch wrapper never wired to real bill versions.
- `proviso-search-tool` -- paste budget XML, then search and filter provisos. A
  dataless version of the SB-5167 study's proviso search.
- `xml-bill-inspector` -- a drop-in XML inspector (tree, statistics, XPath,
  schema inference). Generic; the bill XML shape is now a solved problem.
