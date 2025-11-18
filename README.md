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

## Automated Bill Downloads

This repository includes tools to automatically download bills from [lawfilesext.leg.wa.gov](https://lawfilesext.leg.wa.gov/).

### Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download bills from config:**
   ```bash
   python download_bills.py --config bills_config.json
   ```

3. **Download a range of bills:**
   ```bash
   python download_bills.py --biennium 2023-24 --chamber House --start 1000 --end 1010
   ```

### Configuration

Edit `bills_config.json` to specify which bills to download:

```json
{
  "bills": [
    {
      "biennium": "2023-24",
      "chamber": "House",
      "number": "1050",
      "format": "Pdf",
      "type": "Bills",
      "category": "House Bills",
      "note": "Operating Budget Bill"
    }
  ]
}
```

**Configuration fields:**
- `biennium`: Two-year session (e.g., "2023-24", "2021-22")
- `chamber`: "House" or "Senate"
- `number`: Bill number (can include suffix like "1234-S" for substitute bills)
- `format`: "Pdf" or "Htm"
- `type`: "Bills", "Session Laws", etc.
- `category`: "House Bills", "Senate Bills", "House Passed Legislature", etc.

### GitHub Actions Automation

The repository includes a GitHub Actions workflow that can:
- Run on a schedule (weekly by default)
- Be triggered manually
- Download bills automatically and commit them

**Manual trigger:**
1. Go to the "Actions" tab in GitHub
2. Select "Download WA Bills" workflow
3. Click "Run workflow"
4. Optionally specify a biennium and bill range

### WA Legislative Website Structure

Bills are organized on lawfilesext.leg.wa.gov as follows:

```
/Biennium/[YEAR-YEAR]/[Format]/Bills/[Category]/[Number].[ext]
```

**Examples:**
- `/Biennium/2023-24/Pdf/Bills/House Bills/1050.pdf`
- `/Biennium/2023-24/Htm/Bills/Senate Bills/5950.htm`
- `/Biennium/2023-24/Pdf/Bills/Session Laws/House/1050-S.SL.pdf`

**Bill naming conventions:**
- Standard: `1234.pdf`
- Substitute: `1234-S.pdf`
- Engrossed Substitute: `1234-S.E.pdf`
- Passed Legislature: `1234-S.PL.pdf`
- Session Law: `1234-S.SL.pdf`

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
