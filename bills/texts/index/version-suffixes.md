# WA Bills Corpus — Filename Version Suffixes

Taxonomy of the version suffix carried in each bill filename. The suffix is the portion after the bill number and before the file extension, with the leading separator (`-` or `.`) stripped. Examples: `1007-S2.E.htm` -> `S2.E`; `1049.E.htm` -> `E`; `1000.htm` -> base (no suffix).

Extraction covered the **133160** indexed filenames (69280 Htm, 63880 Xml) across 13 biennia (2001-02 to 2025-26), with zero unparseable names. **18** distinct suffixes occur.

## Naming convention

The suffix encodes two independent amendment stages, each read off the document's own long title:

- **`S`, `S2`, `S3`, `S4`** — substitute stage: substitute, second substitute, third, fourth. A substitute is a committee replacement of the bill text.
- **`E`, `E2`, `E3`** — engrossment stage: engrossed, second engrossed, third engrossed. Engrossment folds adopted floor amendments into the text.
- When combined, the filename orders them **`S{n}.E{m}`**, but the title reads engrossment first: `S2.E` -> "ENGROSSED SECOND SUBSTITUTE", `S.E2` -> "SECOND ENGROSSED SUBSTITUTE".

This corpus contains only these bill-version suffixes. Session-law / chapter suffixes (SL, PL, PV) and amendment-document suffixes (AMH, AMS) do **not** appear here.

## Suffix table

| Suffix | Htm | Xml | Total | Decoded meaning | Confined era | Evidence (document long title) |
|---|--:|--:|--:|---|---|---|
| `(base)` | 46,477 | 42,603 | 89,080 | Original / as-introduced bill (no substitution or engrossment) | all 13 | HOUSE BILL 1000 |
| `S` | 15,802 | 14,717 | 30,519 | Substitute | all 13 | SUBSTITUTE HOUSE BILL 1001 |
| `S.E` | 2,614 | 2,438 | 5,052 | Engrossed Substitute | all 13 | ENGROSSED SUBSTITUTE HOUSE BILL 1002 |
| `S2` | 2,166 | 2,051 | 4,217 | Second Substitute | all 13 | SECOND SUBSTITUTE HOUSE BILL 1007 |
| `E` | 1,145 | 1,049 | 2,194 | Engrossed (original bill, no substitution) | all 13 | ENGROSSED HOUSE BILL 1049 |
| `S2.E` | 760 | 735 | 1,495 | Engrossed Second Substitute | all 13 | ENGROSSED SECOND SUBSTITUTE HOUSE BILL 1007 |
| `S.E2` | 103 | 89 | 192 | Second Engrossed Substitute | 12/13 (2001-02–2025-26) | SECOND ENGROSSED SUBSTITUTE HOUSE BILL 2912 |
| `S3` | 89 | 85 | 174 | Third Substitute | all 13 | THIRD SUBSTITUTE HOUSE BILL 1618 |
| `E2` | 43 | 38 | 81 | Second Engrossed (original bill) | 11/13 (2001-02–2023-24) | SECOND ENGROSSED HOUSE BILL 1547 |
| `S2.E2` | 26 | 24 | 50 | Second Engrossed Second Substitute | 10/13 (2001-02–2023-24) | SECOND ENGROSSED SECOND SUBSTITUTE HOUSE BILL 1144 |
| `S3.E` | 24 | 24 | 48 | Engrossed Third Substitute | 11/13 (2003-04–2025-26) | ENGROSSED THIRD SUBSTITUTE HOUSE BILL 1860 |
| `S4` | 12 | 12 | 24 | Fourth Substitute | 7/13 (2005-06–2023-24) | FOURTH SUBSTITUTE HOUSE BILL 1541 |
| `S.E3` | 9 | 5 | 14 | Third Engrossed Substitute | 5/13 (2001-02–2015-16) | THIRD ENGROSSED SUBSTITUTE HOUSE BILL 2127 |
| `S4.E` | 6 | 6 | 12 | Engrossed Fourth Substitute | 4/13 (2007-08–2023-24) | ENGROSSED FOURTH SUBSTITUTE HOUSE BILL 1827 |
| `S2.E3` | 1 | 1 | 2 | Third Engrossed Second Substitute | 2011-12 only | THIRD ENGROSSED SECOND SUBSTITUTE HOUSE BILL 2565 |
| `S.E4` | 1 | 1 | 2 | Fourth Engrossed Substitute | 2015-16 only | FOURTH ENGROSSED SUBSTITUTE SENATE BILL 5857 |
| `S.E5` | 1 | 1 | 2 | Fifth Engrossed Substitute | 2015-16 only | FIFTH ENGROSSED SUBSTITUTE SENATE BILL 5857 |
| `E3` | 1 | 1 | 2 | Third Engrossed (original bill) | 2017-18 only | THIRD ENGROSSED SENATE BILL 5517 |

## Notes

- Every suffix meaning above was verified by reading the long title line of an actual document carrying that suffix (Htm sample); none are asserted from memory alone.
- Htm and Xml counts track each other closely per suffix, consistent with the two formats being parallel renderings of the same bill versions. Small gaps exist (e.g. `S.E3`: 9 Htm vs 5 Xml).
- The base version and single substitute account for the bulk: base 66.9%, `S` 22.9% of all files.
- Higher-order suffixes are rare and cluster in specific biennia. `S2.E3`, `S.E4`, `S.E5`, and `E3` each occur in a single biennium; `5857-S.E4`/`S.E5` (2015-16) reflect a bill engrossed four and five times.
