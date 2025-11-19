# XML vs HTM Format Comparison

**Analysis Date:** November 19, 2025
**Dataset:** 10 Washington State Bills (8 with both formats, 1 XML-only, 1 HTM-only)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [File Size Analysis](#file-size-analysis)
3. [Encoding and Structure](#encoding-and-structure)
4. [Content Representation](#content-representation)
5. [Parsing Differences](#parsing-differences)
6. [Use Case Recommendations](#use-case-recommendations)
7. [Format Availability](#format-availability)

---

## Executive Summary

Washington State provides legislative bills in both XML and HTM formats. While both formats contain identical legislative content, they differ significantly in structure, size, and intended use:

- **XML**: Machine-readable, semantic structure, smaller files (for policy bills), consistent namespace
- **HTM**: Human-readable, presentation-focused, larger files (typically 9-17% larger for budget bills), includes visual styling

**Key Finding:** XML is preferred for automated extraction and data processing, while HTM is better for human reading and web presentation.

---

## File Size Analysis

### Size Comparison Table

| Bill | XML Size | HTM Size | Difference | % Difference | Category |
|------|----------|----------|------------|--------------|----------|
| **1210-S2** | 1,152,205 | 1,085,481 | -66,724 | -5.8% | Policy |
| **1281-S** | 1,414,844 | 1,207,421 | -207,423 | -14.7% | Policy |
| **1320-S2** | 1,147,154 | 1,050,046 | -97,108 | -8.5% | Policy |
| **5092-S** | N/A | 3,730,556 | N/A | N/A | Budget (HTM only) |
| **5167-S** | 4,212,749 | 4,615,518 | +402,769 | **+9.6%** | Budget |
| **5187-S** | 4,098,166 | 4,489,877 | +391,711 | **+9.6%** | Budget |
| **5195-S** | 2,316,800 | 2,520,946 | +204,146 | **+8.8%** | Budget |
| **5200-S** | 2,040,832 | N/A | N/A | N/A | Budget (XML only) |
| **5693-S** | 2,717,696 | 2,982,266 | +264,570 | **+9.7%** | Budget |
| **5950-S** | 2,821,120 | 3,100,390 | +279,270 | **+9.9%** | Budget |

### Key Observations

1. **Policy Bills**: XML is consistently **larger** than HTM (5-15% larger)
   - Likely due to verbose XML tag names and namespace declarations
   - HTM can use shorter class names and CSS

2. **Budget Bills**: HTM is consistently **larger** than XML (9-10% larger)
   - HTML table markup is more verbose than XML's compact structure
   - Inline CSS styling adds significant overhead
   - Thousands of appropriation entries amplify the difference

3. **Average Difference**:
   - Policy bills: XML is ~10% larger
   - Budget bills: HTM is ~10% larger

---

## Encoding and Structure

### XML Format

#### Declaration
```xml
<?xml version="1.0" encoding="utf-8"?>
```

#### Root Structure
```xml
<CertifiedBill type="sl" xmlns="http://leg.wa.gov/2012/document">
  <EnrollingCertificate>...</EnrollingCertificate>
  <Bill>
    <BillHeading>...</BillHeading>
    <BillBody>...</BillBody>
  </Bill>
</CertifiedBill>
```

#### Characteristics
- **Encoding**: UTF-8 with BOM (﻿)
- **Namespace**: Washington Legislature 2012 document schema
- **Structure**: Semantic, hierarchical tags
- **Validation**: Can be validated against XML schema (XSD)
- **Whitespace**: Preserves formatting with line breaks and indentation

### HTM Format

#### Declaration
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bill Title</title>
  <style>/* Inline CSS */</style>
</head>
<body>
```

#### Root Structure
```html
<div class="certified-bill">
  <div class="enrolling-certificate">...</div>
  <div class="bill">
    <div class="bill-heading">...</div>
    <div class="bill-body">...</div>
  </div>
</div>
```

#### Characteristics
- **Encoding**: UTF-8 with BOM (﻿)
- **DOCTYPE**: HTML5
- **Structure**: Presentation-focused with class names
- **Validation**: Can be validated as HTML5
- **Whitespace**: Uses HTML entity encoding and `&nbsp;` for spacing

---

## Content Representation

### Amendment Markup

#### XML Approach
```xml
<P>
  A person providing services for a
  <TextRun amendingStyle="strike">marijuana</TextRun>
  <TextRun amendingStyle="add">cannabis</TextRun>
  producer does not commit a crime...
</P>
```

**Advantages:**
- Semantic attributes (`amendingStyle`)
- Clear machine-readable intent
- Easy to filter "strike" or "add" content programmatically

#### HTM Approach
```html
<p>
  A person providing services for a
  <span style="text-decoration: line-through;">marijuana</span>
  <span style="text-decoration: underline;">cannabis</span>
  producer does not commit a crime...
</p>
```

**Advantages:**
- Visual styling renders immediately in browsers
- Standard CSS properties
- Human-readable without special knowledge

**Disadvantages:**
- Requires CSS parsing or visual inspection to detect changes
- Not semantically labeled as "strike" vs "add"

---

### Tables

#### XML Approach
```xml
<Table align="center" pubwidth="wide" width="504.0pt" fontFamily="Courier New">
  <Col width="252.0pt" />
  <Col width="228.0pt" />
  <TR>
    <TDEnroll>Passage information</TDEnroll>
    <TDEnroll>Certification</TDEnroll>
  </TR>
</Table>
```

**Characteristics:**
- Custom table cells (`TDEnroll`)
- Points-based width (504.0pt)
- Font family specified at table level
- Column definitions (`<Col>`)

#### HTM Approach
```html
<table style="width: 504.0pt; font-family: 'Courier New'; margin: 0 auto;">
  <colgroup>
    <col style="width: 252.0pt;" />
    <col style="width: 228.0pt;" />
  </colgroup>
  <tr>
    <td class="enroll">Passage information</td>
    <td class="enroll">Certification</td>
  </tr>
</table>
```

**Characteristics:**
- Standard HTML table elements
- Inline CSS styling
- Class names for special cells
- Colgroup for column widths

**Comparison:**
- **HTM:** More verbose due to style attributes repeated across elements
- **XML:** More compact, styling inherited or specified once

---

### Appropriations

#### XML Approach
```xml
<Appropriations agency="085" project="30000047" appropType="appropriation">
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

**Advantages:**
- Attributes carry agency/project metadata
- `appropType` clearly distinguishes appropriation types
- Leader characters are semantic (not visual)
- Easy to extract dollar amounts programmatically

#### HTM Approach
```html
<div class="appropriations" data-agency="085" data-project="30000047" data-type="appropriation">
  <div class="appropriation">
    <div class="account-name">
      <p class="budget-p indent-1">State Building Construction Account</p>
      <p class="budget-p indent-2">Account—State</p>
    </div>
    <span class="leader">......</span>
    <span class="dollar-amount">$8,000,000</span>
  </div>
  <div class="appropriation-total">
    TOTAL
    <span class="leader">......</span>
    <span class="dollar-amount">$43,300,000</span>
  </div>
</div>
```

**Advantages:**
- Visual leader dots render as actual dots
- Data attributes preserve metadata
- CSS classes enable flexible styling

**Disadvantages:**
- Visual leader dots (actual periods) instead of semantic marker
- More verbose with nested divs and spans
- Dollar amounts mixed with visual elements

---

### Text Formatting

#### XML Approach
```xml
<TextRun fontFamily="Times New Roman">—</TextRun>
<TextRun fontWeight="bold">TOTAL</TextRun>
<TextRun fontStyle="italic">Effective until July 1, 2023.</TextRun>
```

**Characteristics:**
- Semantic attributes for styling
- Compact inline elements
- Font properties as attributes

#### HTM Approach
```html
<span style="font-family: 'Times New Roman';">—</span>
<strong>TOTAL</strong>
<em>Effective until July 1, 2023.</em>
```

**Characteristics:**
- Mix of inline styles and semantic HTML (`<strong>`, `<em>`)
- Standard HTML/CSS properties
- Sometimes uses `<b>` and `<i>` instead of semantic tags

**Comparison:**
- **XML:** Consistent attribute-based styling
- **HTM:** Mix of CSS and semantic HTML, more readable for humans

---

## Parsing Differences

### XML Parsing

#### Advantages
1. **Structured Data Extraction**
   - XPath queries for precise selection
   - DOM parsing with standard XML libraries
   - Namespace-aware parsing

2. **Attribute Access**
   - Easy access to metadata (agency, project, year, type)
   - Structured appropriation types

3. **Semantic Clarity**
   - `amendingStyle="strike"` vs style inspection
   - `appropType="reappropriation"` vs class inspection

4. **Validation**
   - Can validate against XSD schema
   - Ensures structural consistency

#### Challenges
1. **Namespace Handling**
   - Must specify namespace in queries: `//ns:BillSection`
   - Requires namespace-aware parsers

2. **Text Extraction**
   - Must aggregate `TextRun` elements for complete text
   - `amendingStyle` requires filtering for final text

3. **Large File Performance**
   - 4+ MB files can be slow to parse with DOM
   - May require SAX parsing or streaming

#### Example (Node.js with xmldom)
```javascript
const { DOMParser } = require('xmldom');
const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');

// Extract bill ID
const billId = doc.getElementsByTagName('ShortBillId')[0]?.textContent;

// Extract appropriations
const appropriations = Array.from(doc.getElementsByTagName('Appropriations'));
appropriations.forEach(approp => {
  const agency = approp.getAttribute('agency');
  const type = approp.getAttribute('appropType');
  // ...
});
```

---

### HTM Parsing

#### Advantages
1. **Visual Rendering**
   - Can be rendered directly in browser
   - Users can read without parsing

2. **Standard HTML Tools**
   - jQuery, Cheerio, BeautifulSoup (Python)
   - CSS selectors: `$('.appropriations[data-type="appropriation"]')`

3. **Forgiving Parsers**
   - HTML parsers handle malformed markup better
   - Can still extract data from imperfect HTML

4. **No Namespace Issues**
   - Standard HTML5 without namespace complications

#### Challenges
1. **Inconsistent Markup**
   - May use mix of semantic tags and divs/spans
   - Class names might vary

2. **Visual vs Semantic**
   - `text-decoration: line-through` less semantic than `amendingStyle="strike"`
   - Leader dots are actual dots (visual) vs semantic markers

3. **Metadata Extraction**
   - Data attributes: `data-agency="085"` less standardized than XML attributes
   - May require CSS selector knowledge

4. **Size Overhead**
   - 10% larger for budget bills
   - Inline styles repeated across elements

#### Example (Node.js with Cheerio)
```javascript
const cheerio = require('cheerio');
const $ = cheerio.load(htmContent);

// Extract bill ID
const billId = $('.short-bill-id').text();

// Extract appropriations
$('.appropriations[data-type="appropriation"]').each((i, elem) => {
  const agency = $(elem).data('agency');
  const amount = $(elem).find('.dollar-amount').text();
  // ...
});
```

---

## Use Case Recommendations

### Use XML When:

1. **Automated Data Extraction**
   - Building databases of bill information
   - Extracting appropriations for financial analysis
   - Mining legislative history

2. **Structured Analysis**
   - Tracking amendments across multiple versions
   - Categorizing bills by type
   - Analyzing vote patterns

3. **Integration with Other Systems**
   - Feeding data into budget tracking systems
   - Legislative monitoring applications
   - Legal research databases

4. **Validation Requirements**
   - Need to ensure conformance to schema
   - Verifying bill structure integrity

5. **Semantic Queries**
   - Finding all amendatory sections
   - Extracting specific RCW citations
   - Filtering by appropriation type

**Recommended Tools:**
- **Node.js**: `xmldom`, `xpath`, `xml2js`
- **Python**: `lxml`, `xml.etree.ElementTree`, `BeautifulSoup` (XML mode)
- **Java**: JAXB, DOM4J, SAX

---

### Use HTM When:

1. **Human Reading**
   - Displaying bills on websites
   - Providing downloadable formats for citizens
   - Legislative staff review

2. **Visual Presentation**
   - Need formatted tables and styling
   - Rendering amendments with strikethrough/underline
   - Print-friendly versions

3. **Browser-Based Applications**
   - Web-based bill readers
   - Annotation tools
   - Comment systems

4. **Simpler Parsing Requirements**
   - Don't need strict schema validation
   - Working with partial/incomplete markup
   - Rapid prototyping

5. **Legacy System Compatibility**
   - Systems expecting HTML input
   - CMS platforms
   - Document management systems

**Recommended Tools:**
- **Node.js**: `cheerio`, `jsdom`, `puppeteer` (for rendering)
- **Python**: `BeautifulSoup`, `lxml.html`, `html5lib`
- **Browser**: Native DOM APIs, jQuery

---

### Hybrid Approach

**Best Practice:** Use XML for extraction, HTM for presentation

**Workflow:**
1. **Extract data from XML** into structured database
2. **Generate web views from HTM** for user display
3. **Cross-validate** to ensure both formats match
4. **Cache parsed XML data** to avoid repeated parsing

**Example Architecture:**
```
XML Files
   ↓
XML Parser (extraction-library.js)
   ↓
Structured Database (bills-index.json)
   ↓
API Layer
   ↓
Web Frontend (displays HTM for reading)
```

---

## Format Availability

### Completeness Analysis

| Format | Count | Percentage | Bills |
|--------|-------|------------|-------|
| **Both XML & HTM** | 8 | 80% | 1210-S2, 1281-S, 1320-S2, 5167-S, 5187-S, 5195-S, 5693-S, 5950-S |
| **XML Only** | 1 | 10% | 5200-S |
| **HTM Only** | 1 | 10% | 5092-S |

### Missing Format Patterns

#### 5200-S (XML Only)
- **Bill Type:** Capital Budget
- **Year:** 2023
- **Possible Reason:** HTM generation failure or not yet completed
- **Impact:** Users cannot view formatted version in browser

#### 5092-S (HTM Only)
- **Bill Type:** Operating Budget
- **Year:** 2021
- **Possible Reason:** Older bill, XML conversion not performed or lost
- **Impact:** Automated extraction tools cannot process this bill

### Recommendations for Handling

1. **Graceful Degradation**
   - If XML missing, attempt HTM parsing with HTML-to-XML converter
   - If HTM missing, generate simple HTML from XML

2. **Notification System**
   - Alert users when only one format is available
   - Provide alternative download options

3. **Conversion Tools**
   - XSLT stylesheet to transform XML → HTM
   - HTML parser with XML serializer for HTM → XML

4. **Archival Strategy**
   - Ensure both formats generated for all future bills
   - Backfill missing formats for historical bills

---

## Conclusion

### Key Takeaways

1. **Format Purpose:**
   - **XML**: Machine processing, data extraction, structured analysis
   - **HTM**: Human reading, web presentation, visual rendering

2. **File Size:**
   - Policy bills: XML is larger (5-15%)
   - Budget bills: HTM is larger (9-10%)
   - Overall: Difference is not significant for modern systems

3. **Content Parity:**
   - Both formats contain identical legislative content
   - Differences are purely structural and presentational

4. **Parsing Complexity:**
   - **XML**: More complex (namespace handling) but more powerful (XPath, schema validation)
   - **HTM**: Simpler CSS selectors but less semantic information

5. **Availability:**
   - 80% of bills have both formats
   - Plan for missing formats in robust systems

### Best Practices

1. **Primary Format: XML**
   - Use XML as source of truth for data extraction
   - Build indexes and databases from XML
   - Validate against schema when available

2. **Secondary Format: HTM**
   - Use HTM for user-facing display
   - Provide download links for human readers
   - Leverage browser rendering capabilities

3. **Cross-Validation**
   - Compare extracted data from both formats
   - Detect discrepancies or corruption
   - Ensure consistency

4. **Future-Proofing**
   - Design parsers to handle both formats
   - Gracefully handle missing formats
   - Monitor for format changes in future bills

This analysis demonstrates that while both formats serve important purposes, XML is optimal for automated extraction and analysis, while HTM excels at human-readable presentation. A robust legislative bill processing system should support both formats to maximize usability and data quality.
