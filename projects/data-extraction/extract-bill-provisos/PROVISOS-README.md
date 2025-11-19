# Washington State Budget Provisos Analysis

This analysis extracts and categorizes all proviso language from Washington State operating budget bills across multiple biennia.

## Summary

- **Total Provisos Extracted:** 11,986
- **Total Appropriations:** 7,156
- **Biennia Covered:** 2021-23, 2023-25, 2025-27
- **Bills Processed:** 6 operating budget bills

## Output Files

### 1. `provisos.json` (12.1 MB)
Complete dataset of all extracted provisos with full metadata:
```json
{
  "billNumber": "ESSB 5167.SL",
  "biennium": "2025-2027",
  "section": "103",
  "agency": "FOR THE JOINT LEGISLATIVE AUDIT AND REVIEW COMMITTEE",
  "agencyCode": "014",
  "provisoNumber": "2",
  "text": "(2)(a) $400,000 of the performance audits...",
  "categories": ["Conditional appropriations", "Study requirements"],
  "amount": "$400,000"
}
```

### 2. `appropriations-with-provisos.json` (4.2 MB)
Appropriations linked to their associated provisos (optimized with proviso indices):
```json
{
  "billNumber": "ESSB 5167.SL",
  "biennium": "2025-2027",
  "section": "103",
  "agency": "FOR THE JOINT LEGISLATIVE AUDIT AND REVIEW COMMITTEE",
  "agencyCode": "014",
  "accountName": "Performance Audits of Government Account—State Appropriation",
  "amount": "$13,910,000",
  "provisos": [0, 1, 2, 3, 4]
}
```

### 3. `proviso-search.html`
**Interactive search interface** - Open in browser to search and filter provisos by:
- **Keyword** - Full-text search across proviso text
- **Agency** - Filter by specific state agency
- **Category** - Filter by proviso type
- **Biennium** - Filter by budget cycle

### 4. `patterns-report.md` / `patterns-report.json`
Statistical analysis and patterns including:
- Category breakdown
- Top agencies by proviso count
- Biennium distribution
- Bills processed

### 5. `data-summary.json` (9.2 KB)
Quick reference with agencies, categories, and biennia lists.

## Proviso Categories

| Category | Count | Percentage |
|----------|-------|------------|
| Conditional appropriations | 9,597 | 80.1% |
| Grant programs | 2,192 | 18.3% |
| Reporting requirements | 2,012 | 16.8% |
| Study requirements | 1,410 | 11.8% |
| General | 1,235 | 10.3% |
| IT constraints | 765 | 6.4% |
| FTE restrictions | 579 | 4.8% |
| Pilots | 333 | 2.8% |
| Transfers | 183 | 1.5% |

*Note: Provisos can have multiple categories*

## Top Agencies by Proviso Count

1. **Department of Commerce** - 957 provisos
2. **Department of Health** - 600 provisos
3. **University of Washington** - 534 provisos
4. **State Board for Community and Technical Colleges** - 348 provisos
5. **Department of Ecology** - 329 provisos
6. **State Health Care Authority (Medical Assistance)** - 311 provisos
7. **DSHS (Aging and Adult Services)** - 295 provisos
8. **Department of Fish and Wildlife** - 292 provisos
9. **Department of Labor and Industries** - 277 provisos
10. **State Health Care Authority (Behavioral Health)** - 275 provisos

## Usage

### Running the Extraction

```bash
# Install dependencies
npm install

# Extract provisos from XML bills
node extract-provisos.js
```

### Viewing the Data

1. **Interactive Search:** Open `proviso-search.html` in a web browser
2. **Read Reports:** View `patterns-report.md` for analysis
3. **Programmatic Access:** Import `provisos.json` or `appropriations-with-provisos.json`

## Methodology

### Extraction Process

1. **Parse XML Bills** - Read structured bill data from Legislature's XML format
2. **Identify Sections** - Find BillSections with agency appropriations
3. **Extract Appropriations** - Capture account names and dollar amounts
4. **Extract Provisos** - Identify "conditions and limitations" paragraphs
5. **Categorize** - Apply pattern matching to classify proviso types
6. **Link Data** - Connect provisos to their parent appropriations

### Categorization Logic

Provisos are categorized using regex pattern matching:

- **FTE Restrictions** - Mentions of FTE, staffing, positions
- **Reporting Requirements** - Report deadlines, submission requirements
- **IT Constraints** - Information technology, systems, software
- **Pilots** - Pilot programs, demonstration projects
- **Transfers** - Fund transfers, reappropriations
- **Conditional Appropriations** - "Provided solely", bill enactment conditions
- **Study Requirements** - Studies, evaluations, assessments
- **Grant Programs** - Grants, awards, distributions

## Bills Included

| Bill | Biennium | Legislature | Session | Provisos | Appropriations |
|------|----------|-------------|---------|----------|----------------|
| ESSB 5167 | 2025-2027 | 69th | 2025 Regular | 3,439 | 2,172 |
| ESSB 5187 | 2023-2025 | 68th | 2023 Regular | 3,449 | 1,941 |
| ESSB 5950 | 2023-2025 | 68th | 2024 Regular | 2,282 | 1,553 |
| ESSB 5693 | 2021-2023 | 67th | 2022 Regular | 1,859 | 1,473 |
| SSB 5195 | - | 69th | 2025 Regular | 534 | 17 |
| ESSB 5200 | - | 68th | 2023 Regular | 423 | 0 |

## Files

- `extract-provisos.js` - Main extraction script
- `provisos.json` - All provisos with metadata
- `appropriations-with-provisos.json` - Appropriations linked to provisos
- `proviso-search.html` - Interactive search interface
- `patterns-report.md` - Human-readable analysis
- `patterns-report.json` - Machine-readable analysis
- `data-summary.json` - Quick reference metadata
- `package.json` - Node.js dependencies

## License

Data extracted from public Washington State Legislature documents.
