# bills/

Everything in this folder is derived from bill documents.

- **Scans go wide.** Fetch every bill's document, extract something small,
  discard the document. The three scan sets below cover the full 2025-26
  biennium as a point-in-time snapshot.
- **Full texts** ([`texts/`](texts/)) keep every bill document across fourteen
  biennia.

(A per-bill deep-study tree, `studies/`, was retired 2026-07-20 after an audit
found its extracted data unreliable; see
[`../probes/studies-retired-2026-07.md`](../probes/studies-retired-2026-07.md).)

## The scans

| Folder | Per bill | Size |
|---|---|---|
| [`content/`](content/) | Header fields from the HTM and XML versions (sponsors, dates, committee referral, title, brief description) plus linked RCW cites. `combined_2025-26.json` merges both sources. | ~1 KB |
| [`terms-and-rcws/`](terms-and-rcws/) | Bag-of-words term frequencies (~320-470 distinct terms) and section-level RCW cites, House and Senate, from HTM and XML text. Includes the log-odds comparison tool. | ~10 KB |
| [`topic/`](topic/) | The retirement-and-pension topic set: 521 bills with the full scan treatment (heading fields, RCW cites, term frequencies). | |

What the scans keep: identity metadata, the RCW citation graph, word
frequencies. What they discard with the documents: section structure,
amendatory strike/insert marks, proviso text, dollar amounts. Those live only
in the full texts under [`texts/`](texts/), for anyone who wants to parse them.

Known quality notes: the HTM content scan's sponsors field failed (the XML
scan's is good, and `combined` uses it), and term extraction fused some
words across tag boundaries.

## Full texts

Stored, as of 2026-07-12, in [`texts/`](texts/): every House and Senate
bill document on `lawfilesext.leg.wa.gov` for the fourteen biennia
1999-00 through 2025-26 (HTM throughout; XML from 2003-04, where the
server's XML archive begins). 138,706 files, 4.6 GB, the full reach of
the server's bill archive, verified file-by-file against the server's
directory listings (`texts/manifest.json`).
See [`texts/README.md`](texts/README.md) for layout and provenance. The
`.gitignore` guard on `*.xml`/`*.htm` remains in force outside `texts/`.
The URL catalog in
[`../wsl-api/data/GetAllDocumentsByClass/`](../wsl-api/data/GetAllDocumentsByClass/)
covers other document classes (resolutions, memorials, session laws) not imported here.
