# bills/texts/

Full bill texts, House and Senate, for the thirteen biennia 2001-02
through 2025-26. HTM for all thirteen; XML from 2003-04 forward (the
server's XML archive starts there; 2001-02 exists only as HTM, and
1999-00 HTM exists on the server but is not imported). Fetched from the
Legislature's static file server
(`lawfilesext.leg.wa.gov/Biennium/<biennium>/<Htm|Xml>/Bills/`)
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

This import is the deliberate exception to the repo's `*.htm`/`*.xml`
gitignore guard; see the carve-out in `.gitignore`.
