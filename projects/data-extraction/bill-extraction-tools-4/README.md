# Washington State Bill Extraction Tools

Comprehensive data extraction and analysis tools for Washington State legislative bills, with full implementation for HB 5195-S (2025-27 Capital Budget).

## Overview

This repository provides:

- **JavaScript extraction library** for parsing WA bill XML/HTML formats
- **Complete structured data** extracted to JSON
- **JSON Schema** for validation and documentation
- **Interactive demo page** for querying bill data
- **Comprehensive analysis** of bill structure and fiscal data

## HB 5195-S Capital Budget

**Bill**: SUBSTITUTE SENATE BILL 5195
**Type**: Capital Budget (2025-2027 Biennium)
**Status**: Enacted with Partial Veto (Chapter 414, Laws of 2025)
**Effective**: May 20, 2025

### Key Statistics

- 💰 **$10.46 Billion** in current biennium appropriations
- 💰 **$9.45 Billion** in reappropriations
- 🏗️ **788** capital projects across state government
- 🏛️ **40** departments and agencies
- 💳 **83** unique funding accounts
- 📄 **1,180** bill sections

## Quick Start

### View the Demo

1. Extract the data:
   ```bash
   npm install
   node extract-to-json.js
   ```

2. Start a local web server:
   ```bash
   python -m http.server 8000
   ```

3. Open the demo:
   ```
   http://localhost:8000/demo.html
   ```

### Use the Extraction Library

**Browser:**
```html
<script src="bill-extractor.js"></script>
<script>
  fetch('5195-S.xml')
    .then(response => response.text())
    .then(xml => {
      const data = BillExtractor.extractAll(xml);
      console.log(data.projects);
    });
</script>
```

**Node.js:**
```javascript
const BillExtractor = require('./bill-extractor-node.js');
const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

global.DOMParser = DOMParser;
const xml = fs.readFileSync('./5195-S.xml', 'utf-8');
const data = BillExtractor.extractAll(xml);
```

## Files

### Source Data
- `5195-S.xml` - Official bill in XML format (2.3 MB)
- `5195-S.htm` - Official bill in HTML format (2.5 MB)

### Extraction Tools
- `bill-extractor.js` - Browser-compatible extraction library
- `bill-extractor-node.js` - Node.js-optimized extraction library
- `extract-to-json.js` - Command-line extraction script

### Output
- `hb5195-data.json` - Complete extracted structured data (~3 MB)
- `hb5195-schema.json` - JSON Schema for validation

### Demo & Documentation
- `demo.html` - Interactive query interface (lodash + Chart.js)
- `ANALYSIS.md` - Comprehensive analysis and documentation
- `README.md` - This file

## Extracted Data Structure

```json
{
  "metadata": {
    "billId": "SSB 5195.SL",
    "legislature": "69th Legislature",
    "session": "2025 Regular Session",
    "effectiveDate": "May 20, 2025",
    ...
  },
  "projects": [
    {
      "projectId": "40000007",
      "projectName": "Puget Sound Regional Archives HVAC",
      "department": "FOR THE SECRETARY OF STATE",
      "fiscalSummary": {
        "currentBiennium": 2430000,
        "reappropriation": 0,
        "total": 2430000
      },
      "appropriations": { ... }
    },
    ...
  ],
  "fiscalImpact": {
    "totalCurrentBiennium": 10457670000,
    "byDepartment": { ... },
    "byAccount": { ... }
  },
  ...
}
```

## Query Examples

Using lodash in the browser (loaded from CDN in demo):

**Find projects over $10 million:**
```javascript
_.filter(billData.projects,
  p => p.fiscalSummary.currentBiennium > 10000000)
```

**Top 10 departments by budget:**
```javascript
_.chain(billData.fiscalImpact.byDepartment)
  .toPairs()
  .map(([dept, data]) => ({ dept, ...data }))
  .orderBy(['currentBiennium'], ['desc'])
  .take(10)
  .value()
```

**Search projects by keyword:**
```javascript
_.filter(billData.projects,
  p => p.projectName.toLowerCase().includes('school'))
```

**Climate-funded projects:**
```javascript
_.filter(billData.projects,
  p => _.some(p.appropriations.appropriation,
    a => a.account.includes('Climate Commitment')))
```

## Key Features

### Entity Extraction

✅ **Bill Metadata** - Sponsors, dates, votes, veto status
✅ **Capital Projects** - 788 projects with full fiscal details
✅ **Appropriations** - All funding line items by account
✅ **Agencies** - 40 departments with agency codes
✅ **Accounts** - 83 unique funding sources
✅ **RCW References** - Statutory citations
✅ **Fiscal Impact** - Aggregations by department and account
✅ **Veto Information** - 23 vetoed sections with details

### Budget Data

- **Current Biennium Appropriations** (2025-27)
- **Reappropriations** (2023-25 carryover)
- **Prior Biennia** (historical expenditures)
- **Future Biennia** (2027-29+ projections)
- **Account breakdowns** (83 funding sources)
- **Department totals** (40 agencies)

### Analysis Capabilities

- 📊 Budget visualization (Chart.js)
- 🔍 Full-text search across projects
- 📈 Fiscal aggregations and trends
- 🗺️ Department/account breakdowns
- ⚖️ Veto impact analysis
- 📋 Custom lodash queries

## Bill Structure

The capital budget is organized into 8 major parts:

| Part | Focus Area |
|------|------------|
| 1 | General Government |
| 2 | K-12 Education |
| 3 | Higher Education |
| 4 | Transportation |
| 5 | Natural Resources |
| 6 | Debt Service |
| 7 | State Facilities |
| 8 | General Provisions |

## Development

### Prerequisites

- Node.js 14.0.0+
- Modern web browser (for demo)

### Installation

```bash
npm install
```

### Extract Data

```bash
node extract-to-json.js
```

### Run Demo Locally

```bash
python -m http.server 8000
# Visit http://localhost:8000/demo.html
```

## Documentation

See [ANALYSIS.md](ANALYSIS.md) for comprehensive documentation including:

- Bill type and purpose
- Structural patterns
- HTM vs XML format comparison
- Extractable entities and fields
- Budget data structures
- Query examples
- Technical implementation notes
- Future enhancements

## Use Cases

- 📰 **Journalism** - Investigate budget priorities
- 🔬 **Research** - Analyze fiscal policy
- 🏛️ **Government** - Track appropriations
- 👁️ **Transparency** - Monitor public spending
- 💼 **Advocacy** - Identify funding impacts
- 🛠️ **Development** - Build budget apps

## Data Quality

- ✅ Extracted from official legislative XML
- ✅ 100% of sections and projects captured
- ✅ Fiscal totals validated
- ✅ Cross-checked against session law publication

## License

Tools and schema: MIT License (recommended for open source release)
Source data: Washington State Legislature (public domain)

## Contributing

Issues and pull requests welcome! This extraction framework can be adapted for:

- Other WA bill types (operating budget, policy bills)
- Other states' legislative formats
- Historical bill analysis
- Multi-bill comparisons

## Contact

For questions or issues, please open a GitHub issue.

---

**Built with**: JavaScript, Node.js, Lodash, Chart.js
**Data Source**: Washington State Legislature
**Last Updated**: November 2025
