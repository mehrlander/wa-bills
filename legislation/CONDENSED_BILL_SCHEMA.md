# Condensed Bill Schema

This document defines a condensed JSON schema for Washington State bill data, organized by bill number.

**Scope:** Bills only (legislation type B). Excludes gubernatorial appointments (GA), resolutions (R), joint resolutions (JR), joint memorials (JM), concurrent resolutions (CR), and initiatives (I).

---

## Design Goals

1. **Group by BillNumber** - One record per unique bill number per biennium
2. **Combine RequestedBy** - Single field instead of 4 booleans
3. **Short field names** - Concise identifiers
4. **Capture version history** - Array of versions with key info
5. **Retain essential fields** - Drop redundant/derivable data

---

## Schema

### Core Bill Record

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `bien` | string | Biennium | e.g., "2023-24" |
| `num` | int | BillNumber | e.g., 1009 |
| `chamber` | char | OriginalAgency | H or S |
| `intro` | date | IntroducedDate | First introduction date |
| `short` | string | ShortDescription | Topic summary |
| `long` | string | LongDescription | Fuller description |
| `sponsor` | string | Sponsor | Primary sponsor name |
| `sponsor_id` | int | PrimeSponsorID | Sponsor ID |
| `req` | string | RequestedBy* | Combined: G/D/B/O or null |
| `fn` | string | *FiscalNote | SWF, Loc, "SWF,Loc", or null |
| `approp` | bool | Appropriations | Has appropriations |
| `companion` | string | Companions.*.BillId | Companion bill ID or null |
| `versions` | array | (aggregated) | Version history array |
| `final` | object | (from active version) | Final status info |

### RequestedBy Encoding (`req`)

Combine into single string with letter codes:
- `G` = Governor
- `D` = Department
- `B` = BudgetCommittee
- `O` = Other
- `null` = None

Examples: `"G"`, `"D"`, `"GO"`, `null`

### Fiscal Note Encoding (`fn`)

- `SWF` = Statewide fiscal note only
- `Loc` = Local fiscal note only
- `"SWF,Loc"` = Both state and local
- `null` = Neither

### Versions Array

Each version in the bill's history:

```json
{
  "id": "2SHB 1009",
  "sub": 2,
  "eng": 0,
  "active": true,
  "date": "2023-02-02",
  "status": "C 165 L 23",
  "amended": true,
  "amendments": true
}
```

### Final Status Object

Extracted from the active (or highest) version:

```json
{
  "status": "C 165 L 23",
  "action": "Effective date 7/23/2023*.",
  "date": "2023-04-25",
  "passed": true,
  "vetoed": false,
  "partial_veto": false
}
```

---

## Example Record

**Original CSV rows for BillNumber 1009:**
```csv
HB 1009,  Active=0, Sub=0, Status="H subst for"
SHB 1009, Active=0, Sub=1, Status="H subst for"
2SHB 1009, Active=1, Sub=2, Status="C 165 L 23"
```

**Condensed to:**
```json
{
  "bien": "2023-24",
  "num": 1009,
  "chamber": "H",
  "intro": "2023-01-09",
  "short": "Military spouse employment",
  "long": "Concerning military spouse employment.",
  "sponsor": "Leavitt",
  "sponsor_id": 29102,
  "req": null,
  "fn": "SWF",
  "approp": false,
  "companion": null,
  "versions": [
    {"id": "HB 1009", "sub": 0, "eng": 0, "active": false, "status": "H subst for"},
    {"id": "SHB 1009", "sub": 1, "eng": 0, "active": false, "status": "H subst for"},
    {"id": "2SHB 1009", "sub": 2, "eng": 0, "active": true, "status": "C 165 L 23"}
  ],
  "final": {
    "status": "C 165 L 23",
    "action": "Effective date 7/23/2023*.",
    "date": "2023-04-25",
    "passed": true,
    "vetoed": false,
    "partial_veto": false
  }
}
```

---

## Dropped/Derived Fields

| Original Field | Reason to Drop |
|----------------|----------------|
| `ShortLegislationType.*` | Bills only, no type needed |
| `CurrentStatus.BillId` | Redundant (matches BillId) |
| `LegalTitle` | Can derive from LongDescription if needed |
| `Request` | Internal tracking, low value |
| `Companions` (container) | Empty wrapper |
| `Companions.Companion.Biennium` | Always same as bill's biennium |
| `Companions.Companion.Status` | Can look up if needed |

---

## Implementation Notes

### Grouping Logic

1. Filter to `ShortLegislationType.ShortLegislationType = "B"` only
2. Group all rows by `(Biennium, BillNumber)`
3. For each group:
   - Use first row for stable fields (chamber, sponsor, etc.)
   - Collect all versions sorted by (SubstituteVersion, EngrossedVersion)
   - Identify active version for final status
   - Combine RequestedBy and Fiscal booleans

### Edge Cases

1. **Multiple active versions** - Some bills show Active=1 for multiple versions (stalled in committee at different stages). Use highest version number.

2. **No active version** - All versions superseded. Mark final as the last version.

### Status Classification

Parse `CurrentStatus.Status` to determine outcome:
- Starts with `C ` → Passed into law
- Contains `vetoed` → Vetoed
- Contains `Rules X` → Dead in rules
- Contains `subst for` → Superseded by substitute
- Contains committee name → In committee

---

## Compression Estimates

### Current Data (2023-24 Bills Only)
- Bill rows: ~4,158 (excluding GA, R, JR, JM, CR, I)
- Unique bill numbers: ~3,000
- Compression ratio: ~1.4x (rows per bill)

### Projected Condensed Size
- Records: ~3,000 per biennium (one per bill number)
- Estimated size reduction: 30-40% (fewer rows, shorter field names)
