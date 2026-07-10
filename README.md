# wa-bills: Washington State Legislative Analysis System

A comprehensive system for extracting, analyzing, and exploring data from Washington State legislative bills. Combines raw legislative documents, extracted structured data, and interactive tools for legislative research, budget analysis, and policy tracking.

**Repository:** mehrlander/wa-bills | **Status:** Active | **Last Updated:** July 2026

---

## Quick Start

### I want to explore bills interactively (no coding)
- **Budget Bill Comparison:** [`projects/viewers/budget-bill-comparison/budget-bill-comparison.html`](projects/viewers/budget-bill-comparison/) — Compare appropriations, agencies, and funding across bills
- **Proviso Search Tool:** [`projects/viewers/proviso-search-tool/proviso-search.html`](projects/viewers/proviso-search-tool/) — Search all provisos with auto-categorization
- **Legislation Tracker:** [`LegislationTrackerGH.html`](LegislationTrackerGH.html) — Live bill lookup and tracking
- **Pension Dashboard:** [`pension-dash.html`](pension-dash.html) — Pension system classifications and mappings

### I want to query bill data (SQL/JSON)
- **WA Budget Automation Database:** [`projects/database/wa-budget-automation/`](projects/database/wa-budget-automation/) — Normalized SQL schema for multi-bill queries
- **Budget Bills Database:** [`projects/database/wa-budget-bills-database/`](projects/database/wa-budget-bills-database/) — 27-year historical metadata (SQL/JSON)
- **Raw JSON Data:** [`bills/*/extracted-data/*-data.json`](bills/) — Pre-extracted appropriations, agencies, provisos

### I want to analyze bill structure (developer)
- **Analyze Bill Patterns #2:** [`projects/analysis/analyze-bill-patterns-2/`](projects/analysis/analyze-bill-patterns-2/) — Most polished extraction library
- **Parse Bill Data:** [`format/parse-bill-data.js`](format/parse-bill-data.js) — Core parsing functions (Node.js)
- **Bill Structure Reference:** [`format/hierarchy.md`](format/hierarchy.md) — Bill XML/HTML structure documentation

### I want to understand this repository
- **Full Project Inventory:** [`projects/PROJECT_INVENTORY.md`](projects/PROJECT_INVENTORY.md) — Detailed guide to all 26 projects (990 lines)
- **Bills Inventory:** [`bills/BILLS_INVENTORY.md`](bills/BILLS_INVENTORY.md) — Metadata and structure of 10 tracked bills
- **Legislature API Docs:** [`legislation/README.md`](legislation/README.md) — WSL Web Services API reference

---

## What's In Here

### 📋 Tracked Bills (10 bills, ~80 MB total)

| Bill | Type | Biennium | Enacted | Format |
|------|------|----------|---------|--------|
| **SB-5167-S** | Operating Budget | 2025-2027 | 2025 | [XML](bills/SB-5167-S/raw/) + [Extracted](bills/SB-5167-S/extracted-data/) |
| **SB-5195-S** | Capital Budget | 2025-2027 | 2025 | [XML](bills/SB-5195-S/raw/) + [Extracted](bills/SB-5195-S/extracted-data/) |
| **SB-5187-S** | Operating Budget | 2023-2025 | 2023 | [XML](bills/SB-5187-S/raw/) + [Extracted](bills/SB-5187-S/extracted-data/) |
| **SB-5200-S** | Capital Budget | 2023-2025 | 2023 | [XML](bills/SB-5200-S/raw/) + [Extracted](bills/SB-5200-S/extracted-data/) |
| **SB-5092-S** | Operating Budget | 2021-2023 | 2021 | [HTM](bills/SB-5092-S/raw/) + [Extracted](bills/SB-5092-S/extracted-data/) |
| **SB-5693-S** | Supplemental Op. Budget | 2021-2023 | 2021 | [XML](bills/SB-5693-S/raw/) + [Extracted](bills/SB-5693-S/extracted-data/) |
| **SB-5950-S** | Supplemental Op. Budget | 2023-2025 | 2023 | [XML](bills/SB-5950-S/raw/) + [Extracted](bills/SB-5950-S/extracted-data/) |
| **HB-1210-S2** | Policy Bill | 2023 | 2023 | [XML](bills/HB-1210-S2/raw/) + [Extracted](bills/HB-1210-S2/extracted-data/) |
| **HB-1281-S** | Technical Corrections | 2023 | 2023 | [XML](bills/HB-1281-S/raw/) + [Extracted](bills/HB-1281-S/extracted-data/) |
| **HB-1320-S2** | Policy Bill | 2023 | 2023 | [XML](bills/HB-1320-S2/raw/) + [Extracted](bills/HB-1320-S2/extracted-data/) |

### 🗂️ Analysis & Extraction (26 projects across 5 categories)

**Analysis Projects** — Bill structure, parsing patterns, reference implementations (4 projects)

**Data Extraction** — Extract appropriations, agencies, provisos, RCW references (11 projects)

**Database Systems** — Normalized SQL schemas, multi-bill queries (2 projects)

**Specialized Tools** — Agency mapping, statutory references, pension classification, funding timelines (5 projects)

**Interactive Viewers** — Web-based exploration interfaces, no setup required (4 projects)

👉 **See [projects/PROJECT_INVENTORY.md](projects/PROJECT_INVENTORY.md) for complete guide to all 26 projects.**

### 📊 Reference Data

- **RCW Database** — 6.4 MB complete Revised Code of Washington with chapter/title indices
  - [`rcw/rcw-full.json`](rcw/rcw-full.json) — Full RCW database
  - [`rcw/pension-mapping.json`](rcw/pension-mapping.json) — Pension system classifications
  - [`rcw/PensionMappingInverter.html`](rcw/PensionMappingInverter.html) — Interactive pension classifier

- **Fiscal Notes** — OFM Fiscal Notes by biennium (2011-2022 onwards)
  - [`FiscalNotes/json/`](FiscalNotes/json/) — Fiscal notes organized by year
  - [`FiscalNotes/README.md`](FiscalNotes/README.md) — Data processing documentation

- **Legislation Archive** — 40,160 Washington State bills (2009-2025)
  - [`legislation/data/json/`](legislation/data/json/) — 22 MB of bill records
  - [`legislation/data/csv/`](legislation/data/csv/) — Flattened tabular format
  - [`legislation/README.md`](legislation/README.md) — Legislature API documentation

---

## For Different Users

### Legislative Staff / Policy Analysts

**Start here:** Open [`projects/viewers/budget-bill-comparison/budget-bill-comparison.html`](projects/viewers/budget-bill-comparison/) in your browser.

This tool lets you:
- Compare appropriations across bills
- Search for specific agencies and programs
- Track funding changes by biennium
- Export data for reporting

**Next:** Use the [Proviso Search Tool](projects/viewers/proviso-search-tool/proviso-search.html) to find provisos affecting your jurisdiction.

### Researchers / Academics

**Start here:** Read [`projects/PROJECT_INVENTORY.md`](projects/PROJECT_INVENTORY.md) to find analysis tools matching your research question.

**Then:** Use [`projects/database/wa-budget-automation/`](projects/database/wa-budget-automation/) for SQL queries across years, or [`bills/BILLS_INVENTORY.md`](bills/BILLS_INVENTORY.md) for detailed bill metadata.

### Developers / Data Engineers

**Start here:** Read [`format/hierarchy.md`](format/hierarchy.md) to understand bill structure.

**Then:**
1. Review [`projects/analysis/analyze-bill-patterns-2/`](projects/analysis/analyze-bill-patterns-2/) as reference implementation
2. Use parsing functions from [`format/parse-bill-data.js`](format/parse-bill-data.js) and [`format/helper.js`](format/helper.js)
3. Consult [`legislation/README.md`](legislation/README.md) for WSL API details

**For new extraction:** Copy approach from existing projects in [`projects/data-extraction/`](projects/data-extraction/) and adapt to your needs.

---

## Repository Structure

```
wa-bills/
├── README.md                          ← You are here
├── bills/                             # 10 tracked bills with raw & extracted data
│   ├── SB-5167-S/, SB-5195-S/, ...   # Individual bill directories
│   ├── BILLS_INVENTORY.md             # Bill metadata & structure guide
│   └── bills-manifest.json            # Bill metadata catalog
├── projects/                          # 26 analysis & viewing projects
│   ├── analysis/                      # Bill structure & pattern analysis (4)
│   ├── data-extraction/               # Single-bill extractors (11)
│   ├── database/                      # SQL-based systems (2)
│   ├── specialized/                   # Targeted analysis tools (5)
│   ├── viewers/                       # Interactive web tools (4)
│   ├── PROJECT_INVENTORY.md           # Complete project guide (990 lines)
│   └── projects-manifest.json         # Project metadata
├── legislation/                       # WA Legislature API & 40K+ bills archive
│   ├── data/                          # Bill records (JSON/CSV)
│   ├── schema/                        # API documentation
│   └── README.md                      # API reference
├── rcw/                               # RCW database & pension mappings
│   ├── rcw-full.json                  # Complete Revised Code of Washington
│   ├── pension-mapping.json           # Pension classifications
│   └── *.html, *.js                   # Interactive tools & utilities
├── FiscalNotes/                       # OFM Fiscal Notes by biennium
│   ├── json/                          # Notes organized by year
│   └── README.md                      # Processing documentation
├── format/                            # Bill formatting & parsing tools
│   ├── parse-bill-data.js             # Core parsing functions
│   ├── helper.js, helper-new.js       # Utility functions
│   ├── format-bill.html               # Interactive formatter
│   ├── lawhop.html                    # Version navigator
│   └── hierarchy.md                   # Bill structure reference
├── CLAUDE.md                          # Claude Code guidelines
├── probes/                            # Repository analysis surveys
└── .gitignore
```

---

## Key Datasets at a Glance

| Dataset | Size | Format | Coverage | Use Case |
|---------|------|--------|----------|----------|
| **10 Tracked Bills** | ~80 MB | XML/HTML + JSON | SB-5167, SB-5195, SB-5092, SB-5693, SB-5950, SB-5187, SB-5200, HB-1210, HB-1281, HB-1320 | Detailed extraction & analysis |
| **RCW Database** | 6.4 MB | JSON | Full RCW (titles, chapters, sections) | Legal references, statute mapping |
| **Fiscal Notes** | ~50 MB | JSON | 2011-2022 onwards, by biennium | Bill fiscal impact assessment |
| **40K+ Bills Archive** | 22 MB | JSON/CSV | All WA bills 2009-2025 | Broad legislative queries |
| **27-Year Metadata** | ~1 MB | JSON/CSV | Historical bills catalog | Trend analysis, longitudinal studies |
| **Pension Mappings** | <1 MB | JSON | PERS/TRS/WSERS/etc. | Public employee benefits tracking |

---

## Common Tasks

### Find all appropriations to Department of Education in SB-5167
**Method 1 (Interactive):** Open [Budget Bill Comparison](projects/viewers/budget-bill-comparison/budget-bill-comparison.html), search for "Department of Education"

**Method 2 (SQL):** Query [`projects/database/wa-budget-automation/`](projects/database/wa-budget-automation/) for `agency_name LIKE '%Education%'`

**Method 3 (JSON):** Load [`bills/SB-5167-S/extracted-data/SB-5167-S-appropriations.json`](bills/SB-5167-S/extracted-data/) and filter by agency

### Search for provisos affecting a specific agency
**Method:** Open [Proviso Search Tool](projects/viewers/proviso-search-tool/proviso-search.html), type agency name

### Extract bill data in a new format
**Method:** 
1. Read [`format/hierarchy.md`](format/hierarchy.md) to understand structure
2. Review [`projects/analysis/analyze-bill-patterns-2/`](projects/analysis/analyze-bill-patterns-2/) for reference
3. Use functions from [`format/parse-bill-data.js`](format/parse-bill-data.js)

### Compare funding across biennia
**Method:** Use [`projects/specialized/appropriations-timeline/`](projects/specialized/appropriations-timeline/) for visualization, or query [`projects/database/wa-budget-bills-database/`](projects/database/wa-budget-bills-database/) for historical data

### Find RCW references in a bill
**Method:** Use [`projects/specialized/parse-statutory-references/`](projects/specialized/parse-statutory-references/) to extract and visualize RCW citations

---

## Documentation Guide

| Document | Purpose | Audience |
|-----------|---------|----------|
| **[projects/PROJECT_INVENTORY.md](projects/PROJECT_INVENTORY.md)** (990 lines) | Complete guide to all 26 projects; descriptions, usage, recommendations | Anyone exploring projects |
| **[bills/BILLS_INVENTORY.md](bills/BILLS_INVENTORY.md)** | Bill metadata, structure, extracted data inventory | Anyone working with bills |
| **[format/hierarchy.md](format/hierarchy.md)** | Bill XML/HTML structure reference | Developers extracting data |
| **[legislation/README.md](legislation/README.md)** | WSL Web Services API documentation | Developers using Legislature API |
| **[FiscalNotes/README.md](FiscalNotes/README.md)** | Fiscal notes processing & data format | Fiscal analysis users |
| **[CLAUDE.md](CLAUDE.md)** | Claude Code on the web guidelines | Claude users |

---

## Project Status & Roadmap

**Status:** Active, well-maintained repository with 26 production and development projects.

**Recent Activity:** Updated project inventory (November 2025), enhanced extraction libraries, expanded database schemas.

**Tier 1 Projects (Production-Ready):**
- Analyze Bill Patterns #2 (polished extraction)
- WA Budget Automation (SQL database)
- Extract Bill Provisos (comprehensive analysis)
- Budget Bill Comparison Tool (interactive viewer)
- Proviso Search Tool (full-text search)

**Suggested Next Steps:** See phase-based roadmap in [projects/PROJECT_INVENTORY.md](projects/PROJECT_INVENTORY.md#suggested-next-steps-phases).

---

## Getting Help

- **Which project should I use?** → Start with [Quick Start](#quick-start) or [For Different Users](#for-different-users)
- **How do I extract data from a bill?** → Read [format/hierarchy.md](format/hierarchy.md) and [projects/analysis/analyze-bill-patterns-2/](projects/analysis/analyze-bill-patterns-2/)
- **What projects already exist?** → Read [projects/PROJECT_INVENTORY.md](projects/PROJECT_INVENTORY.md)
- **How is bill data structured?** → Read [bills/BILLS_INVENTORY.md](bills/BILLS_INVENTORY.md)
- **How do I query the Legislature API?** → Read [legislation/README.md](legislation/README.md)

---

## License & Attribution

This repository is maintained by mehrlander. For attribution or contribution guidelines, see individual project directories.
