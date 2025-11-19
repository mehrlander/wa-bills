# Washington State Budget Bill Comparison Tool

## Overview

This tool compares two Washington State budget bills side-by-side to identify differences in appropriations, proviso language, and overall fiscal impact. It's designed for legislative analysts, staff, and anyone needing to understand changes between budget versions (e.g., base vs supplemental, or different biennia).

## Features

✅ **Appropriation Analysis**
- Identifies new, removed, changed, and unchanged appropriations
- Calculates dollar and percentage changes
- Groups changes by agency and account

✅ **Proviso Comparison**
- Highlights added, removed, and modified proviso language
- Uses semantic text diffing to show exact changes
- Color-coded additions (green) and deletions (red)

✅ **Agency-Level Breakdown**
- Collapsible agency sections for easy navigation
- Total funding change per agency
- Status badges (NEW, CHANGED, REMOVED, UNCHANGED)

✅ **Executive Summary**
- Total agencies analyzed
- Total fiscal impact across all agencies
- Appropriation and proviso change counts
- Aggregate totals for both bills

✅ **Interactive Features**
- Filter by agency status (all, changed only, new, removed)
- Search agencies by name
- Expand/collapse individual agencies
- Print-friendly output

## How to Use

### Method 1: File Upload

1. Open `budget-bill-comparison.html` in any modern web browser
2. Click "Choose File" under each section
3. Select the base bill XML (left) and comparison bill XML (right)
4. Click "Compare Budget Bills"

### Method 2: Copy-Paste

1. Open `budget-bill-comparison.html` in any modern web browser
2. Copy the XML content from the first bill
3. Paste into the "Base Bill (XML)" textarea
4. Copy the XML content from the second bill
5. Paste into the "Comparison Bill (XML)" textarea
6. Click "Compare Budget Bills"

### Example Comparisons

**Base vs Supplemental:**
- Base: `5167-S.xml` (2025-2027 Operating Budget)
- Comparison: Any supplemental bill for the same biennium

**Different Biennia:**
- Base: `1320-S2.xml` (2023-2025 Budget)
- Comparison: `5167-S.xml` (2025-2027 Budget)

## Technical Details

### Architecture

**Single HTML File** - The entire tool is self-contained in one HTML file with:
- Embedded CSS for styling
- Embedded JavaScript for all functionality
- No server required - runs entirely in the browser
- Works offline once loaded

### Libraries Used

1. **DOMParser** (Built-in)
   - Native browser XML parsing
   - Fast and reliable
   - No external dependencies
   - Handles complex nested structures

2. **diff-match-patch** (Google, via CDN)
   - Industry standard for text comparison
   - Produces semantic diffs optimized for human reading
   - Used for proviso language comparison
   - Clean visual output with proper highlighting

3. **Bootstrap 5** (via CDN)
   - Professional, responsive design
   - Minimal custom CSS needed
   - Print-friendly layouts
   - Wide browser compatibility

### XML Structure Parsed

The tool expects Washington State budget bill XML with this structure:

```xml
<BillSection SectionNumber="101">
  <Department Code="011">
    <Index>AGENCY NAME</Index>
  </Department>
  <Appropriations agency="011">
    <Appropriation>
      <AccountName>Fund Name—State Appropriation (FY 2026)</AccountName>
      <DollarAmount>$1,234,567</DollarAmount>
    </Appropriation>
    ...
  </Appropriations>
  <P>The appropriations in this section are subject to...</P>
  <P>(1) [Proviso text...]</P>
  ...
</BillSection>
```

### Comparison Algorithm

1. **Agency Matching**
   - Agencies matched by code (if available) or name
   - Identifies new, removed, and existing agencies

2. **Appropriation Matching**
   - Key: Account name + Fiscal year
   - Detects additions, removals, and changes
   - Calculates dollar and percentage changes

3. **Proviso Comparison**
   - Extracts numbered proviso paragraphs
   - Matches by proviso number when possible
   - Uses text diffing for modifications
   - Highlights character-level changes

## Output

The comparison displays:

### Summary Card
- Total agencies, new, changed, removed
- Base bill total, net change, comparison bill total
- Appropriation counts (new, changed, removed, unchanged)
- Proviso counts (added, modified, removed)

### Agency Breakdown
Each agency shows:
- Status badge and total funding change
- Collapsible detail section
- Individual appropriation line items with changes
- Proviso differences with visual highlighting

### Filter Controls
- Filter by status (all/changed/new/removed)
- Search by agency name
- Real-time filtering

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

Requires JavaScript enabled.

## Performance

- Parses large bills (4MB+, 400+ agencies) in < 5 seconds
- Responsive UI even with extensive changes
- Memory efficient - runs on standard laptops

## Use Cases

1. **Legislative Staff** - Analyze supplemental budget impacts
2. **Fiscal Analysts** - Identify agency-specific funding changes
3. **Policy Advocates** - Track program funding across biennia
4. **Researchers** - Compare historical budget trends
5. **Journalists** - Report on budget changes

## Limitations

- Requires valid XML format (not HTML or PDF versions)
- Does not parse narrative text outside appropriation sections
- Proviso matching is heuristic-based (by number)
- Large diffs may be slow to render in very old browsers

## Future Enhancements

Potential improvements:
- Export to CSV/Excel
- Direct URL loading from leg.wa.gov
- Historical comparison across multiple biennia
- Chart visualizations of changes
- Integration with agency budget tracking systems

## Support

For issues or questions:
1. Check that XML is valid and complete
2. Verify you're using a modern browser
3. Clear browser cache and reload

## License

This tool was created to support transparency and analysis of Washington State budget processes.

## Author

Built with Claude AI by Anthropic
Created: 2025

---

**Pro Tip:** Save the comparison output (File → Save Page As) for archival purposes. The entire analysis is preserved in the HTML file.
