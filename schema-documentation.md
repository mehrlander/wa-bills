# HB 1281-S JSON Data Schema Documentation

## Overview

This document describes the JSON schema for extracted Washington State bill data from HB 1281-S. The data is structured to enable easy querying from static HTML pages using browser-based JavaScript libraries.

## Bill Type

**HB 1281-S** is a **Technical Corrections Bill** (Session Law). It is NOT a budget/appropriations bill. Its purpose is to make technical, nonsubstantive amendments to the Revised Code of Washington (RCW).

## Root Schema

```json
{
  "metadata": { ... },
  "sections": [ ... ],
  "rcwReferences": [ ... ],
  "agencies": [ ... ],
  "dates": { ... },
  "programs": [ ... ],
  "fiscalImpacts": { ... },
  "statutoryReferences": { ... },
  "history": [ ... ],
  "amendments": { ... },
  "analysis": { ... }
}
```

## Schema Definitions

### metadata

Core information about the bill.

| Field | Type | Description |
|-------|------|-------------|
| `billId` | string | Short bill identifier (e.g., "SHB 1281.SL") |
| `longBillId` | string | Full bill name (e.g., "SUBSTITUTE HOUSE BILL 1281") |
| `billType` | string | Type of bill (e.g., "bill", "resolution") |
| `legislature` | string | Legislature number (e.g., "69th Legislature") |
| `session` | string | Legislative session (e.g., "2025 Regular Session") |
| `sponsors` | string | Bill sponsors |
| `briefDescription` | string | Brief description of the bill's purpose |
| `title` | string | Full bill title (AN ACT...) |
| `chapterLaw` | string | Chapter law number |
| `chapterYear` | string | Year of chapter law |
| `sessionLawCaption` | string | Session law caption |
| `effectiveDate` | string | When the bill takes effect |
| `passage` | object | House and Senate passage information |
| `passage.house` | object | House passage details (date, yeas, nays, signer) |
| `passage.senate` | object | Senate passage details (date, yeas, nays, signer) |
| `approvedDate` | string | Governor approval date |
| `filedDate` | string | Filing date |
| `governor` | string | Governor's name |

### sections

Array of all bill sections.

Each section object contains:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Section type ("new", "amendatory", etc.) |
| `action` | string | Action type ("amend", "reen", "decod", etc.) |
| `sectionNumber` | string | Section number in the bill |
| `rcwCitation` | string | RCW being amended (if applicable) |
| `caption` | string | Section caption/title |
| `paragraphCount` | number | Number of paragraphs in section |
| `hasAmendments` | boolean | Whether section contains amendments |

### rcwReferences

Array of all RCW (Revised Code of Washington) references found in the bill.

Format: `"RCW X.XX.XXX"`

Example: `["RCW 1.16.050", "RCW 9.94A.507", ...]`

### agencies

Array of state agencies, departments, boards, and commissions mentioned in the bill.

Examples:
- "department of health"
- "state board of nursing"
- "Washington state health care authority"

### dates

Object containing various dates from the bill.

| Field | Type | Description |
|-------|------|-------------|
| `passedHouse` | string | Date passed by House |
| `passedSenate` | string | Date passed by Senate |
| `approved` | string | Approval date |
| `filed` | string | Filing date |
| `effective` | string | Effective date(s) |
| `readFirstTime` | string | First reading date |
| `allMentioned` | array | All dates mentioned in bill |

### programs

Array of program names mentioned in the bill.

Examples:
- "children's health program"
- "limited casualty program"
- "developmental disabilities endowment program"

### fiscalImpacts

Object containing fiscal and budget-related information.

| Field | Type | Description |
|-------|------|-------------|
| `monetaryAmounts` | array | Dollar amounts found in bill |
| `monetaryAmounts[].amount` | string | Dollar amount |
| `monetaryAmounts[].context` | string | Context around the amount |
| `fiscalReferences` | array | References to fiscal terms |
| `fiscalReferences[].keyword` | string | Keyword (budget, fiscal, etc.) |
| `fiscalReferences[].context` | string | Context of reference |

### statutoryReferences

Object containing all statutory references.

| Field | Type | Description |
|-------|------|-------------|
| `rcw` | array | RCW references |
| `usc` | array | U.S. Code references |
| `cfr` | array | Code of Federal Regulations references |

### history

Array of legislative history entries for sections.

### amendments

Object containing amendment information.

| Field | Type | Description |
|-------|------|-------------|
| `strikeCount` | number | Number of strikethrough amendments |
| `addCount` | number | Number of addition amendments |
| `strikethrough` | array | Sample strikethrough text (first 10) |
| `additions` | array | Sample addition text (first 10) |

### analysis

Metadata about the extraction and bill analysis.

| Field | Type | Description |
|-------|------|-------------|
| `extractedAt` | string | ISO timestamp of extraction |
| `billType` | string | Classification of bill type |
| `isBudgetBill` | boolean | Whether this is a budget bill |
| `hasAppropriations` | boolean | Whether bill includes appropriations |
| `totalSections` | number | Total number of sections |
| `totalRCWReferences` | number | Total RCW references |
| `totalAgencies` | number | Total agencies mentioned |
| `structuralPatterns` | object | Structural analysis |

## Querying the Data

### Using Lodash (from CDN)

```javascript
// Filter sections by type
const amendatorySections = _.filter(billData.sections, { type: 'amendatory' });

// Find sections affecting a specific RCW title
const title18Sections = _.filter(billData.sections, section =>
  section.rcwCitation && section.rcwCitation.startsWith('RCW 18.')
);

// Group sections by action type
const sectionsByAction = _.groupBy(billData.sections, 'action');

// Count amendments by type
const amendmentStats = {
  added: billData.amendments.addCount,
  removed: billData.amendments.strikeCount,
  total: billData.amendments.addCount + billData.amendments.strikeCount
};
```

### Using Native JavaScript

```javascript
// Search for specific agency
const healthDeptRefs = billData.agencies.filter(agency =>
  agency.toLowerCase().includes('health')
);

// Find all dates in a specific year
const dates2025 = billData.dates.allMentioned.filter(date =>
  date.includes('2025')
);

// Search RCW references
const findRCW = (title, chapter) => {
  return billData.rcwReferences.filter(rcw =>
    rcw.startsWith(`RCW ${title}.${chapter}`)
  );
};
```

### Common Query Patterns

#### 1. Find all sections modifying nursing-related statutes

```javascript
const nursingSections = billData.sections.filter(section =>
  section.caption && section.caption.toLowerCase().includes('nurs')
);
```

#### 2. Get timeline of bill passage

```javascript
const timeline = {
  introduced: billData.dates.readFirstTime,
  passedHouse: billData.dates.passedHouse,
  passedSenate: billData.dates.passedSenate,
  approved: billData.dates.approved,
  filed: billData.dates.filed,
  effective: billData.dates.effective
};
```

#### 3. Count sections by RCW title

```javascript
const sectionsByTitle = {};
billData.sections.forEach(section => {
  if (section.rcwCitation) {
    const title = section.rcwCitation.split('.')[1];
    sectionsByTitle[title] = (sectionsByTitle[title] || 0) + 1;
  }
});
```

#### 4. Find all health-related agencies

```javascript
const healthAgencies = billData.agencies.filter(agency =>
  /health|medical|nursing|hospital/i.test(agency)
);
```

## Data Quality Notes

1. **Agency Extraction**: Agency names are extracted using pattern matching and may include some false positives. Review context when precise identification is needed.

2. **Monetary Amounts**: Dollar amounts are extracted with surrounding context. For this technical corrections bill, these may be thresholds or definitions rather than appropriations.

3. **RCW References**: All RCW citations are extracted and deduplicated. The bill references 423 unique RCW sections.

4. **Amendments**: The bill contains numerous textual amendments (strikethroughs and additions). Full amendment text is available in the sections data.

## Bill-Specific Notes for HB 1281-S

- **Type**: Technical Corrections Bill
- **Purpose**: Make technical, nonsubstantive amendments to RCW
- **Sections**: 257 sections (numbered 1-5172, with many numbers used)
- **Primary Changes**:
  - Placing legislatively recognized days in calendar order
  - Correcting cross-references
  - Merging multiple amendments
  - Updating terminology (e.g., "marijuana" → "cannabis", "nursing care quality assurance commission" → "state board of nursing")
- **Multiple Effective Dates**:
  - General: July 27, 2025
  - Section 1003: October 1, 2025
  - Sections 5058-5170: June 30, 2027

## Format Comparison: XML vs HTM

### XML Format
- **Structure**: Well-formed XML with semantic tags
- **Elements**: `<BillSection>`, `<RCWCite>`, `<TextRun>`, etc.
- **Attributes**: Type, action, amendingStyle attributes
- **Parsing**: Easy to parse with XML/DOM parsers
- **Best for**: Programmatic extraction, data processing

### HTM Format
- **Structure**: HTML with inline CSS styles
- **Elements**: Standard HTML (`<div>`, `<span>`, etc.)
- **Styling**: Inline `style` attributes for formatting
- **Parsing**: Requires HTML parsing, less semantic
- **Best for**: Human reading, visual presentation

**Recommendation**: Use XML for data extraction, HTM for display/presentation.
