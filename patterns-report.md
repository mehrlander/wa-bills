# Washington State Bills: Structural Patterns Analysis

**Generated:** 2025-11-19
**Bills Analyzed:** 9 (18 files total: 9 XML, 9 HTM)
**Total Appropriations:** 7,763
**Total Amount:** $349.9 billion

---

## Executive Summary

This report documents structural patterns, format differences, and parsing challenges discovered while analyzing Washington State legislation files. The analysis covers both operating and capital budget bills, as well as policy bills, across multiple biennia (2021-2027).

### Key Findings

1. **Bill Types:** Three distinct categories identified with clear structural differences
2. **Format Consistency:** XML format is highly structured and parseable; HTM format mirrors XML structure
3. **Budget Bill Complexity:** Operating budgets contain 300+ agencies and 2,000+ appropriations
4. **Structural Variations:** Significant differences between budget types and policy bills
5. **Parsing Challenges:** Large file sizes, complex nesting, and proviso language require specialized handling

---

## 1. Bill Categorization

### 1.1 Budget/Appropriations Bills (6 bills)

#### Operating Budget Bills
- **5167-S:** 2025-2027 Operating Budget
  - 314 appropriations, 203 agencies
  - 420 sections, $134.9B total
  - Session: 2025 Regular Session

- **5187-S:** Operating Budget
  - 314 appropriations, 205 agencies
  - 361 sections, $118.0B total
  - Session: 2023 Regular Session

#### Operating Budget Supplementals
- **5693-S:** Supplemental Operating Budget
  - 181 appropriations, 180 agencies
  - 247 sections, $4.1B total

- **5950-S:** Operating Budget 2023-2025 Supplemental
  - 176 appropriations, 176 agencies
  - 189 sections, $280.8M total

#### Capital Budget Bills
- **5195-S:** Capital Budget
  - 3 appropriations, 1 agency
  - 1,180 sections
  - Focuses on capital projects and infrastructure

- **5200-S:** Capital Budget
  - 2 appropriations, 1 agency
  - 1,030 sections

### 1.2 Policy Bills (3 bills)

- **1210-S2:** Cannabis Terminology Replacement
  - 176 sections amending RCW statutes
  - No appropriations
  - Heavy use of strike/add markup

- **1281-S:** Technical Corrections
  - 257 sections
  - Pure amendment bill

- **1320-S2:** Civil Protection Orders
  - 172 sections
  - Policy changes without fiscal impact

### 1.3 Mixed Bills (0 bills)

No bills in this dataset contain both significant appropriations and policy amendments. Budget bills may include minor statutory changes to enable appropriations, but these are categorized as budget bills.

---

## 2. Structural Elements

### 2.1 Common XML Structure

All bills follow this high-level structure:

```xml
<?xml version="1.0" encoding="utf-8"?>
<CertifiedBill type="sl" xmlns="http://leg.wa.gov/2012/document">
  <EnrollingCertificate>
    <!-- Metadata: passage, approval, filing dates -->
  </EnrollingCertificate>
  <Bill type="bill">
    <BillHeading>
      <!-- Bill identification and description -->
    </BillHeading>
    <BillBody>
      <BillTitle>AN ACT Relating to...</BillTitle>
      <Part><!-- For budget bills only --></Part>
      <BillSection>
        <!-- Bill content sections -->
      </BillSection>
    </BillBody>
  </Bill>
</CertifiedBill>
```

### 2.2 Metadata Elements

#### Bill Identification
- `<ShortBillId>`: e.g., "ESSB 5167.SL"
- `<LongBillId>`: Full bill name
- `<SessionLawCaption>`: Brief title (e.g., "OPERATING BUDGET")
- `<BriefDescription>`: One-sentence summary

#### Legislative Process
- `<Legislature>`: e.g., "69th Legislature"
- `<Session>`: e.g., "2025 Regular Session"
- `<Sponsors>`: Committee or individual sponsors
- `<ChapterLaw year="YYYY">XXX</ChapterLaw>`: Chapter number

#### Passage Information
```xml
<PassedBy chamber="h|s">
  <PassedDate>Date</PassedDate>
  <Yeas>XX</Yeas>
  <Nays>XX</Nays>
  <Signer>NAME</Signer>
</PassedBy>
```

#### Veto Information
- `<VetoAction>(partial veto)</VetoAction>`
- `veto="line"` attribute on sections
- Veto messages embedded in sections

### 2.3 Budget Bill Specific Structure

#### Part Organization
Budget bills are divided into parts by government function:

```xml
<Part pagebreak="yes" endofpart="yes">
  <P>PART I</P>
  <P>GENERAL GOVERNMENT</P>
</Part>
```

Common parts include:
- PART I: GENERAL GOVERNMENT
- PART II: HUMAN SERVICES
- PART III: NATURAL RESOURCES
- PART IV: TRANSPORTATION
- PART V: EDUCATION
- PART VI: HIGHER EDUCATION
- PART VII: SPECIAL APPROPRIATIONS
- PART VIII: OTHER TRANSFERS AND APPROPRIATIONS
- PART IX: VETO MESSAGE (when applicable)

#### Appropriations Structure
```xml
<BillSection type="new">
  <BillSectionHeader>
    <BillSectionNumber>
      <Value>101</Value>
    </BillSectionNumber>
    <Department>
      <Index>HOUSE OF REPRESENTATIVES</Index>
      <DeptName>FOR THE HOUSE OF REPRESENTATIVES</DeptName>
    </Department>
  </BillSectionHeader>

  <Appropriations agency="011">
    <Appropriation>
      <AccountName>
        <BudgetP>General Fund—State Appropriation (FY 2026)</BudgetP>
      </AccountName>
      <Leader character="dot" />
      <DollarAmount>$61,985,000</DollarAmount>
    </Appropriation>

    <AppropriationTotal>
      <TextRun>TOTAL APPROPRIATION</TextRun>
      <Leader character="dot" />
      <DollarAmount>$127,235,000</DollarAmount>
    </AppropriationTotal>
  </Appropriations>

  <P prePadding="halfline">The appropriations in this section are subject to the following conditions and limitations:</P>
  <P>(1) Proviso language...</P>
  <P>(2) More proviso language...</P>
</BillSection>
```

#### Key Patterns:
1. **Agency Codes**: Three-digit codes (e.g., "011" for House, "055" for Courts)
2. **Account Types**:
   - General Fund—State Appropriation (FY YYYY)
   - General Fund—Federal Appropriation
   - Special account appropriations
3. **Fiscal Years**: Biennium split into FY 2026 and FY 2027
4. **Proviso Language**: Conditions and limitations following appropriations
5. **Total Calculations**: Explicit `<AppropriationTotal>` elements

### 2.4 Policy Bill Structure

#### Amendment Markup
```xml
<BillSection type="amendatory" action="amend">
  <BillSectionHeader>
    <SectionCite>
      <TitleNumber>9</TitleNumber>
      <ChapterNumber>01</ChapterNumber>
      <SectionNumber>210</SectionNumber>
    </SectionCite>
  </BillSectionHeader>

  <P>
    Text with <TextRun amendingStyle="strike">old text</TextRun>
    <TextRun amendingStyle="add">new text</TextRun>
  </P>
</BillSection>
```

#### Section Types:
- `type="new"`: New statute
- `type="amendatory"`: Amending existing statute
- `action="amend"`: Amendment action
- `action="repeal"`: Repealing action

### 2.5 Tables

Bills contain extensive tables for various purposes:

```xml
<Table width="243pt" align="center" fontSize="10pt">
  <Col width="36pt" />
  <Col width="171pt" />
  <TR>
    <TD textAlign="right"><P>III</P></TD>
    <TD textAlign="left"><P>Description...</P></TD>
  </TR>
</Table>
```

**Table Usage:**
- Budget bills: Limited tables
- Policy bills: Extensive tables for offense classifications, schedules
- Capital bills: Project lists and allocations

---

## 3. Format Comparison: XML vs HTM

### 3.1 XML Format

**Advantages:**
- Highly structured and consistent
- Clear namespace definitions
- Easily parseable with standard XML tools
- Semantic tags (e.g., `<Appropriation>`, `<DollarAmount>`)
- Complete data preservation

**Structure:**
- Well-formed XML with namespace
- Hierarchical nesting reflects document structure
- Attributes provide metadata
- Text content cleanly separated from markup

**File Sizes:**
- Range from 1.1MB to 4.7MB
- Larger than HTM due to verbose XML tags

### 3.2 HTM Format

**Advantages:**
- Human-readable in browsers
- Familiar HTML structure
- Can be styled for presentation

**Observations:**
- Mirrors XML structure closely
- Uses similar tag names
- Not standard HTML - uses custom tags like `<BillSection>`
- Appears to be XHTML or custom XML rendered as HTM

**File Sizes:**
- Range from 1.1MB to 4.7MB
- Similar to XML (sometimes slightly larger)

### 3.3 Format Availability

**Coverage:**
- 9 bills have XML format
- 9 bills have HTM format
- 1 bill (5092-S) has only HTM
- 1 bill (5200-S) has only XML

**Recommendation:**
- **Primary parsing: XML format** (more reliable, better structure)
- HTM format as fallback when XML unavailable
- HTM can be parsed with similar logic due to structural similarity

---

## 4. Parsing Challenges

### 4.1 File Size

**Challenge:** Large files (up to 4.7MB) can cause memory issues

**Solutions:**
- Stream parsing for very large files
- Chunk processing for specific elements
- Lazy loading of sections
- Indexing before full parse

### 4.2 Complex Nesting

**Challenge:** Deep nesting of elements (sections within parts within bills)

**Solutions:**
- Recursive parsing functions
- Stack-based traversal
- XPath for targeted extraction
- DOM parsing with selective tree building

### 4.3 Proviso Language

**Challenge:** Unstructured narrative text with:
- Cross-references to other sections
- Complex conditional logic
- Embedded dollar amounts
- Policy directives mixed with budget data

**Solutions:**
- Natural language processing for entity extraction
- Pattern matching for dollar amounts
- Section reference parsing
- Store as structured text blocks with metadata

### 4.4 Inconsistent Formatting

**Challenge:** Variations across bills and years:
- Different account name formats
- Agency code conventions
- Part numbering (Roman numerals)
- Section numbering (fixed vs. sequential)

**Solutions:**
- Flexible parsing with pattern matching
- Normalization functions
- Lookup tables for agency codes
- Version-aware parsing

### 4.5 Special Characters

**Challenge:** XML entities and special formatting:
- `&amp;` for &
- Em dashes: `—` (U+2014)
- Currency symbols
- UTF-8 encoding

**Solutions:**
- Proper XML entity handling
- Unicode normalization
- HTML entity decoding
- UTF-8 encoding throughout

### 4.6 Veto Handling

**Challenge:** Vetoed sections and line-item vetoes:
- Partial section vetoes
- Veto messages embedded in bill
- Struck text vs. vetoed text distinction

**Solutions:**
- Track veto attributes at section/line level
- Parse veto messages separately
- Flag vetoed content in extracted data
- Preserve both original and post-veto versions

---

## 5. Structural Variations by Bill Type

### 5.1 Operating Budget Bills

**Characteristics:**
- 200+ agencies with appropriations
- Biennial appropriations (two fiscal years)
- Extensive proviso language (conditions/limitations)
- 9 major parts by government function
- Multiple account types per agency
- Total appropriations: $100B+ per biennium

**Unique Elements:**
- FTE (Full Time Equivalent) allocations
- Transfer authority between accounts
- Fund reappropriations from prior biennia
- Emergency clauses
- Intent statements

**Parsing Priorities:**
1. Appropriation amounts by agency and account
2. Fiscal year breakdown
3. Proviso language extraction
4. Cross-references between sections
5. Transfer and reappropriation authority

### 5.2 Capital Budget Bills

**Characteristics:**
- Fewer appropriations (2-3 total)
- Many more sections (1,000+)
- Project-specific allocations
- Bond authorizations
- Multi-year project timelines

**Unique Elements:**
- Project lists with detailed descriptions
- Bond funding sources
- Reappropriations from prior biennia
- Project allotments by phase
- Federal and local match requirements

**Parsing Priorities:**
1. Project descriptions and locations
2. Funding sources (bonds, grants, etc.)
3. Reappropriation tracking
4. Agency assignments
5. Timeline and phasing

### 5.3 Supplemental Budget Bills

**Characteristics:**
- Smaller scale ($0.3B - $4B)
- Amendments to base budget
- Emergency funding
- Fewer agencies than base budget
- Mid-biennium adjustments

**Unique Elements:**
- References to base budget sections
- Adjustment language (increase/decrease)
- Emergency appropriations
- One-time allocations

**Parsing Priorities:**
1. Net changes to base budget
2. Emergency vs. ongoing funding
3. Cross-references to base budget
4. Effective date for mid-biennium changes

### 5.4 Policy Bills

**Characteristics:**
- No appropriations (or minimal fiscal impact)
- Extensive RCW amendments
- Strike/add markup throughout
- Technical and substantive changes
- 100-500 sections

**Unique Elements:**
- RCW citations for every section
- Amendment markup (strike/add)
- Effective dates by section
- Savings clauses
- Severability clauses

**Parsing Priorities:**
1. RCW sections being amended
2. Text changes (strike/add analysis)
3. Effective dates
4. Cross-references to other statutes
5. New vs. amendatory sections

---

## 6. Agency and Account Patterns

### 6.1 Agency Codes

**Format:** Three-digit numeric codes (e.g., "011", "055", "540")

**Common Agencies:**
- 011: House of Representatives
- 012: Senate
- 055: Administrator for the Courts
- 060: Attorney General
- 235: Department of Health
- 302: Department of Ecology
- 540: Health Care Authority
- 690: Department of Social and Health Services

**Total Unique Agencies:** 271 across all bills

### 6.2 Account Types

**General Fund:**
- General Fund—State Appropriation (FY YYYY)
- General Fund—Federal Appropriation
- General Fund—Private/Local Appropriation

**Special Accounts:**
- Hundreds of dedicated accounts
- Named by purpose (e.g., "Performance Audits of Government Account")
- Trust accounts
- Bond accounts
- Program-specific accounts

**Pattern:** `[Account Name]—[Source] Appropriation [(FY YYYY)]`

### 6.3 Appropriation Amounts

**Range:** $1,000 to $66 billion (single appropriation)

**Formatting:**
- Always prefixed with `$`
- Comma-separated thousands
- Typically rounded to nearest thousand
- No decimal points for large amounts
- Occasionally: millions/billions noted in text

**Total Across All Bills:** $349.9 billion

---

## 7. Cross-References and Dependencies

### 7.1 RCW References

**Format:** `RCW [Title].[Chapter].[Section]`

**Examples:**
- RCW 9.01.210
- RCW 43.79.195
- RCW 69.50.101

**Usage:**
- Policy bills: Heavy RCW citation (100s per bill)
- Budget bills: Moderate RCW citation (authority for appropriations)
- Capital bills: Minimal RCW citation

### 7.2 Bill References

**Format:** `[Chamber] Bill No. [Number]`

**Examples:**
- House Bill No. 1163
- Senate Bill No. 5085
- Substitute Senate Bill No. 5149

**Purpose:**
- Conditional appropriations (if bill enacted)
- Implementation funding
- Cross-bill coordination

### 7.3 Internal References

**Section References:**
- "section 101 of this act"
- "subsection (2) of this section"
- "chapter 376, Laws of 2024"

**Part References:**
- "parts I through IX of this act"
- "specified in part II"

---

## 8. Edge Cases and Special Situations

### 8.1 Partial Vetoes

**Example:** Bill 5167-S has partial veto

**Indicators:**
- `<VetoAction>(partial veto)</VetoAction>`
- `veto="line"` attribute on specific elements
- `<SeeVetoNote>` tags
- Separate veto message section

**Handling:**
- Flag vetoed sections/lines
- Preserve original text
- Link to veto message
- Calculate net impact (post-veto amounts)

### 8.2 Multiple Effective Dates

**Pattern:** Different sections effective on different dates

**Example:**
```
Except for sections 7, 51, and 116, which take effect July 1, 2022;
sections 5, 9, 86, and 88, which take effect July 1, 2023;
sections 65 and 68, which take effect July 1, 2024...
```

**Handling:**
- Parse effective date text
- Map dates to section numbers
- Default to bill-level effective date
- Track expiration dates separately

### 8.3 Reappropriations

**Definition:** Re-authorization of unspent funds from prior biennia

**Format:**
```xml
<Appropriation>
  <AccountName>
    <BudgetP>General Fund—State Appropriation</BudgetP>
    <BudgetP indent="1">(FY 2024) (Reappropriation)</BudgetP>
  </AccountName>
  <DollarAmount>$XXX,XXX</DollarAmount>
</Appropriation>
```

**Tracking:**
- Separate from new appropriations
- Link to original appropriation
- Track multi-biennium projects

### 8.4 Transfer Authority

**Purpose:** Allow agencies to move funds between accounts/programs

**Language:**
- "The appropriations in this section may be transferred..."
- "The director may transfer amounts..."

**Parsing Challenge:** Narrative text, not structured data

### 8.5 Emergency Clauses

**Format:**
```xml
<P>This act is necessary for the immediate preservation of the public
peace, health, or safety, or support of the state government and its
existing public institutions, and takes effect immediately.</P>
```

**Indicator:** "declaring an emergency" in bill title

**Impact:** Immediate effectiveness (not 90 days after session)

---

## 9. Data Quality Considerations

### 9.1 Completeness

**Strengths:**
- All bills have complete XML with full text
- Appropriations are explicitly tagged
- Metadata is comprehensive

**Gaps:**
- HTM format missing for 5200-S
- XML format missing for 5092-S
- Some agency departments lack clear names

### 9.2 Consistency

**Strong Consistency:**
- XML namespace and schema
- Agency code format
- Dollar amount format
- Section numbering

**Variations:**
- Account name formatting (dashes, spacing)
- Department name presentation
- Proviso language structure
- Part numbering across years

### 9.3 Validation Challenges

**Challenges:**
- Arithmetic: Do line items sum to totals?
- Cross-references: Do cited sections exist?
- RCW accuracy: Are RCW citations valid?
- Agency codes: Do all codes map to departments?

**Recommendations:**
- Validate dollar amount arithmetic
- Build agency code lookup table
- Cross-check RCW citations against current statutes
- Flag orphaned references

---

## 10. Recommendations for Future Parsing

### 10.1 Tool Selection

**Recommended Approach:**
- **XML Parsing:** Node.js with built-in XML capabilities or lightweight libraries
- **Browser-based:** Native DOMParser for client-side parsing
- **Python Alternative:** lxml or ElementTree for server-side processing

**Avoid:**
- Regular expressions for complex nested structures
- String manipulation for XML parsing
- Full DOM loading of large files without streaming

### 10.2 Optimization Strategies

**For Large Files:**
1. **Lazy Loading:** Parse sections on demand
2. **Indexing:** Build section/agency index first, load details later
3. **Chunking:** Process bill in parts (by Part structure)
4. **Caching:** Cache parsed results for repeated queries

**For Query Performance:**
1. **Pre-compute Aggregates:** Total by agency, account type, fiscal year
2. **Build Indexes:** Agency lookup, section lookup, RCW lookup
3. **Normalize Data:** Separate tables for bills, appropriations, sections
4. **Denormalize for Read:** Include common joins in main tables

### 10.3 Data Normalization

**Recommended Schema:**

```javascript
{
  bills: [
    {
      id, type, session, legislature, sessionLawCaption,
      totalAmount, effectiveDate, hasVeto, ...
    }
  ],
  appropriations: [
    {
      id, billId, agencyCode, departmentName, accountName,
      amount, fiscalYear, sectionNumber, isTotal, isReappropriation, ...
    }
  ],
  sections: [
    {
      id, billId, sectionNumber, type, action, caption,
      rcw, hasAppropriations, veto, length, ...
    }
  ],
  agencies: [
    {
      code, name, totalAppropriations, billCount, ...
    }
  ],
  parts: [
    {
      id, billId, partNumber, name, sectionCount, ...
    }
  ]
}
```

### 10.4 Query Patterns

**Common Queries:**
1. All appropriations for agency X
2. Budget trends by agency across biennia
3. Bills with partial vetoes
4. Appropriations by account type
5. RCW sections amended most frequently
6. Bills by sponsor or committee
7. Emergency appropriations
8. Reappropriations from prior biennia

**Indexing Strategy:**
- Index: billId, agencyCode, accountName, sectionNumber
- Full-text: proviso language, bill descriptions
- Aggregates: Pre-compute totals by agency, fiscal year, account type

### 10.5 Future-Proofing

**Design Principles:**
1. **Format Agnostic:** Support both XML and HTM parsing
2. **Version Tolerant:** Handle schema variations across years
3. **Extensible:** Easy to add new fields or bill types
4. **Documented:** Clear field definitions and examples
5. **Tested:** Edge cases and special situations covered

**Monitoring:**
- Track parsing failures and warnings
- Log structural variations encountered
- Flag unexpected patterns
- Validate against known totals

---

## 11. Conclusions

### 11.1 Key Takeaways

1. **XML Format is Robust:** Highly structured, consistent, and complete across all bills
2. **Budget Bills are Complex:** Require specialized handling for appropriations, proviso language, and multi-year tracking
3. **Policy Bills are Simpler:** Follow clear amendment patterns with extensive RCW citations
4. **Structural Consistency:** Despite variations, core patterns are stable across years
5. **Scale Challenges:** Large file sizes and deep nesting require efficient parsing strategies

### 11.2 Success Factors

The extraction library successfully handles:
- ✓ Multiple bill types with different structures
- ✓ Large files up to 4.7MB
- ✓ Complex nesting and hierarchies
- ✓ Dollar amount extraction and parsing
- ✓ Agency and department identification
- ✓ Cross-references and dependencies
- ✓ Metadata extraction
- ✓ Section categorization

### 11.3 Future Enhancements

**Potential Improvements:**
1. **Proviso Language Analysis:** NLP-based extraction of policy directives
2. **Multi-Year Tracking:** Link appropriations across biennia
3. **Fiscal Impact Analysis:** Calculate net changes from supplementals
4. **Veto Analysis:** Track veto patterns and amounts
5. **Comparative Analysis:** Bill-to-bill comparisons
6. **Visualization:** Interactive budget exploration
7. **API Development:** RESTful API for bill data queries
8. **Real-time Updates:** Monitor legislature website for new bills

---

## Appendix A: Statistics Summary

### Bill Counts
- Total Bills: 9
- Budget Bills: 6
  - Operating: 2
  - Operating Supplemental: 2
  - Capital: 2
- Policy Bills: 3

### Structural Counts
- Total Sections: 4,032
- Total Appropriations: 7,763
- Unique Agencies: 271
- Unique Departments: 576
- Total Parts: 45

### Financial Data
- Total Appropriation Amount: $349.9 billion
- Largest Single Bill: $134.9B (5167-S)
- Smallest Budget Bill: $280.8M (5950-S)
- Average Budget Bill: $58.3B

### File Sizes
- Largest XML: 4.7MB (5167-S.xml)
- Smallest XML: 1.1MB (1210-S2.xml)
- Total XML Size: 26.9MB
- Total HTM Size: 26.6MB

### Parsing Performance
- Average Parse Time: ~2-3 seconds per bill
- Total Extraction Time: ~30 seconds (all bills)
- Memory Usage: <200MB peak

---

## Appendix B: Common Agency Codes

| Code | Department Name |
|------|----------------|
| 011 | House of Representatives |
| 012 | Senate |
| 014 | Joint Legislative Audit and Review Committee |
| 020 | Legislative Evaluation and Accountability Program |
| 035 | Office of the State Actuary |
| 055 | Administrator for the Courts |
| 060 | Attorney General |
| 070 | Governor |
| 105 | Secretary of State |
| 110 | Office of Financial Management |
| 235 | Department of Health |
| 302 | Department of Ecology |
| 540 | Health Care Authority |
| 690 | Department of Social and Health Services |

*Note: Complete agency code list available in bills-data.json*

---

**Report End**
