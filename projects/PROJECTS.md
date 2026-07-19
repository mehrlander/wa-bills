# Projects Overview

This folder contains 16 projects organized into 4 categories for analyzing Washington State legislative budget bills.

## Quick Navigation

| Category | Projects | Purpose |
|----------|----------|---------|
| [analysis/](./analysis/) | 4 | Bill structure analysis and parsing libraries |
| [database/](./database/) | 2 | Normalized SQL databases for cross-bill queries |
| [specialized/](./specialized/) | 5 | Targeted tools for specific research questions |
| [viewers/](./viewers/) | 5 | Interactive web-based exploration tools |

## All Projects (16 Total)

See **[PROJECT_INVENTORY.md](./PROJECT_INVENTORY.md)** for comprehensive documentation of all 16 projects.

### Analysis (4)
| Project | Purpose | Output |
|---------|---------|--------|
| [analyze-bill-patterns-2](./analysis/analyze-bill-patterns-2/) | Production-ready extraction system | Web + Data |
| [analyze-bill-patterns-1](./analysis/analyze-bill-patterns-1/) | Comprehensive bill extraction (historical) | Web + Data |
| [analyze-bill-structures](./analysis/analyze-bill-structures/) | Format documentation and parsing guides | Documentation |
| [bill-language-analysis-tool](./analysis/bill-language-analysis-tool/) | Quick terminology analysis | Web Tool |

### Database (2)
| Project | Purpose | Output |
|---------|---------|--------|
| [wa-budget-automation](./database/wa-budget-automation/) | Normalized SQLite database with parsers | SQLite + Scripts |
| [wa-budget-bills-database](./database/wa-budget-bills-database/) | Historical metadata catalog (27 bills) | SQLite + Docs |

### Specialized (5)
| Project | Purpose | Output |
|---------|---------|--------|
| [appropriations-timeline](./specialized/appropriations-timeline/) | Longitudinal funding trend analysis | Web + Data |
| [budget-appropriations-explorer](./specialized/budget-appropriations-explorer/) | Instant XML exploration (no setup) | Web Tool |
| [parse-statutory-references](./specialized/parse-statutory-references/) | RCW cross-reference network | Data + Viz |
| [map-agencies-programs](./specialized/map-agencies-programs/) | Inter-agency relationship mapping | Python + Viz |
| [map-wa-legal-site](./specialized/map-wa-legal-site/) | Automated bill downloads | Python Script |

### Viewers (5)
| Project | Purpose | Output |
|---------|---------|--------|
| [budget-bill-comparison](./viewers/budget-bill-comparison/) | Side-by-side budget version comparison | Web Tool |
| [proviso-search-tool](./viewers/proviso-search-tool/) | Full-text proviso search | Web Tool |
| [legislative-diff-viewer](./viewers/legislative-diff-viewer/) | Multi-mode text diff (2-way, 3-way) | Web Tool |
| [xml-bill-inspector](./viewers/xml-bill-inspector/) | Interactive XML structure analysis | Web Tool |

## Start Here

### Non-Technical Users
Open these standalone HTML tools in any browser:
- **[budget-bill-comparison](./viewers/budget-bill-comparison/)** - Compare two budget versions
- **[proviso-search-tool](./viewers/proviso-search-tool/)** - Search for specific provisions
- **[budget-appropriations-explorer](./specialized/budget-appropriations-explorer/)** - Explore any bill instantly

### Researchers & Analysts
- **[analyze-bill-patterns-2](./analysis/analyze-bill-patterns-2/)** - Interactive data explorer with query tools
- **[appropriations-timeline](./specialized/appropriations-timeline/)** - Funding trends across biennia
- **[wa-budget-bills-database](./database/wa-budget-bills-database/)** - Historical bill catalog

### Developers
1. Read **[analyze-bill-structures](./analysis/analyze-bill-structures/)** to understand bill formats
2. Use **[xml-bill-inspector](./viewers/xml-bill-inspector/)** to explore XML structure
3. Build on **[wa-budget-automation](./database/wa-budget-automation/)** for database integration

### Policy Analysts
- **[proviso-search-tool](./viewers/proviso-search-tool/)** - Find restrictions and requirements
- **[parse-statutory-references](./specialized/parse-statutory-references/)** - Understand legal cross-references
- **[appropriations-timeline](./specialized/appropriations-timeline/)** - Track agency funding changes

## Recommended Projects

**Tier 1 - Production Ready:**
- analyze-bill-patterns-2
- wa-budget-automation
- budget-bill-comparison
- proviso-search-tool

**Tier 2 - Valuable for Specific Uses:**
- wa-budget-bills-database
- appropriations-timeline
- parse-statutory-references
- map-agencies-programs
- legislative-diff-viewer

**Tier 3 - Utility/Reference:**
- analyze-bill-structures (reference documentation)
- xml-bill-inspector (developer tool)
- budget-appropriations-explorer (quick exploration)
- bill-language-analysis-tool (ad-hoc analysis)
- map-wa-legal-site (bill acquisition)

## Related Documentation

- **[PROJECT_INVENTORY.md](./PROJECT_INVENTORY.md)** - Detailed 40KB inventory with comprehensive analysis
- **[Category READMEs](./analysis/README.md)** - Each category folder has its own README
- **[projects-manifest.json](./projects-manifest.json)** - Machine-readable project metadata
