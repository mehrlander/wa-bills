# pension-analysis/

A pension-bill dataset built over the full-text corpus (`bills/texts/`),
covering the twelve biennia with XML, 2003-04 through 2025-26. It pairs
the repo's RCW-citation classifier with a large language-model pass that
reads each bill's text. Built 2026-07-12.

## What is here

| File | Rows | What it is |
|---|---|---|
| `pension-bills-dataset.json` | 1,614 | The merged dataset: one row per bill that any method flagged as pension-related or pension-adjacent. |
| `sonnet-deep-reads.json` | 38 | Section-by-section analyst reads (provisions, statutory flags, points of interest) of a partial sample of confirmed pension bills. |
| `sonnet-hidden-scan.json` | 59 | Passage-level hunts through a partial sample of unclassified bills whose text is dense in pension terms. |
| `extract-pension.py` | | The citation extractor: reads every XML bill, pulls RCW cites (handling both the pre-2015 and current XML schemas), and applies the classification logic from `rcw/pension-rcw.js`. |

## Headline numbers

- **912 confirmed pension bills** across the twelve XML biennia.
- **828** were flagged by RCW citation alone (the classifier in
  `rcw/pension-rcw.js`, ported to Python here). This is the first time
  that classification has been run beyond 2025-26.
- **61** RCW-flagged bills were judged **not-pension** by the text read
  (a ~7% false-positive rate on the citation classifier: bills that cite
  a pension chapter incidentally, for example a public-records
  reorganization that happens to touch Title 41).
- **145** bills were caught by the text pass that citation missed. See
  the limitation below before reading this as 145 clean discoveries.

Per-biennium counts and the category and system distributions are at the
end of this file.

## Method

Three layers, cheapest first:

1. **Citation extraction (script, no model).** `extract-pension.py`
   walks all 59,991 XML bill files, extracts RCW cites from the
   `SectionCite`/`Cite` markup, and runs the pension classification.
   Output: `pension-sweep.json` (regenerable), the base layer.

2. **Text classification (Haiku, ~1,530 agents).** One agent per
   candidate bill reads the text and returns a summary, a category
   (benefits, contributions, funding, membership, governance,
   administration), the systems affected, and a not-pension flag. Run
   over three sets: the RCW-flagged pension bills; the RCW
   adjacent-only bills; and a term-screened set of bills the classifier
   never flagged but whose title mentions retirement terms.

3. **Analyst read (Sonnet, partial).** One agent per bill does a
   section-by-section read: every substantive provision with its cites,
   who is affected, statutory-mechanics flags (emergency clause,
   null-and-void-without-appropriation, retroactivity, narrow
   carve-outs), and points an experienced pension analyst would flag.
   A parallel hunt reads unclassified but pension-term-dense bills
   (appropriations and omnibus acts) for buried pension provisions.
   This layer was run as a bounded test and covers a sample, not the
   full set; `deep_*` and `hidden_*` fields are present only where it
   ran.

## Known limitations

- **The "145 caught" figure overstates genuine discoveries.** Of the
  bills the text pass flagged that citation missed, 97 are tagged
  `amends-pension-rcw`, meaning the model says they amend a pension
  chapter. That points at a gap in the citation extractor (`CITE_RX`
  and the chapter-only fallback miss some cite formats), not 97 bills
  hiding pensions in non-obvious ways. The genuinely novel catches are
  the ~48 tagged `benefit-adjacent`, `study-or-report`,
  `budget-or-appropriation`, or `new-pension-sections`. Reconciling the
  97 against a corrected extractor is open work.
- **2001-02 is absent.** The Legislature's XML archive begins at
  2003-04; 2001-02 exists only as HTM, which this extractor does not
  parse.
- **The Sonnet layer is a sample, not a census.** 38 deep reads and 59
  hidden-scan hunts, from a run stopped deliberately. The `is_pension`
  determination stands on layers 1 and 2 for the rest.
- **The XML classifier undercounts against the API snapshot.** For
  2025-26 it finds 56 pension bills where
  `wsl-api/snapshots/2025-26/rcws.json` (built from the WSL API's
  cite-affected data) finds 68. The API sees cites the amendatory XML
  does not carry inline.

## Row schema

Each row in `pension-bills-dataset.json`:

- `bill`, `biennium`, `shortId`, `brief`: identity and the official
  brief description.
- `rcw_pension`, `rcw_adjacent`, `PensionLabels`, `AdjacentLabels`,
  `PensionRcws`: the citation-classifier output.
- `haiku_summary`, `haiku_category`, `haiku_systems`: the text read.
- `triage_isPension`, `triage_how`, `triage_mechanism`, `triage_kind`:
  present for borderline bills (RCW-adjacent or term-screened).
- `deep_provisions`, `deep_flags`, `deep_whoAffected`, `deep_poi`,
  `deep_oneLine`: the Sonnet analyst read, where run.
- `hidden_verdict`, `hidden_how`, `hidden_passages`, `hidden_poi`: the
  Sonnet hidden-content hunt, for unclassified dense bills.
- `is_pension`: the merged determination.
- `confidence`: `rcw+llm` (both agree), `llm-caught` (text pass only),
  `rcw-rejected` (cited but read as not-pension).

## Distributions (confirmed pension bills)

Category: benefits 397, membership 143, administration 76, funding 65,
governance 46, contributions 40.

System (bills may touch several): PERS 460, TRS 410, LEOFF 328,
SERS 279, WSPRS 135, PSERS 112, JRS 68, JRA 35, JRF 24, DRS-general 23.

Per biennium (confirmed | RCW-only | false-pos | text-caught):

| Biennium | Pension | RCW | False-pos | Caught |
|---|--:|--:|--:|--:|
| 2003-04 | 125 | 101 | 2 | 26 |
| 2005-06 | 128 | 112 | 8 | 24 |
| 2007-08 | 101 | 97 | 10 | 14 |
| 2009-10 | 95 | 72 | 5 | 28 |
| 2011-12 | 85 | 77 | 5 | 13 |
| 2013-14 | 61 | 59 | 4 | 6 |
| 2015-16 | 73 | 69 | 6 | 10 |
| 2017-18 | 55 | 56 | 2 | 1 |
| 2019-20 | 60 | 55 | 4 | 9 |
| 2021-22 | 27 | 28 | 5 | 4 |
| 2023-24 | 52 | 46 | 3 | 7 |
| 2025-26 | 50 | 56 | 7 | 1 |
