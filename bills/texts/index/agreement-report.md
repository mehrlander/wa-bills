# WA Bills Index — HTM vs XML Agreement

Cross-format check over the merged index. For every bill document present in both HTM and XML (matched on chamber, bill number, and version), the two independent extractions are compared. Computed over the full corpus, not a sample.

## Per-biennium agreement

| Biennium | Doc pairs | id match | session match | acted-RCW set match | HTM w/ links | XML acted-set ⊆ HTM links |
|---|--:|--:|--:|--:|--:|--:|
| 2003-04 | 5,778 | 100.0% | 100.0% | 99.7% | 0 | n/a |
| 2005-06 | 6,199 | 100.0% | 100.0% | 99.7% | 0 | n/a |
| 2007-08 | 6,471 | 100.0% | 100.0% | 99.8% | 0 | n/a |
| 2009-10 | 6,089 | 100.0% | 100.0% | 99.5% | 0 | n/a |
| 2011-12 | 5,132 | 100.0% | 100.0% | 99.5% | 0 | n/a |
| 2013-14 | 5,088 | 100.0% | 100.0% | 99.5% | 0 | n/a |
| 2015-16 | 5,407 | 100.0% | 100.0% | 98.2% | 4,819 | 62.5% |
| 2017-18 | 5,474 | 100.0% | 100.0% | 99.0% | 4,965 | 66.5% |
| 2019-20 | 5,633 | 100.0% | 100.0% | 99.1% | 5,148 | 63.7% |
| 2021-22 | 3,416 | 100.0% | 100.0% | 98.4% | 3,156 | 61.6% |
| 2023-24 | 4,504 | 100.0% | 100.0% | 99.2% | 4,154 | 63.3% |
| 2025-26 | 4,689 | 100.0% | 100.0% | 99.4% | 4,390 | 64.1% |
| **All** | **63,880** | **100.0%** | **100.0%** | **99.3%** | **26,632** | **63.7%** |

## Reading the columns

- **id match / session match**: near-total. The two formats carry the same bill identity and session metadata; disagreements are rare source-level differences.

- **acted-RCW set match**: the set of RCW sections the bill acts on (from the HTM enacting-clause title) compared against the XML index's cites that carry an action code. Agreement is high. The residual splits three ways: a small number of XML index entries that truncated a cite (e.g. `2.310.505` for `28A.310.505`, which HTM gets right); genuine source-level typos where the HTM and XML documents themselves disagree on a digit (e.g. `43.060.010` vs `43.06D.010`, with the HTM hyperlink confirming the HTM reading); and rare title-parse edge cases.

- **XML acted-set ⊆ HTM links**: for the six biennia with hyperlinks (2015-16 forward), whether every RCW the XML marks as acted-on is present in the HTM's hyperlink set. The hyperlink set is a superset (it also links body cross-references), so this measures link completeness, not exact match.

## Note on the XML `rcw` field

The XML index records some cites with a null action. The cross-check shows these are predominantly body cross-references (a section that merely mentions `RCW x`, not one that amends it), most numerous in the 2015-forward 2012-schema files. The HTM `rcw` field is derived from the enacting-clause title, which by constitutional title requirement enumerates exactly the acted-on sections, so it excludes those cross-references. Where a clean acted-on set is needed, the HTM `rcw` field or the XML cites filtered to non-null action are the reliable views; the raw XML `rcw` field is a candidate for the same title-based cleanup.
