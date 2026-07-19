# Condensed Bill Schema

This document defines a condensed JSON schema for Washington State bill data, organized by bill number.

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

Analysis of 2023-24 data (1,105 multi-version bills) determined field placement. See BILL_DATA_ANALYSIS.md Section 4 for full stability analysis.

**Bill-Level (100% stable):** Biennium, BillNumber, OriginalAgency, PrimeSponsorID, Appropriations, RequestedBy flags

**Bill-Level (pragmatic, >90% stable):** ShortDescription (96.6%), LongDescription (91.1%) - use values from original version

**Version-Level (vary across versions):** BillId, SubstituteVersion, EngrossedVersion, Active, IntroducedDate, CurrentStatus fields, Fiscal note flags, Sponsor text

**Key findings:**
- 380 of 2,826 bills have multiple active versions (no single "final" version)
- 35% of multi-version bills have different fiscal notes across versions (386 of 1,105)
- Veto flags only appear on versions that reached the governor
- Sponsor text varies due to committee prefixes, but PrimeSponsorID is 100% stable

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

Combine boolean flags into single string:
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

Indicates whether a fiscal note was completed for this version:

- `"SWF"` = StateFiscalNote completed
- `"Loc"` = LocalFiscalNote completed
- `"SWF,Loc"` = Both completed
- `null` = Neither completed

### Outcome Encoding (`outcome`)

Comma-delimited values indicating legislative outcomes:

| Value | Meaning |
|-------|---------|
| `Passed` | Bill passed the legislature (status starts with "C " or "Chapter") |
| `Vetoed` | Governor vetoed the bill (CurrentStatus.Veto = 1) |
| `Partial Veto` | Governor partially vetoed sections (CurrentStatus.PartialVeto = 1) |

**Examples:** `"Passed"`, `"Vetoed"`, `"Passed,Partial Veto"`, `null`

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
  "sponsor_id": 17241,
  "req": "D",
  "approp": false,
  "companion": "SB 5162",
  "versions": [
    {
      "id": "HB 1125",
      "sub": 0,
      "eng": 0,
      "active": false,
      "intro": "2023-01-09",
      "status": "H subst for",
      "action": "1st substitute bill substituted.",
      "date": "2023-04-03",
      "fn": null,
      "outcome": null
    },
    {
      "id": "ESHB 1125",
      "sub": 1,
      "eng": 1,
      "active": true,
      "intro": "2023-03-29",
      "status": "C 472 L 23",
      "action": "Effective date 5/16/2023.",
      "date": "2023-05-16",
      "fn": null,
      "outcome": "Passed,Partial Veto",
      "amended": true,
      "amendments": true
    }
  ]
}
```

---

## Dropped Fields

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
   - Use first row for bill-level fields
   - Build version array with per-version fields
   - Extract sponsor name from format like `"APP(Leavitt)"` → `"Leavitt"`

### Outcome Determination

For each version:
1. Does `CurrentStatus.Status` start with `"C "` or `"Chapter"`? → append `"Passed"`
2. Is `CurrentStatus.Veto` = `"1"`? → append `"Vetoed"`
3. Is `CurrentStatus.PartialVeto` = `"1"`? → append `"Partial Veto"`
4. Join with commas, or return `null` if empty

### Active Versions

Multiple versions may have `Active=1`. This is valid and represents the bill being active at different stages. Do not attempt to pick a single "final" version.

---

## Compression Estimates

**2023-24 Bills:**
- CSV rows: ~4,158 (type B only)
- Unique bills: ~2,826
- Average versions per bill: 1.47
- Estimated size reduction: 25-35% (shorter field names, no redundancy)

---

## Data Quality Notes

See BILL_DATA_ANALYSIS.md Section 7 for detailed analysis.

- **Placeholder records:** Some records have `0001-01-01` action dates and empty status fields (~0.2% in completed bienniums, ~6% in active 2025-26)
- **BillId uniqueness:** Nearly unique in completed bienniums; 10 duplicate cases in 2025-26 due to placeholder records
- **Deduplication:** For active bienniums, filter records with placeholder dates or prefer `Active=1`

---

## Changelog

### Version 2 (Current)
**Major changes:**
- **Removed `final` object** - Multiple versions can be active; "final" version concept is misleading
- **Moved `fn` to version level** - Fiscal notes vary across versions (35% of multi-version bills)
- **Added per-version fields** - `intro`, `action`, `outcome` now on each version
- **Changed outcome encoding** - Single comma-delimited string instead of three booleans
- **Data-driven field placement** - Analysis of 1,105 multi-version bills determined bill vs version level
- **Clarified field stability** - Distinguished 100% stable fields from pragmatically stable (>90%)

### Version 1
- Initial schema with bill-level `final` object and fiscal note
- Version array with basic fields only
