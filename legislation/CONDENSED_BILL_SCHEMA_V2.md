# Condensed Bill Schema (v2)

This document defines a condensed JSON schema for Washington State bill data, organized by bill number. This revision enriches version-level data and removes the `final` object.

**Scope:** Bills only (legislation type B). Excludes gubernatorial appointments (GA), resolutions (R), joint resolutions (JR), joint memorials (JM), concurrent resolutions (CR), and initiatives (I).

---

## Design Goals

1. **Group by BillNumber** - One record per unique bill number per biennium
2. **Bill-level stability** - Only truly stable fields at the bill level
3. **Version-level completeness** - Each version carries its own status, outcome, and metadata
4. **No synthesized "final"** - Let the versions array speak for itself
5. **Concise field names** - Short identifiers throughout

---

## Bill-Level vs Version-Level Fields

Analysis of 2023-24 data (1,105 multi-version bills) determined field placement:

### Bill-Level (100% stable across versions)
- Biennium, BillNumber, OriginalAgency
- PrimeSponsorID, Appropriations
- RequestedBy* (all 4 boolean flags)

### Version-Level (vary across versions)
- BillId, SubstituteVersion, EngrossedVersion, Active
- IntroducedDate (each version has its own)
- Sponsor (includes committee prefix)
- CurrentStatus.* (all status fields)
- StateFiscalNote, LocalFiscalNote (can change per version)

### Special Cases
- **Companion**: Only populated on original version (Sub=0), but conceptually bill-level
- **ShortDescription/LongDescription**: Rarely change; use original version for bill level
- **Sponsor name**: Stable, but format varies (e.g., "APP(Leavitt)"); extract name for bill level

---

## Schema

### Bill Record

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `bien` | string | Biennium | e.g., "2023-24" |
| `num` | int | BillNumber | e.g., 1009 |
| `chamber` | char | OriginalAgency | H or S |
| `intro` | date | IntroducedDate | First introduction date (from original version) |
| `short` | string | ShortDescription | Topic summary |
| `long` | string | LongDescription | Fuller description |
| `sponsor` | string | Sponsor | Primary sponsor name (extracted from parentheses) |
| `sponsor_id` | int | PrimeSponsorID | Sponsor ID |
| `req` | string | RequestedBy* | Combined: G/D/B/O or null |
| `approp` | bool | Appropriations | Has appropriations |
| `companion` | string | Companions.*.BillId | Companion bill ID or null |
| `versions` | array | (aggregated) | Version history array |

### RequestedBy Encoding (`req`)

Combine boolean flags into single string with letter codes:
- `G` = RequestedByGovernor
- `D` = RequestedByDepartment
- `B` = RequestedByBudgetCommittee
- `O` = RequestedByOther
- `null` = None requested

Examples: `"G"`, `"D"`, `"GO"`, `"GDB"`, `null`

---

### Version Record

Each version in the bill's history:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `id` | string | BillId | e.g., "2SHB 1009" |
| `sub` | int | SubstituteVersion | 0, 1, 2, ... |
| `eng` | int | EngrossedVersion | 0, 1, 2, ... |
| `active` | bool | Active | Whether this version is marked active |
| `intro` | date | IntroducedDate | When this version was introduced |
| `status` | string | CurrentStatus.Status | Current status text |
| `action` | string | CurrentStatus.HistoryLine | Action description |
| `date` | date | CurrentStatus.ActionDate | Date of last action |
| `fn` | string | *FiscalNote | Fiscal note encoding (see below) |
| `outcome` | string | (derived) | Outcome encoding (see below) |
| `amended` | bool | CurrentStatus.AmendedByOppositeBody | If amended by other chamber (optional) |
| `amendments` | bool | CurrentStatus.AmendmentsExist | If amendments exist (optional) |

### Fiscal Note Encoding (`fn`)

Indicates whether a fiscal note was completed for this version (not whether there was fiscal impact):

- `"SWF"` = StateFiscalNote completed
- `"Loc"` = LocalFiscalNote completed
- `"SWF,Loc"` = Both completed
- `null` = Neither completed

### Outcome Encoding (`outcome`)

Aggregates legislative outcomes as comma-delimited values. These flags are independent and can appear in any combination:

| Value | Meaning |
|-------|---------|
| `Passed` | Bill passed the legislature (status starts with "C " or "Chapter") |
| `Vetoed` | Governor vetoed the bill (CurrentStatus.Veto = 1) |
| `Partial Veto` | Governor partially vetoed sections (CurrentStatus.PartialVeto = 1) |

**Examples:**
- `"Passed"` - Passed legislature, signed by governor
- `"Vetoed"` - Passed legislature, fully vetoed
- `"Passed,Partial Veto"` - Passed with sections vetoed
- `"Passed,Vetoed"` - Passed legislature, then vetoed (if this occurs)
- `null` - Superseded, in committee, or no final action

Note: A bill can pass the legislature and still be vetoed. The `outcome` field captures whatever combination of flags is present in the data.

---

## Example Record

**Bill 1125** (transportation budget with partial veto):

```json
{
  "bien": "2023-24",
  "num": 1125,
  "chamber": "H",
  "intro": "2023-01-09",
  "short": "Transportation budget",
  "long": "Making transportation appropriations for the 2023-2025 fiscal biennium.",
  "sponsor": "Fey",
  "sponsor_id": 28800,
  "req": null,
  "approp": true,
  "companion": null,
  "versions": [
    {
      "id": "HB 1125",
      "sub": 0,
      "eng": 0,
      "active": false,
      "intro": "2023-01-09",
      "status": "H subst for",
      "action": "Substitute bill substituted.",
      "date": "2023-02-22",
      "fn": "SWF",
      "outcome": null
    },
    {
      "id": "ESHB 1125",
      "sub": 1,
      "eng": 1,
      "active": true,
      "intro": "2023-02-22",
      "status": "C 472 L 23",
      "action": "Effective date 7/1/2023**.",
      "date": "2023-05-15",
      "fn": "SWF,Loc",
      "outcome": "Passed,Partial Veto",
      "amended": true,
      "amendments": true
    }
  ]
}
```

**Bill 1009** (passed without veto):

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
  "approp": false,
  "companion": null,
  "versions": [
    {
      "id": "HB 1009",
      "sub": 0,
      "eng": 0,
      "active": false,
      "intro": "2023-01-09",
      "status": "H subst for",
      "action": "2nd substitute bill substituted.",
      "date": "2023-02-15",
      "fn": "SWF",
      "outcome": null
    },
    {
      "id": "SHB 1009",
      "sub": 1,
      "eng": 0,
      "active": false,
      "intro": "2023-01-13",
      "status": "H subst for",
      "action": "2nd substitute bill substituted.",
      "date": "2023-02-15",
      "fn": "SWF",
      "outcome": null
    },
    {
      "id": "2SHB 1009",
      "sub": 2,
      "eng": 0,
      "active": true,
      "intro": "2023-02-02",
      "status": "C 165 L 23",
      "action": "Effective date 7/23/2023*.",
      "date": "2023-04-25",
      "fn": "SWF",
      "outcome": "Passed",
      "amended": true,
      "amendments": true
    }
  ]
}
```

---

## Changes from v1

| Aspect | v1 | v2 |
|--------|----|----|
| `final` object | Present at bill level | **Removed** |
| `fn` (fiscal note) | Bill level | **Version level** |
| Version `intro` | Not present | **Added** (each version's IntroducedDate) |
| Version `action` | Not present | **Added** (CurrentStatus.HistoryLine) |
| Version `date` | Optional | **Standard** (always included) |
| Version `outcome` | Not present | **Added** (replaces passed/vetoed/partial_veto) |
| Outcome encoding | Three booleans in `final` | Single comma-delimited string per version |

### Rationale

1. **No `final` object**: Multiple versions can have `Active=1` simultaneously (380 of 2,826 bills in 2023-24). The concept of a single "final" version is misleading and duplicates version data.

2. **Version-level fiscal notes**: Fiscal note completion can change as a bill is amended. Analysis showed 32% of multi-version bills have different `StateFiscalNote` values across versions.

3. **Version-level outcomes**: Veto and partial veto flags only appear on the version that reached the governor. Superseded versions always have these as 0.

4. **Enriched versions**: Each version now carries complete information about its own status, making the data self-describing without needing to synthesize a separate object.

---

## Dropped/Derived Fields

| Original Field | Reason to Drop |
|----------------|----------------|
| `ShortLegislationType.*` | Bills only, no type needed |
| `CurrentStatus.BillId` | Redundant (matches BillId) |
| `LegalTitle` | Can derive from LongDescription if needed |
| `Request` | Internal tracking code, low value |
| `Companions` (container) | Empty wrapper |
| `Companions.Companion.Biennium` | Always same as bill's biennium |
| `Companions.Companion.Status` | Can look up if needed |

---

## Implementation Notes

### Grouping Logic

1. Filter to `ShortLegislationType.ShortLegislationType = "B"` only
2. Group all rows by `(Biennium, BillNumber)`
3. For each group:
   - Sort versions by `(SubstituteVersion, EngrossedVersion)`
   - Use first row for bill-level fields (chamber, sponsor name, descriptions)
   - Build version array with per-version fields
   - Extract sponsor name from format like `"APP(Leavitt)"` → `"Leavitt"`

### Sponsor Name Extraction

The CSV `Sponsor` field includes committee prefixes for substitute versions:
- Original: `"(Leavitt)"`
- Substitute: `"APP(Leavitt)"`, `"TEDV(Leavitt)"`

Extract just the name in parentheses for the bill-level `sponsor` field.

### Outcome Determination

For each version, build outcome string by checking:
1. Does `CurrentStatus.Status` start with `"C "` or `"Chapter"`? → append `"Passed"`
2. Is `CurrentStatus.Veto` = `"1"`? → append `"Vetoed"`
3. Is `CurrentStatus.PartialVeto` = `"1"`? → append `"Partial Veto"`
4. Join with commas, or return `null` if empty

### Active Versions

Multiple versions may have `Active=1`. This is valid and represents the bill being active at different stages (e.g., stalled in committee with multiple versions). Do not attempt to pick a single "final" version.

---

## Compression Estimates

### Current Data (2023-24 Bills Only)
- Bill rows in CSV: ~4,158 (type B only)
- Unique bill numbers: ~2,826
- Average versions per bill: 1.47

### Projected Output
- Records: ~2,826 per biennium (one per bill number)
- Version objects: ~4,158 total (same as input rows)
- Estimated size reduction: 25-35% (shorter field names, no redundancy)
