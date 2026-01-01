# Database Projects

**Purpose:** Create normalized relational databases for querying across multiple Washington State budget bills, enabling SQL-based analysis and historical tracking.

## Overview

Database projects transform unstructured bill XML/HTM into queryable relational databases. They define schemas and build automation to parse bills into SQLite databases, enabling complex queries across agencies, programs, and fiscal years.

**Best For:** SQL-based analysis, historical tracking, complex queries across biennia.

## Projects

| Project | Output | Status | Description |
|---------|--------|--------|-------------|
| [wa-budget-automation](./wa-budget-automation/) | SQLite + Parser | **Recommended** | Normalized database with 7-table schema |
| [wa-budget-bills-database](./wa-budget-bills-database/) | SQLite + Docs | Stable | Historical metadata catalog (27 bills, 25 years) |

## Detailed Descriptions

### wa-budget-automation (Recommended)

**Tier 1: Production-Ready**

Transforms unstructured bill XML into queryable relational database. Currently parses 2025-27 ESSB 5167 ($77.9B general fund, $150.4B total). Enables SQL-based analysis across agencies, programs, and fiscal years.

**Database Schema (7 tables):**
- `agencies` - Government agencies with codes
- `programs` - Programs within agencies
- `accounts` - Funding accounts
- `appropriations` - Funding amounts by program/account/fiscal year
- `provisos` - Legislative conditions and restrictions
- `ftes` - Full-time equivalent positions
- `cross_references` - Section cross-references

**Key Files:**
- `wa-budget.db` - Normalized SQLite database
- `schema.sql` - 7-table normalized schema
- `index.js` - Main orchestrator
- `appropriations-extractor.js` - Appropriations parser
- `proviso-extractor.js` - Provisos parser

**Quick Start:**
```bash
cd wa-budget-automation
npm install

# Initialize database
npm run init-db

# Parse a bill
npm run parse ../bills/2025-27/operating/ESSB-5167.xml

# Query with SQLite
sqlite3 wa-budget.db
> SELECT * FROM agency_totals ORDER BY total_amount_dollars DESC;
```

### wa-budget-bills-database

**Tier 2: Metadata Catalog**

Most comprehensive historical metadata catalog spanning 25+ years. Phase 1 provides complete reference of WA budget bills with query tools. Phase 2 content parsing schema is designed but not yet implemented.

**Coverage:**
- 27 bills across 14 biennia (1999-2025)
- 17 biennial budgets, 9 supplemental, 1 special session
- Tracks available formats (XML, HTM, PDF) with official URLs
- Bill relationships and companions

**Key Files:**
- `wa-budget-bills.db` - Metadata database with 27 bills
- `schema.sql` - Metadata schema (bills, formats, companions)
- `content-schema.sql` - Designed content schema (14+ tables, not yet implemented)
- `query-database.js` - Command-line query tool
- `example-usage.js` - 10 query examples

**Quick Start:**
```bash
cd wa-budget-bills-database
npm install

# Initialize with all 27 bills
npm run init-db

# Query from command line
node query-database.js list              # All bills
node query-database.js biennium 2023-25  # By biennium
node query-database.js type supplemental # By type
```

## How Projects Relate

```
wa-budget-bills-database  →  Historical metadata (WHAT bills exist)
         ↓
wa-budget-automation      →  Parse bill content (WHAT's IN the bills)
```

These projects are complementary:
- **wa-budget-bills-database** catalogs which bills exist and their metadata
- **wa-budget-automation** extracts detailed content from individual bills

Future integration could combine both: use the metadata catalog to discover bills, then parse their content into the automation database.

## Getting Started

### For SQL Analysis
1. Set up `wa-budget-automation`
2. Parse your target bills into the database
3. Write SQL queries to analyze appropriations, agencies, provisos

### For Historical Research
1. Use `wa-budget-bills-database` to find bills across 25 years
2. Query by biennium, type, or format availability
3. Get official URLs for bill documents

### Example Queries

**Find top-funded agencies:**
```sql
-- Using wa-budget-automation
SELECT agency_name, SUM(amount) as total
FROM appropriations
GROUP BY agency_name
ORDER BY total DESC
LIMIT 10;
```

**Find bills by biennium:**
```bash
# Using wa-budget-bills-database
node query-database.js biennium 2023-25
```

## Technology Stack

| Technology | Used In | Purpose |
|------------|---------|---------|
| SQLite | Both projects | Relational data storage |
| Node.js | Both projects | Parsing and automation |
| xmldom | wa-budget-automation | XML parsing |

## Recommended Next Steps

1. **Expand wa-budget-automation** to parse all available bills (not just 2025-27)
2. **Implement content-schema.sql** from wa-budget-bills-database
3. **Connect both databases** for unified historical + content analysis
4. **Build web UI** for querying without SQL knowledge
