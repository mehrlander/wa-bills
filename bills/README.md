# bills/

Everything in this folder is derived from bill documents. Two depths:

- **Scans go wide.** Fetch every bill's document, extract something small,
  discard the document. The three scan sets below cover the full 2025-26
  biennium as a point-in-time snapshot.
- **Studies go deep.** Keep everything about one bill: raw source,
  extracted data, analysis, interactive demo. Ten bills, in
  [`studies/`](studies/).

## The scans

| Folder | Per bill | Size |
|---|---|---|
| [`content/`](content/) | Header fields from the HTM and XML versions (sponsors, dates, committee referral, title, brief description) plus linked RCW cites. `combined_2025-26.json` merges both sources. | ~1 KB |
| [`terms-and-rcws/`](terms-and-rcws/) | Bag-of-words term frequencies (~500-600 distinct terms) and section-level RCW cites, House and Senate, from HTM and XML text. Includes the log-odds comparison tool. | ~10 KB |
| [`topic/`](topic/) | The retirement-and-pension topic set: 521 bills with the full scan treatment (heading fields, RCW cites, term frequencies). | |

What the scans keep: identity metadata, the RCW citation graph, word
frequencies. What they discard with the documents: section structure,
amendatory strike/insert marks, proviso text, dollar amounts. That last
category is what the studies capture.

Known quality notes: the HTM content scan's sponsors field failed (the XML
scan's is good, and `combined` uses it), and term extraction fused some
words across tag boundaries.

## Full texts

Not stored. The URL catalog for every bill document is in
[`../wsl-api/data/GetAllDocumentsByClass/`](../wsl-api/data/GetAllDocumentsByClass/),
and the repo `.gitignore` deliberately blocks `*.xml`/`*.htm` so a future
full-text import (a `texts/` folder here would be its natural home) happens
by decision, with `git add -f`, not by accident.
