# WA Budget Bills Analysis

Repository for parsing and analyzing Washington State budget bills.

## Contents

This repo contains enacted operating budget bills from Washington State Legislature, available in multiple formats:
- XML (structured)
- HTM (web format)
- PDF (document format)

## Goal

Extract structured data from budget bills including:
- Agencies and programs
- Appropriations amounts and accounts
- Proviso language
- Cross-references
- Legislative structure

## Approach

Use parallel extraction tasks to:
1. Parse bills into normalized database structures
2. Compare different schema approaches
3. Build reusable parsing libraries
4. Document structural patterns across biennia

## Tools

### Budget Appropriations Explorer

Interactive web-based tool for exploring budget bill appropriations:
- **File**: `budget-explorer.html`
- **Features**:
  - Paste XML budget bill content for instant parsing
  - Sortable/filterable data grid with 1000+ row performance
  - Interactive visualizations (top 10 agencies, fund distribution)
  - Proviso text viewer for each appropriation
  - CSV export functionality
  - Built with Tabulator.js and Chart.js

**Usage**: Open `budget-explorer.html` in any modern browser, paste XML content from budget bills, and click "Parse & Load Data"

## Output Format

Each extraction should produce:
- SQLite database with extracted data
- Schema documentation
- Extraction code (JavaScript)
- Completeness metrics
- Edge cases report

## Notes for Claude Code

Bills are large (500-1400 pages). Focus on:
- Appropriations tables (amounts, agencies, programs)
- Proviso language (conditions, restrictions)
- Structural hierarchy (agency → program → account)
- Cross-references between sections

Bill structure may vary across biennia and formats. Document structural changes encountered.
