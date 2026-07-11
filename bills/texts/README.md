# bills/texts/

Full bill texts, House and Senate, HTM and XML, for the eleven biennia
2005-06 through 2025-26: 116,207 files, verified byte-exact against the
server's directory listings. Fetched from the Legislature's static file
server (`lawfilesext.leg.wa.gov/Biennium/<biennium>/<Htm|Xml>/Bills/`)
on 2026-07-11. Layout mirrors the source:

```
texts/<biennium>/<Htm|Xml>/<House|Senate>/<file>
```

Filenames are the source's own: bill number plus version suffixes
(`1007-S2.E.htm` is the engrossed second substitute). Every version the
server offers is here, not just the latest.

`manifest.json` is the integrity reference: one record per file
(biennium, format, chamber, name, byte size) parsed from the server's
directory listings at fetch time. A file on disk matching its manifest
size is complete. `fetch-texts.py` populates the tree from the manifest;
it is resumable and safe to rerun (skips complete files, retries the
rest).

The manifest also covers 2003-04 (HTM and XML) and 2001-02 (HTM only;
the server's XML archive starts at 2003-04): 16,953 files, 478 MB, not
yet fetched. Running `fetch-texts.py` pulls exactly that remainder.
1999-00 HTM exists on the server but is outside the manifest.

This import is the deliberate exception to the repo's `*.htm`/`*.xml`
gitignore guard; see the carve-out in `.gitignore`.
