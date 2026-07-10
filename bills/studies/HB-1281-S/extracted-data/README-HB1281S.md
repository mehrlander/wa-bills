# Washington State Bill Data Extraction Tools - HB 1281-S

Comprehensive data extraction and analysis tools for Washington State legislative bills, demonstrated with HB 1281-S (Technical Corrections Bill).

## 📋 Overview

This repository contains:

1. **JavaScript Extraction Library** - Parse and extract structured data from WA bills
2. **Extracted JSON Data** - Complete structured data from HB 1281-S
3. **JSON Schema Documentation** - Schema definitions and query examples
4. **Interactive HTML Demo** - Browser-based data explorer with visualizations
5. **Comprehensive Analysis** - Bill type analysis and format comparison

## 🎯 Quick Start

### View the Demo

1. Open `demo.html` in a web browser
2. The page will automatically load `hb1281s-extracted-data.json`
3. Explore bill data with interactive queries and visualizations

**No server required!** All queries run in the browser using CDN libraries (Lodash, Chart.js).

### Extract Data from Bills

```bash
# Extract data from HB 1281-S
node extract-bill-data.js

# Output: hb1281s-extracted-data.json
```

### Use the Library

```javascript
const BillExtractor = require('./bill-extractor.js');
const fs = require('fs');

// Load bill XML
const xmlContent = fs.readFileSync('1281-S.xml', 'utf8');

// Extract data
const extractor = new BillExtractor(xmlContent);
const billData = extractor.extractAll();

// Query the data
console.log(`Sections: ${billData.sections.length}`);
console.log(`RCW References: ${billData.rcwReferences.length}`);
```

## 📁 Files

### Source Files
- `1281-S.xml` - Bill in XML format (1.4 MB, 6,124 lines)
- `1281-S.htm` - Bill in HTML format (1.2 MB)

### Extraction Tools
- `bill-extractor.js` - JavaScript library with extraction functions
- `extract-bill-data.js` - Script to extract data from HB 1281-S

### Output Files
- `hb1281s-extracted-data.json` - Extracted structured data (generated)

### Documentation
- `README-HB1281S.md` - This file
- `schema-documentation.md` - JSON schema reference and query examples
- `ANALYSIS.md` - Comprehensive bill analysis and format comparison

### Demo
- `demo.html` - Interactive HTML demo page with queries and visualizations

## 📊 HB 1281-S Statistics

**Bill Type**: Technical Corrections Bill (Not a budget bill)

| Metric | Count |
|--------|-------|
| **Sections** | 257 |
| **RCW References** | 423 |
| **Agencies Mentioned** | 114 |
| **Dates Referenced** | 124 |
| **Amendments** | Numerous (strike/add) |

### Key Information

- **Bill**: Substitute House Bill 1281
- **Legislature**: 69th Legislature, 2025 Regular Session
- **Chapter Law**: Chapter 58, Laws of 2025
- **Sponsors**: House Civil Rights & Judiciary
- **Status**: Enacted and filed
- **Effective Dates**:
  - July 27, 2025 (general)
  - October 1, 2025 (Section 1003)
  - June 30, 2027 (Sections 5058-5170)

## 🔧 Extraction Features

### Metadata Extraction
- Bill identification (ID, title, type)
- Legislative session and sponsors
- Passage information (dates, votes)
- Governor approval and filing
- Chapter law and effective dates

### Section Analysis
- Section numbering and types
- RCW citations
- Section captions
- Amendment tracking (additions/deletions)
- Action types (amend, reenact, decodify, etc.)

### Entity Extraction
- **Agencies**: State departments, boards, commissions (114 found)
- **Programs**: Health programs, education programs, etc.
- **Dates**: All dates mentioned in bill (124 found)
- **RCW References**: All Revised Code sections (423 found)
- **Statutory References**: USC and CFR references

### Fiscal Data (Limited for this bill)
- Monetary amounts with context
- Budget/fiscal keyword references
- Appropriation thresholds

### Amendment Tracking
- Strikethrough text (deletions)
- Added text (additions)
- Sample amendments with context

### Legislative History
- Prior legislation references
- Amendment history per section

## 🔍 Query Examples

### Using the Demo Page

The HTML demo (`demo.html`) provides:

1. **Search Sections** - Find sections by keyword
2. **Filter by RCW Title** - Browse sections affecting specific RCW titles
3. **Search Agencies** - Find agencies by name
4. **View Timeline** - See bill passage timeline
5. **Section Analysis Chart** - Visualize sections by type
6. **Amendment Statistics** - Track additions and deletions

### Using JavaScript (with Lodash)

```javascript
// Load the data
const billData = require('./hb1281s-extracted-data.json');

// Find all nursing-related sections
const nursingSections = _.filter(billData.sections, section =>
  section.caption && section.caption.toLowerCase().includes('nursing')
);

// Group sections by RCW title
const sectionsByTitle = _.groupBy(
  billData.sections.filter(s => s.rcwCitation),
  section => section.rcwCitation.split('.')[1]
);

// Find all health-related agencies
const healthAgencies = _.filter(billData.agencies, agency =>
  /health|medical|nursing/i.test(agency)
);

// Get sections affecting Title 18 (Professions)
const title18Sections = _.filter(billData.sections, section =>
  section.rcwCitation && section.rcwCitation.startsWith('RCW 18.')
);
```

### Using Native JavaScript

```javascript
// Search for specific RCW
const findRCW = (rcw) => {
  return billData.sections.filter(s => s.rcwCitation === rcw);
};

// Get all dates from 2025
const dates2025 = billData.dates.allMentioned.filter(d =>
  d.includes('2025')
);

// Count amendatory vs new sections
const sectionCounts = billData.sections.reduce((acc, s) => {
  acc[s.type] = (acc[s.type] || 0) + 1;
  return acc;
}, {});
```

## 📖 Documentation

### Schema Documentation

See `schema-documentation.md` for:
- Complete JSON schema definitions
- Field descriptions and data types
- Query patterns and examples
- Bill type classification
- Format comparison (XML vs HTM)

### Analysis Report

See `ANALYSIS.md` for:
- Bill type and purpose analysis
- Structural pattern analysis
- Extractable data inventory
- HTM vs XML format comparison
- Technical corrections categories
- Data extraction challenges and solutions
- Query use cases
- Recommendations for future bills

## 🔄 Format Comparison

### XML Format (Recommended for Extraction)

**Advantages**:
- Semantic structure with meaningful tags
- Attributes for metadata
- Easy to parse with standard tools
- Reliable entity extraction
- Schema validation possible

**Use for**: Data extraction, analysis, archival

### HTM Format (Recommended for Display)

**Advantages**:
- Human-readable in browser
- Visual formatting with CSS
- Hyperlinks to references
- Print-friendly

**Use for**: Public access, reading, printing

## 🚀 Use Cases

### Legislative Analysis
- Track bill amendments
- Identify affected RCW sections
- Monitor agency impacts
- Analyze voting patterns

### Legal Research
- Find related statutes
- Track amendment history
- Identify federal law connections
- Research legislative intent

### Public Information
- Understand bill content
- View voting records
- See effective dates
- Track legislative timeline

### Data Integration
- Export to databases
- Build search indexes
- Create bill tracking systems
- Generate reports

## 🛠️ Requirements

### For Extraction (Node.js)
- Node.js v14+
- No external npm packages required (uses built-in `fs` module)

### For Demo (Browser)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required (loads from CDN)

## 📦 Installation

```bash
# Extract data
node extract-bill-data.js

# Open demo
open demo.html  # macOS
xdg-open demo.html  # Linux
start demo.html  # Windows
```

## ✅ Deliverables

This toolkit provides:

- ✅ **Complete extraction** of HB 1281-S bill data
- ✅ **Structured JSON output** ready for queries
- ✅ **Interactive HTML demo** with visualizations
- ✅ **Comprehensive documentation** of schema and formats
- ✅ **Detailed analysis** of bill type and structure
- ✅ **Reusable library** for other WA bills
- ✅ **Browser-compatible** queries using CDN libraries
- ✅ **No server required** for viewing and querying

All deliverables are complete and ready to use! 🎉

## 🔗 Resources

- [Washington State Legislature](https://leg.wa.gov/)
- [RCW (Revised Code of Washington)](https://app.leg.wa.gov/RCW/)
- [Bill Search](https://app.leg.wa.gov/billinfo/)
- [Lodash Documentation](https://lodash.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
