# HB 5693-S JSON Data Schema Documentation

## Overview

This document describes the JSON data structure extracted from Washington State HB 5693-S (Supplemental Operating Budget). The data is structured to be easily queryable using browser-based tools like lodash, and contains comprehensive information about appropriations, agencies, fiscal impacts, and legislative details.

## Root Object Structure

```json
{
  "metadata": {},
  "agencies": [],
  "appropriations": [],
  "statutoryReferences": [],
  "dates": {},
  "fiscalImpacts": {},
  "programs": [],
  "vetoes": [],
  "billSections": [],
  "extractionMetadata": {},
  "summary": {}
}
```

## Schema Details

### metadata (Object)

Contains high-level bill information.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `billId` | string | Short bill identifier | "ESSB 5693.SL" |
| `longBillId` | string | Full bill identifier | "ENGROSSED SUBSTITUTE SENATE BILL 5693" |
| `billType` | string | Type of bill | "Supplemental Operating Budget" |
| `sessionLawCaption` | string | Session law caption | "SUPPLEMENTAL OPERATING BUDGET" |
| `chapterLaw` | string | Chapter number in law | "297" |
| `chapterYear` | string | Year of chapter | "2022" |
| `legislature` | string | Legislature session | "67th Legislature" |
| `session` | string | Session type | "2022 Regular Session" |
| `sponsors` | string | Bill sponsors | "Senate Ways & Means (originally sponsored by...)" |
| `briefDescription` | string | Brief description | "Making 2021-2023 fiscal biennium supplemental operating appropriations." |
| `vetoAction` | string | Veto status | "(partial veto)" |

### agencies (Array of Objects)

List of all departments and agencies mentioned in the bill.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Official agency name | "HOUSE OF REPRESENTATIVES" |
| `displayName` | string | Display version of name | "FOR THE HOUSE OF REPRESENTATIVES" |
| `agencyCode` | string | Agency code identifier | "011" |
| `sectionNumber` | string | Bill section number | "101" |

**Example:**
```json
{
  "name": "DEPARTMENT OF COMMERCE",
  "displayName": "FOR THE DEPARTMENT OF COMMERCE",
  "agencyCode": "103",
  "sectionNumber": "128"
}
```

### appropriations (Array of Objects)

Detailed appropriation amounts for each agency and account.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `agency` | string | Agency name | "DEPARTMENT OF COMMERCE" |
| `agencyCode` | string | Agency code | "103" |
| `sectionNumber` | string | Bill section number | "128" |
| `accountName` | string | Fund/account name | "General Fund—State Appropriation (FY 2022)" |
| `fiscalYear` | string\|null | Fiscal year | "FY 2022" or "FY 2023" |
| `oldAmount` | string\|null | Original appropriation amount | "$193,804,000" |
| `newAmount` | string\|null | Revised appropriation amount | "$201,157,000" |
| `changeAmount` | number | Dollar amount of change | 7353000 |
| `isNew` | boolean | Whether this is a new appropriation | true/false |
| `isStrike` | boolean | Whether old amount was struck | true/false |
| `isTotal` | boolean | Whether this is a total row | true/false |

**Example:**
```json
{
  "agency": "HOUSE OF REPRESENTATIVES",
  "agencyCode": "011",
  "sectionNumber": "101",
  "accountName": "General Fund—State Appropriation (FY 2022)",
  "fiscalYear": "FY 2022",
  "oldAmount": "$45,740,000",
  "newAmount": "$46,838,000",
  "changeAmount": 1098000,
  "isNew": true,
  "isStrike": true
}
```

### statutoryReferences (Array of Strings)

List of all Revised Code of Washington (RCW) citations referenced in the bill.

**Example:**
```json
[
  "28B.92.205",
  "41.60.050",
  "41.80.010",
  "43.31.605"
]
```

### dates (Object)

Important dates related to the bill.

| Field | Type | Description |
|-------|------|-------------|
| `effectiveDate` | string | When bill takes effect |
| `senatePassed` | object | Senate passage information |
| `senatePassed.date` | string | Date senate passed |
| `senatePassed.yeas` | string | Yes votes |
| `senatePassed.nays` | string | No votes |
| `housePassed` | object | House passage information |
| `housePassed.date` | string | Date house passed |
| `housePassed.yeas` | string | Yes votes |
| `housePassed.nays` | string | No votes |
| `approved` | string | Governor approval date |
| `filed` | string | Filing date |
| `readFirstTime` | string | First reading date |
| `allMentionedDates` | array | All dates mentioned in bill |

**Example:**
```json
{
  "effectiveDate": "March 31, 2022",
  "senatePassed": {
    "date": "March 10, 2022",
    "yeas": "29",
    "nays": "19"
  },
  "housePassed": {
    "date": "March 10, 2022",
    "yeas": "57",
    "nays": "41"
  },
  "approved": "March 31, 2022 5:04 PM...",
  "filed": "April 1, 2022",
  "readFirstTime": "02/24/22"
}
```

### fiscalImpacts (Object)

Aggregated fiscal impact data.

#### fiscalImpacts.byFiscalYear (Object)

Fiscal impacts grouped by fiscal year.

```json
{
  "FY 2022": {
    "old": 12345678900,
    "new": 12445678900,
    "change": 100000000
  },
  "FY 2023": {
    "old": 12345678900,
    "new": 12545678900,
    "change": 200000000
  }
}
```

#### fiscalImpacts.byAgency (Object)

Fiscal impacts grouped by agency.

```json
{
  "DEPARTMENT OF COMMERCE": {
    "old": 2716086000,
    "new": 3730436000,
    "change": 1014350000,
    "agencyCode": "103"
  }
}
```

#### fiscalImpacts.total (Object)

Overall fiscal impact totals.

```json
{
  "old": 45123456789,
  "new": 46234567890,
  "change": 1111111101
}
```

### programs (Array of Objects)

Programs, grants, and initiatives mentioned in conditions and limitations.

| Field | Type | Description |
|-------|------|-------------|
| `sectionNumber` | string | Bill section number |
| `description` | string | Program description (first 500 chars) |
| `amounts` | array | Dollar amounts mentioned |
| `fullText` | string | Complete text of the provision |

**Example:**
```json
{
  "sectionNumber": "128",
  "description": "$3,000,000 of the general fund—state appropriation for fiscal year 2022 and $7,096,000 of the general fund—state appropriation for fiscal year 2023 are provided solely for a grant to resolution Washington...",
  "amounts": ["$3,000,000", "$7,096,000"],
  "fullText": "..."
}
```

### vetoes (Array of Objects)

Information about vetoed sections.

| Field | Type | Description |
|-------|------|-------------|
| `sectionNumber` | string | Bill section number |
| `vetoType` | string | Type of veto (e.g., "line") |
| `lineVetoes` | array | Array of line veto texts |
| `hasLineVetoes` | boolean | Whether section has line vetoes |

**Example:**
```json
{
  "sectionNumber": "103",
  "vetoType": "line",
  "lineVetoes": [
    "(10) $13,000 of the general fund—state appropriation for fiscal year 2022 is for the implementation of House Bill No. 1924..."
  ],
  "hasLineVetoes": true
}
```

### billSections (Array of Objects)

Structural information about bill sections.

| Field | Type | Description |
|-------|------|-------------|
| `sectionNumber` | string | Section number |
| `type` | string | Section type (e.g., "amendatory", "new") |
| `action` | string | Legislative action (e.g., "amenduncod") |
| `agency` | string | Related agency |
| `hasVeto` | boolean | Whether section has veto |
| `vetoType` | string\|null | Type of veto if applicable |

**Example:**
```json
{
  "sectionNumber": "101",
  "type": "amendatory",
  "action": "amenduncod",
  "agency": "HOUSE OF REPRESENTATIVES",
  "hasVeto": false,
  "vetoType": null
}
```

### extractionMetadata (Object)

Metadata about the extraction process.

| Field | Type | Description |
|-------|------|-------------|
| `extractedAt` | string | ISO timestamp of extraction |
| `extractorVersion` | string | Version of extraction library |
| `sourceFile` | string | Source filename |
| `billType` | string | Type of bill |

**Example:**
```json
{
  "extractedAt": "2025-11-19T12:34:56.789Z",
  "extractorVersion": "1.0.0",
  "sourceFile": "5693-S.xml",
  "billType": "Supplemental Operating Budget"
}
```

### summary (Object)

Summary statistics about the extracted data.

| Field | Type | Description |
|-------|------|-------------|
| `totalAgencies` | number | Total number of agencies |
| `totalAppropriations` | number | Total number of appropriations |
| `totalStatutoryReferences` | number | Total RCW citations |
| `totalPrograms` | number | Total programs/grants |
| `totalVetoedSections` | number | Total vetoed sections |
| `totalBillSections` | number | Total bill sections |
| `fiscalYears` | array | Array of fiscal years |
| `totalFiscalImpact` | object | Overall fiscal impact |

## Query Examples

### Using Lodash in Browser

```javascript
// Load the data
fetch('hb5693-data.json')
  .then(res => res.json())
  .then(data => {

    // Find all appropriations for Department of Commerce
    const commerceApprops = _.filter(data.appropriations,
      { agency: 'DEPARTMENT OF COMMERCE' });

    // Get total appropriations by fiscal year
    const fy2023Total = _.sumBy(
      _.filter(data.appropriations, { fiscalYear: 'FY 2023' }),
      item => parseFloat(item.newAmount?.replace(/[$,]/g, '') || 0)
    );

    // Find all agencies with vetoes
    const vetoedAgencies = _.uniq(
      _.map(data.vetoes, veto => {
        const section = _.find(data.billSections,
          { sectionNumber: veto.sectionNumber });
        return section?.agency;
      })
    );

    // Group appropriations by agency
    const byAgency = _.groupBy(data.appropriations, 'agency');

    // Find programs with amounts over $1M
    const largePrograms = _.filter(data.programs, program => {
      return program.amounts.some(amt =>
        parseFloat(amt.replace(/[$,]/g, '')) > 1000000
      );
    });
  });
```

### Query Patterns

1. **Filter by agency**: `_.filter(data.appropriations, { agency: 'AGENCY_NAME' })`
2. **Filter by fiscal year**: `_.filter(data.appropriations, { fiscalYear: 'FY 2023' })`
3. **Sum amounts**: `_.sumBy(data.appropriations, item => parseMoneyValue(item.newAmount))`
4. **Group by field**: `_.groupBy(data.appropriations, 'agencyCode')`
5. **Find specific section**: `_.find(data.billSections, { sectionNumber: '101' })`
6. **Search programs**: `_.filter(data.programs, p => p.fullText.includes('search term'))`

## Data Types

All dollar amounts are stored as strings with formatting (e.g., "$1,234,567") to preserve exact formatting. To perform calculations:

```javascript
function parseMoneyValue(moneyString) {
  if (!moneyString) return 0;
  return parseFloat(moneyString.replace(/[$,]/g, '')) || 0;
}
```

## Notes

- `null` values indicate data was not available or not applicable
- Empty strings `""` indicate the field exists but has no value
- Arrays may be empty `[]` if no items of that type exist
- Dollar amounts in `changeAmount` fields are numeric for easy calculations
- Fiscal years are either "FY 2022", "FY 2023", or `null` for items that span both years
