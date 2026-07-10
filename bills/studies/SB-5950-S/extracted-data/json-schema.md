# Washington Legislative Bill Data - JSON Schema Documentation

Version: 1.0.0
Last Updated: 2024-11-19

## Overview

This document describes the JSON data structure produced by the Bill Extractor library when parsing Washington State legislative bills (specifically budget bills in XML format).

## Root Object Structure

```json
{
  "extractionDate": "ISO 8601 timestamp",
  "extractorVersion": "string",
  "sourceFile": "string",
  "billData": { ... }
}
```

### Root Fields

| Field | Type | Description |
|-------|------|-------------|
| `extractionDate` | string (ISO 8601) | Timestamp when data was extracted |
| `extractorVersion` | string | Version of the extraction tool used |
| `sourceFile` | string | Name of the source file processed |
| `billData` | object | Main bill data object (see below) |

## BillData Object

The `billData` object contains all extracted information about the bill:

```json
{
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
```

## Metadata Object

Bill metadata including identification, sponsors, and passage information.

```json
{
  "billId": "string",
  "longBillId": "string",
  "legislature": "string",
  "session": "string",
  "sponsors": "string",
  "briefDescription": "string",
  "chapterLaw": {
    "year": "string",
    "number": "string"
  },
  "vetoAction": "string | null",
  "effectiveDate": "string",
  "passageInfo": [
    {
      "chamber": "string",
      "date": "string",
      "yeas": "number",
      "nays": "number",
      "signer": "string"
    }
  ]
}
```

### Metadata Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `billId` | string | Yes | Short bill identifier | "ESSB 5950.SL" |
| `longBillId` | string | Yes | Full bill identifier | "ENGROSSED SUBSTITUTE SENATE BILL 5950" |
| `legislature` | string | Yes | Legislative session | "68th Legislature" |
| `session` | string | Yes | Session year and type | "2024 Regular Session" |
| `sponsors` | string | Yes | Bill sponsors | "Senate Ways & Means (originally sponsored by...)" |
| `briefDescription` | string | Yes | Brief description of bill purpose | "Making 2023-2025 fiscal biennium supplemental..." |
| `chapterLaw` | object | No | Chapter and year if enacted | `{"year": "2024", "number": "376"}` |
| `vetoAction` | string | No | Veto information | "(partial veto)" |
| `effectiveDate` | string | Yes | Date bill becomes effective | "March 29, 2024" |
| `passageInfo` | array | Yes | Vote information by chamber | See PassageInfo below |

### PassageInfo Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `chamber` | string | "s" for Senate, "h" for House | "s" |
| `date` | string | Date of passage | "March 7, 2024" |
| `yeas` | number | Yes votes | 39 |
| `nays` | number | No votes | 8 |
| `signer` | string | Presiding officer | "DENNY HECK" |

## Agencies Array

List of all agencies mentioned in the bill.

```json
[
  {
    "name": "string",
    "displayName": "string",
    "type": "string"
  }
]
```

### Agency Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Agency index name (uppercase) | "HOUSE OF REPRESENTATIVES" |
| `displayName` | string | Display name from bill | "FOR THE HOUSE OF REPRESENTATIVES" |
| `type` | string | Always "department" | "department" |

## Appropriations Array

All budget appropriations in the bill.

```json
[
  {
    "section": "string",
    "agency": "string",
    "agencyCode": "string",
    "accountName": "string",
    "amount": "number",
    "amountFormatted": "string",
    "amendmentType": "string | null",
    "fiscalYear": "number | null"
  }
]
```

### Appropriation Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `section` | string | Bill section number | "101" |
| `agency` | string | Agency name | "HOUSE OF REPRESENTATIVES" |
| `agencyCode` | string | Numeric agency code | "011" |
| `accountName` | string | Account being appropriated from | "General Fund—State Appropriation (FY 2024)" |
| `amount` | number | Dollar amount (integer) | 60051000 |
| `amountFormatted` | string | Original formatted amount | "$60,051,000" |
| `amendmentType` | string/null | "add", "strike", or null | "add" |
| `fiscalYear` | number/null | Fiscal year if specified | 2024 |

## Statutory References Array

References to existing statutes (RCW codes, session laws, etc.).

```json
[
  {
    "type": "string",
    "reference": "string",
    "context": "string"
  }
]
```

### Statutory Reference Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | string | "RCW" or "uncodified" | "RCW" |
| `reference` | string | The reference number/text | "43.101.220" |
| `context` | string | Where found: "bill_title", "section_header" | "bill_title" |

## Dates Array

Important dates associated with the bill.

```json
[
  {
    "type": "string",
    "date": "string",
    "context": "string"
  }
]
```

### Date Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | string | Date type: "effective_date", "passage_date", "filed_date", "approved_date" | "effective_date" |
| `date` | string | The date value | "March 29, 2024" |
| `context` | string | Where found: "bill_metadata", "passage_info" | "bill_metadata" |

## Fiscal Impacts Object

Aggregated fiscal impact data.

```json
{
  "totalAppropriations": "number",
  "byFiscalYear": {
    "2024": "number",
    "2025": "number"
  },
  "byAgency": {
    "AGENCY NAME": "number"
  },
  "amendments": {
    "increases": [ ...appropriation objects... ],
    "decreases": [ ...appropriation objects... ]
  }
}
```

### Fiscal Impacts Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalAppropriations` | number | Sum of all appropriation amounts |
| `byFiscalYear` | object | Total appropriations grouped by fiscal year |
| `byAgency` | object | Total appropriations grouped by agency name |
| `amendments.increases` | array | Appropriations marked as "add" |
| `amendments.decreases` | array | Appropriations marked as "strike" |

## Conditions and Limitations Array

Spending conditions and restrictions.

```json
[
  {
    "section": "string",
    "text": "string",
    "hasProvidedSolely": "boolean"
  }
]
```

### Conditions Fields

| Field | Type | Description |
|-------|------|-------------|
| `section` | string | Bill section number |
| `text` | string | Full text of the condition |
| `hasProvidedSolely` | boolean | True if contains "provided solely" language |

## Programs Array

Programs mentioned in the bill.

```json
[
  {
    "name": "string",
    "section": "string",
    "context": "string"
  }
]
```

### Program Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Program name | "juvenile rehabilitation program" |
| `section` | string | Section where mentioned | "103" |
| `context` | string | Context of mention | "conditions_and_limitations" |

## Accounts Array

Unique accounts identified in appropriations.

```json
[
  {
    "name": "string",
    "fiscalYear": "number | null",
    "type": "string"
  }
]
```

### Account Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Account name | "General Fund—State Appropriation (FY 2024)" |
| `fiscalYear` | number/null | Associated fiscal year | 2024 |
| `type` | string | Account type classification | "general_fund_state" |

### Account Types

- `general_fund_state` - General Fund—State
- `general_fund_federal` - General Fund—Federal
- `general_fund_private` - General Fund—Private/Local
- `special_account_state` - Special Account—State
- `special_account_federal` - Special Account—Federal
- `other` - Other account types

## Bill Type Object

Classification of the bill.

```json
{
  "category": "string",
  "subcategory": "string | null",
  "description": "string"
}
```

### Bill Type Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `category` | string | "budget" or "general_legislation" | "budget" |
| `subcategory` | string/null | Specific budget type | "supplemental_operating" |
| `description` | string | Human-readable description | "Supplemental Operating Budget" |

### Budget Subcategories

- `supplemental_operating` - Supplemental Operating Budget
- `operating` - Operating Budget
- `capital` - Capital Budget
- `transportation` - Transportation Budget

## Example Queries

### Using JavaScript (Browser)

```javascript
// Load the JSON data
fetch('hb-5950-s-data.json')
  .then(response => response.json())
  .then(data => {
    // Get all appropriations for a specific agency
    const houseApprops = data.billData.appropriations.filter(
      a => a.agency === 'HOUSE OF REPRESENTATIVES'
    );

    // Get total appropriations for FY 2024
    const fy2024Total = data.billData.fiscalImpacts.byFiscalYear[2024];

    // Find all "provided solely" conditions
    const providedSolely = data.billData.conditionsAndLimitations.filter(
      c => c.hasProvidedSolely
    );

    // Get all agencies with appropriations over $100M
    const bigAgencies = Object.entries(data.billData.fiscalImpacts.byAgency)
      .filter(([name, amount]) => amount > 100000000)
      .map(([name, amount]) => ({ name, amount }));
  });
```

### Using Lodash (from CDN)

```javascript
// Group appropriations by fiscal year
const byYear = _.groupBy(
  data.billData.appropriations,
  'fiscalYear'
);

// Get top 10 agencies by funding
const topAgencies = _.chain(data.billData.fiscalImpacts.byAgency)
  .toPairs()
  .orderBy([1], ['desc'])
  .take(10)
  .value();

// Find all RCW references
const rcwRefs = _.filter(
  data.billData.statutoryReferences,
  { type: 'RCW' }
);
```

## Data Quality Notes

1. **Amount Parsing**: Dollar amounts are parsed as integers (cents not supported). All amounts are in dollars.

2. **Program Detection**: Program names are extracted heuristically from text. Not all programs may be detected.

3. **Amendment Types**: Only appropriations with explicit markup (`amendingStyle="add"` or `amendingStyle="strike"`) will have an `amendmentType`.

4. **Fiscal Years**: Only detected from explicit "FY 2024", "FY 2025" patterns in account names.

5. **Completeness**: XML format provides more complete data than HTML format. Always prefer XML source when available.

## Version History

### 1.0.0 (2024-11-19)
- Initial schema definition
- Support for supplemental operating budget bills
- Extraction of metadata, appropriations, agencies, dates, references
- Fiscal impact aggregation
- Conditions and limitations extraction
