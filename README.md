# Washington State Bills Analysis

Comprehensive analysis and extraction tools for Washington State legislative bills, with focus on structural patterns, budget data, and reusable parsing utilities.

## Overview

This repository contains:
- 10 Washington State bills (9 XML, 9 HTM) from 2022-2025 sessions
- Extraction library for parsing WA bill formats
- Categorized metadata and extracted entities in JSON format
- Detailed structural analysis report
- Interactive browser-based data explorer

## Deliverables

### 1. `bills-index.json`
Categorized list of all bills with metadata:
- Bill number, type (budget/policy/mixed)
- Title and description
- Sponsors and session information
- Agencies mentioned
- Key statistics (appropriations, sections, etc.)
- Fiscal data presence indicators

### 2. `bills-data.json`
All extracted entities from all bills:
- Complete bill data
- Normalized agencies (581 unique agencies)
- Appropriations (10,257 total)
- Account summaries (474 unique accounts)
- RCW references (1,473)
- Fiscal years (1991-2038)
- Summary statistics

**Total appropriations**: $472.3 billion

### 3. `extraction-library.js`
Reusable parsing functions for WA bill formats:
- Auto-detection of XML vs HTM formats
- Bill metadata extraction
- Fiscal data parsing (appropriations, accounts, amounts)
- Agency and department identification
- Section structure analysis
- Amendment tracking (strike/add markup)
- RCW reference extraction
- Entity normalization

**Functions**:
- `extractBill(content, filename)` - Main extraction function
- `extractXMLMetadata()` - Extract bill metadata
- `extractXMLFiscalData()` - Extract appropriations and fiscal data
- `extractXMLAgencies()` - Extract agencies and departments
- `extractXMLSections()` - Extract section structure
- `extractXMLAmendments()` - Extract amendments and RCW references
- `extractEntities()` - Normalize entities across all bills
- Plus utility functions for text processing and pattern matching

### 4. `patterns-report.md`
Comprehensive documentation of:
- Bill type categorization (budget vs policy)
- Structural elements and patterns
- XML vs HTM format differences
- Fiscal data patterns and account structures
- Agency identification methods
- Parsing challenges and solutions
- Edge cases (vetoes, multiple effective dates, provisos)
- Recommendations for future parsing

### 5. `demo.html`
Browser-based interface for querying the data:
- **Bills tab**: Browse and search all bills with filters
- **Agencies tab**: View agencies and their bill appearances
- **Appropriations tab**: Sortable appropriations list
- **Accounts tab**: Account summaries by total amount
- **Query Builder**: Execute lodash queries on the data
- **Charts**: Visual analytics (pie charts, bar charts)

**Features**:
- Real-time search and filtering
- Interactive charts (Chart.js)
- Lodash query execution
- No backend required - pure static files
- Responsive design

## Bill Types

### Budget Bills (7)
- **ESSB 5167.SL**: Operating Budget 2025-2027 (1,529 appropriations)
- **ESSB 5187.SL**: Operating Budget (1,374 appropriations)
- **SSB 5195.SL**: Capital Budget (3,639 appropriations)
- **ESSB 5200.SL**: Transportation Budget (3,184 appropriations)
- **ESSB 5693.SL**: Supplemental Budget (220 appropriations)
- **ESSB 5950.SL**: Omnibus Budget (311 appropriations)
- **SB 5092**: Budget Bill HTM (7,938 dollar amounts)

### Policy Bills (3)
- **2SHB 1210.SL**: Cannabis terminology replacement (176 sections)
- **SHB 1281.SL**: Technical corrections (257 sections)
- **E2SHB 1320.SL**: Accessibility modernization (172 sections)

## Key Statistics

| Metric | Count |
|--------|-------|
| Total Bills | 10 |
| Unique Agencies | 581 |
| Total Appropriations | 10,257 |
| Unique Accounts | 474 |
| Total Amount | $472.3 billion |
| RCW References | 1,473 |
| Fiscal Years | 1991-2038 |

## Usage

### Using the Extraction Library

```javascript
const lib = require('./extraction-library');
const fs = require('fs');

// Read and parse a bill
const content = fs.readFileSync('5167-S.xml', 'utf8');
const billData = lib.extractBill(content, '5167-S.xml');

console.log(billData.type); // 'budget'
console.log(billData.fiscal.appropriations.length); // 1529
console.log(billData.agencies.length); // 339
```

### Querying the Data (Browser)

Open `demo.html` in a browser and use the Query Builder:

```javascript
// Find all budget bills
_.filter(billsIndex, {type: 'budget'})

// Calculate total appropriations
_.sumBy(billsData.appropriations, 'numericAmount')

// Top 10 agencies
_.take(_.sortBy(billsData.agencies, a => -a.billsAppearingIn.length), 10)

// Find appropriations over $1B
_.filter(billsData.appropriations, a => a.numericAmount > 1000000000)

// Group appropriations by bill
_.groupBy(billsData.appropriations, 'billNumber')
```

### Generating Deliverables

```bash
# Generate all JSON deliverables
node generate-deliverables.js

# Run preliminary analysis
node analyze-bills.js
```

## File Structure

```
wa-bills/
├── bills-index.json          # Categorized bill metadata
├── bills-data.json           # All extracted entities
├── extraction-library.js     # Reusable parsing library
├── patterns-report.md        # Structural analysis report
├── demo.html                 # Interactive browser interface
├── generate-deliverables.js  # Main generation script
├── analyze-bills.js          # Preliminary analysis script
├── README.md                 # This file
├── *.xml                     # XML bill files
└── *.htm                     # HTM bill files
```

## Format Differences

### XML Format (Preferred)
- Structured semantic markup
- Consistent namespace: `xmlns="http://leg.wa.gov/2012/document"`
- Rich metadata preservation
- Specific tags for appropriations, amendments, sections
- Easy programmatic extraction

### HTM Format
- HTML-based presentation
- Less structured
- Primarily for human reading
- More difficult to parse programmatically

**Recommendation**: Always use XML format when available.

## Structural Patterns

### Common XML Elements (9/9 bills)
- `<CertifiedBill>` - Root element
- `<EnrollingCertificate>` - Certification and passage data
- `<BillHeading>` - Bill number, sponsors, session
- `<BillBody>` - Main content
- `<BillSection>` - Individual sections
- `<Appropriations>` - Fiscal appropriations (budget bills)
- `<Part>` - Organizational structure (budget bills)

### Appropriation Structure
```xml
<Appropriations agency="011">
  <Appropriation>
    <AccountName>
      <BudgetP>General Fund—State Appropriation (FY 2026)</BudgetP>
    </AccountName>
    <DollarAmount>$61,985,000</DollarAmount>
  </Appropriation>
</Appropriations>
```

### Amendment Markup
```xml
<TextRun amendingStyle="strike">old text</TextRun>
<TextRun amendingStyle="add">new text</TextRun>
```

## Top Agencies (by bill appearances)

1. Office of Financial Management (6 bills)
2. Department of Social and Health Services (6 bills)
3. Department of Health (6 bills)
4. Department of Corrections (6 bills)
5. Military Department (6 bills)

## Top Accounts (by total appropriations)

1. General Fund — Federal Appropriation: $80.7B
2. Future Biennia (Projected Costs): $63.5B
3. General Fund — State Appropriation (FY 2025): $56.3B
4. General Fund — State Appropriation (FY 2024): $43.5B
5. General Fund — State Appropriation (FY 2027): $36.7B

## Future-Proofing

The extraction library is designed to handle:
- New bill types with similar structures
- Additional fiscal years
- New agencies and departments
- Structural variations within existing patterns
- Both XML and HTM formats

All tools work with future WA bills following similar formats.

## Browser Requirements

The demo interface requires a modern browser with:
- JavaScript ES6 support
- Fetch API
- Chart.js and Lodash (loaded from CDN)

Simply open `demo.html` in any modern browser - no server required!

## License

Data is public information from Washington State Legislature. Tools and analysis provided as-is for educational and analytical purposes.

## Contributing

This is an analysis project for Washington State bills. To extend:

1. Add new bills to the repository (XML format preferred)
2. Run `node generate-deliverables.js`
3. Open `demo.html` to explore the updated data

## Notes

- Bills analyzed: 2022-2025 regular sessions
- All dollar amounts in USD
- Fiscal years represent state biennium budget cycles
- Appropriations include state, federal, and other fund sources
