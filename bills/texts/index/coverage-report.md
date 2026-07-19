# Coverage cross-check: bill texts vs. WSL API metadata

Question: do the imported bill-text corpus (`bills/texts/<biennium>/<Htm|Xml>/<House|Senate>/`)
and the Washington Legislature web-service metadata agree on which bills exist?

## Sources compared

- Text corpus: bill numbers are the leading integer of each filename, taken as the
  union across `Htm/` and `Xml/`, split by chamber directory (`House/`, `Senate/`).
  The corpus spans fourteen biennia, 1999-00 through 2025-26.
- API metadata: `wsl-api/data/GetLegislationSinceHistorical/csv/<biennium>.csv`, one
  row per legislation version, reduced to distinct `BillNumber` within `OriginalAgency`
  (House/Senate), with `ShortLegislationType`. Eighteen biennia, 1991-92 through
  2025-26. These CSVs match the row counts in `wsl-api/README.md` and are the fuller
  pull; the sibling `json/` files are a de-duplicated, bills-only subset and were not
  used.

The two sources overlap on all fourteen corpus biennia (1999-00 .. 2025-26). The API
CSVs also cover four earlier biennia (1991-92 .. 1997-98) with no text corpus, which
are out of scope for the comparison.

Comparison is by integer bill number within chamber. The number ranges are disjoint
by chamber (House bills 1000-4999, Senate bills 5000-6999, plus higher blocks for
non-bill instruments), so chamber assignment is unambiguous.

## Per-biennium counts (House and Senate combined)

| Biennium | Text corpus | API metadata | In both | Metadata only | Text only |
|---|---:|---:|---:|---:|---:|
| 1999-00 | 4,053 | 4,234 | 4,053 | 181 | 0 |
| 2001-02 | 3,874 | 4,063 | 3,873 | 190 | 1 |
| 2003-04 | 3,964 | 4,161 | 3,964 | 197 | 0 |
| 2005-06 | 4,226 | 4,416 | 4,225 | 191 | 1 |
| 2007-08 | 4,347 | 4,615 | 4,347 | 268 | 0 |
| 2009-10 | 4,119 | 4,358 | 4,119 | 239 | 0 |
| 2011-12 | 3,477 | 3,691 | 3,477 | 214 | 0 |
| 2013-14 | 3,390 | 3,584 | 3,390 | 194 | 0 |
| 2015-16 | 3,694 | 3,883 | 3,693 | 190 | 1 |
| 2017-18 | 3,646 | 4,131 | 3,646 | 485 | 0 |
| 2019-20 | 3,674 | 4,162 | 3,674 | 488 | 0 |
| 2021-22 | 2,126 | 2,386 | 2,126 | 260 | 0 |
| 2023-24 | 2,829 | 3,458 | 2,826 | 632 | 3 |
| 2025-26 | 3,111 | 3,644 | 3,111 | 533 | 0 |

"Metadata only" = bill numbers in the API but with no text file. "Text only" = bill
numbers with a text file but absent from the API pull.

## Agreement across all biennia

All fourteen biennia agree. Text-only counts are zero or a rounding error (per
biennium, 1999-00 through 2025-26: 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0). Every
bill the API lists as a bill has a text file. The metadata-only residual is composed
entirely of non-bill instruments, described below. This is the expected clean result:
the text import captured every introduced bill the API records, and the historical API
pull now covers every biennium in the corpus, including 2009-10 and the still-open
2025-26.

## What the metadata-only items are

Across all fourteen biennia, the 4,262 metadata-only identifiers are non-bill instruments
that never receive a numbered bill-text file, plus a few genuine gaps. By type:

- **Gubernatorial appointments** (Senate, numbered 9000-9800). Present from 2017-18
  onward and the largest single category in recent biennia: 299 (2017-18), 301
  (2019-20), 128 (2021-22), 453 (2023-24), 332 (2025-26). Examples: SGA 9000, SGA 9001.
- **Resolutions** (House, HR 46xx-47xx) and **Joint / Concurrent Resolutions and Joint
  Memorials** (House 4000-4999, Senate 8000-8999). Present every biennium, roughly
  100-200 per biennium. Examples: HJM 4000, HJR 4200, SCR 8400, HR 4654.
- **Initiatives** (HI/SI, numbered in the low ranges, e.g. SI 502, HI 732, SI 2081).
  A handful per biennium where present.

These account for essentially all metadata-only identifiers in every biennium. The
type mix per biennium is consistent; the only structural change is the
appearance of the 9000-series appointments beginning 2017-18.

**Genuine small gaps.** A few numbers carry a text file but appear under no metadata
row of any type: SB 6208 (2001-02); HB 3322 (2005-06); SB 6684 (2015-16); HB 1193,
HB 2379, HB 3093 (2023-24). These are isolated (six total across the fourteen biennia)
and look like individual omissions in the API pull rather than a systematic pattern.

## What the text-only items are

Text-only numbers are negligible across all biennia (six total, listed above). There
are no large text-only blocks: the historical API pull now covers 2009-10 and the open
2025-26 biennium in full, so no biennium shows the metadata source lagging the corpus.
Spot checks confirm the text-only numbers are ordinary bills (SB 6208, HB 3322,
SB 6684).

## Assessment

Across all fourteen biennia the text import is complete relative to the API record:
every bill the API lists as a bill has a text file, and the only metadata-only items
are appointments, resolutions, memorials, and initiatives that by design have no
numbered bill text. The historical API pull now covers every biennium in the corpus,
including 2009-10 and the still-open 2025-26.

Net: the text import shows no evidence of missing bills. The six text-only numbers are
isolated omissions in the API pull, and the residual metadata-only set is
well-characterized non-bill legislation.
