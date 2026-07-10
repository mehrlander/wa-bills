# Washington State Legislation Data

This folder contains Washington State Legislature API documentation and bill data.

## Folder Structure

```
legislation/
├── schema/              # API documentation and specifications
│   ├── API_CATALOG.json # Machine-readable API catalog (all endpoints, types, operations)
│   ├── API_REFERENCE.md # Developer reference documentation
│   ├── specs/           # Official WSDL files and data dictionary
│   └── archive/         # Historical research (prior-research.tar.gz)
│
├── data/                # Bill data by biennium (40,160 bills total)
│   ├── json/            # Full bill records as JSON arrays
│   ├── csv/             # Flattened tabular format for spreadsheets
│   ├── index.json       # Metadata catalog with bill counts and file sizes
│   ├── BILL_DATA_ANALYSIS.md
│   └── CONDENSED_BILL_SCHEMA.md
│
└── tools/               # Utility scripts
    ├── transform_bills.py  # Data transformation between formats
    └── bookmarklet.js      # Browser helper for WA Legislature site
```

## Quick Start

### API Documentation
- **[schema/API_REFERENCE.md](schema/API_REFERENCE.md)** - Human-readable API reference
- **[schema/API_CATALOG.json](schema/API_CATALOG.json)** - Machine-readable catalog for tooling

### Bill Data
Load bill data for a specific biennium:

```python
import json
with open('data/json/2025-26.json') as f:
    bills = json.load(f)
print(f"Loaded {len(bills)} bills")
```

Or use CSV for spreadsheet analysis:
```bash
# View in terminal
head data/csv/2025-26.csv

# Open in spreadsheet application
open data/csv/2025-26.csv
```

## Data Formats

| Format | Location | Best For |
|--------|----------|----------|
| JSON | `data/json/` | Programmatic access, full bill records |
| CSV | `data/csv/` | Spreadsheets, SQL import, quick exploration |

## Bienniums Available

| Biennium | Bills | JSON Size |
|----------|-------|-----------|
| 2009-10 | 2,318 | 1.3 MB |
| 2011-12 | 5,003 | 2.8 MB |
| 2013-14 | 4,906 | 2.8 MB |
| 2015-16 | 5,216 | 3.0 MB |
| 2017-18 | 5,577 | 3.0 MB |
| 2019-20 | 5,766 | 3.0 MB |
| 2021-22 | 3,390 | 1.8 MB |
| 2023-24 | 4,800 | 2.3 MB |
| 2025-26 | 3,184 | 1.6 MB |
| **Total** | **40,160** | **22 MB** |

## Source

Data retrieved from the [Washington State Legislature Web Services](https://wslwebservices.leg.wa.gov/).
