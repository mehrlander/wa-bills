# Washington State Bill Data Extraction Tools

Comprehensive data extraction and analysis tools for Washington State legislative bills, with a focus on operating budget appropriations bills.

## Overview

This repository contains tools to parse, extract, and analyze structured data from WA legislative bills in HTM and XML formats. The project demonstrates bill data extraction from **ESSB 5187** (2023-2025 Operating Budget, $304.6 billion).

## Deliverables

### 1. Extracted Data
- **`5187-S-data.json`** (716KB) - Complete structured data from ESSB 5187
  - All metadata, voting records, appropriations, agencies, dates, etc.
  - Fully queryable JSON structure
  - Ready for browser or server-side use

- **`5187-S-data-compact.json`** (510KB) - Minified version for production use

### 2. Schema Documentation
- **`schema.json`** (16KB) - Complete JSON Schema (Draft-07)
  - Defines all data structures
  - Documents field types and descriptions
  - Enables validation and IDE autocomplete

### 3. Extraction Library
- **`bill-extractor-xmldom.js`** (19KB) - Full-featured extraction library
  - Entity-specific extraction functions
  - Works in Node.js and browsers
  - Parses XML format bills
  - Extracts 11 major data categories

### 4. Demo Application
- **`demo.html`** (16KB) - Interactive data explorer
  - Browser-based, no server required
  - Lodash-powered queries
  - Chart.js visualizations
  - Bootstrap UI
  - Real-time data filtering

### 5. Analysis Document
- **`ANALYSIS.md`** (24KB) - Comprehensive bill analysis
  - Bill type classification
  - Structural patterns
  - HTM vs XML format comparison
  - Extraction methodology
  - Technical recommendations

## Quick Start

### View the Demo

1. Open `demo.html` in a modern web browser
2. Data loads automatically from `5187-S-data.json`
3. Explore using the interactive query buttons
4. View charts and statistics

### Extract Data from XML

```bash
# Install dependencies
npm install

# Run extraction
node extract-bill-data-simple.js

# Output: 5187-S-data.json and 5187-S-data-compact.json
```

### Use the Extraction Library

```javascript
const { DOMParser } = require('@xmldom/xmldom');
const WABillExtractor = require('./bill-extractor-xmldom.js');
const fs = require('fs');

// Make DOMParser global
global.DOMParser = DOMParser;

// Load XML
const xmlContent = fs.readFileSync('./5187-S.xml', 'utf8');

// Extract data
const extractor = new WABillExtractor(xmlContent);
const data = extractor.extractAll();

// Query specific data
console.log(data.metadata);
console.log(data.fiscalImpacts.totalAppropriations);
```

### Query Data with Lodash (Browser)

```javascript
// Load the JSON data
const billData = await fetch('5187-S-data.json').then(r => r.json());

// Top 10 agencies by funding
const top10 = _.chain(billData.data.fiscalImpacts.byAgency)
  .map((value, key) => ({ agency: key, total: value.total }))
  .orderBy(['total'], ['desc'])
  .take(10)
  .value();

// Find specific agency
const health = _.find(billData.data.agencies,
  a => a.name.includes('Health Care Authority')
);

// Filter appropriations over $1B
const large = _.filter(billData.data.appropriations,
  a => a.totalNumeric > 1e9
);
```

## Data Categories Extracted

1. **Metadata** - Bill ID, session, sponsors, descriptions
2. **Voting** - Chamber votes, tallies, dates, presiding officers
3. **Certification** - Chapter law, effective date, governor signature
4. **Vetos** - Partial veto information (29 sections vetoed)
5. **Structure** - 18 parts, 361 sections, hierarchical organization
6. **Agencies** - 27+ agencies with codes and names
7. **Appropriations** - 314 appropriation sections, $304.6B total
8. **Statutory References** - 500+ RCW citations
9. **Dates** - Legislative process dates, deadlines, report dates
10. **Conditions** - Provisos, limitations, reporting requirements
11. **Fiscal Impacts** - Aggregations by year, source, agency

## Bill Analysis Summary

**Bill:** ESSB 5187 (Engrossed Substitute Senate Bill 5187)
**Type:** Operating Budget Appropriations Bill
**Biennium:** 2023-2025 (July 1, 2023 - June 30, 2025)
**Total:** $304,584,371,000

**Key Stats:**
- **361 sections** across **18 parts**
- **314 appropriation blocks**
- **1,820 individual line items**
- **27+ state agencies** funded
- **29 partial vetoes** by Governor
- **Passed Senate:** 37-12 (April 23, 2023)
- **Passed House:** 58-40 (April 23, 2023)
- **Signed:** May 16, 2023 by Gov. Jay Inslee
- **Effective:** May 16, 2023

## Format Comparison

### XML Format (Recommended)
- **Size:** 4.3 MB, 12,412 lines
- **Structure:** Semantic, hierarchical
- **Extractability:** Excellent
- **Tags:** `<Appropriation>`, `<Department>`, `<DollarAmount>`, etc.
- **Attributes:** Agency codes, chamber designations, fiscal years
- **Best for:** Automated extraction, analysis, APIs

### HTM Format
- **Size:** 4.7 MB, 1 line (no breaks)
- **Structure:** Presentation-focused
- **Extractability:** Poor (inline styles, no semantic markup)
- **Best for:** Human reading, print layout

**Conclusion:** XML format is 8% smaller and dramatically better for data extraction.

## Technical Stack

### Extraction (Node.js)
- **@xmldom/xmldom** - XML parsing
- **Node.js 22+** - Runtime environment

### Demo (Browser)
- **Lodash 4.17.21** - Data manipulation (CDN)
- **Chart.js 4.4.0** - Visualizations (CDN)
- **Bootstrap 5.3.2** - UI framework (CDN)
- **Vanilla JavaScript** - No build step required

## File Structure

```
wa-bills/
├── 5187-S.xml                      # Source XML (4.3MB)
├── 5187-S.htm                      # Source HTM (4.7MB)
├── bill-extractor-xmldom.js        # Main extraction library
├── extract-bill-data-simple.js     # CLI extraction script
├── 5187-S-data.json                # Extracted data (formatted)
├── 5187-S-data-compact.json        # Extracted data (compact)
├── schema.json                     # JSON Schema definition
├── demo.html                       # Interactive demo
├── ANALYSIS.md                     # Comprehensive analysis
├── README.md                       # This file
├── package.json                    # Node.js dependencies
└── package-lock.json               # Dependency lock file
```

## Use Cases

- **Legislative Analysis** - Track agency funding, compare budgets
- **Budget Transparency** - Public-facing explorer tools
- **Fiscal Research** - Economic analysis, trend identification
- **Compliance Monitoring** - Track reporting requirements
- **Data Journalism** - Budget impact stories, visualizations
- **Government Operations** - Implementation tracking, allotment planning

## API Reference

### WABillExtractor Class

#### Methods

- `extractAll()` - Extract all data categories
- `extractMetadata()` - Bill identification and sponsors
- `extractVoting()` - Chamber votes and tallies
- `extractCertification()` - Enrollment and executive actions
- `extractVetos()` - Veto information
- `extractStructure()` - Parts and sections hierarchy
- `extractAgencies()` - Agency list with codes
- `extractAppropriations()` - All appropriations with amounts
- `extractStatutoryReferences()` - RCW and chapter citations
- `extractDates()` - Legislative, executive, and deadline dates
- `extractConditions()` - Provisos and limitations
- `extractFiscalImpacts()` - Aggregated fiscal data
- `getSummary()` - High-level summary statistics

See `schema.json` for complete data structure documentation.

## Future Enhancements

- SQLite export for SQL-based queries
- CSV exports for spreadsheet analysis
- Budget version comparison tool
- Full-text search indexing
- FTE data extraction
- Fiscal note linking
- RESTful API endpoints
- Multi-year trend analysis

## License

This project is designed for analyzing public legislative documents from the Washington State Legislature.

## Author

Created as part of bill data extraction analysis for Washington State legislative transparency.

## Date

November 2025
