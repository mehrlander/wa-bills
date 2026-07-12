# WA Bills Corpus — Integrity Report

Verification of `bills/texts/` against `bills/texts/manifest.json`. Manifest holds one record per file with fields `biennium, fmt, chamber, name, size`; on-disk path is `<biennium>/<fmt>/<chamber>/<name>`.

## Summary

- Manifest records: **133,160**
- Files on disk: **133,160**
- Duplicate manifest paths: **0**
- Missing (in manifest, not on disk): **0**
- Size mismatches: **0**
- Extra (on disk, not in manifest): **0**
- Zero-byte files: **0**
- Suspiciously tiny files (<200 bytes): **0**

**The corpus verifies clean.** Every manifest record has a matching file on disk of the exact recorded size, every file on disk is accounted for in the manifest, and no file falls below 200 bytes. Smallest file in the corpus is 787 bytes.

## Per-biennium totals

| Biennium | Manifest count | Disk count | Size mismatches | Missing | Extra | Total size |
|---|--:|--:|--:|--:|--:|--:|
| 2001-02 | 5,397 | 5,397 | 0 | 0 | 0 | 206.9 MB |
| 2003-04 | 11,556 | 11,556 | 0 | 0 | 0 | 249.1 MB |
| 2005-06 | 12,401 | 12,401 | 0 | 0 | 0 | 279.6 MB |
| 2007-08 | 12,942 | 12,942 | 0 | 0 | 0 | 297.6 MB |
| 2009-10 | 12,178 | 12,178 | 0 | 0 | 0 | 369.3 MB |
| 2011-12 | 10,264 | 10,264 | 0 | 0 | 0 | 346.9 MB |
| 2013-14 | 10,176 | 10,176 | 0 | 0 | 0 | 278.0 MB |
| 2015-16 | 10,814 | 10,814 | 0 | 0 | 0 | 358.7 MB |
| 2017-18 | 10,948 | 10,948 | 0 | 0 | 0 | 382.2 MB |
| 2019-20 | 11,266 | 11,266 | 0 | 0 | 0 | 364.7 MB |
| 2021-22 | 6,832 | 6,832 | 0 | 0 | 0 | 302.8 MB |
| 2023-24 | 9,008 | 9,008 | 0 | 0 | 0 | 355.4 MB |
| 2025-26 | 9,378 | 9,378 | 0 | 0 | 0 | 382.0 MB |
| **Total** | **133,160** | **133,160** | **0** | **0** | **0** | **4.08 GB** |

## Per-biennium by format

| Biennium | Htm files | Htm size | Xml files | Xml size |
|---|--:|--:|--:|--:|
| 2001-02 | 5,397 | 206.9 MB | 0 | 0.0 MB |
| 2003-04 | 5,778 | 99.0 MB | 5,778 | 150.1 MB |
| 2005-06 | 6,202 | 111.6 MB | 6,199 | 168.0 MB |
| 2007-08 | 6,471 | 118.8 MB | 6,471 | 178.7 MB |
| 2009-10 | 6,089 | 146.2 MB | 6,089 | 223.1 MB |
| 2011-12 | 5,132 | 136.9 MB | 5,132 | 209.9 MB |
| 2013-14 | 5,088 | 110.1 MB | 5,088 | 167.9 MB |
| 2015-16 | 5,407 | 197.7 MB | 5,407 | 161.0 MB |
| 2017-18 | 5,474 | 207.3 MB | 5,474 | 175.0 MB |
| 2019-20 | 5,633 | 184.4 MB | 5,633 | 180.3 MB |
| 2021-22 | 3,416 | 152.6 MB | 3,416 | 150.3 MB |
| 2023-24 | 4,504 | 177.8 MB | 4,504 | 177.6 MB |
| 2025-26 | 4,689 | 187.6 MB | 4,689 | 194.4 MB |

## Problem files

None. No missing files, no extra files, no size mismatches, no zero-byte or sub-200-byte files.
