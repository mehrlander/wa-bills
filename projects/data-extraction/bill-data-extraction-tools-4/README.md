# Washington Legislative Bill Data Extraction Tools

Tools for extracting and analyzing structured data from Washington State legislative bills, specifically focused on budget bills.

## Overview

This repository contains extraction tools and analysis for **HB 5950-S (ESSB 5950)**, the 2023-2025 Supplemental Operating Budget for Washington State. The tools parse both XML and HTML formats of legislative bills and extract structured data including appropriations, agencies, fiscal impacts, statutory references, and more.

### Key Statistics

- **Bill Type:** Supplemental Operating Budget
- **Total Appropriations:** $244.6 billion
- **Agencies:** 176
- **Individual Appropriations:** 1,499
- **Conditions/Limitations:** 995
- **Extracted Data Points:** 3,500+

## Repository Contents

### Source Bill Files

- `5950-S.xml` (2.8 MB) - XML format of the bill (recommended for data extraction)
- `5950-S.htm` (3.1 MB) - HTML format of the bill (optimized for reading)

### Extraction Tools

- **`bill-extractor.js`** - JavaScript library for extracting structured data from bills
  - Works in both browser and Node.js environments
  - Modular functions for each entity type
  - Supports XML and HTML formats (XML recommended)

- **`extract-bill-data.js`** - Node.js script to extract data from the bill files
  - Reads XML file
  - Applies extraction library
  - Outputs structured JSON

### Data Outputs

- **`hb-5950-s-data.json`** - Complete extracted data in JSON format
  - Queryable from browser JavaScript
  - Structured for analysis
  - ~500+ KB of structured data

### Documentation

- **`json-schema.md`** - JSON schema documentation
  - Complete field descriptions
  - Data types and formats
  - Query examples using Lodash
  - Use cases and best practices

- **`ANALYSIS.md`** - Comprehensive bill analysis
  - Bill type classification
  - HTM vs XML format comparison
  - Structural patterns
  - Data quality assessment
  - Extraction methodology

### Demo Application

- **`demo.html`** - Interactive browser-based demo
  - Query the JSON data
  - Visualizations with Chart.js
  - Search and filter capabilities
  - Uses CDN libraries (Lodash, Chart.js, Tailwind CSS)

## Quick Start

### Prerequisites

- Node.js 14+ (for running extraction script)
- Modern web browser (for demo page)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd wa-bills

# Install dependencies
npm install
```

### Extract Data from Bill

```bash
# Run the extraction script
node extract-bill-data.js

# Output: hb-5950-s-data.json
```

### View the Demo

```bash
# Serve the files with any HTTP server
# For example, using Python:
python3 -m http.server 8000

# Or using Node.js http-server:
npx http-server

# Open browser to http://localhost:8000/demo.html
```

## Using the Extraction Library

### In Browser

```html
<!-- Load the library -->
<script src="bill-extractor.js"></script>

<!-- Load your bill XML/HTML -->
<script>
  fetch('5950-S.xml')
    .then(response => response.text())
    .then(xmlContent => {
      const data = BillExtractor.extractFromXML(xmlContent);
      console.log(data);

      // Access specific data
      console.log('Agencies:', data.agencies);
      console.log('Appropriations:', data.appropriations);
      console.log('Fiscal Impacts:', data.fiscalImpacts);
    });
</script>
```

### In Node.js

```javascript
const fs = require('fs');
const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM();
global.DOMParser = dom.window.DOMParser;

// Load library
const BillExtractor = require('./bill-extractor.js');

// Read and extract
const xmlContent = fs.readFileSync('5950-S.xml', 'utf8');
const data = BillExtractor.extractFromXML(xmlContent);

console.log(data);
```

### Extraction Functions

The library provides both a complete extraction function and individual extractors:

```javascript
// Extract everything
const allData = BillExtractor.extractFromXML(xmlString);

// Or extract specific entities
const metadata = BillExtractor.extractBillMetadata(xmlString);
const agencies = BillExtractor.extractAgencies(xmlString);
const appropriations = BillExtractor.extractAppropriations(xmlString);
const fiscalImpacts = BillExtractor.extractFiscalImpacts(xmlString);
const dates = BillExtractor.extractDates(xmlString);
const references = BillExtractor.extractStatutoryReferences(xmlString);
const conditions = BillExtractor.extractConditionsAndLimitations(xmlString);
const programs = BillExtractor.extractPrograms(xmlString);
const accounts = BillExtractor.extractAccounts(xmlString);
```

## Querying the JSON Data

### With Lodash (Recommended)

```javascript
// Load the data
const data = await fetch('hb-5950-s-data.json').then(r => r.json());
const billData = data.billData;

// Find all appropriations over $1 billion
const bigAppropriations = _.filter(billData.appropriations,
  a => a.amount > 1000000000
);

// Get top 10 agencies by funding
const topAgencies = _.chain(billData.fiscalImpacts.byAgency)
  .toPairs()
  .orderBy([1], ['desc'])
  .take(10)
  .value();

// Group appropriations by fiscal year
const byYear = _.groupBy(billData.appropriations, 'fiscalYear');

// Search for specific agency
const healthAppropriations = _.filter(billData.appropriations,
  a => a.agency && a.agency.includes('HEALTH')
);

// Find "provided solely" conditions
const providedSolely = _.filter(billData.conditionsAndLimitations,
  { hasProvidedSolely: true }
);
```

### With Vanilla JavaScript

```javascript
// Filter by fiscal year
const fy2024 = billData.appropriations.filter(a => a.fiscalYear === 2024);

// Calculate total for an agency
const houseTotal = billData.appropriations
  .filter(a => a.agency === 'HOUSE OF REPRESENTATIVES')
  .reduce((sum, a) => sum + (a.amount || 0), 0);

// Find all RCW references
const rcwRefs = billData.statutoryReferences
  .filter(r => r.type === 'RCW');
```

## Data Structure

### Root JSON Structure

```json
{
  "extractionDate": "ISO 8601 timestamp",
  "extractorVersion": "1.0.0",
  "sourceFile": "5950-S.xml",
  "billData": {
    "metadata": { ... },
    "agencies": [ ... ],
    "appropriations": [ ... ],
    "statutoryReferences": [ ... ],
    "dates": [ ... ],
    "fiscalImpacts": { ... },
    "conditionsAndLimitations": [ ... ],
    "programs": [ ... ],
    "accounts": [ ... ],
    "billType": { ... }
  }
}
```

See [`json-schema.md`](json-schema.md) for complete schema documentation.

## Extracted Data Types

| Entity Type | Count | Description |
|-------------|-------|-------------|
| Agencies | 176 | Government agencies receiving appropriations |
| Appropriations | 1,499 | Individual budget line items |
| Statutory References | 163 | RCW and session law citations |
| Dates | 5+ | Key dates (passage, effective, etc.) |
| Conditions | 995 | Spending conditions and limitations |
| Programs | 140 | Program mentions (heuristic extraction) |
| Accounts | 101 | Unique fund sources |
| Fiscal Impacts | Aggregated | Totals by year, agency, amendment type |

## Key Features

### Extraction Library

- ✅ Parses both XML and HTML formats
- ✅ Extracts all major bill entities
- ✅ Handles amendment markup (add/strike)
- ✅ Identifies fiscal years
- ✅ Calculates fiscal impacts
- ✅ Browser and Node.js compatible
- ✅ Modular function design

### JSON Output

- ✅ Fully structured and queryable
- ✅ Human-readable format
- ✅ Validated against schema
- ✅ Static file (no database needed)
- ✅ ~500 KB compressed size

### Demo Page

- ✅ Interactive queries
- ✅ Visual charts and graphs
- ✅ Search functionality
- ✅ Custom query console
- ✅ No backend required
- ✅ Mobile responsive

## XML vs HTML Format

| Aspect | XML Format | HTML Format |
|--------|-----------|-------------|
| **Best For** | Data extraction | Human reading |
| **Structure** | Semantic markup | Presentation markup |
| **Parsing** | Easy | Complex |
| **File Size** | 2.8 MB | 3.1 MB |
| **Amendment Markup** | Attributes | Visual styling |
| **Agency Codes** | Included | Not included |
| **Recommendation** | ✅ Use for extraction | Use for reading/printing |

**Recommendation:** Always use the XML format for data extraction. See [`ANALYSIS.md`](ANALYSIS.md) for detailed comparison.

## Bill Type Support

The extraction library is designed for **Washington State budget bills**, specifically:

- ✅ Operating budgets (biennial and supplemental)
- ⚠️ Capital budgets (similar structure, not tested)
- ⚠️ Transportation budgets (similar structure, not tested)
- ❌ General legislation (different structure)

For other bill types, the library may need adaptation.

## Use Cases

### Budget Analysis

- Compare agency funding across years
- Track supplemental budget changes
- Identify largest appropriations
- Analyze fund source distribution

### Transparency & Journalism

- Make budget data accessible to public
- Support investigative journalism
- Enable citizen budget oversight
- Facilitate academic research

### Government Operations

- Budget planning and forecasting
- Spend tracking and variance analysis
- Agency operations planning
- Fiscal impact assessment

## Browser Compatibility

The demo page requires:
- Chrome 90+, Firefox 88+, Safari 14+, or equivalent
- JavaScript enabled
- Modern ES6 support

The extraction library uses:
- DOMParser API
- Standard JavaScript (ES6+)
- No framework dependencies

## Performance

- **XML Parsing:** ~500ms (2.8 MB file)
- **Data Extraction:** ~1-2 seconds
- **JSON Generation:** ~500ms
- **Total Processing:** ~2.5 seconds

On typical 2020+ era hardware.

## Limitations

1. **Program Extraction:** Uses heuristics, may miss some programs or have false positives
2. **Amendment Context:** Cannot determine why amounts changed without external context
3. **Fiscal Notes:** Not present in this bill type
4. **Cross-Bill References:** Extracted as text, not resolved
5. **Natural Language:** Conditions are prose text, require NLP for deep analysis

See [`ANALYSIS.md`](ANALYSIS.md) for detailed data quality assessment.

## Contributing

Contributions welcome! Areas for enhancement:

- Support for other bill types (capital, transportation, general legislation)
- Improved program extraction using NLP
- Fiscal note extraction (for applicable bills)
- Time-series analysis across bienniums
- CSV/Excel export functionality
- Integration with fiscal tracking systems

## License

ISC License - See package.json

## Resources

- [Washington State Legislature](https://leg.wa.gov)
- [Bill Text Viewer](https://lawfilesext.leg.wa.gov/biennium/2023-24/Htm/Bills/Session%20Laws/Senate/5950-S.SL.htm)
- [Washington State Budget](https://ofm.wa.gov/budget)

## Acknowledgments

Developed for analysis of Washington State legislative budget data. Bill data provided by the Washington State Legislature.

## Version

**Version:** 1.0.0
**Last Updated:** November 19, 2024
**Bill Session:** 2024 Regular Session
**Biennium:** 2023-2025
