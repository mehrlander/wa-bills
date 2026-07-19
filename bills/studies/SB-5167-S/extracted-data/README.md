# Washington State Bill Data Extraction Tools

Comprehensive extraction and analysis tools for HB 5167-S (2025-2027 Operating Budget).

## 📦 Deliverables

### 1. **HB5167-S-data.json** - Extracted Structured Data
Complete JSON dataset with 1,816 appropriations, 216 agencies, 495 RCW references, and more.

**Key Data:**
- ✓ Bill metadata (sponsors, passage dates, effective dates)
- ✓ 420 sections with agency assignments
- ✓ $3.3+ billion in appropriations (FY 2026-2027)
- ✓ 38 vetoed sections with veto details
- ✓ Statutory references (RCW citations)
- ✓ Fiscal notes and biennia information
- ✓ Conditions and limitations on spending

### 2. **schema.json** - JSON Schema Documentation
Formal JSON Schema (draft-07) specification defining the structure of extracted data.

### 3. **bill-extractor.js** - JavaScript Extraction Library
Reusable extraction library with functions for each entity type. Works in Node.js and browsers.

### 4. **demo.html** - Interactive Query Demo
Single-page application demonstrating browser-based queries using CDN libraries (Lodash, Chart.js).

### 5. **ANALYSIS.md** - Comprehensive Analysis Report
Detailed analysis covering bill type, structural patterns, format comparison, and usage examples.

## 🚀 Quick Start

### View the Demo

```bash
# Start a local web server
python -m http.server 8000

# Open in browser
http://localhost:8000/demo.html
```

### Extract Data Programmatically

```javascript
const { BillExtractor } = require('./bill-extractor.js');
const fs = require('fs');

const xml = fs.readFileSync('5167-S.xml', 'utf-8');
const extractor = new BillExtractor(xml, 'xml');
const data = extractor.extractAll();

console.log(`Found ${data.appropriations.length} appropriations`);
```

## 📊 Bill Overview

**HB 5167-S: Operating Budget**
- **Type:** Biennial Appropriations Bill
- **Biennium:** 2025-2027 (FY 2026 and FY 2027)
- **Status:** Enacted as Chapter 424, Laws of 2025
- **Effective Date:** May 20, 2025

**Key Statistics:**
```
Total Sections:         420
Agencies:               216
Appropriations:       1,816
RCW References:        495
Vetoed Sections:        38
```

## 🔍 Query Examples (with Lodash)

```javascript
// Top 10 largest appropriations
const top10 = _.chain(billData.appropriations)
  .filter(a => !a.isTotal)
  .orderBy(['amount'], ['desc'])
  .take(10)
  .value();

// Total by agency
const byAgency = _.chain(billData.appropriations)
  .filter(a => !a.isTotal && a.agency)
  .groupBy('agency')
  .map((items, agency) => ({
    agency,
    total: _.sumBy(items, 'amount')
  }))
  .orderBy(['total'], ['desc'])
  .value();

// Search for agency
const commerce = _.filter(billData.appropriations, a =>
  a.agency && a.agency.includes('COMMERCE')
);

// Fiscal year comparison
const byYear = _.chain(billData.appropriations)
  .filter(a => !a.isTotal && a.fiscalYear)
  .groupBy('fiscalYear')
  .mapValues(items => _.sumBy(items, 'amount'))
  .value();
```

## 📁 File Descriptions

| File | Description | Size |
|------|-------------|------|
| `../raw/5167-S.xml` | Source bill (XML format) | 4.2 MB |
| `../raw/5167-S.htm` | Source bill (HTML format) | 4.5 MB |
| `bill-extractor.js` | Extraction library | 25 KB |
| `HB5167-S-data.json` | Extracted data | ~2 MB |
| `schema.json` | JSON Schema | 8 KB |
| `demo.html` | Interactive demo | 30 KB |
| `ANALYSIS.md` | Analysis report | 25 KB |

## 📖 Documentation

See **ANALYSIS.md** for complete documentation including:
- Bill type and classification
- Structural analysis
- HTM vs XML format comparison
- Data schema details
- Advanced query examples

## 🎯 Use Cases

- Budget analysis and tracking
- Transparency and accountability
- Academic and policy research
- Investigative journalism
- Government compliance monitoring

---

**Generated:** 2025-11-19
**Bill:** ESSB 5167, Chapter 424, Laws of 2025
