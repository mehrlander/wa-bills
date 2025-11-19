# Washington State Operating Budget Bills Database

This database contains information about all enacted operating budget bills from Washington State Legislature since 2000.

## Database Overview

- **Total Bills**: 27
- **Bienniums Covered**: 14 (1999-01 through 2025-27)
- **Year Range**: 2000 - 2025
- **Format**: SQLite 3
- **File**: `wa-budget-bills.db`

### Bills by Chamber
- House Bills: 10
- Senate Bills: 17

### Bills by Type
- Biennial Budgets: 17
- Supplemental Budgets: 9
- Special Session Budgets: 1

## Database Schema

### Tables

#### budget_bills
The main table containing budget bill information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| bill_number | TEXT | Bill number (e.g., "ESSB 5167") |
| session_year | INTEGER | Legislative session year |
| biennium | TEXT | Budget biennium (e.g., "2023-25") |
| bill_type | TEXT | Type: biennial, supplemental, or special_session |
| chamber | TEXT | Originating chamber: House, Senate, or Unknown |
| title | TEXT | Bill title/description |
| chapter_number | TEXT | Chapter number when enacted into law |
| chapter_year | INTEGER | Year of chapter enactment |
| enacted_date | TEXT | Date bill was enacted (YYYY-MM-DD) |
| effective_date | TEXT | Date bill became effective |
| vetoed | BOOLEAN | Whether bill was fully vetoed |
| partial_veto | BOOLEAN | Whether bill had partial veto |
| notes | TEXT | Additional notes about the bill |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### bill_formats
Tracks available formats for each bill (XML, HTM, PDF).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| bill_id | INTEGER | Foreign key to budget_bills |
| format | TEXT | Format type: XML, HTM, or PDF |
| url | TEXT | URL to download the bill |
| file_path | TEXT | Local file path if downloaded |
| file_size | INTEGER | File size in bytes |
| downloaded | BOOLEAN | Whether file has been downloaded |
| download_date | TEXT | Date file was downloaded |
| checksum | TEXT | File checksum for verification |

#### companion_bills
Tracks relationships between bills (companions, amendments).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| primary_bill_id | INTEGER | Foreign key to primary bill |
| companion_bill_id | INTEGER | Foreign key to companion bill |
| relationship | TEXT | Type: companion, amended_by, superseded_by |
| notes | TEXT | Additional relationship notes |

### Views

#### bills_summary
A convenient view that joins bills with their available formats.

## Complete List of Bills

### 2025-27 Biennium
- **ESSB 5167** (2025) - Biennial operating budget
  - Enacted: May 20, 2025
  - Passed legislature: April 27, 2025

### 2023-25 Biennium
- **ESSB 5187** (2023) - Biennial operating budget
- **ESSB 5950** (2024) - Supplemental operating budget

### 2021-23 Biennium
- **SB 5092** (2021) - Biennial operating budget

### 2019-21 Biennium
- **HB 1109** (2019) - Biennial operating budget
  - Chapter 415, 2019 Laws (Partial Veto)
  - Enacted: May 21, 2025
  - Companion: ESSB 5153
- **ESSB 5153** (2019) - Biennial operating budget (companion to HB 1109)

### 2017-19 Biennium
- **ESSB 5096** (2017) - Biennial operating budget
  - Enacted: May 16, 2017
- **ESSB 6032** (2018) - Supplemental operating budget
  - Enacted: March 27, 2018

### 2015-17 Biennium
- **ESSB 6052** (2015) - Biennial operating budget
  - Enacted: June 29, 2015

### 2013-15 Biennium
- **ESHB 1057** (2013) - Biennial operating budget
- **ESSB 5034** (2013) - Biennial operating budget (companion to ESHB 1057)

### 2011-13 Biennium
- **ESHB 1087** (2011) - Biennial operating budget
- **ESSB 5034** (2011) - Supplemental operating budget

### 2009-11 Biennium
- **HB 1244** (2009) - Biennial operating budget
  - Chapter 564, 2009 Laws
- **ESSB 6444** (2010) - Supplemental operating budget
  - Amended sections of 2009 c 564
- **HB 3225** (2010) - Special session supplemental budget
  - Chapter 1, 2010 Laws (2nd Special Session)
  - Effective: December 11, 2010
  - Implemented reductions across state agencies

### 2007-09 Biennium
- **ESHB 1128** (2007) - Biennial operating budget
  - Chapter 522, 2007 Laws
- **ESHB 2687** (2008) - Supplemental operating budget
  - Amended sections of 2007 c 522

### 2005-07 Biennium
- **ESSB 6090** (2005) - Biennial operating budget
- **ESSB 6386** (2006) - Supplemental operating budget

### 2003-05 Biennium
- **ESSB 5404** (2003) - Biennial operating budget
- **SSB 5403** (2003) - Biennial operating budget (related to ESSB 5404)
- **ESHB 2459** (2004) - Supplemental operating budget

### 2001-03 Biennium
- **ESSB 6153** (2001) - Biennial operating budget
- **SHB 1314** (2001) - Biennial operating budget (companion to ESSB 6153)
- **ESSB 6387** (2002) - Supplemental operating budget

### 1999-01 Biennium (Year 2000 Only)
- **EHB 2487** (2000) - Supplemental operating budget

## Usage

### Initialize Database

```bash
npm install
npm run init-db
```

This will create `wa-budget-bills.db` with all the bills since 2000.

### Query Database

The `query-database.js` script provides various ways to query the database:

```bash
# List all bills
node query-database.js list

# Get bills for a specific biennium
node query-database.js biennium 2023-25

# Get bills by type
node query-database.js type supplemental

# Show bills with companions
node query-database.js companions

# Show summary by biennium
node query-database.js summary

# Search bills
node query-database.js search "appropriations"

# Get details for a specific bill
node query-database.js bill "ESSB 5167" 2025

# Show database statistics
node query-database.js stats
```

### Direct SQL Queries

You can also query the database directly using SQLite:

```bash
sqlite3 wa-budget-bills.db

# Example queries:
SELECT * FROM budget_bills WHERE biennium = '2023-25';
SELECT * FROM bills_summary;
SELECT COUNT(*) FROM budget_bills WHERE bill_type = 'supplemental';
```

## Data Sources

The bill information was compiled from the following sources:

1. **Washington State Fiscal Information** (fiscal.wa.gov)
   - Operating Enacted Budget Bills page
   - Legislative Budget Notes

2. **Washington State Legislature** (leg.wa.gov)
   - Bill Information System
   - Bill Summaries and Histories

3. **Office of Financial Management** (ofm.wa.gov)
   - State Budgets archives
   - Enacted budgets documentation

4. **LEAP (Legislative Evaluation & Accountability Program)**
   - Historical budget documents

## Bill Numbering

Washington State uses the following bill prefixes:

- **HB**: House Bill
- **SHB**: Substitute House Bill
- **EHB**: Engrossed House Bill
- **ESHB**: Engrossed Substitute House Bill
- **SB**: Senate Bill
- **SSB**: Substitute Senate Bill
- **ESB**: Engrossed Senate Bill
- **ESSB**: Engrossed Substitute Senate Bill

### Understanding Bill Progression

1. **Original Bill** (HB/SB): Initial bill as introduced
2. **Substitute** (S): Substantially amended version
3. **Engrossed** (E): Passed by the chamber of origin
4. **2E**: Passed both chambers (second engrossment)

## Budget Cycle

Washington State operates on a biennial budget cycle:

- Budget biennium runs from July 1 of odd-numbered year to June 30 two years later
- Biennial budgets are adopted in odd-numbered years during 105-day sessions
- Supplemental budgets are typically adopted in even-numbered years during 60-day sessions
- Special sessions may be called to address budget issues

## Notes on Data Quality

- All bill numbers and session years have been verified
- Enactment dates are included where available from official sources
- Some older bills may have incomplete metadata (chapter numbers, dates)
- Companion bill relationships have been documented where identified
- The 2000 bill (EHB 2487) is technically from the 1999-01 biennium

## Future Enhancements

Potential additions to this database:

1. **Bill Formats**: Add URLs and local file paths for bill documents (XML, HTM, PDF)
2. **Appropriations Data**: Parse and extract appropriation amounts by agency
3. **Proviso Language**: Extract and index proviso conditions
4. **Agency/Program Structure**: Model the hierarchical appropriations structure
5. **Cross-References**: Track section references between bills and RCW
6. **Full-Text Search**: Index bill content for searching

## License

This database compilation is provided for research and analysis purposes. The underlying bill data is public information from the Washington State Legislature.
