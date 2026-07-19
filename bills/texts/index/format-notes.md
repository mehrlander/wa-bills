# WA Bills Corpus — Format Notes

A parsing-oriented survey of the full-text bill corpus under `bills/texts/`, written for
whoever builds extraction tooling next. On-disk layout is `<biennium>/<fmt>/<chamber>/<name>`,
where `fmt` is `Htm` or `Xml` and `chamber` is `House` or `Senate`. Fourteen biennia,
1999-00 through 2025-26. Htm exists for all fourteen; Xml begins in 2003-04 (1999-00 and
2001-02 have no `Xml` directory).

Every claim below was read off an actual file. Paths are repo-relative from the repo root.
Counts and version-suffix taxonomy live in the sibling files `index/integrity-report.md`
and `index/version-suffixes.md`.

## 1. Format generations at a glance

Two independent format tracks, each with its own generation breaks. The breaks do not line
up between Htm and Xml.

| Biennia | Htm generation | Xml generation |
|---|---|---|
| 1999-00 | H1: MS-Word-filtered HTML | (none) |
| 2001-02 | H1: MS-Word-filtered HTML | (none) |
| 2003-04 | H2: FONT/CENTER + field comments | X1: LSC DTD |
| 2005-06 .. 2007-08 | H2 | X1 |
| 2009-10 .. 2011-12 | H2 | X1 (system-id + encoding-case shift) |
| 2013-14 | H2 | X1 |
| 2015-16 .. 2017-18 | H3: XHTML div/style, BOM | X2: 2012 namespace |
| 2019-20 | H4: plain HTML div/hr, BOM | X2 |
| 2021-22 .. 2025-26 | H5: H4 + `<!DOCTYPE html>` | X2 |

Key transition facts:

- The **Xml schema flips exactly once**, between 2013-14 (LSC DTD) and 2015-16 (2012
  namespace). Both chambers flip in the same biennium. A whole-corpus scan (grep for
  `DOCTYPE Bill PUBLIC` vs `leg.wa.gov/2012/document` over every `.xml` file) found **zero
  mixing**: 2003-04..2013-14 are 100% LSC, 2015-16..2025-26 are 100% namespace. No biennium
  contains both.
- The **Htm generations drift more often** than the Xml schema. The single hardest Htm break
  is 2013-14 -> 2015-16 (FONT markup to div/CSS markup, and no-BOM to UTF-8 BOM). It
  coincides with the Xml schema flip, so a biennium-based dispatch and a content-sniff
  dispatch agree at that boundary.

## 2. HTM generations

### H1 — MS-Word-filtered HTML (1999-00 and 2001-02)

Example: `2001-02/Htm/House/1000-S.htm`, `2001-02/Htm/Senate/5347-S.htm` (budget-sized,
1.67 MB).

- First bytes are `<html>` (no BOM). Declared charset **windows-1252** via
  `<meta http-equiv=Content-Type content="text/html; charset=windows-1252">`, and
  `<meta name=Generator content="Microsoft Word 11 (filtered)">`.
- Content lives in `<p class=...>` paragraphs with Word style classes. The reliable anchors
  are **semantic CSS classes**, not field comments (this generation has **no**
  `<!-- field: -->` markers, sponsor-marker count is 0):
  - Bill id: the header line `<p class=BillGen-For><b> ... SUBSTITUTE HOUSE BILL 1000</b></p>`.
  - Sponsors: `<span class=Sponsors> ... </span>`.
  - Description / long title: `<span class=BillTitle> ... AN ACT Relating to ...</span>`.
  - Body sections are wrapped in `<div class=Section1>`, `<div class=Section2>`, etc.;
    `p.MsoNormal` is the base body paragraph class.
- **Charset caveat:** the bytes are windows-1252, not UTF-8. Non-breaking spaces (0xA0),
  em spaces, and smart punctuation appear as raw high bytes and will render as U+FFFD if the
  file is opened as UTF-8. Decode this generation as `cp1252`. Header alignment is done with
  runs of 0xA0, so collapse whitespace after decoding.
- Entities: heavy `&nbsp;` use plus the Word style block. A large inline `<style>` block
  precedes `<body>`; skip everything up to `</head>`.

### H2 — FONT / CENTER with field comments (2003-04 through 2013-14)

Examples: `2003-04/Htm/House/1000-S.E.htm`, `2007-08/Htm/House/1000.htm`,
`2011-12/Htm/House/1000.htm`, `2013-14/Htm/House/1000-S.E.htm`,
`2013-14/Htm/Senate/5077-S.htm` (1.25 MB, budget-sized).

- First bytes are `<html>` then `<body>` on line 2. **No BOM.** No `<meta charset>` at all;
  bytes are effectively UTF-8/ASCII (bill text is ASCII, entities carry the rest).
- Markup is simple presentational HTML: `<FONT SIZE=...>`, `<CENTER>`, `<B>`, `<table
  width=...>`, `<P>`, `<p>`. Header is centered rules of underscores around the long bill id
  in `<B>`.
- **Machine-readable field comments are the primary anchors.** Each field is delimited by a
  paired HTML comment; the closing marker is the empty `<!-- field: -->`:
  - `<!-- field: Sponsors -->  ...text... <!-- field: -->`
  - `<!-- field: CaptionsTitles -->  ...AN ACT Relating to... <!-- field: -->`  (description / long title)
  - `<!-- field: BeginningSection -->` and `<!-- field: Text -->` bracket body-section prose.
  The complete marker vocabulary observed is: `Sponsors`, `CaptionsTitles`,
  `BeginningSection`, `Text`, and the empty closer. Extract by matching from an opening
  `field: NAME` comment to the next `field: ` closer.
- Bill id: still simplest to read from the centered `<B>...HOUSE BILL 1000</B>` line, which
  carries the full version-decorated long id ("ENGROSSED SUBSTITUTE HOUSE BILL 1000").
- Request number: as-introduced and most substitute reprints carry a leading
  `BILL REQ. #:&nbsp;&nbsp;H-1201.1` line; engrossed reprints sometimes omit it. Treat its
  presence as version-dependent, not a generation marker.
- Within-H2 cosmetic drift (do not key on these): 2003-04 sometimes opens the body with
  `<FONT SIZE="3">` and unquoted `width=100%`; from 2005-06 `width="100%"` is quoted. None of
  this affects the field-comment anchors, which are stable across all of H2.

### H3 — XHTML div/style with BillHeadingTable (2015-16, 2017-18)

Examples: `2015-16/Htm/House/1000-S.htm`, `2017-18/Htm/House/1000.htm`.

- **UTF-8 BOM present** (`EF BB BF`) from 2015-16 onward. Root is
  `<html xmlns="http://www.w3.org/1999/xhtml"><head><title> </title></head><body>`.
- Layout moved to `<div>`/`<table>` with inline `style="..."` (pixel and point units),
  including a `<table id="BillHeadingTable">`. The bill id is a styled div:
  `<div style="font-weight:bold;text-align:center;...">SUBSTITUTE HOUSE BILL 1000</div>`.
- **Field comments survive** into this generation and remain the best sponsor/description
  anchors: `<!-- field: Sponsors -->...<!-- field: -->` and the same `CaptionsTitles` /
  `BeginningSection` / `Text` vocabulary as H2. Sponsors sit right after a
  `<span ...>By</span>` label.
- No `&nbsp;`/numeric entities for spacing; spacing is CSS.

### H4 — plain HTML div/hr, no xhtml namespace (2019-20)

Example: `2019-20/Htm/House/1000.htm`, `2019-20/Htm/House/1023-S.E.htm`.

- UTF-8 BOM, then bare `<html><body>` (no `xmlns`, no `<head>`). Horizontal rules are
  `<hr style=...></hr>`. Bill id is again `<div style="font-weight:bold;text-align:center;">
  HOUSE BILL 1000</div>`.
- Field comments present, and in many files **doubled**: 2,109 of the 5,633 files (37%)
  emit each marker twice, e.g.
  `<!-- field: Sponsors --><!-- field: Sponsors -->Representative Klippert<!-- field: --><!-- field: -->`;
  the other 3,524 emit each marker once. The doubling skews toward plain as-introduced
  filenames (1,896 of the 2,109 doubled files). An extractor
  that matches the first opener to the first closer still captures the field, but a naive
  count of markers will be off by 2x on the doubled files. This is the one Htm quirk most likely to trip regex-
  based tooling.
- No html entities for spacing (`&nbsp;` count 0, numeric entities 0); literal UTF-8 plus CSS.

### H5 — H4 plus HTML5 doctype (2021-22, 2023-24, 2025-26)

Examples: `2021-22/Htm/House/1000.htm`, `2023-24/Htm/House/1000.htm`,
`2025-26/Htm/House/1000.htm`, `2025-26/Htm/House/1198-S.htm` (4.53 MB, budget-sized),
`2025-26/Htm/Senate/5167-S.E.htm` (4.49 MB).

- Identical to H4 except the file now opens `<!DOCTYPE html ><html><body>` (note the space
  before `>`), and `<hr .../>` is self-closed. UTF-8 BOM present.
- Field comments are **single** again (the 2019-20 doubling did not persist). Same
  vocabulary: `Sponsors`, `CaptionsTitles`, `BeginningSection`, `Text`, empty closer.
- No html entities for spacing; literal UTF-8 plus CSS. Budget-sized files are structurally
  identical to small bills, just longer; the field-comment anchors hold.

## 3. XML generations

### X1 — LSC Authoring DTD (2003-04 through 2013-14)

Examples: `2007-08/Xml/House/1000.xml`, `2007-08/Xml/House/1008-S.E.xml` (amendatory),
`2013-14/Xml/Senate/5000.xml`.

- Prolog then DOCTYPE:
  `<!DOCTYPE Bill PUBLIC "-//LSC//DTD Authoring Bill XML//EN" "...billauthoring.top">`.
  **No default namespace, no BOM.**
- Root: `<Bill version="1.0" type="introLN">`. Some substitute/engrossed reprints carry an
  extra `docName="ESHB 1000"` (or a request-style `docName="S-5439.1"`) attribute; many base
  bills carry it too. Do not depend on `docName`.
- Header block `<IntroducedBillHeader>`:
  - `<RequestNumber>H-0135.1</RequestNumber>` (present on as-introduced; omitted on some
    engrossed reprints, mirroring the Htm "BILL REQ" line).
  - `<BillNumber>HOUSE BILL 1000</BillNumber>` — full version-decorated long id.
  - `<StateLegSession><State/><Legislature/><Session/></StateLegSession>`.
  - `<Sponsors>...</Sponsors>`.
  - `<IntroHistory>` (dates), `<BriefDescription>` (short description), `<BillTitle>`
    (the "AN ACT Relating to..." long title), `<EnactingClause>`.
- Body: `<BillSection>` blocks with `<SecNum>`, `<Cite>`, `<RCWSLText>` (existing statutory
  law text), `<BegSecText>` / `<BegSecNew>` / `<BegSecAmd>` (section openers),
  `<NewSecText>`, `<NewSingleSecToCh>`. Line numbering is **baked in as elements**:
  `<LineNumber .../>` appears once per printed line (hundreds per bill), alongside
  `<paraend>`, `<hyphen>`, `<breakwordnohyphen>`, `<endofsentence>`, `<PageNumberFooter>`.
  Strip these before extracting clean prose.
- **Amendatory markup:** inserted text is `<add>...</add>`; deleted text is
  `<strike>...</strike>`. In the rendered Htm the struck text is additionally wrapped in
  double parentheses `((...))`, but in X1 the element carries it directly.
- **Entities:** X1 escapes quotes and apostrophes as `&apos;` and `&quot;` in text content
  (e.g. `O&apos;Brien`, `&quot;Interested person&quot;`), plus `&amp;`.
- Within-X1 drift (cosmetic, coincides at 2009-10; do not key extraction on it):
  - DOCTYPE system id: `"l:\dtd\author\billauthoring.top"` in 2003-04..2007-08, shortened to
    `"billauthoring.top"` in 2009-10..2013-14.
  - Prolog encoding label: `encoding="UTF-8"` (uppercase) in 2003-04..2007-08,
    `encoding="utf-8"` (lowercase) in 2009-10..2013-14.
  The `IntroducedBillHeader` element set is stable across all of X1.

### X2 — 2012 namespace schema (2015-16 through 2025-26)

Examples: `2015-16/Xml/House/1000-S.xml`, `2015-16/Xml/House/1060-S.E.xml` (amendatory),
`2019-20/Xml/House/1000.xml`, `2025-26/Xml/House/1000.xml`.

- **UTF-8 BOM present.** Prolog `<?xml version="1.0" encoding="utf-8"?>`. **No DOCTYPE.**
- Root: `<Bill type="bill" xmlns="http://leg.wa.gov/2012/document">`. The `type` attribute is
  `"bill"` uniformly across sampled biennia. Note the default namespace: XPath/lxml queries
  must register it (elements are in `{http://leg.wa.gov/2012/document}`), or the extractor
  must match on local-name.
- Header block `<BillHeading>` (renamed from `IntroducedBillHeader`):
  - `<RequestNumber>H-0360.1</RequestNumber>`.
  - `<ShortBillId>SHB 1000</ShortBillId>` — new element; abbreviated id.
  - `<LongBillId>SUBSTITUTE HOUSE BILL 1000</LongBillId>` — replaces `BillNumber`.
  - `<Legislature>`, `<Session>` — now direct children (the `StateLegSession`/`State`
    wrapper is gone).
  - `<Sponsors>`, `<BillHistory>` (with `<PrefiledDate>`, `<ReadDate>`,
    `<ReferredCommittee>`), `<BriefDescription>`, `<BillTitle>`, `<EnactedClause>`.
- Body: `<BillSection>` with `<BillSectionNumber>`, `<BillSectionHeader>`, `<SectionCite>`,
  `<SectionNumber>`, `<Caption>`, `<History>`, plus statutory-note elements `<RCWNoteSection>`,
  `<RevNote>`, `<CrossRefNote>`, `<AnnNote>`, `<NoteP>`. Prose is carried in `<P>` paragraphs
  built from `<TextRun>` spans.
- **No line-number elements.** X2 dropped the per-line `<LineNumber>` markup entirely; line
  numbering was a print artifact and is not present in the namespace XML. This is a real
  divergence from X1 for anyone counting on line anchors.
- **Amendatory markup moved to attributes:** text is styled via
  `<TextRun amendingStyle="add">` (inserted), `amendingStyle="strike"` (deleted), plus
  `strikemarkleft` / `strikemarkright` / `strikemarknone` variants for the strike-mark
  bracket rendering. `fontWeight`, `fontStyle`, `fontFamily` also ride on `TextRun`. To
  reconstruct clean text, keep `add` runs, drop `strike`/`strikemark*` runs.
- **Entities:** X2 uses only the strictly required `&amp;` (e.g. in `Agriculture &amp;
  Natural Resources`). It does **not** escape quotes or apostrophes: they appear as literal
  `"` and `'` in text content. Sample `1060-S.E.xml` contains 398 literal double-quotes and 0
  `&quot;`. The em dash `—` (U+2014) and section sign `§` (U+00A7) appear as literal UTF-8
  characters (33 and 52 occurrences respectively in that file). No smart/curly quotes were
  observed.

## 4. Text-cleaning summary

- **Charset / decoding:**
  - H1 (2001-02): decode as **windows-1252**. Everything else is UTF-8.
  - **UTF-8 BOM** (`EF BB BF`) is present on H3/H4/H5 Htm (2015-16+) and on all X2 Xml
    (2015-16+). Strip the BOM before parsing. H1, H2, and X1 have no BOM.
- **Entities:** `&nbsp;` and heavy entity use are confined to H1 and H2 Htm. X1 Xml escapes
  `&apos;`/`&quot;`/`&amp;`. H3+ Htm and X2 Xml use literal UTF-8 and only `&amp;` where a
  literal `&` occurs. Expect literal `—` and `§` in X2.
- **Line numbering:** present only in X1 Xml as `<LineNumber/>` elements (hundreds per file);
  strip along with `<paraend>`, `<hyphen>`, `<PageNumberFooter>`, `<breakwordnohyphen>`. Not
  present in X2. Not present as markup in any Htm generation (the rendered Htm carries no
  per-line number tokens).
- **Strikethrough / amendatory conventions across formats:**
  - H1 Htm: inserted `<u>`; deleted `<s>` and Word `text-decoration:line-through` spans.
  - H2 Htm (2003-14): inserted `<u>`; deleted uppercase `<STRIKE>...</STRIKE>`, and the
    struck text is wrapped in double parentheses `((...))`.
  - H3-H5 Htm (2015-26): inline styles `text-decoration:underline` (inserted) and
    `text-decoration:line-through` (deleted); watch for `text-decoration:no-underline` as a
    reset, not a mark.
  - X1 Xml: `<add>` / `<strike>`.
  - X2 Xml: `<TextRun amendingStyle="add|strike|strikemark*">`.
  The double-paren `((...))` convention around deleted text is a WA drafting standard and is
  the most format-independent signal of struck material in the rendered Htm.

## 5. Recommended parse strategy

A single extractor should dispatch on a cheap content sniff of the first ~200 bytes (after
stripping any leading BOM), not on the biennium alone. The corpus is clean enough that a
sniff and a biennium lookup agree, but sniffing is robust to misfiled inputs.

1. **Strip a leading UTF-8 BOM** if present. Record whether it was there (implies 2015-16+).

2. **Xml vs Htm** by extension and by first non-BOM bytes (`<?xml` => Xml).

3. **Xml dispatch:**
   - If the header contains `DOCTYPE Bill PUBLIC "-//LSC//DTD` (equivalently, root
     `<Bill ... type="introLN">` with no namespace) => **X1 (LSC)**. Parse `IntroducedBillHeader`;
     read `BillNumber`, `Sponsors`, `BriefDescription`/`BillTitle`; strip `<LineNumber/>` and
     kin; treat `<add>`/`<strike>` for amendments.
   - If the root carries `xmlns="http://leg.wa.gov/2012/document"` => **X2 (namespace)**.
     Register the namespace (or match local-names). Read `BillHeading` -> `LongBillId` /
     `ShortBillId`, `Sponsors`, `BriefDescription`/`BillTitle`; walk `TextRun`, honoring
     `amendingStyle`.
   Because the schema partition is exact by biennium, `biennium <= 2013-14 -> X1, else X2`
   is a valid fallback, but the namespace/DOCTYPE sniff is the primary key.

4. **Htm dispatch:**
   - If `charset=windows-1252` / `Microsoft Word` / `class=MsoNormal` present => **H1**.
     Decode as cp1252. Anchor on `class=Sponsors`, `class=BillTitle`, `class=BillGen-For`;
     there are no field comments.
   - Else if `<!-- field: Sponsors -->` comments are present => **H2/H3/H4/H5** (2003-26).
     These all share the field-comment vocabulary (`Sponsors`, `CaptionsTitles`,
     `BeginningSection`, `Text`, empty closer). A single field-comment extractor works across
     all four. Two guards: (a) in H2 (no BOM, FONT/CENTER markup) versus H3+ (BOM, div/CSS
     markup) the surrounding tags differ but the comments do not; (b) in **2019-20 (H4) the
     markers are doubled** — match first-opener to first-closer, or dedupe, before counting.
   - Bill id in all Htm generations is most reliably the version-decorated long id in the
     centered/bold header element (`<B>...HOUSE BILL nnnn</B>` in H2, styled `<div>` in H3+,
     `<b>` inside `class=BillGen-For` in H1).

5. **Cross-check:** for 2003-14, the Htm and Xml are parallel renderings of the same version;
   the Xml is the cleaner source for structured fields (explicit elements, no presentational
   noise) while the Htm is easier for a quick sponsor/title grab via field comments. For
   2001-02, Htm is the only source. Prefer Xml where it exists.
