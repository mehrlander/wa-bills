# Content Schema Entity Relationship Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUDGET BILL METADATA                        │
│                         (from schema.sql)                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ bill_id
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BILL STRUCTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│  bill_sections                                                      │
│  - id                                                               │
│  - bill_id (FK → budget_bills)                                      │
│  - section_number                                                   │
│  - part_number, part_title                                          │
│  - section_code                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ section_id
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         APPROPRIATIONS                              │
├─────────────────────────────────────────────────────────────────────┤
│  appropriations                                                     │
│  - id                                                               │
│  - bill_id (FK → budget_bills)                                      │
│  - section_id (FK → bill_sections)                                  │
│  - agency_id (FK → agencies)                                        │
│  - program_id (FK → programs)                                       │
│  - appropriation_type                                               │
│  - fiscal_period                                                    │
│  - total_amount                                                     │
└─────────────────────────────────────────────────────────────────────┘
         │                              │                        │
         │                              │                        │
         │ approp_id                    │ approp_id              │ approp_id
         ▼                              ▼                        ▼
┌──────────────────┐    ┌───────────────────────┐    ┌─────────────────┐
│appropriation_    │    │fte_authorizations     │    │provisos         │
│amounts           │    │- id                   │    │- id             │
│- id              │    │- appropriation_id     │    │- bill_id        │
│- appropriation_id│    │- fiscal_year          │    │- section_id     │
│- fund_id (FK)    │    │- fte_count            │    │- appropriation_id│
│- amount          │    │- position_type        │    │- proviso_type   │
│- fiscal_year     │    └───────────────────────┘    │- subject        │
└──────────────────┘                                 │- text           │
         │                                           │- amount         │
         │ fund_id                                   └─────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FUND SOURCES                                │
├─────────────────────────────────────────────────────────────────────┤
│  funds                                                              │
│  - id                                                               │
│  - code (e.g., "001-1")                                             │
│  - name (e.g., "General Fund—State")                                │
│  - fund_type (state/federal/local/private)                          │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ Many-to-Many via fund_group_membership
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ACCOUNT GROUPS                                 │
├─────────────────────────────────────────────────────────────────────┤
│  account_groups                                                     │
│  - id                                                               │
│  - name (e.g., "Near General Fund")                                 │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    ORGANIZATIONAL STRUCTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│  agencies                                                           │
│  - id                                                               │
│  - code (e.g., "DSHS")                                              │
│  - name                                                             │
│  - agency_type                                                      │
│  - parent_agency_id (FK → agencies, self-reference)                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ agency_id
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  programs                                                           │
│  - id                                                               │
│  - agency_id (FK → agencies)                                        │
│  - code                                                             │
│  - name                                                             │
│  - parent_program_id (FK → programs, self-reference)                │
└─────────────────────────────────────────────────────────────────────┘
```

## Table Relationships

### Core Relationships

```
budget_bills (1) ─────< (many) bill_sections
                  │
                  └─────< (many) appropriations
                  │
                  └─────< (many) provisos

agencies (1) ──────< (many) programs
         │
         └──────< (many) appropriations

bill_sections (1) ─────< (many) appropriations

appropriations (1) ────< (many) appropriation_amounts
               │
               ├────< (many) fte_authorizations
               │
               └────< (many) provisos

funds (1) ──────< (many) appropriation_amounts
      │
      └──── (many-to-many via fund_group_membership) ─── (many) account_groups
```

## Data Flow

### How a Budget Bill Maps to the Schema

```
1. Budget Bill Created
   ↓
2. Bill Metadata → budget_bills table

3. Parse Bill Structure
   ↓
4. Sections → bill_sections table

5. Parse Appropriations
   ↓
6. For each appropriation:
   a. Identify/Create Agency → agencies table
   b. Identify/Create Program → programs table
   c. Create Appropriation → appropriations table
   d. Parse Fund Breakdown → appropriation_amounts table
   e. Parse FTE Counts → fte_authorizations table
   f. Parse Provisos → provisos table

7. Create Cross-References
   ↓
8. Cross-references → cross_references table

9. Calculate Summaries
   ↓
10. Update Summary Tables → agency_totals, fund_totals
```

## Cardinality

### One-to-Many Relationships

- **budget_bills** → **bill_sections** (1:N)
  - One bill has many sections

- **budget_bills** → **appropriations** (1:N)
  - One bill has many appropriations

- **bill_sections** → **appropriations** (1:N)
  - One section has many appropriations

- **agencies** → **programs** (1:N)
  - One agency has many programs

- **agencies** → **appropriations** (1:N)
  - One agency receives many appropriations

- **programs** → **appropriations** (1:N)
  - One program receives many appropriations

- **appropriations** → **appropriation_amounts** (1:N)
  - One appropriation can be split across multiple funds/years

- **appropriations** → **fte_authorizations** (1:N)
  - One appropriation can have FTEs for multiple years

- **appropriations** → **provisos** (1:N)
  - One appropriation can have multiple provisos

- **funds** → **appropriation_amounts** (1:N)
  - One fund is used in many appropriations

### Many-to-Many Relationships

- **funds** ←→ **account_groups** (M:N via fund_group_membership)
  - Funds can belong to multiple groups
  - Groups contain multiple funds

### Self-Referencing Relationships

- **agencies** → **agencies** (parent_agency_id)
  - Agencies can have sub-agencies

- **programs** → **programs** (parent_program_id)
  - Programs can have sub-programs

## Lookup vs. Transactional Tables

### Lookup Tables (Relatively Static)
These are normalized reference data shared across multiple bills:

```
┌──────────────────┐
│ agencies         │ ← Normalized across all bills
├──────────────────┤
│ funds            │ ← Fund codes are standardized
├──────────────────┤
│ account_groups   │ ← Groupings are consistent
└──────────────────┘
```

### Transactional Tables (Bill-Specific)
These contain the actual budget data for each bill:

```
┌──────────────────────┐
│ bill_sections        │ ← Specific to each bill
├──────────────────────┤
│ appropriations       │ ← New for each bill
├──────────────────────┤
│ appropriation_amounts│ ← Detailed breakdown
├──────────────────────┤
│ fte_authorizations   │ ← FTE counts per bill
├──────────────────────┤
│ provisos             │ ← Conditions per bill
└──────────────────────┘
```

### Semi-Transactional Tables
These can change between bills but reference normalized entities:

```
┌──────────────────┐
│ programs         │ ← Tied to normalized agencies
└──────────────────┘   but structure can change per biennium
```

## Key Design Decisions

### 1. Normalized Agencies and Funds

**Decision**: Agencies and funds are stored in separate normalized tables.

**Rationale**:
- Same agencies appear across multiple bills
- Enables cross-biennium comparisons
- Standardizes naming (e.g., "DSHS" vs "Department of Social and Health Services")

### 2. Programs Tied to Agencies but Not Normalized

**Decision**: Programs reference agencies but are not fully normalized.

**Rationale**:
- Program structures change as agencies reorganize
- Need to preserve historical program structure per biennium
- Still linked to normalized agency for cross-biennium agency-level analysis

### 3. Separate Appropriation Amounts Table

**Decision**: Split appropriation amounts by fund/year into separate table.

**Rationale**:
- An appropriation can be funded from multiple sources
- Enables detailed fund-level analysis
- Allows tracking of year-specific amounts within biennium

### 4. Summary Tables

**Decision**: Include pre-calculated summary tables (agency_totals, fund_totals).

**Rationale**:
- Performance optimization for common queries
- Aggregating millions of rows on each query is expensive
- Updated via triggers or periodic batch processes

## Query Patterns

### Pattern 1: Agency Spending Over Time

```sql
SELECT
    bb.biennium,
    ag.name,
    SUM(aa.amount) as total
FROM appropriations ap
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN agencies ag ON ap.agency_id = ag.id
JOIN appropriation_amounts aa ON aa.appropriation_id = ap.id
WHERE ag.code = 'DSHS'
GROUP BY bb.biennium, ag.id
ORDER BY bb.biennium;
```

**Tables Used**: budget_bills → appropriations → agencies → appropriation_amounts

### Pattern 2: Fund Source Analysis

```sql
SELECT
    f.name as fund,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN funds f ON aa.fund_id = f.id
JOIN appropriations ap ON aa.appropriation_id = ap.id
WHERE ap.bill_id = ?
GROUP BY f.id
ORDER BY total DESC;
```

**Tables Used**: appropriation_amounts → funds → appropriations

### Pattern 3: Proviso Search

```sql
SELECT
    ag.name as agency,
    p.subject,
    p.text
FROM provisos p
JOIN appropriations ap ON p.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
WHERE p.text LIKE '%behavioral health%'
  AND p.bill_id = ?;
```

**Tables Used**: provisos → appropriations → agencies

## Indexes Strategy

### Primary Access Patterns

1. **By Bill**: Most queries filter by bill_id
   - Index on all tables with bill_id

2. **By Agency**: Common to analyze by agency
   - Index on agency_id in appropriations

3. **By Fund**: Financial analysis by fund source
   - Index on fund_id in appropriation_amounts

4. **By Time**: Trend analysis by fiscal year
   - Index on fiscal_year in appropriation_amounts and fte_authorizations

### Composite Indexes

```sql
-- For agency spending by bill
CREATE INDEX idx_appropriations_bill_agency
ON appropriations(bill_id, agency_id);

-- For fund analysis by bill
CREATE INDEX idx_approp_amounts_bill_fund
ON appropriation_amounts(appropriation_id, fund_id);
```

## Future Enhancements

### Version Tracking

Add columns to track bill versions:
- Governor's proposed budget
- House version
- Senate version
- Conference/enacted version

```sql
ALTER TABLE appropriations ADD COLUMN version TEXT;
-- Values: 'governor', 'house', 'senate', 'enacted'
```

### Change Tracking

Track changes between versions:

```sql
CREATE TABLE appropriation_changes (
    id INTEGER PRIMARY KEY,
    appropriation_id INTEGER,
    from_version TEXT,
    to_version TEXT,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    change_date TIMESTAMP
);
```

### Expenditure Tracking

Link appropriations to actual expenditures:

```sql
CREATE TABLE expenditures (
    id INTEGER PRIMARY KEY,
    appropriation_id INTEGER,
    fiscal_year INTEGER,
    amount DECIMAL(15,2),
    expenditure_date DATE,
    FOREIGN KEY (appropriation_id) REFERENCES appropriations(id)
);
```

This would enable variance analysis (budgeted vs. actual spending).
