# Studies Quality Audit: `bills/studies/`

**Date:** 2026-07-20
**Repository:** `/home/user/wa-bills`
**Scope:** the ten per-bill studies under [`bills/studies/`](../bills/studies/)

## Method

One reviewer agent per study, ten in parallel, each against the same rubric.
Each reviewer checked the study's extracted JSON against its own source
document in `raw/` (the bill XML, or HTM where no XML exists), not against the
study's prose. Where feasible the reviewer ran the extractor on Node v22 and
compared its output to the committed JSON. Findings below are the reviewers'
spot-checks reproduced against the source; dollar figures and counts are the
values measured on 2026-07-20.

This audit concerns data correctness and usefulness. It does not edit the
studies or their data. It records which fields a reader can trust and names the
one follow-up that would fix the shared defects.

## Scorecard

| Study | Type | Score | Headline defect |
|---|---|---|---|
| [SB-5167-S](../bills/studies/SB-5167-S/) | Operating (2025-27) | 3/5 | Drops ~25% of appropriations; cross-bill data mis-filed as this study's summary |
| [SB-5187-S](../bills/studies/SB-5187-S/) | Operating (2023-25) | 3/5 | $304.6B total double-counts amendatory strike/add (real total funds ~$150B) |
| [SB-5092-S](../bills/studies/SB-5092-S/) | Operating (2021-23), HTM-only | 3/5 | Drops ~44% of sections, including a real appropriation |
| [HB-1210-S2](../bills/studies/HB-1210-S2/) | Policy (cannabis terms) | 3/5 | "1,376 replacements" is the total strike count, not marijuana→cannabis |
| [HB-1281-S](../bills/studies/HB-1281-S/) | Policy (technical corrections) | 2.5/5 | RCW citations undercount 142 of 565 (regex misses letter-suffixed titles) |
| [SB-5693-S](../bills/studies/SB-5693-S/) | Supplemental (2021-23) | 2/5 | New amounts dropped; fiscal total reads −$98B on a spending increase |
| [SB-5950-S](../bills/studies/SB-5950-S/) | Supplemental (2023-25) | 2/5 | ~90% of account names collapse to "—"; total double-counted to $244.6B |
| [SB-5195-S](../bills/studies/SB-5195-S/) | Capital (2025-27) | 2/5 | Project-ID collisions corrupt every project and every fiscal total |
| [SB-5200-S](../bills/studies/SB-5200-S/) | Capital (2023-25) | 2/5 | "4,479 appropriations" 3.4x inflated by subtotal rows; a whole npm package vendored loose |
| [HB-1320-S2](../bills/studies/HB-1320-S2/) | Policy (protection orders) | 2/5 | Section numbers 100% blank; the 137 repeals not captured |

The set averages about 2.4. No study exceeds 3.

## The central finding

In every study, the structural layer is accurate and the headline number is
wrong. This holds across all ten regardless of bill type or extractor. What
verifies against the source: section and part counts, vote tallies, sponsors,
chapter law, effective dates, veto flags and veto text, agency and department
rosters, and individual line-item amounts, often to the cent. What does not
verify is the marquee statistic each study exists to produce.

- **Budgets:** every fiscal total is corrupted by amendatory strike/add
  handling. An amended appropriation carries an old figure (struck) and a new
  figure (added). The extractors either sum both (inflating the total: 5187,
  5950, 5167) or keep the wrong side (5693's negative total). None nets
  correctly. No dollar total in any of the seven budget studies is
  citation-grade.
- **Policy bills:** the domain count undercounts because the extraction regex
  is too strict. RCW citations with letter-suffixed titles (`9.94A`, `71A.12`)
  are silently dropped (1281 misses 142 of 565). Definitions that open with a
  lettered subsection are dropped (1320 misses 2 of 36). The "1,376
  replacements" headline in 1210 is the total strike count, not the
  marijuana→cannabis count (about 872 by the tool's own field).

## Systematic defects

Ordered by reader impact. Each is present in more than one study, so the fix is
shared, not per-study.

### A. Amendatory strike/add is never netted (all seven budgets)

Amended bills carry both the superseded (`amendingStyle="strike"`) and the
enacted (`amendingStyle="add"`) dollar amount. No extractor nets them.

- SB-5187-S sums both, producing `$304,584,371,000`; 110 of 314 blocks have an
  item-sum that disagrees with their own `AppropriationTotal`. Real total funds
  are on the order of $150B.
- SB-5950-S sums both (add $124.7B + strike $113.9B) to `$244,647,243,000`
  against a roughly $72B supplemental.
- SB-5693-S keeps struck line items but drops most add amounts, summing
  incomparable columns into a `change` of `−$98,160,350,000` on a bill that
  raises spending.
- SB-5167-S drops rows entirely when the amount is wrapped in markup (see E).

### B. Extraction regex too strict for domain tokens (policy bills, and 5167)

- HB-1281-S: `/RCW\s+(\d+)\.(\d+)\.(\d+)/` requires three all-digit groups, so
  every letter-suffixed citation (`9.94A`, `18.88A`, `71A.12`) fails to match.
  423 captured against 565 distinct in source; 142 real citations dropped, zero
  false positives. This is the citation style a technical-corrections bill
  leans on most.
- HB-1320-S2: definitions numbered `(5)(a) "Course of conduct"` and
  `(20)(a) "Isolate"` open with a lettered subsection the regex does not match,
  so 34 of 36 are captured.
- SB-5167-S: `parseInt` on a `<DollarAmount>` wrapped in `<TextRun>` (line
  vetoes, amended `((old))new` figures) returns `NaN`, and the row is then
  discarded (see E).

### C. Text-node flattening mangles names

When a name spans multiple XML text nodes separated by an em-dash `<TextRun>`,
the flatten step glues tokens together and relocates or strips the em-dash.

- SB-5950-S (worst): `getTextContent()` returns only nested `<TextRun>` content,
  so `General Fund` + `—` + `State Appropriation (FY 2024)` collapses to `"—"`.
  786 of 1,499 appropriations show `"—"`, 568 are empty, 145 (9.7%) carry real
  text.
- SB-5167-S (xml2js pipeline only): `FOR THE DEPARTMENT OF COMMERCECOMMUNITY
  SERVICES AND HOUSING —`. The regex pipeline (`HB5167-S-data.json`) is clean.
- SB-5200-S: `Washington State Library-Archives BuildingAccount—State`.
- SB-5195-S: 19 accounts, e.g. `...Underground StorageTank`.
- Absent (clean) in SB-5187-S, SB-5693-S, HB-1320-S2, and the SB-5092-S agency
  names. This defect is pipeline-dependent, not universal.

### D. Row-count inflation and miscount (capital budgets)

- SB-5200-S: "4,479 appropriations" counts 550 appropriation + 764
  reappropriation = 1,314 real funding lines plus 3,165 informational rows
  (prior/future biennia, subtotals, totals); 1,193 are flagged `isTotal: true`.
  "923 projects" is 668 distinct ids (148 duplicated).
- SB-5195-S: `projectMap` is keyed on the 8-digit project id alone, but that id
  is reused across agencies. First-section-wins on name and last-block-wins on
  fiscal totals corrupt `projects[]` and every `fiscalImpact` rollup; 788
  reported against 1,064 distinct agency+project pairs. The flat
  `appropriations[]` array, which keeps the `agency` attribute, is correct.

### E. Silent completeness loss

- SB-5092-S: captures 243 of roughly 437 `Sec.` headers; drops Sec. 801 (a real
  appropriation in table markup), 601, 951-999, and all 1000+ sections, then
  reports "243 (100%)".
- SB-5167-S: drops 508 individual appropriations (about 25%), all the
  amended/supplemental and vetoed line items, via the `parseInt` NaN path in B.
- HB-1320-S2: section `number` is the blank stub `"Sec. .  "` on all 172
  sections, and content is empty on 74 of 172, so a definition or amendment
  cannot be mapped back to its section.
- SB-5693-S: keeps 440 of 3,882 `add` runs (empty-account-name adds skipped).

### F. Broken joins and dead fields

- SB-5693-S: every appropriation has `agency: ""` and every agency record has
  `agencyCode: ""`, so the README's own headline query
  `_.filter(data.appropriations, {agency: 'DEPARTMENT OF COMMERCE'})` returns
  nothing.
- SB-5200-S: `agencyCode` is `null` on all 923 projects; all 71 agencies carry
  `totalAppropriation: 0`. The documented `agencyCode` filter returns nothing.
- SB-5195-S: `fiscalImpact.byDepartment` has 38 entries against 40 departments.

### G. Docs vouch for the wrong number

Each study's README or ANALYSIS confidently prints the broken headline, so the
prose does not catch the extraction error, it repeats it. Corrections have been
partial.

- SB-5092-S: the earlier repo audit fixed the counts in `README.md` (839
  appropriations, 256 fund types, ~1.1 MB) but the discredited figures
  (1,847 / 287 / 15-25 MB) still stand in `ANALYSIS.md` and `schema.md`.
- Manifest errors: `bills-manifest.json` lists HB-1281-S session as 2023 (the
  bill is the 2025 session); it lists SB-5187-S `agencies: 27` while the data
  array holds 212.
- SB-5950-S `ANALYSIS.md` advises "handle amendments carefully to avoid
  double-counting," which is exactly what the pipeline fails to do.

### H. Hygiene

- SB-5200-S: about half the folder is a loose copy of the `@xmldom/xmldom@0.8.11`
  npm package (`dom.js`, `sax.js`, `entities.js`, plus a foreign `LICENSE`,
  `SECURITY.md`, `CHANGELOG.md`, `readme.md`), already declared as a dependency
  in `package.json`.
- Most extractors hardcode a source path (`__dirname/<bill>.xml` or an absolute
  repo-root path) that does not match the `raw/` layout, so they fail with
  ENOENT as committed and run only after the source is copied beside the script.
- SB-5167-S `extract-provisos.js` globs every `*.xml` in its run directory, so
  `provisos.json` and `data-summary.json` hold six bills' data mis-filed inside
  the SB-5167 study; the "11,986 provisos / 7,156 appropriations" there are
  cross-bill totals, not SB-5167 figures (the SB-5167-only proviso count is
  3,439).
- Naming is inconsistent: `HB5167-S-data.json` for a Senate bill, and
  `SCHEMA.md` / `schema.md` / `schema-documentation.md` / `json-schema.md`
  across studies.

## Trust map

For a reader using this data as-is:

**Reliable** (verified against source across the set):

- Section and part counts, and part titles.
- Passage votes, sponsors, chapter law, effective dates.
- Veto flags and veto text.
- Agency and department rosters as names, except where collapsed by defect C
  (SB-5950-S, and the SB-5167-S xml2js output).
- Individual line-item dollar amounts as literal values (the strike side is
  faithful to the source).
- SB-5167-S proviso extraction: 3,439 numbered provisos with amounts and
  rule-based categories. This is the standout deliverable, useful and correct.

**Not reliable** (recompute before citing):

- Every fiscal total and rollup in the budget studies (defect A).
- Fiscal-year breakdowns (partial or empty in 5187, 5693, 5950).
- RCW-reference and legal-definition counts in the policy bills (defect B).
- Account-name string fields in SB-5167-S (xml2js), SB-5195-S, SB-5200-S, and
  SB-5950-S (defect C).
- Project and appropriation counts in the capital budgets (defect D).
- The "1,376 term replacements" headline in HB-1210-S2.
- Any agency-keyed join in SB-5693-S, SB-5200-S, or SB-5195-S (defect F).

## Consistency

Poor at the code level, uniform at the failure level. Each study was a separate
one-shot session that rebuilt the extractor from scratch. The set uses at least
four parsing stacks (raw regex, xml2js, jsdom, `@xmldom/xmldom`), ten scripts,
and ten distinct bug sets. The same five or six defects recur because the same
problems (amendatory netting, text-node names, letter-suffixed citations,
subtotal rows) were each solved independently and each solved wrong. This is the
same "repeated first attempts at one problem" pattern the retired `projects/`
tree showed. The difference is that these attempts ship real, partially correct
data, and their structural layer is sound.

## Follow-up

The budget studies share defects A, C, and E; the policy studies share B; the
capital studies share D. These are not ten problems, they are about five,
duplicated. The durable fix is one shared extractor, placed in `web-tools` where
the repo's README says shared code belongs, with:

- amendatory netting (read `amendingStyle`, net strike against add, keep both as
  labeled fields),
- a citation regex that accepts letter-suffixed titles and chapters,
- name assembly that walks text nodes and preserves the em-dash separator,
- explicit exclusion of `isTotal`/subtotal/biennia rows from appropriation
  counts, and a project key of agency plus project id,
- validation of each output against the source (section count, appropriation
  count, a checksum of dollar totals) so a bad run fails loudly.

Re-run over all ten, that turns `bills/studies/` from ten one-shot extractions
into a data layer over one validated kit. This audit is the input to that work,
not a substitute for it. The studies stay in place; their structural data is
usable today with the trust map above.
