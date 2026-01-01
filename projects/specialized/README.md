# Specialized Projects

**Purpose:** Targeted analysis tools for specific research questions about Washington State budget bills - agency relationships, statutory references, funding timelines, and bill acquisition.

## Overview

Specialized projects are purpose-built extractors and analyzers for specific data dimensions. Each solves a particular research question that general-purpose tools don't address well.

**Best For:** Answering specific questions about agencies, funding trends, legal references, or acquiring bill documents.

## Projects

| Project | Output | Status | Description |
|---------|--------|--------|-------------|
| [appropriations-timeline](./appropriations-timeline/) | Web + Data + Report | **Recommended** | Longitudinal funding analysis across biennia |
| [budget-appropriations-explorer](./budget-appropriations-explorer/) | Web Tool | **Recommended** | Fastest path from XML to exploration |
| [parse-statutory-references](./parse-statutory-references/) | Data + Viz | Stable | RCW cross-reference network analysis |
| [map-agencies-programs](./map-agencies-programs/) | Python + Data + Viz | Stable | Inter-agency relationship mapping |
| [map-wa-legal-site](./map-wa-legal-site/) | Python + Automation | Utility | Automated bill downloads |

## Detailed Descriptions

### appropriations-timeline (Recommended)

**Tier 2: Unique Analysis**

The only project tracking longitudinal funding trends across biennia. Analyzes $1,251.63B in appropriations across 301+ agencies over multiple biennia (2021-2027).

**Key Findings:**
- 167 agencies with >5% growth
- 154 agencies with cuts
- 118 new programs created
- 82 programs discontinued
- Major changes tracked (e.g., Medical Assistance up $72.66B)

**Key Files:**
- `timeline-viz.html` - Interactive timeline visualization
- `appropriations-timeline.json` - 947 KB processed data
- `funding-changes.md` - Detailed analysis report

**Quick Start:**
```bash
# View interactive timeline
open timeline-viz.html

# Read the analysis report
cat funding-changes.md
```

### budget-appropriations-explorer (Recommended)

**Tier 3: Quick Exploration**

The fastest path from raw XML to interactive exploration. Paste any budget bill XML, get instant data grid with sorting/filtering, charts, and CSV export. No installation required.

**Features:**
- Paste XML, click parse, explore
- Tabulator.js grid (handles 1000+ rows)
- Chart.js visualizations (top 10 agencies, fund distribution)
- CSV export
- Works completely offline

**Key Files:**
- `budget-explorer.html` - Self-contained interactive tool

**Quick Start:**
```bash
open budget-explorer.html
# 1. Paste budget bill XML
# 2. Click "Parse & Load Data"
# 3. Filter, sort, export
```

### parse-statutory-references

**Tier 2: Unique Analysis**

The only project mapping statutory cross-references and bill-to-statute relationships. Analyzes 2,146 unique RCW references across 9 bills.

**Key Findings:**
- 488 amended statutes
- Statutory hotspots (RCW 43.101.200 amended by 3 bills)
- Most-referenced sections (RCW 1.12.025(2): 8 times)
- 534 chapter clusters
- Cross-cutting bills (SHB 1281.SL touches 51 RCW titles)

**Key Files:**
- `parse-references.js` - Main parser (39.7 KB)
- `references.json` - 165 KB citation database
- `reference-viz.html` - Network visualization
- `reference-patterns.md` - Analysis report

**Quick Start:**
```bash
# Parse bills for references
node parse-references.js

# View network visualization
open reference-viz.html
```

### map-agencies-programs

**Tier 2: Unique Analysis**

The only project mapping inter-agency relationships and organizational networks. Maps 3,460 agencies with 1,420 inter-agency relationships.

**Key Findings:**
- Most-mentioned: Office of Financial Management (450), Commerce (401), DSHS (330)
- Agency actions: 6,270 funding, 2,399 creation, 2,017 reporting, 1,512 collaboration
- Network visualization of organizational relationships

**Key Files:**
- `extract_agencies.py` - Main extraction script (Python)
- `agency-index.json` - 1.43 MB agency database
- `agency-network.json` - 1.70 MB relationship graph
- `agency-viz.html` - Interactive network visualization

**Quick Start:**
```bash
# Extract agencies from bills
python extract_agencies.py

# View network visualization
open agency-viz.html

# Read analysis
cat agency-report.md
```

### map-wa-legal-site

**Tier 3: Utility**

Automated bill acquisition system. Downloads bills from lawfilesext.leg.wa.gov with retry logic, rate limiting, and GitHub Actions integration.

**Key Files:**
- `download_bills.py` - Automated downloader (Python)
- `bills_config.json` - Configuration file
- `download-bills.yml` - GitHub Actions workflow

**Quick Start:**
```bash
# Install dependencies
pip install -r requirements.txt

# Download configured bills
python download_bills.py --config bills_config.json

# Or specify range
python download_bills.py --biennium 2023-24 --chamber House --start 1000 --end 1010
```

## How Projects Relate

```
map-wa-legal-site           →  Download bills
        ↓
budget-appropriations-explorer  →  Quick exploration of single bills
        ↓
appropriations-timeline     →  Compare funding across biennia
        ↓
parse-statutory-references  →  Find legal cross-references
        ↓
map-agencies-programs       →  Understand agency relationships
```

Each project answers a different question:
- **map-wa-legal-site**: "How do I get the bills?"
- **budget-appropriations-explorer**: "What's in this bill?"
- **appropriations-timeline**: "How has funding changed over time?"
- **parse-statutory-references**: "What laws does this bill affect?"
- **map-agencies-programs**: "How do agencies relate to each other?"

## Getting Started

### For Quick Bill Exploration
1. Open `budget-appropriations-explorer/budget-explorer.html`
2. Paste any XML budget bill
3. Instant interactive grid and charts

### For Funding Trend Analysis
1. Open `appropriations-timeline/timeline-viz.html`
2. View biennium-by-biennium comparisons
3. Read `funding-changes.md` for insights

### For Legal Research
1. Run `parse-statutory-references/parse-references.js`
2. View `reference-viz.html` network
3. Query `references.json` for specific RCW sections

### For Agency Research
1. Run `map-agencies-programs/extract_agencies.py`
2. View `agency-viz.html` network
3. Query `agency-index.json` for specific agencies

### For Bulk Bill Downloads
1. Configure `map-wa-legal-site/bills_config.json`
2. Run `python download_bills.py --config bills_config.json`

## Technology Stack

| Technology | Used In | Purpose |
|------------|---------|---------|
| Node.js | timeline, references | Server-side parsing |
| Python | agencies, legal-site | Extraction and downloads |
| Chart.js | explorer, timeline | Visualizations |
| Tabulator.js | explorer | High-performance grids |
| GitHub Actions | legal-site | Automation |
