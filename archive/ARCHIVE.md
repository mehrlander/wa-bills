# archive/

Superseded copies whose live homes are now
[mehrlander/web-tools](https://github.com/mehrlander/web-tools). Kept for
history; nothing in this repo loads them. Do not edit here: changes belong
in the live home.

"Archived" here means exactly that the canonical copy moved to web-tools.
Old-but-native material (the `projects/` experiments, the `wsl-api/tools/archive/`
kit lineage) is not in this folder.

| Archived | Live home in web-tools | Notes |
|---|---|---|
| `format/format-bill.html`, `format/lawhop.html` | [`sites/lawfilesext.leg.wa.gov/`](https://github.com/mehrlander/web-tools/tree/main/sites/lawfilesext.leg.wa.gov) | Imported byte-for-byte 2026-05-07 (web-tools IMPORT.md, commit c3a9f4a) |
| `format/helper.js`, `format/parse-bill-data.js` | [`sites/lawfilesext.leg.wa.gov/console/`](https://github.com/mehrlander/web-tools/tree/main/sites/lawfilesext.leg.wa.gov/console) | Same import. `helper-new.js` was byte-identical to `helper.js` and was deleted, not archived |
| `wsl-sync.html`, `pension-dash.html`, `pension-map.js` | [`pages/wsl-sync/`](https://github.com/mehrlander/web-tools/tree/main/pages/wsl-sync) | Imported 2026-05-07, then rebuilt in web-tools PR #162 on the kits below. These copies predate that refactor |
| `wsl-api.js` | [`lib/kits/wsl-core.js`](https://github.com/mehrlander/web-tools/blob/main/lib/kits/wsl-core.js) + [`lib/kits/wsl.js`](https://github.com/mehrlander/web-tools/blob/main/lib/kits/wsl.js) | The kit the web-tools pair replaced. The name overlap with this repo's `wsl-api/` folder is coincidental: the file consolidated `legislation/tools/wsl-api-13.js` (now `wsl-api/tools/wsl-api-13.js`), the folder is the corpus |

`format/hierarchy.md` did not come here: it moved to [`../docs/hierarchy.md`](../docs/hierarchy.md)
as the canonical copy (web-tools points to it).
