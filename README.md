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
- `wa-budget-bills.db` - SQLite database with all budget bill metadata
- `schema.sql` - Database schema definition
- `init-database.js` - Script to initialize and populate the database
- `query-database.js` - Command-line query tool
- `example-usage.js` - Example usage and programmatic queries
- `DATABASE.md` - Complete documentation of the database

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

## Future Goals

This database provides the foundation for deeper analysis:

### Bill Content (Future)
- XML, HTM, and PDF formats of enacted bills
- Full-text search capabilities
- Document download and storage

### Data Extraction (Future)
- Agencies and programs
- Appropriations amounts and accounts
- Proviso language (conditions, restrictions)
- Structural hierarchy (agency → program → account)
- Cross-references between sections

### Analysis (Future)
1. Parse bills into normalized database structures
2. Compare different schema approaches
3. Build reusable parsing libraries
4. Document structural patterns across biennia
5. Track budget changes over time

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
