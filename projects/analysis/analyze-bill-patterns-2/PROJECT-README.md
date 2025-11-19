# WA Bills Structural Pattern Analysis

**Comprehensive analysis and extraction system for Washington State legislation**

This project provides tools to analyze, extract, and query data from Washington State bills across multiple formats (XML/HTM), with a focus on budget appropriations and structural patterns.

## Overview

Analyzed **9 bills** (18 files total) spanning 2021-2027 biennia:
- **6 Budget Bills**: Operating budgets, capital budgets, and supplementals
- **3 Policy Bills**: Legislative changes to RCW statutes
- **$349.9 billion** in total appropriations
- **7,763 appropriations** across 271 agencies

## Deliverables

### 1. bills-index.json (84 KB)
Categorized list of all bills with metadata:
```json
{
  "billNumber": "5167-S",
  "type": "budget/operating",
  "sessionLawCaption": "OPERATING BUDGET",
  "briefDescription": "Making 2025-2027 fiscal biennium operating appropriations...",
  "session": "2025 Regular Session",
  "appropriationCount": 2351,
  "agencyCodes": ["011", "012", ...],
  "totalAppropriationAmount": 134914718000,
  "hasFiscalData": true,
  "keySections": [...]
}
```

**Key Features:**
- Bill categorization (budget/operating, budget/capital, policy)
- Appropriation counts and totals
- Agency lists and department counts
- Key sections with metadata
- Fiscal year tracking
- Amendment statistics

### 2. bills-data.json (4.1 MB)
Comprehensive normalized data structure with all entities:
```json
{
  "metadata": {
    "generatedAt": "2025-11-19T...",
    "billCount": 9,
    "totalAppropriations": 7763,
    "totalAgencies": 271
  },
  "bills": [...],
  "appropriations": [...],
  "sections": [...],
  "parts": [...],
  "agencies": {...},
  "crossReferences": {...},
  "aggregates": {...}
}
```

**Includes:**
- Normalized entities (bills, appropriations, sections, parts)
- Agency and department lookups
- RCW and bill cross-references
- Pre-computed aggregates for fast querying
- Appropriations by agency and account type

### 3. extraction-library.js (15 KB)
Reusable JavaScript parsing library for WA bill formats:

**Core Functions:**
- `parseXMLBill(filePath)` - Parse full XML bill
- `extractAppropriations(content)` - Extract budget data
- `extractMetadata(content)` - Extract bill metadata
- `extractSections(content)` - Parse bill sections
- `extractAgencies(content)` - Identify agencies mentioned
- `extractCrossReferences(content)` - Find RCW and bill references
- `categorizeBill(billData)` - Classify bill type
- `extractAllEntities(billData)` - Normalize for database

**Usage:**
```javascript
const lib = require('./extraction-library');
const billData = lib.parseXMLBill('5167-S.xml');
const entities = lib.extractAllEntities(billData);
```

**Features:**
- Handles both XML and HTM formats
- Manages large files (up to 4.7MB)
- Flexible pattern matching for structural variations
- Comprehensive error handling
- Unicode and XML entity support

### 4. patterns-report.md (24 KB)
Detailed documentation of structural patterns, format differences, and parsing challenges:

**Contents:**
- Bill categorization and types
- Structural elements (metadata, appropriations, sections)
- XML vs HTM format comparison
- Parsing challenges and solutions
- Budget vs Policy vs Capital bill patterns
- Agency codes and account types
- Cross-references and dependencies
- Edge cases (vetoes, reappropriations, multiple effective dates)
- Recommendations for future parsing

**Highlights:**
- 11 major sections covering all aspects
- Code examples and data samples
- Statistics and summaries
- Best practices for parsing WA bills

### 5. demo.html (28 KB)
Browser-based interactive interface for querying the data:

**Features:**
- **Overview Dashboard**: Statistics and summaries
- **Bills Index**: Searchable/filterable bill list
- **Appropriations Browser**: Filter by bill, agency, amount
- **Agencies View**: Top agencies by total appropriations
- **Visualizations**: Charts for bill types, agencies, account types
- **Advanced Query**: Lodash-powered custom queries

**Technologies:**
- Vanilla JavaScript (no build process required)
- Lodash 4.17.21 for data manipulation
- Chart.js 4.4.0 for visualizations
- Fully client-side (loads JSON files directly)
- Responsive design

**Usage:**
```bash
# Open in browser (requires bills-index.json and bills-data.json)
open demo.html
```

## Project Structure

```
wa-bills/
├── Bills (XML and HTM)
│   ├── 1210-S2.xml / .htm    (Policy: Cannabis terminology)
│   ├── 1281-S.xml / .htm     (Policy: Technical corrections)
│   ├── 1320-S2.xml / .htm    (Policy: Civil protection orders)
│   ├── 5092-S.htm            (Budget: HTM only)
│   ├── 5167-S.xml / .htm     (Budget: 2025-27 Operating)
│   ├── 5187-S.xml / .htm     (Budget: Operating)
│   ├── 5195-S.xml / .htm     (Budget: Capital)
│   ├── 5200-S.xml            (Budget: Capital, XML only)
│   ├── 5693-S.xml / .htm     (Budget: Supplemental Operating)
│   └── 5950-S.xml / .htm     (Budget: 2023-25 Supplemental)
│
├── Deliverables
│   ├── bills-index.json          (Categorized metadata)
│   ├── bills-data.json           (All extracted entities)
│   ├── extraction-library.js     (Parsing functions)
│   ├── patterns-report.md        (Structural analysis)
│   └── demo.html                 (Browser interface)
│
├── Scripts
│   ├── analyze-bills.js          (Initial analysis)
│   ├── extract-all-bills.js      (Main extraction)
│   └── analysis-results.json     (Intermediate results)
│
└── Documentation
    ├── README.md                  (Original repo README)
    └── PROJECT-README.md          (This file)
```

## Quick Start

### 1. Run Extraction
```bash
# Extract all bills to JSON
node extract-all-bills.js

# Output:
# - bills-index.json
# - bills-data.json
```

### 2. View in Browser
```bash
# Open the demo interface
open demo.html
# or
python3 -m http.server 8000  # then visit http://localhost:8000/demo.html
```

### 3. Use the Library
```javascript
const lib = require('./extraction-library');

// Parse a bill
const bill = lib.parseXMLBill('./5167-S.xml');

// Get summary
const summary = lib.getBillSummary(bill);
console.log(summary);

// Extract specific data
const appropriations = bill.appropriations;
const agencies = bill.agencies;
const sections = bill.sections;
```

### 4. Query the Data
```javascript
// Load the data
const billsData = require('./bills-data.json');
const billsIndex = require('./bills-index.json');

// Use lodash for queries
const _ = require('lodash');

// Total appropriations
const total = _.sumBy(
  billsData.appropriations.filter(a => !a.isTotal),
  'amount'
);

// Top 10 agencies
const topAgencies = _.chain(billsData.appropriations)
  .filter(a => !a.isTotal)
  .groupBy('departmentName')
  .map((approp, dept) => ({
    department: dept,
    total: _.sumBy(approp, 'amount')
  }))
  .orderBy('total', 'desc')
  .take(10)
  .value();
```

## Bill Types

### Budget/Operating
- **Purpose**: Biennial state agency funding
- **Structure**: 200+ agencies, 9 major parts by government function
- **Size**: $100B+ per biennium
- **Examples**: 5167-S (2025-27), 5187-S

### Budget/Operating-Supplemental
- **Purpose**: Mid-biennium adjustments
- **Structure**: Amendments to base budget
- **Size**: $300M - $4B
- **Examples**: 5693-S, 5950-S

### Budget/Capital
- **Purpose**: Infrastructure and capital projects
- **Structure**: Project-specific allocations, bond authorizations
- **Size**: Varies widely
- **Examples**: 5195-S, 5200-S

### Policy
- **Purpose**: Amend Revised Code of Washington (RCW)
- **Structure**: Strike/add markup, RCW citations
- **Size**: 100-500 sections, no appropriations
- **Examples**: 1210-S2 (Cannabis), 1281-S (Technical corrections)

## Key Findings

### Structural Patterns
1. **XML Format**: Highly structured, consistent namespace, complete metadata
2. **Appropriations**: Explicit tagging with agency codes, account names, dollar amounts
3. **Parts**: Budget bills divided into 9 functional parts (Government, Human Services, etc.)
4. **Proviso Language**: Conditions and limitations follow appropriations
5. **Cross-References**: Extensive RCW citations in policy bills

### Format Differences
- **XML**: Semantic tags, parseable structure, complete data
- **HTM**: Similar structure to XML, human-readable, occasionally missing
- **Recommendation**: Use XML as primary, HTM as fallback

### Parsing Challenges
1. **Large Files**: Up to 4.7MB require efficient parsing
2. **Deep Nesting**: Complex hierarchies need recursive handling
3. **Proviso Language**: Unstructured narrative text with embedded data
4. **Variations**: Different formatting across years and bill types
5. **Special Cases**: Vetoes, reappropriations, multiple effective dates

## Statistics

### Bill Counts
- **Total Bills**: 9
- **Budget Bills**: 6 (Operating: 2, Supplemental: 2, Capital: 2)
- **Policy Bills**: 3

### Data Volume
- **Total Sections**: 4,032
- **Total Appropriations**: 7,763
- **Unique Agencies**: 271
- **Unique Departments**: 576
- **Total Amount**: $349.9 billion

### File Sizes
- **Largest Bill**: 5167-S.xml (4.7MB, 420 sections, 2,351 appropriations)
- **Most Sections**: 5195-S (1,180 sections - Capital Budget)
- **Most Appropriations**: 5167-S (2,351 appropriations)

## Use Cases

### 1. Budget Analysis
```javascript
// Get all operating budget appropriations for DSHS
const dshsApprop = billsData.appropriations.filter(a =>
  a.billId === '5167-S' &&
  a.departmentName.includes('Social and Health Services')
);
```

### 2. Multi-Year Comparison
```javascript
// Compare operating budgets across biennia
const operatingBudgets = billsIndex
  .filter(b => b.type === 'budget/operating')
  .map(b => ({
    bill: b.billNumber,
    session: b.session,
    total: b.totalAppropriationAmount
  }));
```

### 3. Policy Tracking
```javascript
// Find all bills that amended a specific RCW
const rcwSection = '69.50.101';
const bills = billsData.crossReferences.rcw
  .filter(ref => ref.rcw === rcwSection)
  .map(ref => ref.billId);
```

### 4. Agency Budget Trends
```javascript
// Total appropriations by agency
const agencyTotals = _.chain(billsData.appropriations)
  .filter(a => !a.isTotal)
  .groupBy('agencyCode')
  .map((approp, code) => ({
    agencyCode: code,
    total: _.sumBy(approp, 'amount'),
    count: approp.length
  }))
  .orderBy('total', 'desc')
  .value();
```

## Browser-Based Querying

The demo.html interface is optimized for browser-based exploration:

### Query Examples (in Advanced Query tab)
```javascript
// Total appropriations
_.sumBy(billsData.appropriations.filter(a => !a.isTotal), 'amount')

// Top 10 agencies
_.chain(billsData.appropriations)
  .filter(a => !a.isTotal && a.amount)
  .groupBy('departmentName')
  .map((approp, dept) => ({
    department: dept,
    total: _.sumBy(approp, 'amount')
  }))
  .orderBy('total', 'desc')
  .take(10)
  .value()

// Budget bills with totals
billsIndex
  .filter(b => b.type.includes('budget'))
  .map(b => ({
    bill: b.billNumber,
    type: b.type,
    total: b.totalAppropriationAmount
  }))

// Average appropriation by bill
_.chain(billsData.appropriations)
  .filter(a => !a.isTotal && a.amount)
  .groupBy('billId')
  .map((approp, bill) => ({
    bill,
    avg: _.meanBy(approp, 'amount')
  }))
  .value()
```

## Future Enhancements

### Potential Additions
1. **NLP for Proviso Analysis**: Extract policy directives from narrative text
2. **Multi-Year Tracking**: Link appropriations across biennia
3. **Veto Analysis**: Track veto patterns and fiscal impact
4. **Fiscal Note Extraction**: Parse embedded fiscal impact statements
5. **Full-Text Search**: Index proviso language and bill text
6. **API Development**: RESTful API for programmatic access
7. **Database Integration**: SQLite/PostgreSQL schema and import scripts
8. **Real-Time Updates**: Monitor legislature website for new bills

### Optimization Opportunities
1. **Lazy Loading**: Load sections on demand for large bills
2. **Web Workers**: Offload parsing to background threads
3. **Incremental Parsing**: Process bills in chunks
4. **Caching**: Store parsed results for faster subsequent loads
5. **Compression**: Gzip JSON files for smaller downloads

## Technical Details

### Dependencies
- **Node.js**: v12+ for extraction scripts
- **Lodash**: 4.17.21 for data manipulation (CDN in demo.html)
- **Chart.js**: 4.4.0 for visualizations (CDN in demo.html)
- No build process required for browser interface

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern ES6+ JavaScript required

### Performance
- **Parse Time**: ~2-3 seconds per bill
- **Total Extraction**: ~30 seconds (all 9 bills)
- **Memory Usage**: <200MB peak
- **JSON Loading**: <1 second for both files (~4.2MB total)

## License & Attribution

This project analyzes Washington State legislative data, which is in the public domain. The extraction tools and analysis are provided as-is for educational and research purposes.

**Data Source**: Washington State Legislature (leg.wa.gov)

## Contact & Contributions

For questions, issues, or contributions to this analysis framework, please refer to the patterns-report.md for detailed documentation on structural patterns and parsing methodologies.

---

**Generated**: 2025-11-19
**Version**: 1.0
**Analysis Coverage**: 9 bills, 2021-2027 biennia
