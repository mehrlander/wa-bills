# Viewer Projects

**Purpose:** Interactive web interfaces for exploring Washington State budget bills without writing code. Standalone HTML tools with parsing, filtering, searching, and visualization.

## Overview

Viewer projects are browser-based tools that require no installation. Simply open the HTML file and start exploring. They're designed for non-technical users, quick exploration, legislative staff, and journalists.

**Best For:** Non-technical users, quick exploration, legislative staff, journalists.

## Projects

| Project | Output | Status | Description |
|---------|--------|--------|-------------|
| [budget-bill-comparison](./budget-bill-comparison/) | Web Tool | **Recommended** | Side-by-side budget version comparison |
| [proviso-search-tool](./proviso-search-tool/) | Web Tool | **Recommended** | Full-text proviso search with categorization |
| [legislative-diff-viewer](./legislative-diff-viewer/) | Web Tool | Stable | Multi-mode text comparison (2-way, 3-way, timeline) |
| [xml-bill-inspector](./xml-bill-inspector/) | Web Tool | **Recommended** | Interactive XML structure analysis |

**Redundancy Level:** Low - Each viewer has a distinct purpose.

## Detailed Descriptions

### budget-bill-comparison (Recommended)

**Tier 1: Production-Ready**

The best tool for comparing budget versions and tracking changes. Side-by-side comparison with fiscal impact analysis.

**Features:**
- Upload two XML bill files or paste content
- Identifies new, removed, changed, and unchanged appropriations
- Dollar and percentage change calculations
- Proviso changes with semantic text diffing
- Agency-level breakdown
- Executive summary (total agencies, fiscal impact, change counts)
- Print/save as HTML

**Key Files:**
- `budget-bill-comparison.html` - Complete interface (1,191 lines)

**Quick Start:**
```bash
open budget-bill-comparison.html
# 1. Upload or paste two XML bill files
# 2. Click "Compare Budget Bills"
# 3. Filter by agency status, search by name
```

**Use Cases:**
- Compare proposed vs enacted budgets
- Track changes between biennial and supplemental budgets
- Analyze fiscal impact of amendments

### proviso-search-tool (Recommended)

**Tier 1: Production-Ready**

The most useful tool for finding specific provisions quickly. Powerful full-text search with auto-categorization.

**Features:**
- Real-time keyword search with highlighting
- Auto-categorization into 14+ categories:
  - FTE Restrictions
  - Reporting Requirements
  - IT Spending
  - Pilot Programs
  - Funding Distribution
  - And more...
- Agency and category filtering
- Rich context display with section numbers and dollar amounts
- Export via browser print/PDF

**Key Files:**
- `proviso-search.html` - Full-text search interface (874 lines)

**Quick Start:**
```bash
open proviso-search.html
# 1. Paste budget bill XML
# 2. Click "Parse Provisos"
# 3. Search by keyword, filter by agency/category
```

**Use Cases:**
- Find all reporting requirements
- Locate pilot program restrictions
- Search for specific agency conditions

### legislative-diff-viewer

**Tier 2: Advanced Tool**

The most sophisticated text comparison tool. Three comparison modes for different use cases.

**Features:**
- **Two-Way Diff:** Side-by-side comparison
- **Three-Way Merge:** House/Senate/Base comparison
- **Timeline Mode:** Track multiple versions
- Color-coded changes
- Statistics dashboard
- Annotation mode
- Highlight modes
- Dark mode
- Synchronized scrolling
- PDF export

**Key Files:**
- `legislative-diff-viewer.html` - Multi-mode comparison tool (1,208 lines)

**Quick Start:**
```bash
open legislative-diff-viewer.html
# 1. Select comparison mode
# 2. Paste legislative text
# 3. View automatic diff computation
# 4. Add annotations, export to PDF
```

**Use Cases:**
- Track bill amendments through legislative process
- Compare House and Senate versions
- Document changes across multiple drafts

### xml-bill-inspector (Recommended)

**Tier 3: Developer Tool**

Essential for understanding XML structure before building parsers. Interactive tree view with schema inference.

**Features:**
- Drag-and-drop XML upload
- Expandable tree view
- Node statistics (element counts, nesting depth)
- XPath display and copying
- Schema inference
- Element frequency analysis
- Hierarchy pattern detection
- Text content extraction

**Key Files:**
- `xml-bill-inspector.html` - Structure analysis tool (979 lines)

**Quick Start:**
```bash
open xml-bill-inspector.html
# 1. Drag-and-drop XML file
# 2. Explore interactive tree
# 3. View statistics and schema inference
# 4. Copy XPath for selected elements
```

**Use Cases:**
- Explore bill XML structure before writing parsers
- Debug extraction scripts
- Understand element hierarchy and patterns

## How Projects Relate

```
xml-bill-inspector         →  Understand bill structure
        ↓
proviso-search-tool        →  Find specific provisions
        ↓
budget-bill-comparison     →  Compare bill versions
        ↓
legislative-diff-viewer    →  Track changes over time
```

**Workflow example:**
1. Use **xml-bill-inspector** to understand a new bill's structure
2. Use **proviso-search-tool** to find specific requirements
3. Use **budget-bill-comparison** to see what changed from previous budget
4. Use **legislative-diff-viewer** to track amendments through the process

## Getting Started

### For Non-Technical Users
All tools work the same way:
1. Open the HTML file in any browser (Chrome, Firefox, Safari, Edge)
2. No installation required
3. Works completely offline once loaded
4. Data never leaves your computer

### Quick Tool Selection Guide

| I want to... | Use this tool |
|--------------|---------------|
| Compare two budget versions | `budget-bill-comparison.html` |
| Find a specific proviso | `proviso-search.html` |
| Track amendments over time | `legislative-diff-viewer.html` |
| Understand XML structure | `xml-bill-inspector.html` |

### For Legislative Staff
1. **budget-bill-comparison** - Compare proposed vs enacted budgets
2. **proviso-search-tool** - Find agency-specific requirements

### For Journalists
1. **budget-bill-comparison** - Identify what changed in the budget
2. **proviso-search-tool** - Find newsworthy provisions

### For Developers
1. **xml-bill-inspector** - Understand bill structure before coding
2. Use other viewers as reference implementations

## Technology Stack

All viewers use client-side technologies only (no server required):

| Technology | Used In | Purpose |
|------------|---------|---------|
| Vanilla JavaScript | comparison, search, inspector | Core functionality |
| DOMParser | comparison, search, inspector | XML parsing in browser |
| diff-match-patch | diff-viewer | Text comparison |
| Bootstrap 5 | comparison | Responsive UI |
| Tailwind CSS | some viewers | Styling |

## Browser Compatibility

All tools work in modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

No Internet Explorer support.
