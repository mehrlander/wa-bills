# Washington State Bill Document Extraction System

A comprehensive JavaScript library for extracting structured data from Washington State legislative bills in XML format, with browser-based querying capabilities.

## Overview

This project analyzes **HB 1320-S2** (Engrossed Second Substitute House Bill 1320, Chapter 215, Laws of 2021) and provides tools to extract and query structured data from WA legislative bill documents.

### What This System Does

- ✅ Parses WA bill XML files into structured JSON data
- ✅ Extracts metadata, voting records, statutory references, and more
- ✅ Identifies bill type and classifies content
- ✅ Provides browser-based interactive data exploration
- ✅ Enables querying with Lodash and vanilla JavaScript
- ✅ Works in both Node.js and browser environments

## Project Structure

```
wa-bills/
├── 1320-S2.xml                  # Source bill (XML format)
├── 1320-S2.htm                  # Source bill (HTML format)
│
├── billExtractor.js             # Main extraction library
├── extractBillData.js           # Node.js extraction script
├── HB-1320-S2-data.json        # Extracted JSON data (generated)
│
├── demo.html                    # Interactive browser demo
├── SCHEMA.md                    # JSON schema documentation
├── ANALYSIS.md                  # Bill analysis & format comparison
└── README-EXTRACTION.md         # This file
```

## Quick Start

### Option 1: View in Browser (Easiest)

1. Open `demo.html` in a web browser
2. The page automatically loads `HB-1320-S2-data.json`
3. Click any pre-built query button to explore the data
4. Use the search tab to find specific content
5. Try custom Lodash queries in the Custom Queries tab

### Option 2: Extract Data from XML (Node.js)

```bash
# Install dependencies
npm install

# Run extraction
node extractBillData.js

# Output: HB-1320-S2-data.json
```

### Option 3: Use the Library Programmatically

**In Node.js:**
```javascript
const BillExtractor = require('./billExtractor.js');
const fs = require('fs');

// Read XML file
const xmlContent = fs.readFileSync('1320-S2.xml', 'utf-8');

// Extract all data
const billData = BillExtractor.extractBillData(xmlContent);

// Or extract specific data
const metadata = BillExtractor.extractBillMetadata(xmlDoc);
const sections = BillExtractor.extractSections(xmlDoc);
```

**In Browser:**
```html
<script src="billExtractor.js"></script>
<script>
  fetch('1320-S2.xml')
    .then(response => response.text())
    .then(xml => {
      const billData = BillExtractor.extractBillData(xml);
      console.log(billData);
    });
</script>
```

## Bill Analysis Summary

### Bill Type: **Policy Reform (Non-Budget)**

**HB 1320-S2** is a comprehensive policy reform bill that:
- Modernizes civil protection order laws
- Consolidates 6 different types of protection orders
- Amends 88 existing RCW sections
- Creates 84 new sections
- Repeals 175+ RCW sections

**Key Statistics:**
- Total Sections: 172
- Total Parts: 17
- RCW References: 227
- Definitions: 36
- Agencies: 124
- Federal Law References: 12

**NOT a Budget Bill** - Contains minimal fiscal provisions (3 dollar amounts, 1 contingency clause)

See [ANALYSIS.md](ANALYSIS.md) for complete bill type analysis and format comparison.

## Extracted Data Schema

### Top-Level Structure

```json
{
  "metadata": {},              // Bill identifiers, session info
  "votes": {},                 // Voting records (House & Senate)
  "dates": {},                 // Important dates
  "certificate": {},           // Certification info
  "statutoryReferences": {},   // RCW, USC, CFR citations
  "sections": [],              // All 172 bill sections
  "parts": [],                 // 17 bill parts/divisions
  "definitions": [],           // 36 legal definitions
  "agencies": [],              // 124 government agencies
  "programs": [],              // Programs & initiatives
  "fiscal": {},                // Fiscal information
  "legislativeActions": {},    // Amending, repealing, etc.
  "statistics": {},            // Summary counts
  "extractionMetadata": {}     // Extraction timestamp, version
}
```

See [SCHEMA.md](SCHEMA.md) for complete schema documentation with examples.

## Example Queries

### Using Lodash (in Browser Demo)

```javascript
// Get all definition terms
_.map(billData.definitions, 'term')

// Find sections about firearms
_.filter(billData.sections, s =>
  s.content && s.content.toLowerCase().includes('firearm')
)

// Count sections by type
_.countBy(billData.sections, 'type')
// Result: { new: 84, amendatory: 88 }

// Find amendments to RCW Title 9 (Crimes)
_.filter(billData.legislativeActions.amending, action =>
  action.citation && action.citation.title === '9'
)

// Get unique RCW titles affected
_.chain(billData.statutoryReferences.rcw)
  .map('title')
  .uniq()
  .sortBy()
  .value()
```

### Using Vanilla JavaScript

```javascript
// Get bill ID
billData.metadata.shortId
// Result: "E2SHB 1320.SL"

// Count total votes
billData.votes.house.yeas + billData.votes.house.nays
// Result: 97

// Find definition of "Firearm"
billData.definitions.find(d => d.term === "Firearm")

// Get all agencies with "Department" in name
billData.agencies.filter(a => a.includes('Department'))
```

## API Reference

### Core Functions

#### `parseXML(xmlString)`
Parses XML string into DOM document.
- **Parameters:** `xmlString` (String) - XML content
- **Returns:** DOM Document

#### `extractBillData(xmlString)`
Main extraction function - extracts all data categories.
- **Parameters:** `xmlString` (String) - XML content
- **Returns:** Object with all extracted data

### Entity Extraction Functions

All functions take a parsed XML document as parameter:

```javascript
extractBillMetadata(xmlDoc)      // Bill identifiers, session
extractVotingRecords(xmlDoc)     // House & Senate votes
extractDates(xmlDoc)             // Effective dates, approval
extractCertificate(xmlDoc)       // Certification info
extractRCWReferences(xmlDoc)     // RCW statutory citations
extractFederalReferences(xmlDoc) // USC, CFR citations
extractSections(xmlDoc)          // All bill sections
extractParts(xmlDoc)             // Bill parts/divisions
extractDefinitions(xmlDoc)       // Legal definitions
extractAgencies(xmlDoc)          // Government agencies
extractPrograms(xmlDoc)          // Programs & initiatives
extractFiscalData(xmlDoc)        // Fiscal information
extractLegislativeActions(xmlDoc) // Amendments, repeals, etc.
```

### Utility Functions

#### `query(data, path)`
Query extracted data using dot notation (uses Lodash if available).
```javascript
BillExtractor.query(billData, 'metadata.shortId')
BillExtractor.query(billData, 'votes.house.yeas')
```

#### `search(data, searchTerm)`
Full-text search across sections, definitions, and agencies.
```javascript
const results = BillExtractor.search(billData, 'firearm');
// Returns: { sections: [...], definitions: [...], agencies: [...] }
```

## Browser Demo Features

### Interactive Tabs

1. **Pre-built Queries**: One-click access to common data views
2. **Search**: Full-text search across all content
3. **Custom Queries**: Execute custom Lodash expressions
4. **Code Examples**: JavaScript examples for common use cases

### Query Examples Available in Demo

- Bill Metadata
- Voting Records
- All Definitions
- Government Agencies
- RCW Citations
- Federal Law References
- Amending Sections
- Repealing Sections
- Firearm-Related Sections
- Fiscal Information

## Format Comparison: XML vs HTM

### XML Format (Recommended for Extraction)

**Advantages:**
- ✅ Structured, semantic tags
- ✅ Machine-readable
- ✅ Hierarchical organization
- ✅ Rich metadata in attributes
- ✅ Standard parsing tools

**Best for:**
- Data extraction
- Automated processing
- Database import
- Programmatic analysis

### HTM Format (Human-Readable)

**Advantages:**
- ✅ Visual formatting
- ✅ Hyperlinked RCW citations
- ✅ Browser-ready
- ✅ Print-friendly
- ✅ No parsing required for reading

**Best for:**
- Human reading
- Citation lookup
- Visual verification
- Document archival

**Recommendation:** Use XML for all automated extraction, reference HTM for verification.

## Technical Details

### Cross-Platform Compatibility

The extraction library works in both environments:

**Browser:**
- Uses native `DOMParser`
- Native `querySelector/querySelectorAll`
- Loads via `<script>` tag

**Node.js:**
- Uses `@xmldom/xmldom` package
- Custom querySelector wrappers for compatibility
- Loads via `require()`

### Dependencies

**Node.js:**
```json
{
  "@xmldom/xmldom": "^0.8.x"
}
```

**Browser:**
- No dependencies (uses native APIs)
- Optional: Lodash for enhanced querying (loaded from CDN in demo)

### Performance

Benchmark (Node.js, HB 1320-S2):
```
XML File Size:     1.1 MB
Parse Time:        ~200ms
Extraction Time:   ~800ms
Total Time:        ~1.0 second
Output Size:       450 KB JSON
```

## Use Cases

### 1. Legislative Research
```javascript
// Find all bills amending criminal law (Title 9)
const criminalAmendments = _.filter(
  billData.legislativeActions.amending,
  action => action.citation?.title === '9'
);
```

### 2. Fiscal Analysis
```javascript
// Extract all funding provisions
const fundingInfo = billData.fiscal;
console.log('Dollar amounts:', fundingInfo.amounts);
console.log('Provisions:', fundingInfo.fundingProvisions);
```

### 3. Legal Research
```javascript
// Find definition of legal term
const definition = _.find(billData.definitions, { term: 'Firearm' });
console.log(definition.definition);
```

### 4. Agency Impact Analysis
```javascript
// Find all agencies mentioned
const agencies = billData.agencies;
const healthAgencies = agencies.filter(a =>
  a.toLowerCase().includes('health')
);
```

### 5. Citation Tracking
```javascript
// Get all RCW sections being amended
const amendedRCWs = billData.statutoryReferences.rcw
  .filter(ref => ref.context !== 'BillTitle');
```

## Limitations

### Current Limitations

1. **Agency Extraction**: 85% accuracy (pattern-based, may miss some)
2. **Fiscal Data**: Limited for non-budget bills (this bill has minimal fiscal content)
3. **Complex Citations**: Some nested citations may not parse completely
4. **Tables**: Does not extract tabular data (none in this bill)

### Bills This Works Well For

- ✅ Policy bills with similar XML structure
- ✅ Session laws (certified bills)
- ✅ Bills with extensive amendments
- ✅ Bills with definitions sections

### May Require Adaptation For

- ⚠️ Budget/appropriations bills (different fiscal structure)
- ⚠️ Bills with complex tables
- ⚠️ Bills with mathematical formulas
- ⚠️ Older bills with different XML schema

## Extending the System

### Adding New Extractors

```javascript
function extractCustomData(xmlDoc) {
    const customData = [];

    // Your extraction logic here
    const elements = querySelectorAll(xmlDoc, 'YourTagName');
    elements.forEach(element => {
        customData.push({
            // Extract what you need
        });
    });

    return customData;
}
```

### Adding to Main Extraction

```javascript
// In extractBillData()
return {
    // ... existing data ...
    customData: extractCustomData(xmlDoc)
};
```

## Documentation

- **[ANALYSIS.md](ANALYSIS.md)** - Complete bill analysis and format comparison
- **[SCHEMA.md](SCHEMA.md)** - JSON schema documentation with examples
- **demo.html** - Interactive browser-based demo with code examples

## License

This extraction system is provided as-is for analyzing Washington State legislative documents.

The source bill (HB 1320-S2) is public domain as a Washington State legislative document.

## Version History

- **v1.0.0** (2025-11-19)
  - Initial release
  - Full extraction for HB 1320-S2
  - Browser demo with Lodash integration
  - Complete documentation

## Support

For issues or questions about this extraction system, please refer to:
- Schema documentation: SCHEMA.md
- Bill analysis: ANALYSIS.md
- Code examples: demo.html (Code Examples tab)

---

**Built for:** HB 1320-S2 Analysis
**Last Updated:** November 19, 2025
**Version:** 1.0.0
