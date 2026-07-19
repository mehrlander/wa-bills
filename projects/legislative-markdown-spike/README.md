# Legislative Markdown spike: prototype results

Executes the next-step plan from the 2026-07-13 spike report ("Legislative
Markdown and Standoff Annotation") on two real bills, one per XML schema era:

| Bill | Schema | Sections | Amendment runs |
|---|---|---|---|
| SHB 1003, 2023-24 (`1003-S/`) | 2012 namespace | 13 | 51 add, 40 strike |
| ESHB 1008, 2007-08 (`1008-S.E/`) | old LSC DTD | 10 | 95 add, 30 strike |

Each output directory holds `bill.md` (redline Markdown with front matter),
`annotations.json` (W3C-shaped sidecar), `before.md` and `after.md` (projected
views), and `patch.json` (derived change model). `convert.py` is the converter;
`test_relocation.py` runs spike steps 4 through 6.

## Verdict

The hybrid holds. Redline Markdown with inline `ins`/`del` plus a standoff
sidecar survives contact with real legislative source in both schema eras.
Specific results against the spike's seven steps:

1. **Conversion.** Both bills convert. The two schemas parse into one
   intermediate form (blocks of styled runs); one emitter writes the Markdown
   and records section offsets as it goes.
2. **Views.** Before and after project by regex in a few lines. Spot check,
   Sec. 5 of SHB 1003: redline reads `is <del>$65</del> <ins>$42.50</ins> per
   college credit`; before reads `$65`; after reads `$42.50`.
3. **Sidecar.** Three annotation kinds shipped: per-section source provenance
   (position plus SectionSelector), rule-generated RCW citations (the validated
   extractor as a `generatedBy` RegexRule; position, quote, and section/marker
   selectors on most instances), one manual policy-topic annotation.
4. **Fidelity validation.** Inserted and deleted text in the Markdown matches
   the source XML word character for word character on both bills (1,733/1,733 ins and
   1,451/1,451 del chars on 1003-S; 2,788/2,788 and 309/309 on 1008-S.E).
5. **Relocation.** After inserting an editorial paragraph near the top of each
   file, all annotations relocate: 103/103 and 41/41. The selector cascade did
   real work: most resolve by unique quote or context-scored quote, provenance
   targets resolve by SectionSelector, and two repeated cites needed
   section-scoped quote search. Position alone would have failed for everything
   after the edit point.
6. **Patch comparison.** 48 change records derive mechanically from the 1003-S
   redline, e.g. `{op: replace, old: $65, new: $42.50, section: 5, markers:
   (b)(i)}`. The inline-plus-derived-patch conclusion stands: the patch model
   costs nothing to generate and does not need to be stored.

## What the two schemas required

**2012 namespace (2015-26).** Near-direct mapping. `TextRun
amendingStyle="add"` becomes `ins`; `strike`, `strikemarkleft`,
`strikemarkright` become `del` (the strikemark variants are deleted text whose
`((` `))` marks attach on one side; confirmed against the HTM rendering).
Structure arrives as elements: `BillSectionHeader`, `SectionCite`, `Caption`,
`P`, reviser's notes in `RCWNoteSection` (emitted as blockquotes).

**Old LSC DTD (2003-14).** Print-line oriented, so conversion is a reflow:
`LineNumber` markers become whitespace, `paraend` splits paragraphs, `hyphen`
is a soft break before a `LineNumber` and a literal hyphen otherwise,
`PageNumberFooter` is dropped. Two substantive quirks: the source closes and
reopens `add`/`strike` at every print line, so adjacent same-type runs are
rejoined; and section numbers are absent (`Sec. ` with no digit), so the
converter numbers sequentially, matching print. The deletion parens `((` `))`
are literal text in this schema and are removed adjacent to `del` spans; the
2012 schema encodes them as styling and emits none.

## Decisions embodied here (from the spike's open questions)

- **Coordinate stream**: offsets count raw `bill.md` characters, UTF-8, LF.
  Stated in the sidecar's `source.normalization`.
- **Dual targeting**: source provenance is recorded per section
  (`BillSection[n]`), not per span. Conversion is deterministic, so
  section-level traceability suffices.
- **Rule behavior**: annotations are snapshots; `generatedBy` carries rule id,
  version, pattern, and the rule's validation record.
- **Change grouping**: adjacent del/ins pairs group into `replace` ops at
  derivation time, not storage time.
- **Selectors**: most text-anchored annotations carry position, quote
  (48-char context), and a SectionSelector with paragraph markers. The
  relocation test shows all three earn their place.
- **Deletion parens**: not reproduced in the Markdown; `del` carries the
  semantics and a print-faithful renderer can regenerate them. Recorded in the
  front matter `format` field.

## Honest caveats

- The relocation test edits the file once, near the top. Heavier edits
  (rewording inside a paragraph that contains a target) would exercise quote
  drift; not tested.
- Reviser's notes and their internal citations are emitted as blockquotes and
  annotated like body text; whether note citations should be a separate layer
  is undecided.
- Neither bill has tables. Budget bills remain the untested stress case.
- The old-schema `hyphen` rule (soft before `LineNumber`, literal otherwise)
  validated on this bill; a corpus run should count how often it fires and
  spot-check.
- The X1 fidelity check counts characters inside add/strike only; the reflow of
  unstyled text is eyeballed, not diffed against an independent rendering.

## What a corpus run would add

`convert.py` already dispatches on schema sniff. Corpus-scale work items, in
order: the 2001-02 HTM front-end (no XML exists), table handling for budget
bills, a decision on output layout (mirror of `bills/texts/` under a new tree),
and throughput plumbing. The per-bill cost is milliseconds; the 63,880 XML
documents are an hours-scale batch, not a redesign.
