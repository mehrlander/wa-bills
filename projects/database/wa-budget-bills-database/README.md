# WA Budget Bills Analysis

Repository for parsing and analyzing Washington State budget bills.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database with all budget bills since 2000
npm run init-db

# Query the database
npm run query stats
npm run query list
npm run query biennium 2023-25

# Run example usage
node example-usage.js
```

## What's Included

### Database
- **27 operating budget bills** from 2000-2025
- **14 biennia** covered (1999-01 through 2025-27)
- Biennial budgets, supplemental budgets, and special session budgets
- Companion bill relationships
- Enactment dates and chapter numbers

### Files

**Database & Metadata:**
- `wa-budget-bills.db` - SQLite database with all budget bill metadata
- `schema.sql` - Database schema for bill metadata
- `init-database.js` - Script to initialize and populate the database
- `query-database.js` - Command-line query tool
- `example-usage.js` - Example usage and programmatic queries
- `DATABASE.md` - Complete documentation of the metadata database

**Content Schema (for parsing bill content):**
- `content-schema.sql` - Relational schema for appropriations, agencies, programs, funds, provisos
- `CONTENT-SCHEMA.md` - Detailed documentation of the content database design
- `SCHEMA-DIAGRAM.md` - Entity relationship diagrams and query patterns
- `example-content-data.sql` - Example data showing how bills map to the schema

## Database Overview

The database contains comprehensive information about Washington State operating budget bills:

- **Total Bills**: 27
- **Bienniums**: 14 (1999-01 to 2025-27)
- **Year Range**: 2000-2025
- **Bill Types**: Biennial (17), Supplemental (9), Special Session (1)
- **Chambers**: House (10), Senate (17)

### Recent Bills

- **2025-27**: ESSB 5167 (enacted May 20, 2025)
- **2023-25**: ESSB 5187, ESSB 5950 (supplemental)
- **2021-23**: SB 5092
- **2019-21**: HB 1109 (partial veto), ESSB 5153
- **2017-19**: ESSB 5096, ESSB 6032 (supplemental)

See [DATABASE.md](DATABASE.md) for the complete list and detailed documentation.

## Usage Examples

### Command Line

```bash
# List all bills
node query-database.js list

# Get bills for specific biennium
node query-database.js biennium 2023-25

# Get all supplemental budgets
node query-database.js type supplemental

# Search bills
node query-database.js search "appropriations"

# Get bill details
node query-database.js bill "ESSB 5167" 2025

# Show statistics
node query-database.js stats

# Show companion bills
node query-database.js companions

# Show summary by biennium
node query-database.js summary
```

### Programmatic

```javascript
const { openDatabase, queryDatabase } = require('./query-database.js');

async function example() {
    const db = await openDatabase();

    // Get all bills from 2023-25 biennium
    const bills = await queryDatabase(db,
        'SELECT * FROM budget_bills WHERE biennium = ?',
        ['2023-25']
    );

    console.table(bills);
    db.close();
}
```

See [example-usage.js](example-usage.js) for more examples.

## Database Architecture

This repository provides two complementary database schemas:

### 1. Metadata Database (Implemented)

The **metadata database** (`schema.sql`) contains information about the bills themselves:
- Bill numbers and legislative sessions
- Bienniums and fiscal periods
- Enactment dates and chapter numbers
- Bill relationships (companions, amendments)
- Available formats (XML, HTM, PDF)

**Status**: ✅ Fully implemented with 27 bills from 2000-2025

### 2. Content Database (Schema Designed)

The **content database** (`content-schema.sql`) is designed to capture the actual budget appropriations:

**Organizational Structure:**
- State agencies and departments
- Programs and sub-programs within agencies

**Financial Data:**
- Appropriations by agency and program
- Fund sources (General Fund, dedicated accounts)
- Dollar amounts by fiscal year and fund
- Appropriation types (direct, reappropriation, transfer)

**Staffing:**
- FTE (Full-Time Equivalent) authorizations
- Position counts by fiscal year

**Conditions:**
- Proviso language and restrictions
- Directives and reporting requirements

**Structure:**
- Bill sections and organizational parts
- Cross-references to RCW and other sections

**Status**: 📐 Schema designed and documented, ready for bill parsing implementation

See [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) for complete documentation and [SCHEMA-DIAGRAM.md](SCHEMA-DIAGRAM.md) for entity relationships.

## Next Steps

### Bill Content Parsing (Future)
1. Download bill documents (XML, HTM, PDF formats)
2. Build parsers to extract structured data from bills
3. Populate content database with appropriations data
4. Implement full-text search for proviso language

### Analysis Tools (Future)
1. Cross-biennium trend analysis
2. Agency spending comparisons
3. Fund source analysis
4. Proviso tracking and categorization
5. Budget change tracking (governor → house → senate → enacted)

## Data Sources

Bill information compiled from:
- Washington State Fiscal Information (fiscal.wa.gov)
- Washington State Legislature (leg.wa.gov)
- Office of Financial Management (ofm.wa.gov)
- LEAP (Legislative Evaluation & Accountability Program)

## Notes

- Bills are large (500-1400 pages when in document format)
- Bill structure may vary across biennia and formats
- All bill numbers and session years have been verified
- Enactment dates included where available from official sources

## License

This database compilation is provided for research and analysis purposes. The underlying bill data is public information from the Washington State Legislature.
