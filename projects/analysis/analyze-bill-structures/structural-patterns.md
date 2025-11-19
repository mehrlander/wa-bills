# Washington State Bill Structural Patterns Analysis

**Generated:** November 19, 2025
**Dataset:** 10 bills (18 files: 9 XML, 9 HTM)
**Legislatures:** 67th, 68th, 69th
**Sessions:** 2021-2025

---

## Table of Contents

1. [Overview](#overview)
2. [Common XML Structure](#common-xml-structure)
3. [Bill Categories](#bill-categories)
4. [Section Types and Patterns](#section-types-and-patterns)
5. [Appropriations Structure](#appropriations-structure)
6. [Edge Cases](#edge-cases)
7. [Metadata Patterns](#metadata-patterns)
8. [Special Elements](#special-elements)

---

## Overview

All Washington State legislative bills follow a consistent XML schema defined by the namespace `http://leg.wa.gov/2012/document`. The bills can be categorized into three main types based on their primary purpose:

- **Budget Bills** (7): Primarily contain appropriations and fiscal matters
- **Policy Bills** (3): Amend or create statutory law (RCW sections)
- **Mixed Bills** (0): Contain substantial elements of both (none found in this dataset)

---

## Common XML Structure

### Root Element

```xml
<CertifiedBill type="sl" xmlns="http://leg.wa.gov/2012/document">
```

All bills use the `CertifiedBill` root element with:
- **type="sl"**: Session Law designation
- **xmlns**: Washington Legislature 2012 document namespace

### Primary Sections

Every bill contains two main sections:

#### 1. EnrollingCertificate

Contains administrative and procedural metadata:

```xml
<EnrollingCertificate type="hBill|sBill">
  <ChapterLaw year="YYYY">XXX</ChapterLaw>
  <SessionLawCaption>TITLE</SessionLawCaption>
  <VetoAction>(partial veto)</VetoAction> <!-- Optional -->
  <EffectiveDate>...</EffectiveDate>
  <Table>...</Table> <!-- Passage votes and certification -->
</EnrollingCertificate>
```

**Key Elements:**
- `ChapterLaw`: Year and chapter number
- `SessionLawCaption`: Brief title (ALL CAPS)
- `VetoAction`: Present only if governor vetoed sections
- `EffectiveDate`: When the law takes effect
- `Passage`: Vote counts and signers
- `Certificate`: Clerk/Secretary certification
- `Governor`: Approving governor's name
- `ApprovedDate`: Date and time of approval
- `FiledDate`: Date filed with Secretary of State

#### 2. Bill

Contains the legislative content:

```xml
<Bill type="bill">
  <BillHeading>...</BillHeading>
  <BillBody>
    <BillTitle>AN ACT Relating to...</BillTitle>
    <EnactedClause />
    <BillSection>...</BillSection>
    <!-- Multiple BillSections -->
  </BillBody>
</Bill>
```

---

## Bill Categories

### Budget Bills (70% of dataset)

**Characteristics:**
- Title contains "budget" or "appropriations"
- Heavy use of `<Appropriations>` elements
- Sections are primarily `type="new"` with `action="addsectuncod"`
- Contains `<CapitalProjectName>` (capital budgets) or agency appropriations (operating budgets)
- Hundreds to thousands of appropriation entries

**Examples:**
- **5167-S, 5187-S**: Operating budgets (~314 sections)
- **5195-S, 5200-S**: Capital budgets (2,000+ sections)
- **5693-S, 5950-S**: Supplemental operating budgets (~180 sections)

**Typical Structure:**
```xml
<BillSection type="new">
  <BillSectionHeader>
    <BillSectionNumber>Sec. 1001</BillSectionNumber>
    <Department>
      <Index>OFFICE OF THE SECRETARY OF STATE</Index>
      <DeptName>FOR THE OFFICE OF THE SECRETARY OF STATE</DeptName>
    </Department>
  </BillSectionHeader>
  <CapitalProjectName>Library-Archives Building (30000033)</CapitalProjectName>
  <Appropriations agency="085" project="30000047" appropType="appropriation">
    ...
  </Appropriations>
</BillSection>
```

### Policy Bills (30% of dataset)

**Characteristics:**
- Amend existing RCW sections or create new statutory law
- Heavy use of `type="amendatory"` with `action="amend"`
- Contains `<SectionCite>` referencing RCW titles, chapters, and sections
- Uses `<TextRun amendingStyle="strike">` and `<TextRun amendingStyle="add">` for tracking changes
- Typically smaller file sizes (1-1.5 MB)

**Examples:**
- **1210-S2**: Replace "marijuana" with "cannabis" (172 sections)
- **1281-S**: Technical corrections (251 sections)
- **1320-S2**: Civil protection orders reform (88 sections)

**Typical Structure:**
```xml
<BillSection type="amendatory" action="amend">
  <BillSectionHeader>
    <BillSectionNumber>Sec. 2</BillSectionNumber>
    <SectionCite>
      <TitleNumber>9</TitleNumber>
      <ChapterNumber>01</ChapterNumber>
      <SectionNumber>210</SectionNumber>
    </SectionCite>
    <Caption>Financial services to marijuana industry.</Caption>
  </BillSectionHeader>
  <P>
    (1) A person or entity that provides services for a
    <TextRun amendingStyle="strike">marijuana</TextRun>
    <TextRun amendingStyle="add">cannabis</TextRun>
    producer...
  </P>
</BillSection>
```

---

## Section Types and Patterns

### BillSection Type Attribute

| Type | Action | Usage | Example Bills |
|------|--------|-------|---------------|
| `new` | `null` or `addsectuncod` | Creates new sections (often uncodified for budget bills) | All budget bills |
| `amendatory` | `amend` | Amends existing RCW sections | 1210-S2, 1281-S, 1320-S2 |
| `amendatory` | `amenduncod` | Amends previous uncodified budget sections | 5195-S, 5200-S |
| `new` | (creates RCW section) | Creates new codified law | 1320-S2 |

### Section Numbering Patterns

**Policy Bills:**
- Sequential: Sec. 1, Sec. 2, Sec. 3, ...
- Sometimes includes fixed="true" for consistent numbering

**Budget Bills:**
- Grouped by part: Sec. 1001-1999, 2001-2999, 3001-3999, etc.
- Each part represents a category (e.g., Part 1: General Government, Part 2: Natural Resources)

---

## Appropriations Structure

### Basic Appropriation Element

```xml
<Appropriations agency="XXX" project="XXXXXXX" appropType="appropriation|reappropriation|biennia">
  <Appropriation>
    <AccountName>
      <BudgetP indent="1">State Building Construction Account</BudgetP>
      <BudgetP indent="2">Account—State</BudgetP>
    </AccountName>
    <Leader character="dot" />
    <DollarAmount>$8,000,000</DollarAmount>
  </Appropriation>
  <AppropriationTotal>
    TOTAL
    <Leader character="dot" />
    <DollarAmount>$43,300,000</DollarAmount>
  </AppropriationTotal>
</Appropriations>
```

### Appropriation Types

| appropType | Description | Usage |
|------------|-------------|-------|
| `appropriation` | New funding for current biennium | Primary funding |
| `reappropriation` | Reauthorization of unexpended prior funds | Continuing projects |
| `biennia` | Prior and future biennia totals | Informational only |

### Special Appropriation Elements

**Department/Agency Information:**
```xml
<Department>
  <Index>OFFICE OF THE SECRETARY OF STATE</Index>
  <DeptName>FOR THE OFFICE OF THE SECRETARY OF STATE</DeptName>
</Department>
```

**Capital Projects:**
```xml
<CapitalProjectName>Library-Archives Building (30000033)</CapitalProjectName>
```

**Budget Paragraphs with Indentation:**
```xml
<BudgetP indent="1">Account Name</BudgetP>
<BudgetP indent="2">Sub-Account—Type</BudgetP>
```

**Leader Characters (for alignment):**
```xml
<Leader character="dot" />    <!-- Creates dotted line -->
<Leader character="space" />  <!-- Creates spaces -->
```

---

## Edge Cases

### 1. Partial Vetoes

**Frequency:** 7 out of 10 bills (70%)

**Pattern:**
```xml
<VetoAction>(partial veto)</VetoAction>
<ApprovedDate>May 16, 2023 11:47 AM with the exception of sections 5012, 5067, and 8038, which are vetoed.</ApprovedDate>
```

**Examples:**
- **5200-S**: 3 sections vetoed
- **5187-S**: Extensive veto list (20+ items)
- **5092-S**: 7 specific subsections vetoed

**Implications for Parsing:**
- Vetoed sections may still appear in the bill text
- ApprovedDate text contains detailed veto information
- Some vetoes target subsections (e.g., "section 127(18)" rather than entire section)

### 2. Multiple Effective Dates

**Frequency:** 3 out of 10 bills (30%)

**Pattern:**
```xml
<EffectiveDate>
  <P textAlign="center">
    June 9, 2022—Except for sections 7, 51, and 116, which take effect July 1, 2022;
    sections 5, 9, 86, and 88, which take effect July 1, 2023;
    sections 65 and 68, which take effect July 1, 2024;
    and section 11, which takes effect July 1, 2030.
  </P>
</EffectiveDate>
```

**Examples:**
- **1210-S2**: 5 different effective dates spanning 8 years (2022-2030)
- **1281-S**: 3 staged dates
- **1320-S2**: 2 dates for different provisions

**Parsing Challenges:**
- Natural language description requires NLP or regex parsing
- Section ranges can be complex ("sections 65 and 68" vs "sections 7, 51, and 116")

### 3. Large Appropriation Lists

**Pattern:** Capital budgets contain thousands of individual appropriations

**Examples:**
- **5195-S**: 2,311 appropriation entries
- **5200-S**: 2,038 appropriation entries

**Structure:**
- Organized by agency/department
- Each project has multiple appropriation types (new, reappropriation, biennia)
- Biennia appropriations include Prior, Current, Future, and TOTAL

**File Size Impact:**
- Capital budgets: 2-2.5 MB
- Operating budgets: 4-4.6 MB
- Policy bills: 1-1.5 MB

### 4. Amendment Tracking Markup

**Pattern:** Strike/add markup for transparency

```xml
<P>
  A person providing services for a
  <TextRun amendingStyle="strike">marijuana</TextRun>
  <TextRun amendingStyle="add">cannabis</TextRun>
  producer does not commit a crime...
</P>
```

**Attributes:**
- `amendingStyle="strike"`: Text being removed
- `amendingStyle="add"`: Text being added

**Parsing Considerations:**
- Both old and new text present in document
- Final law only includes "add" text
- Strike text shows legislative intent

### 5. Complex Table Structures

**Pattern:** Used in enrolling certificates and appropriation lists

```xml
<Table align="center" pubwidth="wide" width="504.0pt" fontFamily="Courier New">
  <Col width="252.0pt" />
  <Col width="228.0pt" />
  <TR>
    <TDEnroll>...</TDEnroll>
    <TDEnroll>...</TDEnroll>
  </TR>
</Table>
```

**Special Cells:**
- `<TDEnroll>`: Enrollment-specific table data
- Often contains passage votes, certification, and approval information

### 6. Missing File Formats

**Pattern:** Some bills lack one format

**Examples:**
- **5092-S**: HTM only (no XML)
- **5200-S**: XML only (no HTM)

**Possible Reasons:**
- Older bills may not have both formats
- Conversion issues during archiving
- Format generation failures

### 7. Font and Styling Variations

**Common Patterns:**
```xml
<TextRun fontFamily="Times New Roman">—</TextRun>  <!-- Em dash -->
<TextRun fontWeight="bold">TOTAL</TextRun>
<TextRun fontStyle="italic">Effective until...</TextRun>
```

**Usage:**
- `Times New Roman`: Em dashes in dates and titles
- `Courier New`: Tables and structured data
- Bold: Emphasis on bill IDs, totals
- Italic: Effective date qualifiers

### 8. Indentation and Formatting

**Hanging Indents:**
```xml
<P indentStyle="hanging" indent="1">
  Controlled Substance Homicide (RCW 69.50.415)
</P>
```

**Budget Indents:**
```xml
<BudgetP indent="1">Primary Account</BudgetP>
<BudgetP indent="2">Sub-Account—State</BudgetP>
```

**Usage:**
- Hanging: Lists within bill sections
- Budget: Account hierarchy visualization

---

## Metadata Patterns

### Legislature and Session Numbering

**Pattern:** Legislature number increments every 2 years, session year indicates regular/special

**Observed:**
- 67th Legislature: 2021-2022
- 68th Legislature: 2023-2024
- 69th Legislature: 2025-2026

**Session Types:**
- "2021 Regular Session"
- "2023 Regular Session"
- (No special sessions observed in dataset)

### Bill ID Patterns

**Format:** `[Substitution][Origin][Number].[Type]`

**Components:**
- **Substitution**:
  - (none) = Original bill
  - `S` = Substitute
  - `2S` = Second Substitute
  - `E` = Engrossed
  - `E2S` = Engrossed Second Substitute
- **Origin**:
  - `HB` = House Bill
  - `SB` = Senate Bill
- **Number**: Numeric ID (e.g., 1210, 5167)
- **Type**: `.SL` = Session Law

**Examples:**
- `2SHB 1210.SL`: Second Substitute House Bill 1210, Session Law
- `ESSB 5200.SL`: Engrossed Substitute Senate Bill 5200, Session Law

### Sponsors

**Pattern:**
- Committee bills: `Senate Ways & Means (originally sponsored by Senators...)`
- Request bills: `by request of Office of Financial Management`

**Observed:**
- Budget bills always from Ways & Means committees
- Policy bills vary (Commerce & Gaming, Appropriations, Civil Rights & Judiciary)

### Vote Patterns

**Bipartisan Support Indicators:**
- Unanimous or near-unanimous: Capital budgets (5195-S: 47-0, 98-0)
- Partisan split: Operating budgets (5167-S: 28-19, 52-45)
- Mixed: Supplemental budgets and policy bills

**Chamber Order:**
- House bills: House votes first, Senate second
- Senate bills: Senate votes first, House second
- Exception: Conference committees (both chambers vote same day)

### Governor Patterns

**Observed Governors:**
- **JAY INSLEE**: 7 bills (2021-2024)
- **BOB FERGUSON**: 3 bills (2025)

**Veto Behavior:**
- Inslee: Partial vetoes on 5/7 bills (71%)
- Ferguson: Partial vetoes on 2/3 bills (67%)
- **Pattern:** Executive line-item veto common on budget bills

---

## Special Elements

### 1. Part Dividers

**Budget bills use part divisions:**

```xml
<Part pagebreak="yes" endofpart="yes">
  <P>PART 1</P>
  <P>GENERAL GOVERNMENT</P>
  ...
</Part>
```

**Common Parts:**
- Part 1: General Government
- Part 2: Natural Resources
- Part 3: Higher Education
- Part 5: Transportation (capital budgets)
- Part 7: Community & Economic Development

### 2. Caption Elements

**Two types of captions:**

**Session Law Caption (ALL CAPS):**
```xml
<SessionLawCaption>CAPITAL BUDGET</SessionLawCaption>
```

**Section Caption (Title Case):**
```xml
<Caption>Financial, accounting services to marijuana industry.</Caption>
```

### 3. History Tags

**Amendatory sections include history:**

```xml
<History>2018 c 68 § 1.</History>
```

**Format:** `YYYY c XX § Y`
- YYYY: Year
- XX: Chapter number
- Y: Section number

### 4. Expiration Dates

**Some sections include expiration:**

```xml
<ExpirationDate>June 30, 2025</ExpirationDate>
```

**Usage:** Temporary provisions, pilot programs, sunset clauses

---

## Parsing Recommendations

### For XML Parsers

1. **Namespace Handling**: Always specify namespace when selecting nodes
2. **Text Extraction**: Use TextRun aggregation for amended text
3. **Dollar Amount Parsing**: Strip `$` and `,` before parsing to number
4. **Date Parsing**: Effective dates may require NLP; approved dates are more structured
5. **Veto Detection**: Check both `<VetoAction>` tag and `<ApprovedDate>` text

### For HTM Parsers

1. **CSS Selector Equivalents**: Map XML tags to HTML class names
2. **Strike/Add Markup**: Look for `text-decoration: line-through` and `text-decoration: underline`
3. **Table Handling**: Standard HTML tables, but check for custom classes
4. **Performance**: HTM files are often 10% larger than XML equivalents

### For Categorization

**Budget Bill Indicators:**
- Keywords: "budget", "appropriation" in title/caption
- Presence of `<Appropriations>` elements
- Sponsor: Ways & Means committee
- Section count > 100
- File size > 2 MB

**Policy Bill Indicators:**
- Many `amendatory` sections
- `<SectionCite>` elements present
- `amendingStyle` TextRuns
- Section count < 300
- File size < 1.5 MB

### For Robust Extraction

**Handle Edge Cases:**
- Missing HTM/XML counterparts
- Partial vetoes affecting specific subsections
- Multiple effective dates with complex section ranges
- Very large appropriation lists (consider streaming/chunking)
- Special characters in text (em dashes, non-breaking spaces)

---

## Conclusion

Washington State bills follow a highly consistent XML schema with predictable patterns. The primary variation is between budget bills (appropriations-focused) and policy bills (RCW amendments). Understanding these structural patterns enables robust automated extraction and categorization.

**Key Takeaways:**

1. **Consistency**: All bills follow the same namespace and root structure
2. **Categorization**: Bill type is reliably determined by title keywords and appropriation presence
3. **Metadata Richness**: Enrolling certificates contain comprehensive procedural history
4. **Veto Frequency**: Partial vetoes are common (70%) and require careful parsing
5. **Edge Cases**: Multiple effective dates and very large appropriation lists need special handling
6. **Format Parity**: XML and HTM versions contain the same data with minor formatting differences

This analysis is based on 10 bills from 2021-2025 and provides a comprehensive foundation for building extraction tools for Washington State legislative documents.
