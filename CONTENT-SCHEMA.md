# Budget Bill Content Schema

This document describes the relational database schema for capturing the actual content of Washington State budget bills - the appropriations, agencies, programs, funds, and proviso language.

## Overview

The content schema extends the base metadata database to capture the substantive content of budget bills. It models:

- **Organizational structure**: Agencies, programs, sub-programs
- **Financial data**: Appropriations, fund sources, amounts by fiscal year
- **Staffing**: FTE (Full-Time Equivalent) authorizations
- **Conditions**: Proviso language and restrictions
- **Structure**: Bill sections, parts, titles
- **References**: Cross-references to RCW, other bills, etc.

## Schema Architecture

The schema is organized into several logical groups:

### 1. Bill Structure
- **bill_sections**: Individual sections within a bill (Sec. 101, Sec. 201, etc.)

### 2. Organizational Entities
- **agencies**: State agencies and departments
- **programs**: Programs and sub-programs within agencies

### 3. Funds and Accounts
- **funds**: Fund sources (General Fund, Motor Vehicle Account, etc.)
- **account_groups**: Groupings of funds (Near General Fund, Transportation Accounts)
- **fund_group_membership**: Many-to-many relationship between funds and groups

### 4. Appropriations
- **appropriations**: Main appropriation records
- **appropriation_amounts**: Breakdown of appropriations by fund source and fiscal year
- **fte_authorizations**: Position authorizations tied to appropriations

### 5. Conditions and Restrictions
- **provisos**: Proviso language with conditions, directives, and restrictions

### 6. Cross-References
- **cross_references**: Links to RCW, other sections, bills, etc.

### 7. Summary Tables
- **agency_totals**: Pre-calculated totals by agency and bill
- **fund_totals**: Pre-calculated totals by fund and bill

## Entity Relationships

### Core Hierarchy

```
budget_bills (metadata)
  └── bill_sections
       └── appropriations
            ├── appropriation_amounts (by fund)
            ├── fte_authorizations
            └── provisos
```

### Organizational Hierarchy

```
agencies
  └── programs
       └── programs (sub-programs)
```

### Fund Hierarchy

```
account_groups
  └── funds (via fund_group_membership)
```

## Key Tables in Detail

### bill_sections

Represents individual sections within a budget bill.

**Key Fields:**
- `section_number`: Sequential section number
- `section_code`: Text identifier (e.g., "SEC. 101")
- `part_number`, `part_title`: Organizational part (e.g., Part I - General Government)
- `raw_text`: Full text of the section

**Usage:** Each appropriation is tied to a specific section.

### agencies

Normalized table of all state agencies across all budget bills.

**Key Fields:**
- `code`: Short code (e.g., "DSHS", "DOT", "OSPI")
- `name`: Full official name
- `agency_type`: executive, legislative, judicial, independent
- `parent_agency_id`: For sub-agencies or divisions

**Why Normalized:** Agencies are consistent across biennia, so we normalize them to avoid duplication and enable cross-biennium analysis.

### programs

Programs within agencies. Can vary by biennium as agencies reorganize.

**Key Fields:**
- `agency_id`: Parent agency
- `code`: Program code if available
- `name`: Program name
- `program_index`: For ordering within agency
- `parent_program_id`: For sub-programs

**Hierarchy:** Programs can have sub-programs (parent_program_id), allowing for nested structures.

### funds

Normalized table of all fund sources.

**Key Fields:**
- `code`: Official fund code (e.g., "001-1" for General Fund—State)
- `name`: Full fund name
- `fund_type`: state, federal, local, private

**Common Funds:**
- General Fund—State (001-1)
- General Fund—Federal (001-2)
- General Fund—Local (001-3)
- Motor Vehicle Account (176-1)
- Various dedicated accounts

### appropriations

The core table for budget appropriations.

**Key Fields:**
- `bill_id`: Which budget bill
- `section_id`: Which section in the bill
- `agency_id`: Which agency receives the appropriation
- `program_id`: Which program (nullable for agency-level appropriations)
- `appropriation_type`: direct, reappropriation, transfer, reduction
- `fiscal_period`: e.g., "2023-25", "FY2023"
- `total_amount`: Total dollars appropriated

**Appropriation Types:**
- **direct**: New appropriation for the biennium
- **reappropriation**: Re-authorization of prior unexpended funds
- **transfer**: Movement of funds between accounts
- **reduction**: Reduction to previously authorized funds

### appropriation_amounts

Breakdown of each appropriation by fund source and fiscal year.

**Key Fields:**
- `appropriation_id`: Parent appropriation
- `fund_id`: Which fund the money comes from
- `amount`: Dollar amount
- `fiscal_year`: Specific year (2023, 2024, etc.) or NULL for biennial

**Example:**
An appropriation of $10M might be broken down as:
- $6M from General Fund—State, FY2024
- $4M from General Fund—State, FY2025

### fte_authorizations

Full-time equivalent position authorizations.

**Key Fields:**
- `appropriation_id`: Related appropriation
- `fiscal_year`: Which year
- `fte_count`: Number of FTEs (can be fractional, e.g., 123.5)
- `position_type`: FTE, temp, seasonal, etc.

**Purpose:** Tracks staffing levels authorized by the budget.

### provisos

Conditions, restrictions, and directives attached to appropriations.

**Key Fields:**
- `bill_id`: Which bill
- `section_id`: Which section (if section-level proviso)
- `appropriation_id`: Which appropriation (if specific to one)
- `proviso_type`: restriction, directive, reporting, transfer_authority
- `subject`: Brief description
- `text`: Full proviso text
- `amount`: Dollar amount if proviso specifies one

**Proviso Types:**
- **restriction**: Limits on how funds can be used
- **directive**: Instructions to agencies
- **reporting**: Required reports to legislature
- **transfer_authority**: Authority to move funds between programs

**Scope:** Provisos can apply at multiple levels:
- Bill-level (general provisions)
- Section-level (apply to entire section)
- Appropriation-level (specific to one appropriation)

### cross_references

Tracks references to RCW, other sections, bills, etc.

**Key Fields:**
- `source_type`: What type of record contains the reference
- `source_id`: ID of that record
- `reference_type`: rcw, section, bill, program, agency
- `reference_text`: The actual reference text
- `reference_id`: Internal ID if referencing another DB entity

**Examples:**
- Proviso references "RCW 43.88.030"
- Section references "section 205 of this act"
- Appropriation references "section 301, chapter 332, Laws of 2023"

## Views for Common Queries

### v_appropriation_details

Complete appropriation information with agency and program names.

**Use Case:** "Show me all appropriations for DSHS in the 2023-25 budget"

### v_appropriations_by_fund

Appropriations broken down by fund source.

**Use Case:** "How much General Fund money went to education programs?"

### v_agency_summary_by_biennium

Total spending by agency across biennia.

**Use Case:** "What's the trend in DOT funding over the last decade?"

### v_fund_summary_by_biennium

Total appropriations by fund source across biennia.

**Use Case:** "How has General Fund usage changed?"

### v_fte_summary

FTE counts by agency and year.

**Use Case:** "How many FTEs does DSHS have authorized?"

### v_proviso_details

Provisos with full context (agency, program, bill).

**Use Case:** "Find all provisos related to behavioral health"

## Summary Tables

### agency_totals & fund_totals

Pre-calculated totals for performance.

**Purpose:** Instead of summing appropriation_amounts every time, these tables cache the totals and are updated when appropriations change.

**Usage:** Dramatically speeds up queries for total spending by agency or fund.

## Full-Text Search

### provisos_fts

FTS5 (Full-Text Search) virtual table for searching proviso text.

**Use Case:** "Find all provisos mentioning 'climate change'"

**Implementation:** Uses SQLite's FTS5 for fast full-text search of proviso language.

## Example Data Model

Here's how a typical budget section maps to the schema:

### Budget Bill Text:
```
SEC. 101. OFFICE OF THE GOVERNOR

General Fund—State Appropriation (FY 2024) . . . . . $5,123,000
General Fund—State Appropriation (FY 2025) . . . . . $5,234,000
    TOTAL APPROPRIATION . . . . . . . . . . . . . . $10,357,000

The appropriations in this section are subject to the following
conditions and limitations:

(1) $500,000 of the general fund—state appropriation for fiscal
year 2024 is provided solely for a climate resilience study.

FTE Staff: 42.5 FY2024, 43.0 FY2025
```

### Database Records:

**bill_sections:**
```sql
{
  bill_id: 1,
  section_number: 101,
  section_code: "SEC. 101",
  part_number: 1,
  part_title: "GENERAL GOVERNMENT"
}
```

**agencies:**
```sql
{
  code: "GOV",
  name: "Office of the Governor",
  agency_type: "executive"
}
```

**appropriations:**
```sql
{
  bill_id: 1,
  section_id: 101,
  agency_id: 1,
  program_id: NULL,
  appropriation_type: "direct",
  fiscal_period: "2023-25",
  total_amount: 10357000
}
```

**appropriation_amounts:**
```sql
{
  appropriation_id: 1,
  fund_id: 1, -- General Fund—State
  amount: 5123000,
  fiscal_year: 2024
},
{
  appropriation_id: 1,
  fund_id: 1,
  amount: 5234000,
  fiscal_year: 2025
}
```

**fte_authorizations:**
```sql
{
  appropriation_id: 1,
  fiscal_year: 2024,
  fte_count: 42.5
},
{
  appropriation_id: 1,
  fiscal_year: 2025,
  fte_count: 43.0
}
```

**provisos:**
```sql
{
  bill_id: 1,
  section_id: 101,
  appropriation_id: 1,
  proviso_number: 1,
  proviso_type: "restriction",
  subject: "Climate resilience study",
  text: "$500,000 of the general fund—state appropriation...",
  amount: 500000
}
```

## Queries Enabled by This Schema

### 1. Total Appropriations by Agency

```sql
SELECT
    ag.name,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN appropriations ap ON aa.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
WHERE ap.bill_id = ?
GROUP BY ag.id
ORDER BY total DESC;
```

### 2. General Fund vs. Other Funds

```sql
SELECT
    CASE WHEN f.code LIKE '001-%' THEN 'General Fund' ELSE 'Other Funds' END as fund_category,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN funds f ON aa.fund_id = f.id
JOIN appropriations ap ON aa.appropriation_id = ap.id
WHERE ap.bill_id = ?
GROUP BY fund_category;
```

### 3. Year-over-Year Comparison

```sql
SELECT
    ag.name as agency,
    bb.biennium,
    SUM(ap.total_amount) as total
FROM appropriations ap
JOIN agencies ag ON ap.agency_id = ag.id
JOIN budget_bills bb ON ap.bill_id = bb.id
WHERE ap.appropriation_type = 'direct'
GROUP BY ag.id, bb.biennium
ORDER BY ag.name, bb.biennium;
```

### 4. Programs with Most Provisos

```sql
SELECT
    ag.name as agency,
    p.name as program,
    COUNT(pv.id) as proviso_count
FROM provisos pv
JOIN appropriations ap ON pv.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
LEFT JOIN programs p ON ap.program_id = p.id
WHERE pv.bill_id = ?
GROUP BY ag.id, p.id
ORDER BY proviso_count DESC
LIMIT 10;
```

### 5. FTE Trends

```sql
SELECT
    ag.name,
    fte.fiscal_year,
    SUM(fte.fte_count) as total_ftes
FROM fte_authorizations fte
JOIN appropriations ap ON fte.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
JOIN budget_bills bb ON ap.bill_id = bb.id
WHERE bb.biennium IN ('2019-21', '2021-23', '2023-25')
GROUP BY ag.id, fte.fiscal_year
ORDER BY ag.name, fte.fiscal_year;
```

### 6. Search Proviso Text

```sql
SELECT *
FROM v_proviso_details
WHERE proviso_id IN (
    SELECT proviso_id
    FROM provisos_fts
    WHERE provisos_fts MATCH 'climate AND resilience'
);
```

## Data Normalization Principles

### Normalized Entities (shared across bills):
- **agencies**: Same agencies across biennia
- **funds**: Same fund codes across biennia
- **account_groups**: Consistent groupings

### Bill-Specific Entities:
- **programs**: Can change between biennia as agencies reorganize
- **appropriations**: Specific to each bill
- **provisos**: Specific to each bill
- **bill_sections**: Specific to each bill

### Why This Approach:

1. **Agencies are stable** - The Department of Transportation is the same entity across all budgets
2. **Programs evolve** - Agencies reorganize programs, so we track them per-bill but link to the same agency
3. **Funds are consistent** - Fund codes like "001-1" are standardized
4. **Allows cross-biennium analysis** - Can compare the same agency across multiple budgets

## Performance Considerations

### Indexes

The schema includes indexes on:
- Foreign keys (for joins)
- Commonly filtered fields (agency_id, fund_id, fiscal_year)
- Search fields (proviso_type, appropriation_type)

### Summary Tables

`agency_totals` and `fund_totals` cache calculated sums to avoid expensive aggregations on every query.

### Full-Text Search

FTS5 virtual table for fast searching of proviso text without scanning entire table.

## Future Enhancements

1. **Budget Comparisons**: Track changes between governor's proposal, house, senate, and enacted versions
2. **Amendments**: Track how appropriations change through supplemental budgets
3. **Expenditure Tracking**: Link appropriations to actual expenditures (if data available)
4. **Legislative Intent**: Capture legislative intent from committee reports
5. **Performance Measures**: Link to performance metrics and outcomes
6. **Capital vs Operating**: Extend schema to handle capital budget projects
7. **Temporal Tracking**: Track how agency/program structures evolve over time

## Integration with Base Schema

This content schema extends the base metadata schema (`schema.sql`):

**Base Schema** (schema.sql):
- `budget_bills`: Bill metadata
- `bill_formats`: Available formats (XML, PDF, HTM)
- `companion_bills`: Bill relationships

**Content Schema** (content-schema.sql):
- Everything else (appropriations, agencies, programs, etc.)
- References `budget_bills.id` from base schema

Both schemas should be loaded into the same database to enable queries across metadata and content.

## Loading Order

1. Load base schema (`schema.sql`)
2. Load content schema (`content-schema.sql`)
3. Populate `budget_bills` (metadata)
4. Populate `agencies` and `funds` (normalized reference data)
5. Parse bill content and populate sections, appropriations, provisos, etc.

## Tools Needed for Population

To populate this schema, you'll need:

1. **Bill Parser**: Extract structured data from XML/HTM/PDF formats
2. **Agency Normalizer**: Map agency name variations to canonical codes
3. **Fund Matcher**: Match fund descriptions to standardized codes
4. **Amount Parser**: Extract dollar amounts and FTE counts
5. **Proviso Extractor**: Identify and extract proviso language
6. **Section Parser**: Parse bill section structure

These tools would be implemented in the future based on the bill formats available.
