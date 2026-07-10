# HB 1210-S2 Bill Data Extraction Project

Complete extraction and analysis system for Washington State House Bill 1210-S2 (Replacing "marijuana" with "cannabis").

## 📋 Project Overview

This project provides a comprehensive toolkit for extracting, analyzing, and querying structured data from Washington State legislative bills. Using HB 1210-S2 as the reference implementation, it demonstrates how to parse bill documents and create queryable datasets.

## 📦 Deliverables

### 1. **Data Files**
- `1210-S2.xml` - Original bill in XML format (1.1 MB)
- `1210-S2.htm` - Original bill in HTM format (1.0 MB)
- `1210-S2-data.json` - Extracted structured data (~200 KB)

### 2. **Extraction Tools**
- `bill-extractor.js` - JavaScript library for browser and Node.js
- `extract-bill.js` - Node.js CLI extraction script
- `schema.json` - JSON Schema for validation and documentation

### 3. **Demo & Documentation**
- `demo.html` - Interactive HTML demo page with queries
- `ANALYSIS.md` - Comprehensive bill analysis report
- `HB-1210-S2-README.md` - This file

## 🚀 Quick Start

### View the Demo

1. Start a local web server:
   ```bash
   python -m http.server 8000
   # or: python3 -m http.server 8000
   # or: npx serve
   ```

2. Open browser to: `http://localhost:8000/demo.html`

3. Explore the bill data using the interactive queries

### Extract Data from XML

```bash
node extract-bill.js
```

This will:
- Read `1210-S2.xml`
- Extract all structured data
- Generate `1210-S2-data.json`
- Display extraction summary

## 📊 What Data Can Be Extracted?

### Bill Metadata
- Bill ID, legislature, session
- Sponsors and co-sponsors
- Brief description and full title

### Enrolling Information
- Chapter law and year
- House and Senate passage dates
- Vote counts (yeas/nays)
- Governor approval details

### Sections (176 total)
- Section number and type
- RCW citations being amended
- Amendments (strikes and additions)
- Section captions

### Statutory References
- 160 RCW sections amended
- 18 RCW titles affected
- Organized by title and chapter

### Effective Dates
- Primary effective date: June 9, 2022
- Special dates for specific sections
- Future dates (up to July 1, 2030)

### Agencies
- 18 state agencies mentioned
- Department and commission references

### Statistics
- Total sections by type
- Amendment frequency
- Voting patterns
- RCW title distribution

## 🎯 Bill Analysis Summary

**Bill Type:** Terminology Replacement

**Purpose:** Replace "marijuana" with "cannabis" throughout WA law

**Scope:**
- 176 sections
- 160 RCW sections amended
- 18 RCW titles affected
- 1,376 term replacements

**Legislative Support:**
- House: 83 yeas, 13 nays (86.5% approval)
- Senate: 41 yeas, 8 nays (83.7% approval)

**Fiscal Impact:** None (technical changes only)

**Status:** Enacted as Chapter 16, Laws of 2022

## 🔍 Demo Page Features

### Quick Queries
- Bill Metadata, Passage Information, Effective Dates
- RCW References, Agencies, Amendment Statistics

### Search
- Search by section number, RCW citation, or keywords
- Real-time results

### Advanced Queries (Using Lodash)
- Sections with Most Changes
- Group by RCW Title
- Voting Analysis with visualizations

## 📚 File Format Comparison

| Feature | XML | HTM |
|---------|-----|-----|
| Data Extraction | ✅ Excellent | ⚠️ Moderate |
| Human Readability | ⚠️ Moderate | ✅ Excellent |
| File Size | 1.1 MB | 1.0 MB |
| Best Use Case | Automation | Display |

**Recommendation:** Use XML for data extraction, HTM for human review.

## 🛠️ Technology Stack

- **Lodash 4.17.21** - Data manipulation
- **Axios 1.6.0** - JSON loading
- **Node.js v22+** - Extraction runtime
- **JSON Schema Draft-07** - Validation

## 📖 Usage Examples

### Find All Agencies
```javascript
const agencies = billData.agencies;
console.log(`Found ${agencies.length} agencies`);
```

### Count Sections by RCW Title
```javascript
const byTitle = _.groupBy(
  billData.sections.filter(s => s.rcw),
  s => s.rcw.title
);
```

### Calculate Approval Rate
```javascript
const house = billData.enrollingInfo.house;
const rate = (house.yeas / (house.yeas + house.nays)) * 100;
```

## ✅ Verification

To verify the extraction is working:

1. Run `node extract-bill.js`
2. Should show: "Total sections: 176"
3. Should show: "RCW sections amended: 160"
4. Open `demo.html` in browser
5. All queries should work without errors

## 📄 Files Created

- ✅ `1210-S2-data.json` - Extracted data
- ✅ `bill-extractor.js` - Extraction library
- ✅ `extract-bill.js` - CLI extraction script
- ✅ `schema.json` - JSON Schema
- ✅ `demo.html` - Interactive demo
- ✅ `ANALYSIS.md` - Comprehensive analysis
- ✅ `HB-1210-S2-README.md` - This file

---

**Project Status:** ✅ Complete
**Bill Status:** ✅ Enacted as Chapter 16, Laws of 2022
