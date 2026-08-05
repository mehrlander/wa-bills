# Bill index

Derived from `bills/texts/`, built by [`tools/extract-citations.py`](../../tools/extract-citations.py).

## citation-index.json

Which bills cite each RCW chapter, across all 14 biennia: **63,880 bills,
1,663,223 RCW citations, 1,429,867 session laws, 340,005 bill references,
2,822 chapters**. Sections roll up to their chapter, since the chapter is the
unit other repos name.

**This is the cross-repo join.** 430 of the 470 RCW chapters cited in the
prose of `home`, `fn-data`, and `budget-wa` are found here (91%), so a chapter
those repos discuss can be traced to the bills that touch it. `RCW 41.50`, the
Department of Retirement Systems chapter, is cited by 703 bills here and named
109 times in home and 125 in fn-data.

Distilled on purpose. The full chapter-to-every-bill mapping is 15.8 MB, which
is a bulk artifact rather than a committable one, so the committed file carries
each chapter's bill count, citation count, and ten heaviest citers. The
complete detail lives in the gitignored per-biennium shards.

## citations/ (gitignored)

One JSON Lines file per biennium, sharded at the source's own grain so
re-extracting one session rewrites one file. Each record carries the bill's
declared metadata (`billNumber`, `sponsors`, `session`, `legislature`,
`requestNumber`, straight from the XML rather than inferred) and its full
citation counts. 46 MB, six minutes to rebuild.

## Why parsing rather than recognition

A 150-bill probe measured the alternative and it lost badly: an entity
recognizer over bill body text returns 767 organization names of which 2% are
confirmable, headed by `RCW`, `Sec`, and `SHB`, which are citation machinery
rather than organizations. Roughly fourteen hours of model time for a worse
answer than six minutes of regex. The bill XML already tags its sponsors and
numbers, and parsing beats recognizing whenever the publisher has marked up
the thing you want. Full record in web-tools `tools/concept-lab/findings.md`.
