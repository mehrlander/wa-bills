# Washington State Bills Inventory

**Date:** December 2025
**Total Bills:** 10
**Total Raw Size:** ~46 MB
**Total Extracted Data:** ~50 MB

---

## Overview

This directory contains Washington State legislative bills with both raw source documents and extracted structured data. Each bill folder follows a consistent structure:

```
{BILL-NUMBER}/
├── raw/              # Original bill documents from leg.wa.gov
│   ├── *.xml         # XML format (recommended for extraction)
│   └── *.htm         # HTML format (presentation-focused)
└── extracted-data/   # Derived structured data
    ├── *-data.json   # Extracted JSON dataset
    ├── demo.html     # Interactive browser-based explorer
    ├── ANALYSIS.md   # Comprehensive bill analysis
    ├── README.md     # Bill-specific documentation
    └── *.js          # Extraction scripts
```

---

## Bill Categories

| Category | Count | Description |
|----------|-------|-------------|
| **Operating Budget** | 5 | Biennial and supplemental operating budgets |
| **Capital Budget** | 2 | Capital construction and improvement budgets |
| **Policy Bills** | 3 | Non-appropriations legislative changes |

---

## Bills Inventory

### Operating Budget Bills

#### SB-5167-S (2025-2027 Operating Budget)
- **Type:** Biennial Operating Budget
- **Biennium:** 2025-2027
- **Status:** Enacted as Chapter 424, Laws of 2025
- **Raw Formats:** XML (4.2 MB), HTM (4.6 MB)
- **Extracted Data:** 38 MB total (multiple JSON files)
- **Key Stats:** 420 sections, 216 agencies, 1,816 appropriations, 38 vetoed sections
- **Has Demo:** Yes

#### SB-5187-S (2023-2025 Operating Budget)
- **Type:** Biennial Operating Budget
- **Biennium:** 2023-2025
- **Total:** $304.6 billion
- **Status:** Enacted, signed May 16, 2023
- **Raw Formats:** XML (4.1 MB), HTM (4.5 MB)
- **Extracted Data:** 1.2 MB (full + compact JSON)
- **Key Stats:** 361 sections, 27+ agencies, 314 appropriation blocks, 29 partial vetoes
- **Has Demo:** Yes

#### SB-5092-S (2021-2023 Operating Budget)
- **Type:** Biennial Operating Budget
- **Biennium:** 2021-2023
- **Raw Formats:** HTM only (3.7 MB)
- **Extracted Data:** 1.1 MB
- **Has Demo:** Yes

#### SB-5693-S (2021-2023 Supplemental Operating Budget)
- **Type:** Supplemental Operating Budget
- **Biennium:** 2021-2023
- **Raw Formats:** XML (2.7 MB), HTM (3.0 MB)
- **Extracted Data:** 2.3 MB
- **Key Stats:** 218 agencies, 1,172 appropriations, 281 RCW references, 22 vetoed sections
- **Has Demo:** Yes

#### SB-5950-S (2023-2025 Supplemental Operating Budget)
- **Type:** Supplemental Operating Budget
- **Biennium:** 2023-2025
- **Raw Formats:** XML (2.8 MB), HTM (3.1 MB)
- **Extracted Data:** 1.4 MB
- **Has Demo:** Yes

---

### Capital Budget Bills

#### SB-5195-S (2025-2027 Capital Budget)
- **Type:** Capital Budget
- **Biennium:** 2025-2027
- **Total:** $10.46 billion current + $9.45 billion reappropriations
- **Raw Formats:** XML (2.3 MB), HTM (2.5 MB)
- **Extracted Data:** 2.1 MB + schema
- **Key Stats:** 788 projects, 40 departments
- **Has Demo:** Yes

#### SB-5200-S (2023-2025 Capital Budget)
- **Type:** Capital Budget
- **Biennium:** 2023-2025
- **Raw Formats:** XML only (2.0 MB)
- **Extracted Data:** 1.8 MB
- **Key Stats:** 923 projects, 71 agencies, 4,479 appropriation records
- **Has Demo:** Yes

---

### Policy Bills

#### HB-1320-S2 (Civil Protection Order Modernization)
- **Type:** Policy Bill
- **Session:** 2021
- **Status:** Chapter 215, Laws of 2021
- **Raw Formats:** XML (1.1 MB), HTM (1.1 MB)
- **Extracted Data:** 200 KB
- **Key Stats:** 172 sections, 227 RCW references, 34 legal definitions, 124 agencies
- **Has Demo:** Yes

#### HB-1281-S (Technical Corrections)
- **Type:** Technical Corrections Bill
- **Description:** Corrects technical errors in prior legislation
- **Raw Formats:** XML (1.4 MB), HTM (1.2 MB)
- **Extracted Data:** 144 KB
- **Key Stats:** 257 sections, 423 RCW references, 114 agencies, amendment tracking
- **Has Demo:** Yes

#### HB-1210-S2 (Cannabis Terminology)
- **Type:** Policy Bill
- **Description:** Replaces "marijuana" with "cannabis" throughout RCW
- **Raw Formats:** XML (1.1 MB), HTM (1.1 MB)
- **Extracted Data:** 135 KB + schema
- **Key Stats:** 176 sections, 160 RCW amendments, 1,376 term replacements
- **Has Demo:** Yes

---

## Using the Data

### Interactive Exploration

Each bill includes a `demo.html` file that provides:
- Browser-based data exploration (no server required for most)
- Pre-built query buttons for common analyses
- Lodash-powered custom queries
- Chart.js visualizations (most bills)
- Search and filtering capabilities

```bash
# For most bills, just open demo.html directly
# For larger files, use a local server:
cd bills/studies/SB-5167-S/extracted-data
python -m http.server 8000
# Then open http://localhost:8000/demo.html
```

### Programmatic Access

Each bill includes extraction scripts that can be adapted:

```javascript
const { BillExtractor } = require('./bill-extractor.js');
const fs = require('fs');

const xml = fs.readFileSync('../raw/5167-S.xml', 'utf-8');
const extractor = new BillExtractor(xml, 'xml');
const data = extractor.extractAll();

console.log(data.metadata);
console.log(data.appropriations.length);
```

### Data Schema

Most bills include schema documentation:
- `schema.json` - JSON Schema (Draft-07) for validation
- `schema.md` or `SCHEMA.md` - Human-readable schema docs

---

## Data Quality Notes

- **XML Recommended:** XML format is preferred for extraction (semantic markup, hierarchical structure)
- **HTM for Display:** HTM format is presentation-focused and harder to parse
- **Extraction Scripts:** Each bill has its own extractor; patterns vary slightly between budget types
- **Demo Compatibility:** All demo.html files work in modern browsers; some large files need local server

---

## File Size Summary

| Bill | Raw Size | Extracted Size | Has XML | Has HTM |
|------|----------|----------------|---------|---------|
| SB-5167-S | 8.8 MB | 38 MB | Yes | Yes |
| SB-5187-S | 8.6 MB | 1.2 MB | Yes | Yes |
| SB-5092-S | 3.7 MB | 1.1 MB | No | Yes |
| SB-5693-S | 5.7 MB | 2.3 MB | Yes | Yes |
| SB-5950-S | 5.9 MB | 1.4 MB | Yes | Yes |
| SB-5195-S | 4.8 MB | 2.1 MB | Yes | Yes |
| SB-5200-S | 2.0 MB | 1.8 MB | Yes | No |
| HB-1320-S2 | 2.2 MB | 200 KB | Yes | Yes |
| HB-1281-S | 2.6 MB | 144 KB | Yes | Yes |
| HB-1210-S2 | 2.2 MB | 135 KB | Yes | Yes |

---

## Related Resources

- **Retired experiments:** the `projects/` analysis tools, viewers, and databases were removed 2026-07-19; see [`../../probes/projects-retired-2026-07.md`](../../probes/projects-retired-2026-07.md)

---

**Last Updated:** December 2025
