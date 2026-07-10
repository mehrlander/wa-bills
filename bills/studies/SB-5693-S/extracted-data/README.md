# WA Budget Bills Analysis

Repository for parsing and analyzing Washington State budget bills.

## Current Status: HB 5693-S Complete Analysis

A comprehensive extraction and analysis of **HB 5693-S** (2021-2023 Supplemental Operating Budget) has been completed with full tooling, documentation, and interactive demo.

### Quick Start

**View the Interactive Demo**: Open `demo.html` in your browser to explore the bill data with:
- Search and filter appropriations
- Visual charts of fiscal impacts
- Program and grant search
- Live query examples with lodash

**Extract Data**: Run `node extract-data.js` to regenerate the JSON from the XML source.

## HB 5693-S Files

### Core Files
- **`5693-S.xml`** - Source bill in XML format (2.7 MB)
- **`5693-S.htm`** - Source bill in HTML format (2.9 MB)
- **`hb5693-data.json`** - Extracted structured data (~15 MB)

### Tools
- **`bill-extractor.js`** - JavaScript extraction library (works in browser and Node.js)
- **`extract-data.js`** - Node.js extraction script
- **`demo.html`** - Interactive browser-based query interface

### Documentation
- **`ANALYSIS.md`** - Comprehensive bill analysis report (bill type, format comparison, patterns)
- **`schema.md`** - JSON data schema documentation with query examples
- **`README.md`** - This file

## Extracted Data Summary

**ENGROSSED SUBSTITUTE SENATE BILL 5693**
- **Type**: Supplemental Operating Budget
- **Session**: 2022 Regular Session, 67th Legislature
- **Status**: Enacted as Chapter 297, Laws of 2022 (partial veto)

### Statistics
- **218** Agencies and Departments
- **1,172** Appropriations
- **281** Statutory References (RCW)
- **1,916** Programs and Grants
- **22** Vetoed Sections
- **247** Bill Sections

## Data Structure

```json
{
  "metadata": {},           // Bill information (ID, session, sponsors, etc.)
  "agencies": [],           // 218 departments/agencies with codes
  "appropriations": [],     // 1,172 funding line items with old/new amounts
  "statutoryReferences": [], // 281 RCW citations
  "dates": {},              // Passage, approval, effective dates
  "fiscalImpacts": {},      // Aggregated financial data by FY and agency
  "programs": [],           // 1,916 programs/grants from provisos
  "vetoes": [],             // 22 vetoed sections with line items
  "billSections": [],       // 247 bill sections with structure
  "summary": {}             // Extraction statistics
}
```

## Query Examples (Lodash)

```javascript
// Filter appropriations by agency
_.filter(data.appropriations, { agency: 'DEPARTMENT OF COMMERCE' })

// Sum FY 2023 appropriations
_.sumBy(_.filter(data.appropriations, { fiscalYear: 'FY 2023' }),
  item => parseFloat(item.newAmount?.replace(/[$,]/g, '') || 0))

// Find programs with >$1M funding
_.filter(data.programs, p =>
  p.amounts.some(amt => parseFloat(amt.replace(/[$,]/g, '')) > 1000000))

// Group appropriations by agency
_.groupBy(data.appropriations, 'agency')
```

## Key Findings

### Bill Type: Supplemental Operating Budget

This bill adjusts the 2021-2023 biennium operating budget mid-cycle to:
- Respond to changing revenue and expenditure needs
- Fund new programs and initiatives
- Implement legislation passed during the session
- Adjust for COVID-19 impacts and federal relief funds

### Format Comparison

**XML (Recommended for extraction)**:
- Semantic structure with meaningful tags
- Complete metadata (agency codes, section types, veto markers)
- Explicit change tracking (strike/add styles)
- Easy programmatic parsing

**HTM (Better for display)**:
- Visual fidelity and formatting
- Human-readable layout
- Generic HTML structure (harder to parse)
- Missing programmatic metadata

### Extractable Data Types

1. **Agencies**: Names, codes, sections
2. **Appropriations**: Accounts, amounts, fiscal years, changes
3. **Statutory References**: RCW citations
4. **Fiscal Impacts**: Totals by year, agency, fund source
5. **Programs**: Grants, studies, initiatives (from "provided solely" language)
6. **Dates**: Passage, approval, effective dates, vote counts
7. **Vetoes**: Line-item vetoes with full text
8. **Bill Structure**: Sections, amendments, types

## Technical Details

### Installation

```bash
npm install
```

### Usage

**Extract data:**
```bash
node extract-data.js
```

**Use in browser:**
```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
<script src="bill-extractor.js"></script>
<script>
  fetch('hb5693-data.json')
    .then(res => res.json())
    .then(data => {
      console.log(`Loaded ${data.agencies.length} agencies`);
      // Query the data...
    });
</script>
```

### Dependencies
- **xmldom** (0.6.0) - XML parsing in Node.js
- **lodash** (4.17.21, CDN) - Data querying in browser
- **Chart.js** (4.4.0, CDN) - Visualizations

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Use Cases

### Budget Analysis
- Track supplemental budget changes by agency
- Identify largest funding increases/decreases
- Analyze fund source composition (state, federal, COVID relief)
- Compare fiscal year allocations

### Legislative Research
- Find bills with implementation funding
- Track grant programs and recipients
- Identify reporting requirements and deadlines
- Research specific policy areas

### Public Transparency
- Searchable appropriations data
- Program and grant visibility
- Veto tracking
- Detailed budget information access

### Data Integration
- Import into Excel or Google Sheets
- Feed into budget databases
- API data source for applications
- Visualization and reporting tools

## Documentation

- **ANALYSIS.md** - Full bill analysis including:
  - Bill type classification
  - HTM vs XML detailed comparison
  - Structural patterns and conventions
  - Extraction methodology
  - Recommendations

- **schema.md** - Complete JSON schema with:
  - Field descriptions and types
  - Query patterns and examples
  - Lodash usage guide
  - Data access documentation

## Future Enhancements

Potential additions:
1. Link to fiscal notes and impact statements
2. Cross-reference implementation funding to specific bills
3. Historical comparison across multiple biennia
4. CSV/Excel export functionality
5. RESTful API wrapper
6. Additional visualization types
7. Advanced multi-field filtering
8. PDF report generation

## Original Repository Goals

This repo aims to:
1. Parse WA budget bills into normalized structures
2. Compare schema approaches across formats
3. Build reusable parsing libraries
4. Document structural patterns across biennia

### Output Format Goals
Each extraction should produce:
- ✅ Structured data (JSON with ~1,200 appropriations)
- ✅ Schema documentation (schema.md)
- ✅ Extraction code (bill-extractor.js)
- ✅ Completeness metrics (218 agencies, 100% coverage)
- ✅ Analysis report (ANALYSIS.md)

## Notes

- Bills are large (500-1400 pages in PDF, 7,000+ lines XML)
- Focus on appropriations, provisos, and structure
- Bill structure varies across biennia and formats
- XML format preferred for extraction reliability
- All querying can be done client-side (no server needed)

## License

Analyzes publicly available Washington State legislative documents (public domain).

---

**Last Updated**: November 2025
**Current Analysis**: HB 5693-S (Chapter 297, Laws of 2022)
**Extraction Version**: 1.0.0
