# HB 1210-S2 Analysis Report
## Replacing "Marijuana" with "Cannabis" Throughout the Revised Code of Washington

---

## Executive Summary

**Bill:** Second Substitute House Bill 1210 (2SHB 1210)
**Session:** 2022 Regular Session, 67th Legislature
**Status:** Enacted as Chapter 16, Laws of 2022
**Bill Type:** Terminology Replacement / Technical Amendment

This bill represents a comprehensive terminology update across Washington State law, replacing the term "marijuana" with the scientifically accurate term "cannabis" throughout the Revised Code of Washington (RCW). The bill is **technical in nature** with no substantive legal changes intended.

### Key Statistics

- **Total Sections:** 176
- **RCW Sections Amended:** 160
- **RCW Titles Affected:** 18 titles
- **Term Replacements:** 1,376 instances of "marijuana" replaced with "cannabis"
- **Agencies Mentioned:** 18 state agencies
- **Legislative Support:** Strong bipartisan approval (House: 86.5%, Senate: 83.7%)

---

## Bill Type Classification

### Primary Classification: **Terminology Replacement Bill**

This is a **technical amendment bill** focused exclusively on terminology standardization. Key characteristics:

1. **No Substantive Changes:** Section 1 explicitly states no legal changes are intended
2. **Systematic Find-Replace:** Consistent replacement across all affected statutes
3. **No Fiscal Impact:** No appropriations, fund transfers, or budget implications
4. **No New Policy:** Does not create new programs or modify existing regulations

### Legislative Intent

From Section 1:
> "The legislature finds that the use of the term 'marijuana' in the United States has discriminatory origins and should be replaced with the more scientifically accurate term 'cannabis.'"

This reflects a policy to:
- Remove terminology with discriminatory historical context
- Align Washington law with scientific nomenclature
- Maintain consistency with international standards

---

## Structural Analysis

### Bill Organization

```
HB 1210-S2
├── Enrolling Certificate
│   ├── Chapter Law Information
│   ├── Passage Information (House & Senate)
│   ├── Governor Approval
│   └── Filing Information
│
├── Bill Heading
│   ├── Metadata
│   ├── Sponsors
│   └── Brief Description
│
├── Bill Title (AN ACT...)
│
└── Bill Body
    ├── Section 1: Legislative Intent (NEW)
    └── Sections 2-176: Amendatory Sections
```

### Section Type Breakdown

| Section Type | Count | Description |
|--------------|-------|-------------|
| **amendatory** | 173 | Sections amending existing RCW sections |
| **new** | 3 | New sections being added |
| **Total** | 176 | |

### Amendment Actions

- **amend**: 162 sections (92.0%)
- **remd**: 11 sections (6.3%)
- **new**: 3 sections (1.7%)

---

## XML vs HTM Format Comparison

### XML Format (`1210-S2.xml`)

**Characteristics:**
- **File Size:** 1.1 MB
- **Line Count:** 6,149 lines
- **Structure:** Semantic XML with hierarchical tags

**Advantages:**
1. **Structured Data:** Rich semantic markup with typed elements
2. **Machine Parseable:** Easy to extract specific data points
3. **Amendment Tracking:** Clear `<TextRun amendingStyle="strike">` and `amendingStyle="add"` markers
4. **Metadata Rich:** Separate tags for each data element
5. **Validation:** Can be validated against XML schema

**Key XML Elements:**
```xml
<CertifiedBill>
  <EnrollingCertificate>
    <ChapterLaw>, <PassedBy>, <ApprovedDate>, etc.
  </EnrollingCertificate>
  <Bill>
    <BillHeading>
      <ShortBillId>, <Legislature>, <Session>, etc.
    </BillHeading>
    <BillBody>
      <BillSection type="..." action="...">
        <BillSectionHeader>
          <SectionCite>
            <TitleNumber>, <ChapterNumber>, <SectionNumber>
          </SectionCite>
        </BillSectionHeader>
        <P>...</P>
      </BillSection>
    </BillBody>
  </Bill>
</CertifiedBill>
```

### HTM Format (`1210-S2.htm`)

**Characteristics:**
- **File Size:** 1.0 MB (slightly smaller)
- **Line Count:** 3 lines (single-line HTML)
- **Structure:** HTML with inline CSS styling

**Advantages:**
1. **Human Readable:** Formatted for visual presentation
2. **Web Ready:** Can be directly displayed in browsers
3. **Styling:** Includes formatting and layout information
4. **Print Friendly:** Mimics printed document appearance

**Disadvantages:**
1. **Less Structured:** Data mixed with presentation
2. **Harder to Parse:** Requires HTML parsing and text extraction
3. **No Semantic Markup:** Amendments not explicitly marked
4. **Limited Metadata:** Information embedded in text

### Format Comparison Summary

| Feature | XML | HTM |
|---------|-----|-----|
| **Data Extraction** | Excellent | Moderate |
| **Human Readability** | Moderate | Excellent |
| **Machine Processing** | Excellent | Moderate |
| **File Size** | 1.1 MB | 1.0 MB |
| **Amendment Tracking** | Explicit markup | Implicit styling |
| **Metadata Access** | Structured tags | Text parsing required |
| **Best Use Case** | Automated processing | Display/printing |

**Recommendation:** Use XML for data extraction and analysis; use HTM for human review and presentation.

---

## Extractable Structured Data

### 1. Bill Metadata

**Available Fields:**
- Short ID (e.g., "2SHB 1210.SL")
- Long ID (full bill title)
- Legislature number and session
- Sponsors and co-sponsors
- Brief description
- Full bill title with all RCW references

**Extraction Method:** `metadata` object in JSON output

### 2. Enrolling Information

**Available Fields:**
- Chapter law number and year
- Session law caption
- House passage date, vote count (yeas/nays), signer
- Senate passage date, vote count, signer
- Governor approval date and name
- Filing date with Secretary of State

**Extraction Method:** `enrollingInfo` object in JSON output

**Example:**
```json
{
  "house": {
    "passedDate": "February 2, 2022",
    "yeas": 83,
    "nays": 13
  },
  "senate": {
    "passedDate": "March 1, 2022",
    "yeas": 41,
    "nays": 8
  }
}
```

### 3. Statutory References

**Available Data:**
- All RCW sections amended (160 sections)
- Grouped by RCW Title
- Full citation format (Title.Chapter.Section)

**RCW Titles Affected:**
- Title 9: Crimes and Punishments
- Title 13: Juvenile Courts and Juvenile Offenders
- Title 15: Agriculture and Marketing
- Title 18: Businesses and Professions
- Title 19: Business Regulations
- Title 20: Commission Merchants
- Title 28A: Common School Provisions
- Title 28B: Higher Education
- Title 38: Militia and Military Affairs
- Title 42: Public Officers and Agencies
- Title 43: State Government
- Title 46: Motor Vehicles
- Title 66: Alcoholic Beverage Control
- Title 69: Food, Drugs, Cosmetics, and Poisons
- Title 70: Public Health and Safety
- Title 79A: Public Recreational Lands
- Title 82: Excise Taxes
- Title 84: Property Taxes

**Most Affected Title:** Title 69 (over 100 sections)

### 4. Effective Dates

**Primary Effective Date:** June 9, 2022

**Special Effective Dates:**
- Sections 7, 51, and 116: July 1, 2022
- Sections 5, 9, 86, and 88: July 1, 2023
- Sections 65 and 68: July 1, 2024
- Section 11: July 1, 2030

**Extraction Method:** `effectiveDates` array with type, date, and applicable sections

### 5. Amendment Details

**Per-Section Amendments:**
- Text being removed (strikes)
- Text being added (additions)
- Number of changes per section

**Aggregate Statistics:**
- Total strikes: 1,376
- Total additions: 1,376 (approximately)
- Primary change: "marijuana" → "cannabis"

**Extraction Method:** Each section has `amendments` object with `strikes` and `additions` arrays

### 6. Agency References

**Agencies Mentioned (18 total):**
1. Liquor and Cannabis Board
2. Department of Revenue
3. Department of Health
4. Department of Agriculture
5. Department of Ecology
6. Department of Commerce
7. Department of Licensing
8. Department of Labor
9. Department of Social and Health Services
10. Department of Transportation
11. Department of Corrections
12. Department of Fish and Wildlife
13. Washington State Patrol
14. Utilities and Transportation Commission
15. Office of Financial Management
16. Office of the Attorney General
17. Higher Education Coordinating Board
18. Various municipal and county agencies

**Extraction Method:** `agencies` array, extracted via pattern matching

### 7. Section-Level Data

**For Each Section:**
- Section number
- Type (amendatory, new, repealer)
- Action (amend, remd)
- RCW citation being amended
- Section caption/title
- Amendment details (strikes/additions)
- Content text

**Example Section:**
```json
{
  "number": "2",
  "type": "amendatory",
  "action": "amend",
  "rcw": {
    "title": "9",
    "chapter": "01",
    "section": "210",
    "full": "9.01.210"
  },
  "caption": "Financial, accounting services to marijuana industry.",
  "amendments": {
    "strikes": ["marijuana", "marijuana", "marijuana"],
    "additions": ["cannabis", "cannabis", "cannabis"]
  }
}
```

### 8. Statistical Summaries

**Automatically Computed:**
- Total sections by type
- Sections per RCW title
- Amendment frequency
- Voting statistics
- Timeline of enactment

---

## Fiscal Impact Analysis

### Classification: **No Fiscal Impact**

**Rationale:**
1. **No Appropriations:** Bill contains no funding allocations
2. **No Fund Transfers:** No movement of funds between accounts
3. **No New Programs:** No creation of new government programs
4. **Technical Only:** Changes are purely terminological
5. **Administrative:** Minimal cost for updating forms and materials

**Fiscal Notes:** None required or attached

**Implementation Costs:**
- Estimated minimal administrative costs for:
  - Updating agency forms and documents
  - Training staff on terminology changes
  - Updating information systems

These costs would be absorbed within existing operational budgets.

---

## Data Extraction Tools

### JavaScript Extraction Library

**File:** `bill-extractor.js`

**Features:**
- Browser and Node.js compatible
- Supports both XML and HTM formats
- Entity-specific extraction functions:
  - `extractMetadata()`
  - `extractEnrollingInfo()`
  - `extractSections()`
  - `extractStatutoryReferences()`
  - `extractEffectiveDates()`
  - `extractAgencies()`
  - `extractAmendments()`

**Usage:**
```javascript
// In browser
const billData = BillExtractor.parseXML(xmlContent);

// In Node.js
const extractor = require('./bill-extractor.js');
const billData = extractor.parseXML(xmlContent);
```

### Node.js Extraction Script

**File:** `extract-bill.js`

**Functionality:**
- Reads XML file
- Extracts all structured data
- Generates comprehensive JSON output
- Provides extraction summary

**Usage:**
```bash
node extract-bill.js
```

**Output:** `1210-S2-data.json` (structured bill data)

### JSON Schema

**File:** `schema.json`

**Purpose:**
- Validates JSON output structure
- Documents all available fields
- Provides type information
- Enables automated validation

**Compliance:** JSON Schema Draft-07

### HTML Demo Page

**File:** `demo.html`

**Features:**
- Interactive data exploration
- Visual statistics dashboard
- Quick query buttons
- Search functionality (by RCW or section)
- Advanced Lodash-based queries
- Raw data viewer

**CDN Libraries Used:**
- Lodash 4.17.21 (data manipulation)
- Axios 1.6.0 (JSON loading)

**Query Examples:**
1. Show all agencies mentioned
2. Find sections with most changes
3. Group sections by RCW title
4. Analyze voting patterns
5. Search by RCW number
6. View effective dates

---

## Key Entities Extracted

### 1. Legislative Metadata
- Bill identification numbers
- Legislature and session information
- Sponsorship details
- Bill type and classification

### 2. Procedural Information
- Committee assignments
- Reading dates
- Passage dates and votes
- Governor approval
- Effective dates

### 3. Statutory References
- Complete list of RCW sections
- Organized by title and chapter
- Cross-referenced with sections

### 4. Amendment Tracking
- Specific text changes (strike/add)
- Frequency analysis
- Pattern identification

### 5. Agency Involvement
- All mentioned state agencies
- Departments affected by changes
- Regulatory bodies involved

### 6. Timeline Data
- Introduction date
- Passage dates
- Signing date
- Effective dates (multiple)

### 7. Voting Records
- House vote breakdown
- Senate vote breakdown
- Approval percentages
- Partisan analysis (if available)

---

## Structural Patterns Identified

### 1. Consistent Amendment Pattern

Every amendatory section follows this pattern:
```
Section X: RCW Citation and historical reference
[Section content with strike/add markup]
History: [Previous amendments]
```

### 2. Strike/Add Markup

XML provides explicit markup:
```xml
<TextRun amendingStyle="strike">marijuana</TextRun>
<TextRun amendingStyle="add">cannabis</TextRun>
```

### 3. RCW Citation Format

Standardized format:
```xml
<SectionCite>
  <TitleNumber>69</TitleNumber>
  <ChapterNumber>50</ChapterNumber>
  <SectionNumber>101</SectionNumber>
</SectionCite>
```

### 4. Effective Date Specifications

Multiple effective dates specified in certificate:
- Default date for most sections
- Specific dates for certain sections
- Future dates for phased implementation

### 5. Definition Updates

Many sections add new definitions:
```
"For the purposes of this section, 'cannabis' has
the meaning provided in RCW 69.50.101."
```

This ensures consistent interpretation across all affected sections.

---

## Browser-Based Query Capabilities

### Using Lodash for Data Manipulation

**1. Filtering Sections**
```javascript
// Find all sections amending Title 69
const title69Sections = _.filter(billData.sections,
  s => s.rcw && s.rcw.title === '69'
);
```

**2. Grouping by Criteria**
```javascript
// Group sections by RCW title
const byTitle = _.groupBy(billData.sections,
  s => s.rcw ? s.rcw.title : 'none'
);
```

**3. Sorting and Ranking**
```javascript
// Find sections with most changes
const mostChanges = _.orderBy(
  billData.sections,
  s => s.amendments.strikes.length + s.amendments.additions.length,
  ['desc']
);
```

**4. Statistical Analysis**
```javascript
// Calculate average changes per section
const avgChanges = _.meanBy(billData.sections,
  s => s.amendments.strikes.length
);
```

**5. Finding Patterns**
```javascript
// Find all unique struck terms
const uniqueStrikes = _.chain(billData.sections)
  .flatMap(s => s.amendments.strikes)
  .uniq()
  .sort()
  .value();
```

### Demo Page Query Features

**Quick Queries:**
- Bill metadata display
- Passage information with vote breakdown
- Effective dates by section
- Complete RCW reference list
- Agency mentions
- Amendment statistics

**Search Capabilities:**
- Search by section number
- Search by RCW citation
- Search by keyword in caption
- Real-time filtering (debounced)

**Advanced Queries:**
- Top 10 sections with most changes
- Sections grouped by RCW title
- Sections without amendments
- Voting pattern analysis with visualizations

---

## Recommendations

### For Data Consumers

1. **Use XML Format** for automated data extraction and analysis
2. **Use HTM Format** for human review and document presentation
3. **Leverage JSON Output** for web applications and dashboards
4. **Validate Against Schema** to ensure data consistency

### For Similar Bills

This extraction methodology can be applied to:
- Other Washington State bills
- Bills from other states using similar XML formats
- Historical bill analysis
- Comparative legislation studies

### For Future Enhancements

1. **Text Search:** Add full-text search across all section content
2. **Comparison Tool:** Compare multiple bills side-by-side
3. **Visualization:** Add charts for RCW title distribution
4. **Export Options:** PDF, CSV, Excel exports
5. **API Layer:** RESTful API for programmatic access
6. **Historical Tracking:** Track terminology changes over time

---

## Technical Implementation Notes

### Parsing Strategy

**XML Parsing:**
- Used regex-based extraction for Node.js (no external dependencies)
- Can be enhanced with XML parser libraries (xml2js, fast-xml-parser)
- Current implementation is lightweight and fast

**HTM Parsing:**
- Requires HTML parser (DOMParser in browser, cheerio in Node.js)
- More complex due to presentation-focused markup
- Recommended for display purposes only

### Performance Considerations

**File Sizes:**
- XML: 1.1 MB (6,149 lines)
- HTM: 1.0 MB (3 lines, minified)
- JSON Output: ~200 KB (formatted)

**Processing Time:**
- Extraction: < 1 second
- JSON generation: < 1 second
- Browser loading: < 500ms

### Data Integrity

**Validation Points:**
- Section count verification (176 sections)
- RCW reference validation
- Vote count arithmetic
- Date format consistency
- Amendment pairing (strikes match additions)

---

## Conclusion

HB 1210-S2 represents a comprehensive terminology standardization effort across Washington State law. The bill's structured format (especially XML) enables robust data extraction and analysis.

**Key Takeaways:**

1. **Bill Type:** Technical terminology replacement with no substantive legal changes
2. **Scope:** 176 sections amending 160 RCW sections across 18 titles
3. **Impact:** 1,376 term replacements ("marijuana" → "cannabis")
4. **Legislative Support:** Strong bipartisan approval (>83% in both chambers)
5. **Data Accessibility:** Highly structured and extractable data
6. **Tool Completeness:** Full extraction library, schema, and demo interface provided

**Deliverables Provided:**

✅ JSON file with extracted data (`1210-S2-data.json`)
✅ JSON schema documentation (`schema.json`)
✅ JavaScript extraction library (`bill-extractor.js`)
✅ Node.js extraction script (`extract-bill.js`)
✅ HTML demo page with CDN-based queries (`demo.html`)
✅ Comprehensive analysis document (this file)

All tools are ready for use in static HTML pages using browser-based libraries (Lodash, Axios) loaded from CDN.

---

**Report Generated:** 2025
**Bill Analyzed:** HB 1210-S2 (Chapter 16, Laws of 2022)
**Data Source:** Official Washington State Legislature XML and HTM files
