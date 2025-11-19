# Washington Budget Bill Proviso Search Tool

A powerful, framework-free web application built with custom web components for extracting, searching, and analyzing proviso sections from Washington State budget bill XML files.

## Features

### Core Functionality
- **XML Parsing**: Extracts all proviso sections from budget bill XML with full metadata
- **Full-Text Search**: Search across all proviso text and agency names with real-time highlighting
- **Auto-Categorization**: Automatically categorizes provisos into 14+ categories:
  - FTE Restrictions
  - Reporting Requirements
  - IT Spending
  - Pilot Programs
  - Implementation
  - Grants
  - Studies
  - Lapse Provisions
  - Bill Contingencies
  - Funding Distribution
  - Contracts
  - Compliance
  - Training
  - Infrastructure

### Advanced Filtering
- **Agency Filter**: Filter by specific agency or department
- **Category Filter**: Filter by auto-detected categories
- **Keyword Filter**: Additional keyword-based filtering
- **Multi-Filter Support**: Combine filters for precise results

### Rich Context
Each proviso displays:
- Section number and agency
- Extracted dollar amounts
- Total appropriation for the section
- Auto-detected categories
- Mentioned agencies within proviso text
- Link back to parent appropriation section

### User Experience
- Clean, modern UI with responsive design
- Real-time search with highlighted matches
- Statistics dashboard (total provisos, agencies, categories)
- Zero dependencies (pure vanilla JavaScript)
- Single HTML file - easy to deploy and share

## How to Use

### Option 1: Open Directly in Browser
1. Open `proviso-search.html` in any modern web browser
2. Copy the contents of any budget bill XML file (e.g., `5167-S.xml`)
3. Paste the XML into the text area
4. Click "Parse Provisos"
5. Use the search and filter controls to explore

### Option 2: Using Local Server
```bash
# In the wa-bills directory
python3 -m http.server 8000

# Open in browser:
# http://localhost:8000/proviso-search.html
```

## Quick Test

To quickly test the tool with sample data:

1. Open `proviso-search.html` in your browser
2. Open `5167-S.xml` in a text editor
3. Copy all XML content (Ctrl+A, Ctrl+C)
4. Paste into the tool's text area
5. Click "Parse Provisos"

The tool should extract hundreds of provisos from the operating budget bill.

## Example Searches

Try these searches to explore the tool's capabilities:

- **"IT"** - Find all IT-related provisos
- **"report"** - Find reporting requirements
- **"provided solely"** - Find restrictive funding provisions
- **"implementation of"** - Find bill implementation provisos
- **"$1,000,000"** - Find provisos with specific dollar amounts
- **"department of children"** - Find provisos related to DCYF

## Example Filters

Combine filters for powerful analysis:

1. **Agency**: "FOR THE ADMINISTRATOR FOR THE COURTS"
   **Category**: "Implementation"
   → Shows all implementation provisos for courts

2. **Category**: "IT Spending"
   **Keyword**: "system"
   → Shows all IT system-related provisos

3. **Search**: "grant"
   **Category**: "Grants"
   → Shows all grant funding provisos

## Technical Architecture

### Custom Web Components

**`<xml-uploader>`**
- Handles XML input and parsing
- Validates XML structure
- Extracts provisos with metadata
- Manages parsing state and error handling

**`<proviso-search>`**
- Main search and filter interface
- Real-time filter updates
- Results rendering with highlighting
- Statistics dashboard

### State Management
- Centralized `ProvisoStore` using observer pattern
- Reactive updates across all components
- Efficient filtering with multiple criteria

### Parser Features
- DOM-based XML parsing
- Intelligent proviso detection
- Recursive text extraction preserving structure
- Pattern-based categorization
- Dollar amount extraction
- Agency name extraction

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## File Structure

```
proviso-search.html          # Complete standalone tool
README-PROVISO-SEARCH.md    # This file
*.xml                        # Sample budget bill XML files
```

## Development Notes

The tool is built using:
- **Custom Elements API** for web components
- **Shadow DOM** avoided for simplicity
- **Zero framework dependencies**
- **Pure vanilla JavaScript**
- **CSS Grid and Flexbox** for responsive layout
- **DOMParser** for XML processing

## Sample XML Files in Repository

- `5167-S.xml` - Operating Budget (recommended for testing)
- `5187-S.xml` - Transportation Budget
- `1320-S2.xml` - Capital Budget
- And others...

## Tips for Best Results

1. **Large Files**: The tool handles large XML files (several MB) efficiently
2. **Search Performance**: Real-time search is optimized for hundreds of provisos
3. **Filtering**: Use multiple filters together for targeted analysis
4. **Highlighting**: Search terms are highlighted in yellow for easy scanning
5. **Export**: Use browser print/PDF to save filtered results

## Common Use Cases

### For Budget Analysts
- Quickly find all provisos related to specific agencies
- Identify reporting requirements across budget
- Track IT spending provisos
- Find pilot programs and studies

### For Legislative Staff
- Search for provisos mentioning specific bills
- Find lapse provisions and contingencies
- Track grant funding distributions
- Identify compliance requirements

### For Agency Staff
- Find all provisos affecting your agency
- Identify reporting deadlines
- Track funding restrictions
- Review implementation requirements

## Future Enhancements (Not Implemented)

Potential additions could include:
- Export to CSV/JSON
- Save/load filter configurations
- Proviso comparison across bills
- Timeline visualization
- PDF generation
- Bookmark favorite provisos

## License

This tool is provided as-is for use in analyzing Washington State budget bills.

## Support

For issues or questions, refer to the source code comments or the inline documentation.
