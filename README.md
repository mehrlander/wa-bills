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
