# Coverage cross-check: bill texts vs. WSL API metadata

Question: do the imported bill-text corpus (`bills/texts/<biennium>/<Htm|Xml>/<House|Senate>/`)
and the Washington Legislature web-service metadata agree on which bills exist?

## Sources compared

- Text corpus: bill numbers are the leading integer of each filename, taken as the
  union across `Htm/` and `Xml/`, split by chamber directory (`House/`, `Senate/`).
  The corpus spans thirteen biennia, 2001-02 through 2025-26.
- API metadata: `wsl-api/data/GetLegislationSinceHistorical/csv/<biennium>.csv`, one
  row per instrument, with `BillNumber`, `OriginalAgency` (House/Senate), and
  `ShortLegislationType`. Nine biennia, 2009-10 through 2025-26. These CSVs match the
  row counts in `wsl-api/README.md` and are the fuller pull; the sibling `json/`
  files are a de-duplicated, bills-only subset and were not used.

The two sources overlap on nine biennia (2009-10 .. 2025-26). Text-only biennia
(2001-02 .. 2007-08) have no API metadata and are out of scope for the comparison.

Comparison is by integer bill number within chamber. The number ranges are disjoint
by chamber (House bills 1000-4999, Senate bills 5000-6999, plus higher blocks for
non-bill instruments), so chamber assignment is unambiguous.

## Per-biennium counts (House and Senate combined)

| Biennium | Text corpus | API metadata | In both | Metadata only | Text only |
|---|---:|---:|---:|---:|---:|
| 2009-10 | 4,119 | 1,698 | 1,592 | 106 | 2,527 |
| 2011-12 | 3,477 | 3,691 | 3,477 | 214 | 0 |
| 2013-14 | 3,390 | 3,584 | 3,390 | 194 | 0 |
| 2015-16 | 3,694 | 3,883 | 3,693 | 190 | 1 |
| 2017-18 | 3,646 | 4,131 | 3,646 | 485 | 0 |
| 2019-20 | 3,674 | 4,162 | 3,674 | 488 | 0 |
| 2021-22 | 2,126 | 2,386 | 2,126 | 260 | 0 |
| 2023-24 | 2,829 | 3,458 | 2,826 | 632 | 3 |
| 2025-26 | 3,111 | 2,252 | 1,905 | 347 | 1,206 |

"Metadata only" = bill numbers in the API but with no text file. "Text only" = bill
numbers with a text file but absent from the API pull.

## Three regimes

The nine biennia fall into three groups.

**Closed biennia, 2011-12 through 2023-24 (seven biennia): agreement.** Text-only
counts are zero or a rounding error (1, 0, 0, 0, 0, 3). Every bill the API lists as a
bill has a text file. The metadata-only residual is composed entirely of non-bill
instruments, described below. This is the expected clean result: the text import
captured every introduced bill the API records.

**2009-10: metadata is a partial pull.** The API lists only 1,698 instruments against
4,119 text files, and 2,527 bill numbers on disk have no metadata row. The text-only
numbers are not a recent tail; they span the entire range (House 1000-2387, Senate
5000-6189) interleaved with the numbers the API did capture, and the metadata bill
numbers themselves start at HB 1072, not HB 1000. This pattern is a truncated or
mid-biennium `GetLegislationSinceHistorical` capture, not a text-import defect. The
text corpus is the more complete record for this biennium.

**2025-26: metadata is stale for the open biennium.** Here the direction reverses. The
API pull predates the text import, so 1,206 recently introduced bills sit on disk with
no metadata row. The text-only numbers form contiguous high blocks (House 2087-2748,
Senate 5819-6362), i.e. everything introduced after the point-in-time API pull. The
README states the fresh data for the open biennium lives in `snapshots/`, not in the
historical CSV; the stale CSV is the expected cause. The text corpus is again the more
current record.

## What the metadata-only items are

Across all nine biennia, the 2,916 metadata-only identifiers are non-bill instruments
that never receive a numbered bill-text file, plus a few genuine gaps. By type:

- **Gubernatorial appointments** (Senate, numbered 9000-9800). Present from 2017-18
  onward and the largest single category in recent biennia: 299 (2017-18), 301
  (2019-20), 128 (2021-22), 453 (2023-24), 235 (2025-26). Examples: SGA 9000, SGA 9001.
- **Resolutions** (House, HR 46xx-47xx) and **Joint / Concurrent Resolutions and Joint
  Memorials** (House 4000-4999, Senate 8000-8999). Present every biennium, roughly
  100-200 per biennium. Examples: HJM 4000, HJR 4200, SCR 8400, HR 4654.
- **Initiatives** (HI/SI, numbered in the low ranges, e.g. SI 502, HI 732, SI 2081).
  A handful per biennium where present.

These account for essentially all metadata-only identifiers in the seven closed
biennia. The type mix per biennium is consistent; the only structural change is the
appearance of the 9000-series appointments beginning 2017-18.

**Genuine small gaps.** A few numbers carry a text file but appear under no metadata
row of any type: SB 6684 (2015-16); HB 1193, HB 2379, HB 3093 (2023-24). These are
isolated (four total across the closed biennia) and look like individual omissions in
the API pull rather than a systematic pattern.

## What the text-only items are

Outside the two anomalous biennia, text-only numbers are negligible (four total,
listed above). The large text-only counts are confined to 2009-10 (partial metadata
pull) and 2025-26 (stale metadata pull), and in both cases reflect the metadata source
lagging the corpus, not extra or spurious files on disk. Spot checks confirm the
text-only numbers are ordinary bills (HB 1000, SB 5000, and the recent 2025-26 tail).

## Assessment

For the seven closed biennia where the API pull is complete (2011-12 through 2023-24),
the text import is complete relative to the API record: every bill the API lists as a
bill has a text file, and the only metadata-only items are appointments, resolutions,
memorials, and initiatives that by design have no numbered bill text. The two
exceptions, 2009-10 and 2025-26, are limitations of the metadata source, not the text
corpus. In 2009-10 the historical pull is truncated; in 2025-26 it predates the import
of the still-open biennium. In both, the text corpus is the more complete or more
current record.

Net: where the API record is authoritative, the text import shows no evidence of
missing bills. The disagreements are explained by the character of the metadata pulls,
and the residual metadata-only set is well-characterized non-bill legislation.
