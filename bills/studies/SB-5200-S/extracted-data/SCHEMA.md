# HB 5200-S JSON Data Schema Documentation

## Overview

This document describes the JSON data structure extracted from Washington State's HB 5200-S (2023-2025 Capital Budget Bill). The data is designed to be easily queryable from browser-based applications using libraries like lodash.

## File Structure

The JSON file contains a single root object with the following top-level properties:

```json
{
  "metadata": {},
  "structure": {},
  "agencies": [],
  "projects": [],
  "appropriations": [],
  "grants": [],
  "statutoryReferences": [],
  "dates": {},
  "fiscalSummary": {}
}
```

---

## Data Schema

### 1. `metadata` (Object)

Bill metadata and legislative information.

**Properties:**

| Field | Type | Description |
|-------|------|-------------|
| `shortId` | string | Short bill identifier (e.g., "ESSB 5200.SL") |
| `longId` | string | Full bill identifier |
| `billType` | string | Type of bill (e.g., "bill") |
| `legislature` | string | Legislature session (e.g., "68th Legislature") |
| `session` | string | Session name (e.g., "2023 Regular Session") |
| `sponsors` | string | Bill sponsors |
| `briefDescription` | string | Brief description of the bill |
| `billTitle` | string | Full bill title (AN ACT statement) |
| `chapterLaw` | string | Chapter law number |
| `chapterYear` | string | Year of chapter law |
| `vetoAction` | string | Veto action description (if any) |
| `sessionLawCaption` | string | Session law caption |
| `effectiveDate` | string | Effective date of the bill |
| `approvedDate` | string | Governor approval date |
| `filedDate` | string | Filing date |
| `governor` | string | Governor's name |
| `passage` | array | Array of passage information objects |
| `vetoNote` | string | Governor's veto note (if applicable) |
| `vetoedSections` | array | Array of vetoed section numbers |

**Passage Information Object:**

```json
{
  "chamber": "s" | "h",
  "date": "April 22, 2023",
  "yeas": 48,
  "nays": 0,
  "signer": "DENNY HECK"
}
```

---

### 2. `structure` (Object)

Organizational structure of the bill.

**Properties:**

| Field | Type | Description |
|-------|------|-------------|
| `parts` | array | Array of Part objects |
| `totalSections` | number | Total number of sections in the bill |

**Part Object:**

```json
{
  "name": "PART 1 - GENERAL GOVERNMENT",
  "sections": [
    {
      "number": "1001",
      "department": "FOR THE OFFICE OF THE SECRETARY OF STATE",
      "project": "Library-Archives Building (30000033)",
      "type": "new",
      "action": null,
      "vetoed": false
    }
  ]
}
```

---

### 3. `agencies` (Array)

List of all agencies/departments mentioned in the bill.

**Agency Object:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Department/agency name |
| `index` | string | Index code (if available) |
| `projectCount` | number | Number of projects for this agency |
| `totalAppropriation` | number | Total appropriation amount |
| `totalReappropriation` | number | Total reappropriation amount |
| `projects` | array | Array of project summary objects |

**Project Summary Object:**

```json
{
  "name": "Library-Archives Building",
  "id": "30000033"
}
```

---

### 4. `projects` (Array)

Detailed list of all capital projects.

**Project Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Project ID number |
| `name` | string | Project name |
| `section` | string | Bill section number |
| `department` | string | Department name |
| `agencyCode` | string | Agency code |
| `conditions` | array | Array of condition/limitation strings |
| `sectionType` | string | Section type (e.g., "new", "amendatory") |
| `sectionAction` | string | Section action (if applicable) |
| `vetoed` | boolean | Whether the section was vetoed |

**Example:**

```json
{
  "id": "30000033",
  "name": "Library-Archives Building",
  "section": "1001",
  "department": "FOR THE OFFICE OF THE SECRETARY OF STATE",
  "agencyCode": "085",
  "conditions": [
    "$8,000,000 of the Washington state library-archives building account—state appropriation is provided solely for costs associated with the design and construction of the library-archives building..."
  ],
  "sectionType": "new",
  "sectionAction": null,
  "vetoed": false
}
```

---

### 5. `appropriations` (Array)

All funding appropriations and fiscal data.

**Appropriation Object:**

| Field | Type | Description |
|-------|------|-------------|
| `section` | string | Section number |
| `project` | string | Project ID |
| `projectName` | string | Project name |
| `agency` | string | Agency code |
| `type` | string | Appropriation type (see below) |
| `account` | string | Account name |
| `amount` | number | Dollar amount |
| `isTotal` | boolean | Whether this is a subtotal/total row |

**Appropriation Types:**

- `appropriation` - New appropriation for the biennium
- `reappropriation` - Reappropriation from prior budgets
- `prior_biennia` - Prior biennium expenditures (informational)
- `future_biennia` - Future biennium projected costs (informational)
- `appropriation_subtotal` - Subtotal of appropriations
- `reappropriation_subtotal` - Subtotal of reappropriations
- `total` - Project total

**Example:**

```json
{
  "section": "1001",
  "project": "30000047",
  "projectName": "Library-Archives Building (30000033)",
  "agency": "085",
  "type": "appropriation",
  "account": "Washington State Library-Archives Building Account—State",
  "amount": 8000000,
  "isTotal": false
}
```

---

### 6. `grants` (Array)

Individual grant allocations within grant programs.

**Grant Object:**

| Field | Type | Description |
|-------|------|-------------|
| `section` | string | Bill section number |
| `program` | string | Grant program name |
| `department` | string | Department name |
| `grantee` | string | Grant recipient name |
| `amount` | number | Grant amount in dollars |

**Example:**

```json
{
  "section": "1003",
  "program": "2023-25 Building Communities Fund Grant Program (40000279)",
  "department": "FOR THE DEPARTMENT OF COMMERCE",
  "grantee": "American Legion Veteran Housing and Resource Center",
  "amount": 493000
}
```

---

### 7. `statutoryReferences` (Array)

All RCW (Revised Code of Washington) citations found in the bill.

**Type:** Array of strings

**Example:**

```json
[
  "RCW 28A.320.330",
  "RCW 28B.15.210",
  "RCW 43.07.410"
]
```

---

### 8. `dates` (Object)

All date-related information from the bill.

**Properties:**

| Field | Type | Description |
|-------|------|-------------|
| `fiscalYears` | array | Array of fiscal year definition objects |
| `passageDates` | array | Array of passage date objects |
| `effectiveDate` | string | Bill effective date |
| `approvedDate` | string | Governor approval date |
| `filedDate` | string | Filing date |
| `otherDates` | array | Other significant dates |

**Fiscal Year Object:**

```json
{
  "year": "2024",
  "abbreviation": "FY 2024",
  "startDate": "July 1, 2023",
  "endDate": "June 30, 2024"
}
```

**Passage Date Object:**

```json
{
  "chamber": "s",
  "date": "April 22, 2023"
}
```

---

### 9. `fiscalSummary` (Object)

Aggregate fiscal information across all appropriations.

**Properties:**

| Field | Type | Description |
|-------|------|-------------|
| `totalAppropriation` | number | Total new appropriations |
| `totalReappropriation` | number | Total reappropriations |
| `grandTotal` | number | Sum of appropriation + reappropriation |
| `totalPriorBiennia` | number | Total prior biennium expenditures |
| `totalFutureBiennia` | number | Total future biennium projections |
| `byAgency` | object | Fiscal totals by agency code |
| `byAccount` | object | Fiscal totals by account name |
| `bySectionCount` | number | Number of sections with appropriations |

**Agency Fiscal Object (within `byAgency`):**

```json
"085": {
  "appropriation": 1507000,
  "reappropriation": 0,
  "total": 8000000
}
```

**Account Fiscal Object (within `byAccount`):**

```json
"State Building Construction Account—State": 8902281000
```

---

## Query Examples

### Using Lodash in Browser

```javascript
// Load lodash from CDN
// <script src="https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js"></script>

// Example queries:

// 1. Find all projects for a specific agency
const commerceProjects = _.filter(data.projects, { agencyCode: '103' });

// 2. Get total appropriations by account type
const accountTotals = _.mapValues(data.fiscalSummary.byAccount,
  amount => `$${amount.toLocaleString()}`
);

// 3. Find projects with appropriations over $10M
const largeProjects = _.filter(data.appropriations,
  a => a.type === 'appropriation' && a.amount > 10000000
);

// 4. Group grants by program
const grantsByProgram = _.groupBy(data.grants, 'program');

// 5. Find all vetoed sections
const vetoedProjects = _.filter(data.projects, { vetoed: true });

// 6. Get agencies sorted by total funding
const agenciesByFunding = _.chain(data.fiscalSummary.byAgency)
  .toPairs()
  .sortBy(([code, amounts]) => -amounts.total)
  .value();

// 7. Search projects by keyword
const housingProjects = _.filter(data.projects,
  p => p.name.toLowerCase().includes('housing')
);

// 8. Calculate total for specific account
const sbcaTotal = _.sumBy(
  _.filter(data.appropriations, a =>
    a.account.includes('State Building Construction') && !a.isTotal
  ),
  'amount'
);
```

---

## Data Quality Notes

1. **Currency Values**: All dollar amounts are stored as numbers (not strings) for easy numerical operations
2. **Missing Values**: Fields may be `null` or empty string `""` if not present in source XML
3. **Agency Codes**: Agency codes are 3-digit strings (e.g., "085", "103")
4. **Project IDs**: Project IDs are 8-digit strings (e.g., "30000033", "40000279")
5. **Vetoed Sections**: The `vetoedSections` array in metadata lists section numbers that were vetoed by the governor
6. **Totals**: Items with `isTotal: true` in appropriations are summary rows and should be excluded from aggregate calculations to avoid double-counting

---

## File Statistics (HB 5200-S)

- **File Size**: ~1.8 MB (JSON)
- **Total Sections**: 1,030
- **Total Agencies**: 71
- **Total Projects**: 923
- **Total Appropriation Records**: 4,479
- **Total Grant Records**: 5+
- **Grand Total Appropriated**: $21,756,859,000
- **Statutory References**: 68

---

## Version Information

- **Schema Version**: 1.0
- **Bill**: ESSB 5200 (2023-2025 Capital Budget)
- **Extraction Date**: 2025-11-19
- **Source Format**: WA Legislature XML (http://leg.wa.gov/2012/document)
