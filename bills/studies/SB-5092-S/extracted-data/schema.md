# HB 5092-S JSON Data Schema

## Overview

This document describes the JSON schema for extracted Washington State budget bill data. The schema is designed to support efficient querying from browser-based applications using JavaScript libraries like lodash.

## Root Object

```json
{
  "metadata": Object,
  "parts": Array<Part>,
  "sections": Array<Section>,
  "appropriationsSummary": Object,
  "rcwReferences": Array<string>,
  "billReferences": Array<string>,
  "vetoInformation": Object|null,
  "fiscalImpact": Object
}
```

## Schema Definitions

### Metadata Object

Contains bill identification and high-level information.

```typescript
interface Metadata {
  billNumber: string;           // e.g., "ENGROSSED SUBSTITUTE SENATE BILL 5092"
  billType: string;             // e.g., "Operating Budget"
  chamber: string;              // "Senate" | "House"
  chapter: {
    number: string;             // Chapter number
    year: string;               // Year of enactment
  } | null;
  session: string;              // e.g., "67TH"
  sessionYear: string;          // e.g., "2021"
  effectiveDate: string | null; // e.g., "May 18, 2021"
  title: string | null;         // Bill title (e.g., "OPERATING BUDGET")
  sponsors: string;             // Sponsor information
  caption: string;              // Bill caption/summary
  hasPartialVeto: boolean;      // Whether bill has partial veto
}
```

**Example:**
```json
{
  "billNumber": "ENGROSSED SUBSTITUTE SENATE BILL 5092",
  "billType": "Operating Budget",
  "chamber": "Senate",
  "chapter": {
    "number": "334",
    "year": "2021"
  },
  "session": "67TH",
  "sessionYear": "2021",
  "effectiveDate": "May 18, 2021",
  "title": "OPERATING BUDGET",
  "sponsors": "Senate Ways & Means...",
  "caption": "AN ACT Relating to fiscal matters...",
  "hasPartialVeto": true
}
```

### Part Object

Represents major divisions within the budget bill.

```typescript
interface Part {
  partNumber: string;    // Roman numeral (e.g., "I", "II", "III")
  title: string;         // Part title (e.g., "GENERAL GOVERNMENT")
}
```

**Example:**
```json
{
  "partNumber": "I",
  "title": "GENERAL GOVERNMENT"
}
```

### Section Object

Represents individual agency appropriation sections.

```typescript
interface Section {
  sectionNumber: number;              // Section number
  agencyName: string;                 // Agency name
  appropriations: Array<Appropriation>; // Detailed appropriations
  provisos: Array<Proviso>;           // Conditions and limitations
  totalAppropriation: number | null;  // Total section appropriation
  fte: number | null;                 // Full-time equivalents
}
```

**Example:**
```json
{
  "sectionNumber": 101,
  "agencyName": "FOR THE HOUSE OF REPRESENTATIVES",
  "appropriations": [...],
  "provisos": [...],
  "totalAppropriation": 92544000,
  "fte": null
}
```

### Appropriation Object

Individual fund appropriation within a section.

```typescript
interface Appropriation {
  fundType: string;        // Fund name (e.g., "General Fund-State")
  fiscalYear: number | null; // Fiscal year (e.g., 2022, 2023)
  amount: number;          // Appropriation amount in dollars
}
```

**Example:**
```json
{
  "fundType": "General Fund-State Appropriation",
  "fiscalYear": 2022,
  "amount": 45740000
}
```

### Proviso Object

Conditions, limitations, and special instructions for appropriations.

```typescript
interface Proviso {
  subsection: number;              // Subsection number
  text: string;                    // Full proviso text
  amounts: Array<number>;          // Dollar amounts mentioned in proviso
  billReferences: Array<string>;   // Referenced bills
  isProvidedSolely: boolean;       // Whether funds are "provided solely"
}
```

**Example:**
```json
{
  "subsection": 1,
  "text": "$273,000 of the general fund—state appropriation for fiscal year 2022...",
  "amounts": [273000, 244000],
  "billReferences": ["Engrossed Substitute Senate Bill No. 5405"],
  "isProvidedSolely": true
}
```

### Appropriations Summary Object

Aggregated appropriations data for analysis and reporting.

```typescript
interface AppropriationsSummary {
  totalAppropriations: number;           // Total across all sections
  byFundType: {
    [fundType: string]: number;          // Total by fund type
  };
  byFiscalYear: {
    [year: string]: number;              // Total by fiscal year
  };
  byAgency: Array<{
    sectionNumber: number;
    agencyName: string;
    totalAppropriation: number;
  }>;                                     // Sorted by amount (descending)
}
```

**Example:**
```json
{
  "totalAppropriations": 56250000000,
  "byFundType": {
    "General Fund-State Appropriation": 48000000000,
    "General Fund-Federal Appropriation": 8000000000
  },
  "byFiscalYear": {
    "2022": 28000000000,
    "2023": 28250000000
  },
  "byAgency": [
    {
      "sectionNumber": 201,
      "agencyName": "FOR THE DEPARTMENT OF SOCIAL AND HEALTH SERVICES",
      "totalAppropriation": 12500000000
    }
  ]
}
```

### RCW References

Array of unique RCW (Revised Code of Washington) citations.

```typescript
type RCWReferences = Array<string>;  // e.g., ["10.99.800", "16.76.030"]
```

### Bill References

Array of unique bill references found in the document.

```typescript
type BillReferences = Array<string>;  // e.g., ["House Bill No. 1234", "Senate Bill No. 5678"]
```

### Veto Information Object

Information about vetoed sections (if applicable).

```typescript
interface VetoInformation {
  hasVeto: boolean;
  vetoedSections: Array<string>;  // Section references (e.g., ["127(18)", "308(18)"])
  vetoMessage: string | null;     // Governor's veto message
}
```

**Example:**
```json
{
  "hasVeto": true,
  "vetoedSections": ["127(18)", "137(13)", "308(18)", "738"],
  "vetoMessage": "I am vetoing sections 127(18); 137(13); 308(18)..."
}
```

### Fiscal Impact Object

High-level fiscal impact analysis.

```typescript
interface FiscalImpact {
  totalBienniumBudget: number;   // Total for both fiscal years
  fiscalYear2022: number;        // FY 2022 total
  fiscalYear2023: number;        // FY 2023 total
  generalFundState: number;      // General Fund-State total
  generalFundFederal: number;    // General Fund-Federal total
  otherFunds: number;            // All other funds total
  agencyCount: number;           // Number of agencies funded
}
```

**Example:**
```json
{
  "totalBienniumBudget": 56250000000,
  "fiscalYear2022": 28000000000,
  "fiscalYear2023": 28250000000,
  "generalFundState": 45000000000,
  "generalFundFederal": 8000000000,
  "otherFunds": 3250000000,
  "agencyCount": 243
}
```

## Query Examples

### Using Lodash

```javascript
// Load data
const data = await fetch('hb5092-data.json').then(r => r.json());

// Find all sections for a specific agency
const deptSections = _.filter(data.sections, s =>
  s.agencyName.includes('HEALTH')
);

// Get top 10 agencies by funding
const topAgencies = _.chain(data.sections)
  .filter(s => s.totalAppropriation)
  .orderBy(['totalAppropriation'], ['desc'])
  .take(10)
  .value();

// Calculate total General Fund-State appropriations
const totalGFS = _.sumBy(
  _.flatMap(data.sections, 'appropriations'),
  a => a.fundType.includes('General Fund-State') ? a.amount : 0
);

// Find all provisos mentioning a specific bill
const provisosForBill = _.flatMap(
  data.sections,
  s => s.provisos.filter(p =>
    p.billReferences.some(ref => ref.includes('5405'))
  )
);

// Get appropriations by fiscal year
const fy2022 = _.sumBy(
  _.flatMap(data.sections, 'appropriations'),
  a => a.fiscalYear === 2022 ? a.amount : 0
);
```

### Using Vanilla JavaScript

```javascript
// Find sections with provisos over $1M
const largeprovisos = data.sections.filter(s =>
  s.provisos.some(p => p.amounts.some(amt => amt > 1000000))
);

// Group appropriations by fund type
const byFund = data.sections
  .flatMap(s => s.appropriations)
  .reduce((acc, app) => {
    acc[app.fundType] = (acc[app.fundType] || 0) + app.amount;
    return acc;
  }, {});

// Search for specific RCW
const hasRCW = data.rcwReferences.includes('43.79.195');
```

## Data Types and Formats

### Numeric Values

- All dollar amounts are stored as **integers** (whole numbers)
- No decimal places (amounts are in whole dollars)
- Example: `45740000` represents $45,740,000

### Dates

- Stored as **strings** in natural language format
- Example: `"May 18, 2021"`
- Parse with `new Date()` if needed for date operations

### Text Fields

- UTF-8 encoded strings
- HTML entities and tags removed
- Normalized whitespace (single spaces)

## File Size and Performance

- **Uncompressed JSON**: ~15-25 MB (typical operating budget)
- **Gzipped**: ~2-4 MB
- **Recommended**: Serve with gzip compression
- **Browser caching**: Set appropriate cache headers

## Version History

- **v1.0** (2025-11-19): Initial schema for HB 5092-S extraction
