# bills/texts/

Full bill texts, House and Senate, for the fourteen biennia 1999-00
through 2025-26: 138,706 files, verified byte-exact against the
server's directory listings. HTM for all fourteen; XML from 2003-04
forward (the server's XML archive starts there, so 1999-00 and 2001-02
are HTM only). This is the full reach of the server's bill archive in
both formats. Fetched from the Legislature's static file server
(`lawfilesext.leg.wa.gov/Biennium/<biennium>/<Htm|Xml>/Bills/`)
on 2026-07-11 and 2026-07-12. Layout mirrors the source:

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

This import is the deliberate exception to the repo's `*.htm`/`*.xml`
gitignore guard; see the carve-out in `.gitignore`.
