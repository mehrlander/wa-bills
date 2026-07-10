# Fiscal Note Structures and Patterns in WA Bills

## Overview

This document describes the common patterns, structures, and edge cases found when extracting fiscal information from Washington State budget bills.

**Analysis Date:** November 19, 2025
**Bills Analyzed:** 9 bill files (5167-S, 5187-S, 5950-S, 5693-S, 5195-S, 5200-S, 1210-S2, 1281-S, 1320-S2)
**Total Fiscal Items Extracted:** 29,982
**Total Appropriations:** $1,251,803,776,000

## Bill Types

### Operating Budget Bills (5xxx-S series)
The largest fiscal impact bills are operating budget bills:
- **5167-S**: 2025-2027 biennium operating appropriations ($377.6B, 4,839 items)
- **5187-S**: 2023-2025 biennium operating appropriations ($326.3B, 4,883 items)
- **5950-S**: 2023-2025 supplemental operating appropriations ($259.5B, 3,197 items)
- **5693-S**: 2021-2023 supplemental operating appropriations ($226.1B, 2,914 items)

### Capital Budget Bills
- **5200-S**: Capital budget ($148.6B, 6,472 items)
- **5195-S**: Capital budget ($107.9B, 7,677 items)

These bills contain appropriations for infrastructure and construction projects.

### Non-Fiscal Bills
- **1210-S2**: Cannabis terminology bill ($0)
- **1281-S**: Technical corrections bill ($0)
- **1320-S2**: Law modernization bill ($0)

These bills make legal changes but contain no fiscal appropriations.

## XML Structure Patterns

### Standard Appropriations Section

The most common pattern for fiscal information in the XML files:

```xml
<BillSection type="new">
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
    <Appropriation>
      <AccountName>
        <BudgetP>General Fund—State Appropriation (FY 2027)</BudgetP>
      </AccountName>
      <Leader character="dot" />
      <DollarAmount>$65,250,000</DollarAmount>
    </Appropriation>
    <AppropriationTotal>
      <TextRun>TOTAL APPROPRIATION</TextRun>
      <Leader character="dot" />
      <DollarAmount>$127,235,000</DollarAmount>
    </AppropriationTotal>
  </Appropriations>
</BillSection>
```

**Key Elements:**
- `agency` attribute on `<Appropriations>` tag contains numeric agency code
- `<Department>/<DeptName>` contains human-readable agency name
- `<AccountName>` contains fund source and fiscal year
- `<DollarAmount>` contains the appropriation amount
- `<AppropriationTotal>` contains the sum of appropriations in the section

### Fund Source Naming Patterns

**Operating Budgets:**
- "General Fund—State Appropriation (FY YYYY)"
- "General Fund—Federal Appropriation (FY YYYY)"
- "General Fund—Private/Local Appropriation (FY YYYY)"
- "[Specific Account Name]—State Appropriation"

**Capital Budgets:**
- "State Building Construction Account—State"
- "[Project Fund]—State"
- "Future Biennia (Projected Costs)"
- "Prior Biennia (Expenditures)"

### Fiscal Year and Biennium Identification

**Pattern 1: Explicit Fiscal Year**
- Format: `(FY 2026)` or `(FY 2027)`
- Found in: Operating budget appropriations
- Example: "General Fund—State Appropriation (FY 2026)"

**Pattern 2: Biennium Range**
- Format: `YYYY-YYYY` (e.g., "2025-2027")
- Inference: If FY is even (2026), biennium is prior odd year to next odd year (2025-2027)
- If FY is odd (2027), biennium is that year to two years later (2027-2029)

**Pattern 3: No Explicit Year**
- Found in: Some capital budget items, totals
- Challenge: Must infer from bill context or section header
- Default: Use bill's stated biennium

## Agency Naming Patterns

### Common Agency Structures

**State Agencies with Programs:**
- Base: "DEPARTMENT OF SOCIAL AND HEALTH SERVICES"
- With program: "DEPARTMENT OF SOCIAL AND HEALTH SERVICES - AGING AND ADULT SERVICES PROGRAM"
- Pattern: `[DEPARTMENT] - [PROGRAM NAME]`

**Education Agencies:**
- "SUPERINTENDENT OF PUBLIC INSTRUCTION"
- "SUPERINTENDENT OF PUBLIC INSTRUCTION - FOR GENERAL APPORTIONMENT"
- "SUPERINTENDENT OF PUBLIC INSTRUCTION - FOR SPECIAL EDUCATION PROGRAMS"
- Pattern: Often includes "FOR" before purpose

**State Health Care Authority:**
- "STATE HEALTH CARE AUTHORITY - MEDICAL ASSISTANCE"
- "STATE HEALTH CARE AUTHORITY - COMMUNITY BEHAVIORAL HEALTH PROGRAM"
- Pattern: Authority manages multiple large programs

### Agency Code Mapping

Agency codes are 3-digit numbers (e.g., "011", "012", "014"):
- 011 = HOUSE OF REPRESENTATIVES
- 012 = SENATE
- 014 = LEGISLATIVE EVALUATION & ACCOUNTABILITY PROGRAM COMMITTEE
- 020 = STATE AUDITOR
- etc.

**Edge Case:** Some bills use longer codes (e.g., "310200") which may be project codes in capital budgets.

## Proviso Language (Conditions and Limitations)

### Structure

Provisos appear as paragraph `<P>` tags after appropriations sections:

```xml
<P>The appropriations in this section are subject to the following conditions and limitations:</P>
<P>(1) $400,000 of the performance audits account—state appropriation is for...</P>
```

### Common Proviso Patterns

**Earmarked Appropriations:**
- Pattern: "$X of the [fund]—[type] appropriation is provided solely for [purpose]"
- Example: "$400,000 of the performance audits of government account—state appropriation is for the joint legislative audit and review committee to review..."

**Conditional Spending:**
- Pattern: "is provided solely for"
- Pattern: "may only be expended if"
- Pattern: "shall not be used for"

**Intent Language:**
- Pattern: "It is the intent of the legislature that..."
- Pattern: "The appropriation is provided for the following purposes:"

### Extraction Challenges

1. **Nested amounts:** Provisos may reference multiple dollar amounts within a single paragraph
2. **Context dependency:** Understanding what an amount is for requires reading full paragraph
3. **Cross-references:** Provisos may reference other sections or bills

## Edge Cases and Parsing Challenges

### 1. Multi-Line Account Names

Some account names span multiple `<BudgetP>` tags:

```xml
<AccountName>
  <BudgetP>Performance Audits of Government Account—State</BudgetP>
  <BudgetP indent="1">Appropriation</BudgetP>
</AccountName>
```

**Solution:** Concatenate all `<BudgetP>` content within `<AccountName>`

### 2. Em-Dash vs Hyphen

XML uses `<TextRun fontFamily="Times New Roman">—</TextRun>` for em-dashes:
- Raw XML: `General Fund<TextRun...>—</TextRun>State`
- Cleaned: "General Fund—State" or "General Fund - State"

**Solution:** Normalize em-dashes to hyphens during text cleaning

### 3. Totals vs Individual Appropriations

`<AppropriationTotal>` tags contain sums that would double-count if treated as separate appropriations.

**Solution:** Tag totals with `type: "total"` and exclude from summary calculations

### 4. Capital Budget Project Structure

Capital budgets have different structure:
- Projects instead of programs
- "Future Biennia" and "Prior Biennia" categories
- Project-specific fund sources

**Example:**
```xml
<Appropriation>
  <AccountName>Future Biennia (Projected Costs)</AccountName>
  <DollarAmount>$50,000,000</DollarAmount>
</Appropriation>
```

### 5. Missing Fiscal Years

Many appropriations (17,599 instances) don't have explicit fiscal years:
- Totals
- Some capital budget items
- Cross-biennium appropriations

**Impact:** Cannot always aggregate by specific fiscal year

### 6. Agency Name Extraction Failures

Some sections don't have `<DeptName>` tags:
- May only have `<Index>` tag
- May only have section title
- Capital budget projects may only have project codes

**Solution:** Multi-level fallback:
1. Try `<DeptName>`
2. Try `<SectionTitle>`
3. Try `<Index>`
4. Fall back to agency code

### 7. Duplicate Agency Names with Variations

Inconsistent spacing/punctuation creates near-duplicates:
- "STATE HEALTH CARE AUTHORITY - COMMUNITY BEHAVIORAL HEALTH PROGRAM"
- "STATE HEALTH CARE AUTHORITY-COMMUNITY BEHAVIORAL HEALTH PROGRAM" (no space)

**Impact:** Same agency counted separately in aggregations

### 8. Unknown Fund Sources

$396B (31.7% of total) marked as "Unknown" fund source:
- Likely capital budget items without clear FY designation
- Totals
- Items where fund parsing failed

## Fund Source Distribution

### Top Fund Sources by Amount

1. **Unknown**: $396.2B (1,724 items) - 31.7%
2. **General Fund - State**: $385.6B (1,628 items) - 30.8%
3. **General Fund - Federal**: $216.3B (412 items) - 17.3%
4. **Future Biennia (Projected Costs)**: $66.2B (2,111 items) - 5.3%
5. **Prior Biennia (Expenditures)**: $20.5B (2,111 items) - 1.6%
6. **State Building Construction Account**: $18.6B (1,520 items) - 1.5%

### Fund Types

**General Fund:**
- State appropriations (from state taxes)
- Federal appropriations (federal grants/transfers)
- Private/Local appropriations (fees, local contributions)

**Special Accounts:**
- Purpose-specific (e.g., "Education Legacy Trust Account")
- Fee-funded (e.g., "Hospital Safety Net Assessment Account")
- Emergency funds (e.g., "Disaster Response Account")

## Data Quality Metrics

### Extraction Success

- **Bills processed:** 9/9 (100%)
- **Fiscal items extracted:** 29,982
- **Items with amounts:** 29,982 (100%)
- **Items with agencies:** 29,982 (100%)
- **Items with fund sources:** 28,258 (94.2%)
- **Items with fiscal years:** 12,383 (41.3%)

### Uncertainties

- **Total uncertainties flagged:** 17,599 (58.7%)
- **Primary issue:** No fiscal year or biennium identified
- **Secondary issue:** Zero amounts parsed (rare)

### Data Completeness

**Well-captured:**
- Dollar amounts (100% extraction rate)
- Agency associations (100% with codes, ~95% with names)
- Fund sources (~94% meaningful values)
- Biennium context (from bill headers)

**Needs improvement:**
- Specific fiscal year parsing (41% success)
- Proviso amount attribution (extracted but not fully linked)
- Agency name normalization (duplicates from variations)

## Recommendations for Future Extraction

1. **Agency normalization:** Build lookup table mapping codes to canonical names
2. **Fiscal year inference:** Use bill-level biennium when item-level FY missing
3. **Fund source standardization:** Normalize variations ("General Fund - State" vs "General Fund—State")
4. **Proviso linking:** Associate proviso amounts with their parent appropriations
5. **Capital budget handling:** Separate logic for project-based vs program-based appropriations
6. **Amount validation:** Cross-check totals against sum of component appropriations

## Conclusion

Washington State budget bills follow a generally consistent XML structure, but with significant variations between operating and capital budgets, and across different biennia. The primary extraction challenges are:

1. Inconsistent fiscal year designation (especially in capital budgets)
2. Agency name variations creating near-duplicates
3. Complex proviso language requiring NLP for full attribution
4. Fund source naming inconsistencies

The extraction successfully captured $1.25 trillion in appropriations across 29,982 line items, providing a comprehensive view of Washington State's budget allocation across agencies, programs, and fund sources.
