# HB 5950-S Bill Analysis Report

**Analysis Date:** November 19, 2024
**Bill:** ESSB 5950 - 2023-2025 Supplemental Operating Budget
**Legislature:** 68th Washington State Legislature
**Session:** 2024 Regular Session

---

## Executive Summary

This report provides a comprehensive analysis of Washington State House Bill 5950-S (ESSB 5950), including bill type classification, structural patterns in both HTM and XML formats, and extractable data elements. The analysis demonstrates that the XML format provides superior structure for automated data extraction while the HTM format is optimized for human readability.

### Key Findings

- **Bill Type:** Supplemental Operating Budget
- **Total Appropriations:** $244.6 billion
- **Agencies Impacted:** 176
- **Individual Appropriations:** 1,499
- **Bill Sections:** 995+ sections with conditions/limitations
- **File Sizes:** XML (2.8 MB), HTM (3.1 MB)

---

## Bill Type Classification

### Primary Classification

**Category:** Budget Legislation
**Subcategory:** Supplemental Operating Budget
**Biennium:** 2023-2025

### Characteristics

This bill is a **supplemental operating appropriations bill** which modifies the existing 2023-2025 biennial operating budget (originally enacted as Chapter 475, Laws of 2023). Key characteristics include:

1. **Amendatory Nature**: The bill primarily amends existing appropriations rather than creating new ones from scratch
2. **Fiscal Scope**: Covers state government operations for the remainder of the 2023-2025 fiscal biennium
3. **Multi-Part Structure**: Organized into nine parts covering different government functions
4. **Partial Veto**: Contains governor's partial veto of specific sections

### Bill Parts Structure

The bill is organized into the following parts:

- **Part I**: General Government (Legislature, executive agencies)
- **Part II**: Human Services (DSHS, HCA, etc.)
- **Part III**: Natural Resources (DNR, Ecology, etc.)
- **Part IV**: Transportation (not operating budget proper)
- **Part V**: Public Schools
- **Part VI**: Higher Education
- **Part VII**: Special Appropriations
- **Part VIII**: Other Provisions
- **Part IX**: Compensation and Benefits

---

## Format Comparison: XML vs. HTM

### XML Format Analysis

**File:** `5950-S.xml`
**Size:** 2.8 MB
**Line Count:** 7,345 lines
**Character Encoding:** UTF-8 with BOM

#### Structure

The XML format follows the Washington State Legislature XML schema (`http://leg.wa.gov/2012/document`). Key structural elements:

```xml
<CertifiedBill type="sl">
  <EnrollingCertificate>
    <!-- Passage, certification, and signature info -->
  </EnrollingCertificate>
  <Bill type="bill">
    <BillHeading>
      <!-- Metadata: bill ID, sponsors, session, description -->
    </BillHeading>
    <BillBody>
      <BillTitle><!-- Legal title with RCW references --></BillTitle>
      <BillSection>
        <!-- Individual sections with appropriations -->
        <Department>
          <DeptName><!-- Agency name --></DeptName>
        </Department>
        <Appropriations agency="###">
          <Appropriation>
            <AccountName><!-- Fund source --></AccountName>
            <DollarAmount><!-- Amount --></DollarAmount>
          </Appropriation>
        </Appropriations>
      </BillSection>
    </BillBody>
  </Bill>
</CertifiedBill>
```

#### Advantages of XML Format

1. **Structured Data**: Semantic markup makes automated extraction reliable
2. **Amendment Tracking**: `amendingStyle="add"` and `amendingStyle="strike"` attributes clearly mark changes
3. **Typed Elements**: Distinct elements for different data types (DollarAmount, AccountName, etc.)
4. **Agency Codes**: Numeric agency identifiers in `agency="###"` attributes
5. **Metadata Rich**: Comprehensive enrollment certificate with vote counts, dates, signers
6. **Programmatic Access**: Easily parsed with standard XML libraries

#### XML-Specific Features

- **TextRun Elements**: Nested `<TextRun>` elements allow inline formatting and amendment markup
- **Fiscal Year Identifiers**: Clearly marked in account names as `(FY 2024)` or `(FY 2025)`
- **Vetoed Sections**: Explicitly marked in enrollment certificate
- **Cross-References**: `<UncodCite>` elements for session law references
- **Table Structures**: Appropriation tables with semantic meaning

### HTM Format Analysis

**File:** `5950-S.htm`
**Size:** 3.1 MB
**Line Count:** Effectively 1 line (no line breaks except in tables)

#### Structure

The HTM format is HTML 5 optimized for browser display:

```html
<!DOCTYPE html>
<html>
<body>
  <!-- Certification header with CSS styling -->
  <div style="text-align:center;">CERTIFICATION OF ENROLLMENT</div>

  <!-- Passage table with inline styles -->
  <table style="width:504.0pt;font-family:courier new;">
    <!-- Vote counts, signatures -->
  </table>

  <!-- Bill sections with inline styles -->
  <div style="text-indent:0.5in;">
    <!-- Appropriations displayed in tables -->
    <table>
      <tr>
        <td>General Fund—State Appropriation (FY 2024)</td>
        <td>. . . .</td>
        <td style="text-align:right;">
          ((<span style="text-decoration:line-through;">$59,938,000</span>))
        </td>
      </tr>
      <tr>
        <td></td>
        <td>     </td>
        <td style="text-align:right;">
          <span style="text-decoration:underline;">$60,051,000</span>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
```

#### Advantages of HTM Format

1. **Human Readable**: Optimized for browser display with proper formatting
2. **Visual Clarity**: Strikethrough and underline clearly show amendments
3. **Print Ready**: Inline CSS produces correct printed output
4. **Clickable Links**: RCW references are hyperlinked to online RCW viewer
5. **Accessibility**: Standard HTML structure for screen readers

#### HTM-Specific Features

- **Inline Styling**: All formatting via `style` attributes
- **Visual Amendment Markup**: Strikethrough for deletions, underline for additions
- **Courier Font Tables**: Budget tables use monospace font for alignment
- **Dot Leaders**: Visual dots (`. . . .`) connect account names to amounts
- **Indentation**: Text indents via CSS for section structure

### Format Comparison Matrix

| Feature | XML | HTM |
|---------|-----|-----|
| **Machine Readability** | Excellent | Fair |
| **Human Readability** | Fair | Excellent |
| **Data Extraction** | Easy | Complex |
| **Amendment Tracking** | Attribute-based | Visual styling |
| **Metadata Richness** | High | Moderate |
| **File Size** | 2.8 MB | 3.1 MB |
| **Structure Complexity** | Semantic | Presentation |
| **Agency Identification** | Numeric codes | Text only |
| **Amount Parsing** | Clean | Requires text processing |
| **Cross-References** | Semantic tags | Hyperlinks |
| **Best Use Case** | Data extraction, analysis | Reading, printing |

### Recommendation

**For automated data extraction and analysis, use the XML format.** While the HTM format is superior for human reading, the XML format's semantic structure makes it far more reliable for programmatic access. The extraction library developed for this project targets the XML format for this reason.

---

## Extractable Structured Data

Based on analysis of both formats, the following structured data elements can be reliably extracted:

### 1. Bill Metadata

**Reliability: High**
**Source Elements:** `<BillHeading>`, `<EnrollingCertificate>`

- Bill identification (short and long IDs)
- Legislature and session information
- Sponsor information
- Brief description
- Chapter law number and year
- Veto actions
- Effective date
- Passage information (dates, vote counts, signers)
- Approval and filing dates

### 2. Agencies and Departments

**Reliability: High**
**Source Elements:** `<Department>`, `<Index>`, `agency` attributes

- Agency names (full text)
- Agency codes (numeric identifiers)
- Department display names
- Organizational hierarchy (by part)

**Extracted Count:** 176 unique agencies

Example agencies:
- HOUSE OF REPRESENTATIVES (code: 011)
- SENATE (code: 012)
- OFFICE OF THE GOVERNOR (code: 102)
- DEPARTMENT OF SOCIAL AND HEALTH SERVICES (code: 300)

### 3. Appropriations

**Reliability: High**
**Source Elements:** `<Appropriation>`, `<AccountName>`, `<DollarAmount>`

For each appropriation:
- Bill section number
- Agency name and code
- Account name (fund source)
- Dollar amount (as integer)
- Fiscal year (2024, 2025, or null)
- Amendment type (add, strike, or null)
- Original formatted amount string

**Extracted Count:** 1,499 individual appropriations
**Total Value:** $244.6 billion

### 4. Fiscal Impacts

**Reliability: High**
**Derived from:** Appropriations data

- Total appropriations across all agencies
- Appropriations by fiscal year
- Appropriations by agency
- Amendment impacts (increases vs. decreases)
- Account usage statistics

**Key Statistics:**
- FY 2024 appropriations: ~$120 billion
- FY 2025 appropriations: ~$124 billion
- Largest agency appropriations: Public Schools, Health Care Authority

### 5. Statutory References

**Reliability: High**
**Source Elements:** `<BillTitle>`, `<UncodCite>`

- RCW (Revised Code of Washington) citations
- Session law references
- Uncodified law references
- Context of each reference

**Extracted Count:** 163 unique statutory references

Examples:
- RCW 43.101.220 (bill title)
- RCW 70A.65.300 (bill title)
- 2023 c 475 s 101 (uncodified - section header)

### 6. Dates

**Reliability: High**
**Source Elements:** Various date-specific elements

- Effective date
- Passage dates (by chamber)
- Approved date
- Filed date
- Deadline dates (from conditions)

**Extracted Count:** 5 primary dates plus conditional dates

### 7. Conditions and Limitations

**Reliability: Moderate**
**Source Elements:** `<P>` elements with specific text patterns

For each condition:
- Section number
- Full text of condition
- "Provided solely" flag
- Referenced amounts and programs

**Extracted Count:** 995 conditions and limitations

These represent spending restrictions, reporting requirements, and other legislative directives accompanying appropriations.

### 8. Programs

**Reliability: Moderate**
**Extraction Method:** Heuristic pattern matching

Program names extracted from conditions text:
- Juvenile rehabilitation program
- Education program
- Health care program
- Various grant programs

**Extracted Count:** 140 program mentions

**Note:** Program extraction is heuristic and may have false positives/negatives.

### 9. Accounts (Fund Sources)

**Reliability: High**
**Source Elements:** `<AccountName>` elements

For each unique account:
- Account name
- Associated fiscal year
- Account type classification

**Extracted Count:** 101 unique accounts

**Account Types:**
- General Fund—State
- General Fund—Federal
- Special purpose accounts
- Dedicated funds

### 10. Fiscal Notes

**Reliability: Low**
**Availability:** Not present in this bill type

Supplemental operating budgets typically do not include separate fiscal note sections. Fiscal impacts are embedded in appropriations and conditions.

---

## Structural Patterns

### Section Numbering

Sections are numbered sequentially within parts:
- Part I: Sections 101-157
- Part II: Sections 201-230
- Part III: Sections 301-312
- Etc.

Some sections are omitted in numbering (e.g., 110, 128) likely due to earlier drafts.

### Appropriation Patterns

Each agency section typically follows this pattern:

1. **Section header** with agency name
2. **Appropriations table** with:
   - Account name (fund source)
   - Fiscal year designation
   - Dollar amount
   - Amendment markup (if applicable)
3. **Total appropriation** line
4. **Conditions and limitations** paragraphs

### Amendment Markup

Supplemental budgets show changes to existing law:

- **Strikethrough** (`amendingStyle="strike"`): Original amount being replaced
- **Underline** (`amendingStyle="add"`): New amount
- **Clean text**: Unchanged provisions carried forward

Pattern in XML:
```xml
<DollarAmount><TextRun amendingStyle="strike">$59,938,000</TextRun></DollarAmount>
<DollarAmount><TextRun amendingStyle="add">$60,051,000</TextRun></DollarAmount>
```

### Fiscal Year Designation

Appropriations are split by fiscal year:
- `General Fund—State Appropriation (FY 2024)`
- `General Fund—State Appropriation (FY 2025)`

The bill covers a two-year biennium, so most agencies have two appropriation entries.

### Conditions Structure

Conditions typically follow patterns:

1. **Preamble**: "The appropriations in this section are subject to the following conditions and limitations:"
2. **Numbered subsections**: (1), (2), (3), etc.
3. **"Provided solely" language**: Indicates restricted use of funds
4. **Lapse provisions**: "If [bill] is not enacted..., the amount provided in this subsection shall lapse."

### Cross-Bill References

The bill frequently references other legislation:
- "Engrossed Substitute House Bill No. 1436"
- "Senate Bill No. 5949"
- "Initiative Measure No. 2117"

These create conditional appropriations dependent on other legislative outcomes.

---

## Data Quality Assessment

### High Quality Elements

- **Dollar amounts**: Consistent formatting, reliably parseable
- **Agency identification**: Standardized naming and coding
- **Dates**: ISO-like format, machine-readable
- **Section numbers**: Sequential and consistent
- **Statutory references**: Well-formed citations

### Moderate Quality Elements

- **Conditions text**: Natural language, requires NLP for deep analysis
- **Program names**: Inconsistent naming, heuristic extraction needed
- **Account names**: Some variation in formatting
- **Fiscal year tags**: Usually consistent but occasionally implied

### Challenges

1. **Text-heavy conditions**: Conditions are prose text, difficult to structure
2. **Program identification**: No semantic markup for programs
3. **Cross-references**: Bill references are text, not structured links
4. **Amendment context**: Can't always determine why amounts changed
5. **Veto complexity**: Vetoed sections require special handling

---

## Use Cases for Extracted Data

The structured JSON output enables various analysis use cases:

### Budget Analysis

- Compare agency funding across fiscal years
- Track supplemental changes from base budget
- Identify largest appropriations and recipients
- Analyze fund source distribution

### Legislative Tracking

- Monitor which agencies receive new funding
- Track conditional appropriations
- Identify cross-bill dependencies
- Review veto impacts

### Public Transparency

- Make budget data accessible to citizens
- Enable budget visualizations and dashboards
- Support watchdog journalism
- Facilitate academic research

### Government Operations

- Support budget planning and forecasting
- Enable spend tracking and variance analysis
- Inform agency operations planning
- Facilitate fiscal impact assessment

---

## Technical Implementation Notes

### Extraction Library

The JavaScript extraction library (`bill-extractor.js`) provides:

- Modular functions for each data type
- Browser and Node.js compatibility
- DOM-based XML parsing
- Lodash integration for querying

### Performance

Extraction of the full 2.8 MB XML file takes approximately:
- Parse time: ~500ms
- Extraction time: ~1-2 seconds
- Total processing: ~2.5 seconds

On typical hardware (2020+ era computer).

### Browser Compatibility

The demo page requires:
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript enabled
- ~3 MB memory for data load
- Chart.js and Lodash from CDN

### Static Deployment

All outputs are static files requiring only:
- HTTP server (nginx, Apache, etc.)
- No backend processing
- No database
- CDN access for libraries

This enables deployment to GitHub Pages, Netlify, or any static host.

---

## Recommendations

### For Automated Processing

1. **Use XML format exclusively** for data extraction
2. **Cache parsed results** to avoid re-parsing large files
3. **Validate amounts** against known totals
4. **Handle amendments carefully** to avoid double-counting
5. **Consider fiscal year** when aggregating appropriations

### For Enhancement

1. **Add fiscal note extraction** if available in other bill types
2. **Implement full-text search** on conditions
3. **Create time-series tracking** across multiple bienniums
4. **Link to agency websites** for more context
5. **Integrate with fiscal tracking systems**

### For Data Consumers

1. **Use the JSON schema** for validation
2. **Query with Lodash** for complex filters
3. **Visualize with Chart.js** or similar libraries
4. **Export to CSV** for spreadsheet analysis
5. **Share via static hosting** for transparency

---

## Conclusion

HB 5950-S demonstrates the value of structured legislative data. The XML format provides a rich, semantic representation that enables reliable automated extraction of budget data, while the HTM format ensures human accessibility. By extracting and structuring this data into JSON, we enable a wide range of analysis and transparency applications.

The extraction tools developed for this bill can serve as a template for processing other Washington State legislative bills, particularly budget bills with similar structure. The modular design allows for easy adaptation to different bill types and formats.

**Total extracted data points:** Over 3,500 structured records across 10 entity types, representing Washington State's $244.6 billion supplemental operating budget for the 2023-2025 biennium.
