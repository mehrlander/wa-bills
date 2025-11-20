# Washington State Bills Analysis

A collection of tools, scripts, and data for analyzing Washington State budget and policy bills.

## What This Repository Actually Contains

This repository is a **research and exploration workspace** containing 26+ distinct projects created over time to analyze Washington State legislative bills from different angles. It's a hodgepodge - and that's okay! Each project represents a different approach, question, or experiment.

### Current Contents

**📁 bills/** - Raw bill documents (10 bills in XML/HTM format)
- Operating budgets (SB-5092, SB-5167, SB-5187, SB-5950, SB-5693)
- Capital budgets (SB-5195, SB-5200)
- Policy bills (HB-1210, HB-1281, HB-1320)

**📁 projects/** - 26 analysis projects organized by category:
- **Analysis** (4 projects) - Understanding bill structure and patterns
- **Data Extraction** (11 projects) - Extracting structured data from specific bills
- **Database** (2 projects) - Normalized database schemas and automation
- **Specialized** (5 projects) - Targeted analysis (agencies, statutory references, timelines)
- **Viewers** (4 projects) - Interactive web-based exploration tools

**📄 Root directory files** - Metadata database scripts and schema documentation
- Tools to catalog and query bill metadata across 27+ historical bills
- Content schema design for parsing appropriations (not yet implemented)
- Database scripts exist but database hasn't been initialized

## Quick Start: What Can I Do Here?

### If you want to explore bills visually (no coding):

**Interactive web tools** (just open in browser):
- `projects/viewers/budget-bill-comparison/budget-bill-comparison.html` - Compare two budget bills side-by-side
- `projects/viewers/proviso-search-tool/proviso-search.html` - Search proviso language across bills
- `projects/specialized/budget-appropriations-explorer/budget-explorer.html` - Paste XML, explore interactively

### If you want structured data:

**Pre-extracted data** available in various projects:
- `projects/analysis/analyze-bill-patterns-2/` - 9 bills, $349.9B, 7,763 appropriations (production-ready)
- `projects/data-extraction/extract-bill-provisos/` - 11,986 provisos from 6 bills across 3 biennia
- `projects/specialized/appropriations-timeline/` - $1.25T in appropriations tracking over time

### If you want to build something:

**Reference implementations and libraries**:
- `projects/analysis/analyze-bill-structures/` - Documentation on bill structure and parsing patterns
- `projects/database/wa-budget-automation/` - SQLite database automation for budget bills
- See `PROJECT_INVENTORY.md` for complete catalog of all 26 projects

## Repository Organization

The root directory contains files from the `wa-budget-bills-database` project, which provides:

**Metadata Database System** (designed but not yet populated):
```bash
npm install
npm run init-db    # Would create database with metadata for 27 historical bills
npm run query list # Query tool for bill metadata
```

**Schema Documentation**:
- `DATABASE.md` - Metadata database documentation
- `CONTENT-SCHEMA.md` - Content parsing schema design
- `SCHEMA-DIAGRAM.md` - Entity relationship diagrams

**Note**: The metadata database scripts exist but `wa-budget-bills.db` hasn't been created yet. Run `npm run init-db` to initialize it.

## Understanding the Project Landscape

### Best Starting Points

**For Researchers/Analysts:**
- Start with `PROJECT_INVENTORY.md` - comprehensive guide to all 26 projects
- Best polished project: `projects/analysis/analyze-bill-patterns-2/`
- Best historical data: `projects/database/wa-budget-bills-database/`

**For Developers:**
- Read `projects/analysis/analyze-bill-structures/` to understand bill formats
- Study `projects/analysis/analyze-bill-patterns-2/extraction-library.js` for parsing patterns
- Check `projects/database/wa-budget-automation/` for SQL database approach

**For Non-Technical Users:**
- Use the viewer tools in `projects/viewers/` - no installation needed
- `budget-bill-comparison.html` is particularly useful for comparing budget versions

### Project Redundancy

Many of the data extraction projects (`bill-extraction-tools-1` through `bill-data-extraction-tools-3`) follow similar patterns but analyze different bills. This redundancy exists because:
1. Each project was created to answer specific questions about specific bills
2. They serve as examples of different extraction approaches
3. They collectively cover a range of bill types (operating, capital, supplemental, policy)

See `PROJECT_INVENTORY.md` section "Redundancy Assessment" for detailed analysis.

## What Works vs What's Planned

### ✅ Working Now

- 10 bill files available in `bills/` directory
- 26+ projects with working code and interactive demos
- Multiple viewer tools ready to use immediately
- Extraction libraries and parsing examples
- Comprehensive documentation

### 📐 Designed But Not Implemented

- Root-level metadata database (scripts exist, not initialized)
- Content parsing automation (schema designed in `content-schema.sql`)
- Cross-biennium analysis tools (partially implemented in some projects)
- Unified extraction tool (each project currently standalone)

### 🚧 Partially Implemented

- Database projects have 1-2 bills parsed, not full historical catalog
- Some viewer tools require local web server for large files
- Documentation scattered across projects

## Possible Next Steps

Based on what's here, here are some logical directions:

### Consolidation & Usability (High Value)
1. **Create unified extraction tool** - Combine best patterns from existing projects
2. **Initialize the metadata database** - Run `npm run init-db` and populate with all available bills
3. **Create landing page** - Single HTML file linking to all viewer tools
4. **Document quick-start workflows** - "I want to..." guide for common tasks

### Enhanced Analysis (Medium Value)
5. **Complete database automation** - Extend `wa-budget-automation` to parse all available bills
6. **Cross-biennium comparison** - Build on `appropriations-timeline` project
7. **Proviso evolution tracking** - Track how specific provisos change over time
8. **Agency relationship mapping** - Enhance `map-agencies-programs` with temporal analysis

### Public Access (Medium-Long Term)
9. **Deploy viewer tools** - Host on GitHub Pages (all are standalone HTML)
10. **Create data API** - RESTful API serving extracted data
11. **Build public data portal** - Searchable interface for non-technical users

See `PROJECT_INVENTORY.md` "Recommended Next Steps" section for detailed roadmap.

## Technical Notes

**Bill Documents:**
- Operating budgets: 500-1400 pages, highly structured
- Available in XML (structured) and HTM (formatted) versions
- Structure varies somewhat across biennia

**Technology Stack:**
- Node.js for most parsing/extraction
- Python for specialized analysis (2 projects)
- Vanilla JavaScript for browser-based viewers
- SQLite for database projects
- No external dependencies for viewer tools

**Data Quality:**
- Bill files are official legislature documents
- Extraction accuracy varies by project (most 95%+)
- Some edge cases and variations not fully handled

## Data Sources

- Washington State Legislature (leg.wa.gov)
- Washington State Fiscal Information (fiscal.wa.gov)
- Office of Financial Management (ofm.wa.gov)
- LEAP (Legislative Evaluation & Accountability Program)

## Documentation

- `PROJECT_INVENTORY.md` - Complete guide to all 26 projects (40KB, very detailed)
- `PROJECT_MANIFEST.md` - Structured catalog with branch information
- `DATABASE.md` - Metadata database schema and usage
- `CONTENT-SCHEMA.md` - Content parsing schema design
- Individual project READMEs in `projects/*/README.md`

## Getting Help

The comprehensive project inventory is your friend: see `PROJECT_INVENTORY.md` for:
- What each project does and produces
- How to use each tool
- Which projects are production-ready vs experimental
- Redundancy analysis and recommendations
- Technology stack details

## License

Research and analysis tools provided for educational purposes. The underlying bill data is public information from the Washington State Legislature.
