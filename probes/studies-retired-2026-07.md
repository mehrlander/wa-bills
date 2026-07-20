# Retired: the `bills/studies/` per-bill studies

**Date:** 2026-07-20

The `bills/studies/` tree was removed from the working tree on this date. It
held ten per-bill "studies," each a one-shot session pointed at a single bill
(seven budget bills, three policy bills) that parsed the bill into structured
JSON, wrote a browser viewer and several analysis documents, and committed the
raw source alongside. The full tree remains in git history and is browsable at
the last commit that contained it,
[`82548b9fe`](https://github.com/mehrlander/wa-bills/tree/82548b9fe/bills/studies)
(`git show 82548b9fe:bills/studies/<path>` locally).

## Why they were retired

A per-study data audit on 2026-07-20 verified each study's extracted JSON
against its source document. The full result, with a scorecard, a
systematic-defect taxonomy, a per-field trust map, and a comparison of the
parsing approaches, is [`studies-audit-2026-07.md`](studies-audit-2026-07.md).
The short version:

- **The headline is always wrong.** In all ten studies the structural layer
  (section counts, votes, chapter law, veto flags, agency rosters, individual
  line-item amounts) is accurate, but the marquee statistic each study exists to
  produce is not. Every budget's fiscal total is corrupted by unnetted
  amendatory strike/add lines (inflated in most, negative in one supplemental
  that raised spending); the policy bills undercount RCW citations and
  definitions through too-strict regexes. The set averages about 2.4 of 5, and
  no study exceeds 3.
- **Nothing consumed them.** No page in web-tools and no pipeline in this repo
  reads the studies. They were built, looked at once, and left. Stuff is used or
  it is not; this was not.
- **The audit mined more than the set held.** The reusable content was the
  method and the findings, not the data. Both now live in the audit probe, so
  the tree was only inviting a re-look at numbers already known to be unreliable.
- **The sources are not lost.** Each study's `raw/` XML and HTM is a copy of a
  document already held in `bills/texts/` (verified for a sample spanning
  operating, capital, and policy bills). Retiring the studies removes the flawed
  derived data and about 143 MB of duplicated raw text, not the source corpus.

## What was mined

Recorded here so the retirement does not lose the few things worth keeping. The
detail is in the audit; these are the pointers.

- **The audit itself** is the durable product: the defect taxonomy (amendatory
  netting, text-node name mangling, letter-suffixed citation misses, subtotal-row
  inflation), the trust map, and the finding that the ten extractors were ten
  independent rewrites (at most 11 percent shared code), not a versioned parser,
  which is why they each re-made a different subset of the same five bugs.
- **One deliverable had independent value:** the SB-5167 proviso extraction,
  3,439 numbered provisos with dollar amounts and rule-based categories. It is
  the only proviso extractor in the set and the only artifact the audit rated as
  useful and correct. It is browsable in history at the SHA above if it is ever
  wanted as a starting point.
- **A parsing lesson worth carrying forward.** Prefer the XML source over HTM
  wherever it exists (2003-04 on), and read the schema's own structure
  (`agency`, `amendingStyle`, `<TitleNumber>/<ChapterNumber>/<SectionNumber>`)
  rather than flattening to a string and re-deriving it by regex. A lightweight
  XML DOM (`@xmldom/xmldom` in Node, `DOMParser` in the browser) is the
  right-sized tool; the cleanest runs in the set used it, and its failures were
  misuse, not limits.
- **The shape a replacement would take, if built:** not ten scripts but four
  domain profiles (operating budget, capital budget, policy bill, provisos) over
  one shared core (fetch, DOM parse, amendatory netting, name assembly,
  citation regex, output validation against the source), placed in `web-tools`
  where shared code belongs. This is recorded as the shape such an effort would
  have, not as scheduled work. Nothing depends on it existing.
