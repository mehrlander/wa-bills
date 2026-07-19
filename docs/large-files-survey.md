# Large Files Survey

**Date:** 2026-02-10
**Question:** What are the biggest files in the repo, and what's in them?

## Summary

- 139,032 files total across 6 top-level directories: `archive/`, `bills/`, `docs/`, `fiscal-notes/`, `rcw/`, `wsl-api/`
- The 20 largest range from 6 MB to 17 MB -- all JSON data or raw HTML/XML bill text
- `bills/` has the most files (138,883) with raw `.htm`/`.xml` and extracted fiscal JSON
- `bills/`, `wsl-api/`, and `rcw/` hold the largest individual datasets (API dumps, term-frequency indexes, full RCW index)
- `rcw/` and `archive/format/` are small (a handful of files each)
- SB-5167 (2025-27 operating budget) accounts for 2 of the top 10 largest files

## Top 20 Largest Files (diverse selection)

### bills/ -- Raw bill text and extracted fiscal data

| Size | File | Content |
|------|------|---------|
| 17 MB | `bills/studies/SB-5167-S/extracted-data/fiscal-data.json` | Every appropriation line item in the 2025-27 operating budget. Agency, fund source, fiscal year, amount, proviso count. |
| 13 MB | `bills/studies/SB-5167-S/extracted-data/provisos.json` | Full text of every budget proviso in SB 5167 by agency/section. Conditional spending instructions (study requirements, FTE restrictions, reporting mandates). |
| 4.6 MB | `bills/studies/SB-5167-S/raw/5167-S.htm` | Raw enrolled HTML of the 2025-27 operating budget. |
| 4.5 MB | `bills/studies/SB-5187-S/raw/5187-S.htm` | Raw enrolled HTML of the 2023-25 operating budget (ESSB 5187). |
| 4.3 MB | `bills/studies/SB-5167-S/extracted-data/appropriations-with-provisos.json` | Merged appropriations + provisos for SB 5167. |
| 4.2 MB | `bills/studies/SB-5167-S/raw/5167-S.xml` | XML version of the 2025-27 operating budget. |
| 3.7 MB | `bills/studies/SB-5092-S/raw/5092-S.htm` | Raw HTML of the 2021-23 operating budget (ESSB 5092). |
| 3.1 MB | `bills/studies/SB-5950-S/raw/5950-S.htm` | Raw HTML of the 2023-25 supplemental operating budget (ESSB 5950). |
| 3.0 MB | `bills/studies/SB-5167-S/extracted-data/fiscal-summary.json` | Aggregated fiscal summary for SB 5167. |
| 3.0 MB | `bills/studies/SB-5693-S/raw/5693-S.htm` | Raw HTML of the 2021-23 supplemental operating budget (ESSB 5693). |

### legislation/ -- WA Legislature API data & RCW indexes

| Size | File | Content |
|------|------|---------|
| 13 MB | `bills/terms-and-rcws/house_2025-26.json` | Per-bill RCW links and term-frequency dictionaries for every 2025-26 House bill. |
| 12 MB | `bills/terms-and-rcws/house_xml_2025-26.json` | Same as above but derived from XML sources. |
| 9.3 MB | `bills/terms-and-rcws/senate_2025-26.json` | Same as above for Senate bills. |
| 6.4 MB | `rcw/rcw-full.json` | Complete RCW index -- every title, chapter, and section with cite numbers, types, and names. |
| 4.5 MB | `bills/topic/retirement_and_pension_contents.json` | All bills related to retirement & pension topics with RCWs and term frequencies. |
| 4.2 MB | `wsl-api/data/GetLegislationIntroducedSince.json` | WA Legislature API dump: every bill in the 2025-26 biennium with metadata. |
| 3.9 MB | `bills/content/htm_2025-26.json` | Parsed metadata from every 2025-26 bill HTML page. |
| 3.1 MB | `wsl-api/data/GetLegislationSinceHistorical/json/2015-16.json` | Compact historical dataset of all 2015-16 biennium bills. |

## Notes

- Almost all large files are JSON data or raw bill HTML/XML -- no large code files
- The repo is data-heavy by design: raw legislative data feeds analysis tools
- Operating budget bills are by far the largest individual documents (SB-5167 alone generates 2 of the top 10)
- Historical biennium datasets in `wsl-api/data/GetLegislationSinceHistorical/json/` span 1991 through 2025
