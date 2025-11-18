# WA Budget Bill Parser

Automated parser for destructuring Washington State biennial operating budget bills into normalized database tables.

## Overview

This tool parses Washington State budget bills (XML format) and extracts:
- **Agencies and Programs**: Organizational hierarchy
- **Appropriations**: Funding amounts by account, fiscal year, and program
- **Provisos**: Conditions, restrictions, and directives
- **FTEs**: Full-time equivalent positions
- **Cross-references**: Links between bill sections

Data is stored in a normalized SQLite database for analysis and querying.

## Database Schema

The schema (`schema.sql`) includes:

### Core Tables
- `agencies`: Government agencies (code, name, biennium)
- `programs`: Programs within agencies
- `accounts`: Funding accounts (General Fund, special funds, etc.)
- `appropriations`: Funding amounts by program, account, and fiscal year
- `provisos`: Legislative conditions and directives
- `ftes`: Full-time equivalent staff positions
- `cross_references`: Section cross-references within bills

### Views
- `appropriations_summary`: Denormalized appropriations with names
- `agency_totals`: Total funding by agency and fiscal year

## Installation

```bash
npm install
```

Dependencies:
- `better-sqlite3`: Fast SQLite database
- `fast-xml-parser`: XML parsing

## Usage

### 1. Download Budget Bill

Download the bill files manually (automation blocked by WA Legislature website):

See `bills/2025-27/operating/README.md` for download links.

Place the XML file in `bills/2025-27/operating/ESSB-5167.xml`

### 2. Initialize Database

```bash
npm run init-db
```

This creates `wa-budget.db` with the schema.

### 3. Parse Budget Bill

```bash
npm run parse bills/2025-27/operating/ESSB-5167.xml
```

Or with options:

```bash
node src/index.js bills/2025-27/operating/ESSB-5167.xml --reset --db custom.db
```

Options:
- `--db <path>`: Database path (default: `./wa-budget.db`)
- `--biennium <year>`: Biennium (default: `2025-27`)
- `--bill-id <id>`: Bill identifier (default: `ESSB-5167`)
- `--reset`: Reset database before parsing

### 4. Query Data

Use SQLite to query the database:

```bash
sqlite3 wa-budget.db
```

Example queries:

```sql
-- Total budget by agency
SELECT * FROM agency_totals ORDER BY total_amount_dollars DESC;

-- All appropriations for a specific agency
SELECT * FROM appropriations_summary
WHERE agency_name LIKE '%Corrections%';

-- Provisos with restrictions
SELECT bill_section, proviso_text
FROM provisos
WHERE proviso_type = 'Restriction';

-- FTE counts by agency
SELECT a.agency_name, SUM(f.fte_count) as total_ftes
FROM ftes f
JOIN programs p ON f.program_id = p.program_id
JOIN agencies a ON p.agency_id = a.agency_id
GROUP BY a.agency_id;
```

## Project Structure

```
wa-bills/
├── schema.sql                 # Database schema
├── package.json               # Dependencies
├── src/
│   ├── index.js              # Main parser orchestrator
│   ├── init-db.js            # Database initialization
│   ├── extractors/
│   │   ├── xml-parser.js          # XML parsing utilities
│   │   ├── appropriations-extractor.js  # Appropriations extraction
│   │   └── proviso-extractor.js         # Proviso extraction
│   └── utils/
│       ├── text-utils.js     # Text processing utilities
│       └── db-utils.js       # Database utilities
└── bills/
    └── 2025-27/
        └── operating/
            ├── README.md     # Download instructions
            └── ESSB-5167.xml # Bill file (not in git)
```

## Parser Architecture

### 1. XML Parser (`extractors/xml-parser.js`)
- Parses bill XML structure
- Extracts sections, subsections, tables
- Handles nested legislative structure

### 2. Appropriations Extractor (`extractors/appropriations-extractor.js`)
- Identifies agencies and programs from section titles
- Extracts appropriations tables
- Parses textual appropriation patterns
- Extracts FTE data

### 3. Proviso Extractor (`extractors/proviso-extractor.js`)
- Identifies proviso language patterns
- Classifies proviso types (Restriction, Directive, Reporting, Intent)
- Extracts cross-references

### 4. Text Utilities (`utils/text-utils.js`)
- Parse dollar amounts (handles $1.2M, $1,234,567, etc.)
- Extract agency codes
- Normalize section references
- Classify proviso types

### 5. Database Utilities (`utils/db-utils.js`)
- Insert/upsert operations
- Extraction logging
- Statistics generation

## Data Flow

```
XML File
  ↓
XML Parser (parse structure)
  ↓
Section Extractor (identify sections)
  ↓
Appropriations Extractor → Agencies → Programs → Appropriations
  ↓
Proviso Extractor → Provisos → Cross-references
  ↓
SQLite Database
```

## Current Status (2025-27 Biennium)

**Bill**: ESSB 5167
**Budget**: $77.9B general fund, $150.4B total
**Status**: Enacted, Chapter 424, 2025 Laws PV

## Limitations & Future Work

### Current Limitations
1. **Manual Download**: WA Legislature blocks automated downloads
2. **Structure Variations**: Bill structure may vary across biennia
3. **Table Format Detection**: Table parsing is heuristic-based
4. **Proviso Linking**: Provisos not fully linked to specific appropriations
5. **XML Structure Assumptions**: Parser assumes specific XML structure

### Future Enhancements
1. **HTML Parser**: Support for HTM format bills
2. **PDF Parser**: Extract from PDF when XML unavailable
3. **Multi-biennium Support**: Parse multiple biennia and compare
4. **Enhanced Linking**: Better proviso → appropriation linking
5. **Validation**: Cross-check totals against official summaries
6. **Visualization**: Web interface for exploring budget data

## Edge Cases to Document

When parsing, document:
- Agencies with non-standard section formats
- Complex table structures
- Multi-line appropriation entries
- Proviso patterns not recognized
- Cross-references that fail to parse

These should be logged in the `extraction_log` table.

## Contributing

This is a prototype parser. Expected improvements:
1. Better pattern recognition for agency/program extraction
2. More robust table parsing
3. Enhanced proviso classification
4. Support for capital and transportation budgets

## License

MIT
