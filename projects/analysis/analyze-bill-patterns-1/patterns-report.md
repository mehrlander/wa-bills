# Washington State Bill Structural Patterns Report

**Generated**: 2025-11-19
**Bills Analyzed**: 10 bills (9 XML, 1 HTM-only)

## Executive Summary

This report documents structural patterns, format differences, and parsing implications discovered through analysis of Washington State legislative bills. The analysis covers 10 bills including 7 budget/appropriations bills and 3 policy bills, representing legislation from multiple sessions (2022-2025).

**Key Findings**:
- Total appropriations analyzed: 10,257 ($472.3 billion)
- Unique agencies identified: 581
- RCW references: 1,473
- Fiscal years covered: 1991-2038

## Bill Types and Categorization

### 1. Budget/Appropriations Bills (7 bills)

**Characteristics**:
- Extensive appropriations sections (200-3,600+ appropriations per bill)
- Multiple agencies (40-340 per bill)
- Structured fiscal data with specific accounts and dollar amounts
- Part-based organization (e.g., "PART I - GENERAL GOVERNMENT")
- Heavy use of `<Appropriations>` and `<Department>` tags

**Examples**:
- **ESSB 5167.SL** (Operating Budget 2025-2027): 1,529 appropriations, 339 agencies
- **SSB 5195.SL** (Capital Budget): 3,639 appropriations, 47 agencies
- **ESSB 5200.SL** (Transportation Budget): 3,184 appropriations, 44 agencies

**Budget Bill Structure**:
```xml
<Part>
  <P>PART I</P>
  <P>GENERAL GOVERNMENT</P>
  <BillSection>
    <BillSectionHeader>
      <BillSectionNumber>Sec. 101</BillSectionNumber>
      <Department>
        <Index>HOUSE OF REPRESENTATIVES</Index>
        <DeptName><P>FOR THE HOUSE OF REPRESENTATIVES</P></DeptName>
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
    </Appropriations>
  </BillSection>
</Part>
```

### 2. Policy Bills (3 bills)

**Characteristics**:
- Minimal or no appropriations
- Focus on amendments to existing law
- Heavy use of `amendingStyle="strike"` and `amendingStyle="add"` attributes
- Extensive RCW references
- Section types: `amendatory`, `new`, `repealer`

**Examples**:
- **2SHB 1210.SL**: Replacing "marijuana" with "cannabis" (176 sections, 0 appropriations)
- **SHB 1281.SL**: Technical corrections and obsolete language removal (257 sections)
- **E2SHB 1320.SL**: Modernizing accessibility requirements (172 sections)

**Policy Bill Structure**:
```xml
<BillSection type="amendatory" action="amend">
  <BillSectionHeader>
    <BillSectionNumber>Sec. 2</BillSectionNumber>
    <SectionCite>RCW 9.01.210</SectionCite>
  </BillSectionHeader>
  <P>
    <TextRun amendingStyle="strike">marijuana</TextRun>
    <TextRun amendingStyle="add">cannabis</TextRun>
  </P>
</BillSection>
```

### 3. Mixed Bills (0 in this set)

Some bills may contain both policy changes and appropriations, classified as "mixed" when they have:
- 1-50 appropriations, OR
- 5+ dollar amounts but fewer than 50 appropriations

## Structural Elements Across All Bills

### Common XML Elements (9/9 XML bills)

| Element | Occurrence | Purpose |
|---------|-----------|---------|
| `<CertifiedBill>` | 9/9 | Root element, contains entire bill |
| `<EnrollingCertificate>` | 9/9 | Certification metadata, passage votes |
| `<BillHeading>` | 9/9 | Bill number, sponsors, session info |
| `<BillBody>` | 9/9 | Main content container |
| `<BillTitle>` | 9/9 | Official title and RCW references |
| `<BillSection>` | 9/9 | Individual sections of legislation |
| Tables | 9/9 | Used for appropriations and voting records |
| Amendments markup | 9/9 | Strike/add notation for changes |
| `<EnactedClause>` | 9/9 | Enactment declaration |
| `<History>` | 9/9 | Legislative history references |
| `<Part>` | 8/9 | Organization structure (mainly budget bills) |
| `<Appropriations>` | 6/9 | Fiscal appropriations (budget bills) |

### Certificate Structure (All Bills)

Every certified bill includes:

```xml
<EnrollingCertificate>
  <ChapterLaw year="2022">16</ChapterLaw>
  <SessionLawCaption>OPERATING BUDGET</SessionLawCaption>
  <EffectiveDate>
    <P>May 20, 2025—Except for section 940, which takes effect July 1, 2025.</P>
  </EffectiveDate>
  <Passage>
    <PassedBy chamber="h">
      <PassedDate>February 2, 2022</PassedDate>
      <Yeas>83</Yeas>
      <Nays>13</Nays>
      <Signer>LAURIE JINKINS</Signer>
    </PassedBy>
    <PassedBy chamber="s">
      <PassedDate>March 1, 2022</PassedDate>
      <Yeas>41</Yeas>
      <Nays>8</Nays>
      <Signer>DENNY HECK</Signer>
    </PassedBy>
  </Passage>
</EnrollingCertificate>
```

## XML vs HTM Format Differences

### XML Format (Preferred)

**Advantages**:
- Structured, semantic markup
- Consistent namespace: `xmlns="http://leg.wa.gov/2012/document"`
- Well-defined element hierarchy
- Easy programmatic extraction
- Rich metadata preservation
- Specific tags for appropriations, amendments, sections

**Structure**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<CertifiedBill type="sl" xmlns="http://leg.wa.gov/2012/document">
  <EnrollingCertificate>...</EnrollingCertificate>
  <Bill type="bill">
    <BillHeading>...</BillHeading>
    <BillBody>
      <BillTitle>...</BillTitle>
      <BillSection>...</BillSection>
    </BillBody>
  </Bill>
</CertifiedBill>
```

### HTM Format

**Characteristics**:
- HTML-based presentation format
- Less structured than XML
- Primarily for human reading/printing
- Contains similar content but with HTML styling
- More difficult to parse programmatically

**Limitations**:
- Less semantic structure
- Metadata embedded in presentation
- Requires HTML parsing and content extraction
- Loss of type information (e.g., amendment vs new section)

**Recommendation**: Always prefer XML format when available. Of the 9 bills with both formats, XML provides significantly richer structured data.

## Fiscal Data Patterns

### Appropriation Structure

Budget bills use a highly consistent appropriation structure:

```xml
<Appropriations agency="[agency-code]">
  <Appropriation>
    <AccountName>
      <BudgetP>[Account Name]—[Source] Appropriation (FY YYYY)</BudgetP>
    </AccountName>
    <Leader character="dot" />
    <DollarAmount>$XX,XXX,XXX</DollarAmount>
  </Appropriation>
  <AppropriationTotal>
    <TextRun>TOTAL APPROPRIATION</TextRun>
    <Leader character="dot" />
    <DollarAmount>$XX,XXX,XXX</DollarAmount>
  </AppropriationTotal>
</Appropriations>
```

### Key Fiscal Accounts

Top accounts by total appropriations:

1. **General Fund — Federal Appropriation**: $80.7B (166 appropriations)
2. **Future Biennia (Projected Costs)**: $63.5B (2,110 appropriations)
3. **General Fund — State Appropriation (FY 2025)**: $56.3B (284 appropriations)
4. **General Fund — State Appropriation (FY 2024)**: $43.5B (274 appropriations)
5. **General Fund — State Appropriation (FY 2027)**: $36.7B (159 appropriations)

### Fiscal Year References

Bills reference fiscal years from **1991 to 2038**, indicating:
- Historical spending references
- Current biennium appropriations
- Future projected costs
- Long-term financial planning

## Agency and Department Patterns

### Agency Identification

Agencies appear in two primary ways:

1. **Department tag** (Budget bills):
```xml
<Department>
  <Index>DEPARTMENT OF SOCIAL AND HEALTH SERVICES</Index>
  <DeptName><P>FOR THE DEPARTMENT OF SOCIAL AND HEALTH SERVICES</P></DeptName>
</Department>
```

2. **Within text** (Policy bills):
Referenced in section content when amending agency-related RCWs

### Top Agencies by Frequency

All budget bills reference these agencies:
- Office of Financial Management (6 bills)
- Department of Social and Health Services (6 bills)
- Department of Health (6 bills)
- Department of Corrections (6 bills)
- Military Department (6 bills)
- Department of Enterprise Services (6 bills)

Total unique agencies: **581**

## Amendment Patterns (Policy Bills)

### Amendment Markup

Policy bills use specific styling to show changes:

```xml
<TextRun amendingStyle="strike">old text</TextRun>
<TextRun amendingStyle="add">new text</TextRun>
```

**Statistics**:
- Bill 1210: Primarily find-replace amendments (marijuana → cannabis)
- Bill 1281: Technical corrections throughout RCW
- Bill 1320: Substantive policy amendments

### RCW Reference Patterns

Format: `RCW [title].[chapter].[section]`

Examples:
- `RCW 9.01.210` (single section)
- `RCW 69.50.101` (definitions)
- `RCW 28B.76.525` (higher education)

Total unique RCW references: **1,473**

## Section Type Patterns

### Budget Bill Section Types

1. **`type="new"`**: New appropriations or provisos
2. **Unnumbered sections**: Definitions and general provisions

### Policy Bill Section Types

1. **`type="amendatory" action="amend"`**: Amending existing RCW
2. **`type="new"`**: Creating new sections
3. **`type="repealer"`**: Repealing existing sections
4. **Reenactment sections**: Re-enacting with amendments

## Parsing Challenges and Solutions

### Challenge 1: Large File Sizes

**Issue**: Bills range from 1MB to 3.6MB
**Solution**: Stream-based or chunk-based parsing, regex for targeted extraction

### Challenge 2: Nested Structures

**Issue**: Deep nesting in XML (especially appropriations)
**Solution**: Recursive descent parsing or specialized regex patterns

### Challenge 3: Format Variations

**Issue**: Both XML and HTM formats with different structures
**Solution**: Auto-detection based on content, format-specific extractors

### Challenge 4: Text Formatting

**Issue**: Encoded entities, embedded formatting tags
**Solution**: `stripTags()` utility function for clean text extraction

### Challenge 5: Duplicate Data

**Issue**: Same bill in multiple formats
**Solution**: Prefer XML, track processed bill numbers, skip HTM duplicates

## Structural Variations and Edge Cases

### Vetoes

Some bills contain vetoed sections:

```xml
<BillSection type="new" veto="line">
  <!-- Vetoed content -->
</BillSection>
```

Or veto actions in certificate:
```xml
<VetoAction>(partial veto)</VetoAction>
```

### Multiple Effective Dates

Budget bills often have staggered effective dates:

```
June 9, 2022—Except for sections 7, 51, and 116, which take effect July 1, 2022;
sections 5, 9, 86, and 88, which take effect July 1, 2023...
```

### Proviso Language

Budget bills include detailed conditions:

```xml
<P>The appropriations in this section are subject to the following conditions
and limitations:</P>
<P>(1) $400,000 of the performance audits of government account—state
appropriation is for...</P>
```

### Future and Prior Biennia

Capital budget bills include historical and projected costs:

```xml
<Appropriation>
  <AccountName>
    <BudgetP>Prior Biennia (Expenditures)</BudgetP>
  </AccountName>
  <DollarAmount>$X,XXX,XXX</DollarAmount>
</Appropriation>
<Appropriation>
  <AccountName>
    <BudgetP>Future Biennia (Projected Costs)</BudgetP>
  </AccountName>
  <DollarAmount>$XX,XXX,XXX</DollarAmount>
</Appropriation>
```

## Recommendations for Future Parsing

### 1. Format Preference

Always use XML format when available:
- More reliable structure
- Better metadata
- Easier programmatic access
- Format-specific semantics

### 2. Extraction Strategy

**For Budget Bills**:
1. Extract appropriations by agency
2. Parse structured dollar amounts
3. Identify fiscal years
4. Extract provisos and conditions
5. Track parts and organizational structure

**For Policy Bills**:
1. Focus on RCW references
2. Extract amendment markup (strike/add)
3. Identify section types
4. Track affected statutes

### 3. Validation

Validate extracted data:
- Cross-reference bill numbers
- Verify total appropriations match `<AppropriationTotal>`
- Check agency codes consistency
- Validate fiscal year ranges

### 4. Performance

For large-scale processing:
- Use streaming XML parsers (SAX-style)
- Index by bill number for quick lookup
- Cache parsed results
- Parallelize bill processing

### 5. Future-Proofing

The extraction library is designed to handle:
- New bill types with similar structures
- Additional fiscal years
- New agencies and departments
- Structural variations within existing patterns

## Data Quality and Completeness

### Coverage

| Data Type | Coverage | Notes |
|-----------|----------|-------|
| Bill metadata | 100% | All bills have number, title, session |
| Appropriations | 100% | All budget bills fully extracted |
| Agencies | ~95% | Some agencies may appear only in text |
| RCW references | ~90% | Pattern-based extraction |
| Fiscal years | 100% | All FY references captured |
| Amendments | 100% | All strike/add markup captured |

### Known Limitations

1. **HTM-only bills** (1 bill): Limited structure, primarily text-based extraction
2. **Embedded tables**: Complex table structures may need special handling
3. **Footnotes and annotations**: May not be fully captured in structured data
4. **Cross-references**: Bill-to-bill references not automatically linked

## Conclusion

Washington State bills follow highly consistent structural patterns, especially in XML format:

- **Budget bills** are characterized by extensive appropriations, agency-based organization, and part-based structure
- **Policy bills** focus on RCW amendments with detailed strike/add markup
- **XML format** is vastly superior for programmatic extraction
- The data is rich, well-structured, and suitable for comprehensive analysis

The extraction library and generated datasets provide a foundation for:
- Budget analysis and tracking
- Policy change identification
- Agency workload analysis
- Fiscal year projections
- Legislative pattern recognition

All tools are designed to work with future WA bills following similar formats, making this a sustainable approach for ongoing legislative analysis.
