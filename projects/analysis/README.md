# Analysis Projects

**Purpose:** Understand bill structure, document parsing patterns, and create reference implementations for parsing Washington State legislative bills.

## Overview

Analysis projects focus on understanding the structure and patterns in legislative bills to create parsing libraries, comprehensive data models, and documentation. They serve as the foundation for building extraction tools.

**Best For:** Developers building new extraction tools, researchers understanding bill structure.

## Projects

| Project | Output | Status | Description |
|---------|--------|--------|-------------|
| [analyze-bill-patterns-2](./analyze-bill-patterns-2/) | Web + Data | **Recommended** | Production-ready extraction system with optimized performance |
| [analyze-bill-patterns-1](./analyze-bill-patterns-1/) | Web + Data | Stable | Comprehensive extraction with rich interactive demo |
| [analyze-bill-structures](./analyze-bill-structures/) | Documentation | **Recommended** | Best starting point for understanding bill formats |
| [bill-language-analysis-tool](./bill-language-analysis-tool/) | Web Tool | Stable | Lightweight tool for quick language analysis |

## Detailed Descriptions

### analyze-bill-patterns-2 (Recommended)

**Tier 1: Production-Ready**

Production-optimized version with pre-computed aggregates and cross-references. Analyzes 9 bills (6 budget, 3 policy) with $349.9 billion across 271 agencies.

**Key Files:**
- `demo.html` - Enhanced interactive interface with dashboard
- `bills-data.json` - 4.1 MB optimized data
- `extraction-library.js` - Enhanced parsing with aggregations

**Quick Start:**
```bash
# Browse interactively
open demo.html

# Or extract new bills
node extract-all-bills.js
```

### analyze-bill-patterns-1

**Tier 2: Historical Reference**

Comprehensive extraction and analysis system for 10 Washington State bills. Extracts 10,257 appropriations totaling $472.3 billion across 581 agencies. Includes 1,473 RCW references.

**Key Files:**
- `demo.html` - Interactive data explorer
- `bills-data.json` - 8.9 MB of structured data
- `extraction-library.js` - Reusable parsing functions

**Note:** Use `analyze-bill-patterns-2` for new work; this version is kept for historical reference.

### analyze-bill-structures (Recommended)

**Tier 3: Reference Documentation**

Documentation-focused project providing comprehensive guides for parsing both XML and HTM formats. Essential reading before building new tools.

**Key Files:**
- `format-comparison.md` - XML vs HTM format analysis (17 KB)
- `structural-patterns.md` - Parsing patterns guide (17 KB)
- `extraction-library.js` - Format-aware parsing library

**Quick Start:**
```bash
# Read the format comparison first
cat format-comparison.md

# Then study structural patterns
cat structural-patterns.md
```

### bill-language-analysis-tool

**Tier 3: Utility Tool**

Standalone single-file tool for analyzing bill language and terminology. Paste bill text, get instant analysis with visual charts.

**Key Files:**
- `bill-analysis-tool.html` - Single-file analysis tool

**Quick Start:**
```bash
open bill-analysis-tool.html
# Paste bill text and view visualizations
```

## How Projects Relate

```
analyze-bill-structures   →  Understand bill format
        ↓
analyze-bill-patterns-1   →  First extraction implementation
        ↓
analyze-bill-patterns-2   →  Production-optimized extraction
        ↓
bill-language-analysis    →  Quick ad-hoc analysis
```

- **Start with `analyze-bill-structures`** to understand XML/HTM formats before building tools
- **Use `analyze-bill-patterns-2`** for production parsing of new bills
- **Reference `analyze-bill-patterns-1`** to see the evolution of extraction approaches
- **Use `bill-language-analysis-tool`** for quick, no-setup language analysis

## Getting Started

### For Developers
1. Read `analyze-bill-structures/format-comparison.md` to understand bill formats
2. Study `analyze-bill-structures/structural-patterns.md` for parsing patterns
3. Use `analyze-bill-patterns-2/extraction-library.js` as your parsing foundation

### For Researchers
1. Open `analyze-bill-patterns-2/demo.html` in a browser
2. Use the Overview Dashboard to explore bills
3. Try the Advanced Query tab for complex analysis

### For Quick Analysis
1. Open `bill-language-analysis-tool/bill-analysis-tool.html`
2. Paste any bill text
3. View instant terminology analysis

## Technology Stack

| Technology | Used In | Purpose |
|------------|---------|---------|
| Node.js | patterns-1, patterns-2, structures | Server-side parsing |
| Lodash | patterns-1, patterns-2 | Data querying |
| Chart.js | patterns-1, patterns-2, language-tool | Visualizations |
| Vanilla JS | All projects | Browser-based processing |
