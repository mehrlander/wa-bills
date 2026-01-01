# Washington State Bill Data Analysis

## Overview

This document analyzes the CSV legislation data stored by biennium and proposes a condensed schema organized by bill number.

**Data Coverage:**
- 9 bienniums: 2009-10 through 2025-26
- 40,161 total rows across all files
- 35 columns per file (consistent schema)

---

## 1. Column Profile

### Identity Fields

| Column | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| `Biennium` | string | 1 per file | Legislative session (e.g., "2023-24") |
| `BillNumber` | integer | ~3,400/file | Numeric portion only (e.g., 1000) |
| `BillId` | string | unique | Full identifier with version prefix (e.g., "E2SHB 1096") |
| `OriginalAgency` | string | 2 | "House" or "Senate" |

### Version Fields

| Column | Type | Values | Description |
|--------|------|--------|-------------|
| `SubstituteVersion` | integer | 0-4 | 0=original, 1=S, 2=2S, 3=3S, 4=4S |
| `EngrossedVersion` | integer | 0-2 | 0=none, 1=E, 2=E2 |
| `Active` | boolean | 0/1 | 1=current version, 0=superseded |

**Version Distribution (2023-24):**
```
SubstituteVersion: 0=3464, 1=1109, 2=215, 3=10, 4=2
EngrossedVersion:  0=4459, 1=329, 2=12
```

### Bill Type Fields

| Column | Type | Values | Description |
|--------|------|--------|-------------|
| `ShortLegislationType.ShortLegislationType` | string | 7 | B, R, JR, JM, CR, I, GA |
| `ShortLegislationType.LongLegislationType` | string | 7 | Full names |

**Type Codes:**
- `B` = Bill (4,158) - legislation
- `GA` = Gubernatorial Appointment (453) - confirmations
- `R` = Resolution (102) - single chamber
- `CR` = Concurrent Resolution (30) - both chambers
- `JR` = Joint Resolution (25) - constitutional amendments
- `JM` = Joint Memorial (20) - federal requests
- `I` = Initiative (12) - ballot measures

### RequestedBy Fields (4 booleans)

| Column | Count when 1 | Description |
|--------|--------------|-------------|
| `RequestedByGovernor` | 57 | Governor's request |
| `RequestedByDepartment` | 395 | Agency request |
| `RequestedByBudgetCommittee` | 2 | Budget committee |
| `RequestedByOther` | 178 | Other entity |

**Note:** Most bills (3,800+) have all four set to 0. These can be combined into a single field.

### Fiscal Fields (3 booleans)

| Column | Count when 1 | Description |
|--------|--------------|-------------|
| `StateFiscalNote` | 2,931 | Has state fiscal impact |
| `LocalFiscalNote` | 1,071 | Has local fiscal impact |
| `Appropriations` | 4 | Contains appropriations |

### Description Fields

| Column | Type | Max Length | Description |
|--------|------|------------|-------------|
| `ShortDescription` | string | ~50 chars | Brief topic (e.g., "Working families' tax credit") |
| `LongDescription` | string | ~300 chars | Fuller explanation |
| `LegalTitle` | string | ~500 chars | Formal "AN ACT Relating to..." title |

### Sponsorship Fields

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| `Sponsor` | string | "(Stokesbary)" | Parenthesized name, sometimes with committee prefix |
| `PrimeSponsorID` | integer | 20756 | Numeric sponsor ID |

### Date Fields

| Column | Type | Format | Description |
|--------|------|--------|-------------|
| `IntroducedDate` | date | YYYY-MM-DD | When bill was filed |
| `CurrentStatus.ActionDate` | datetime | ISO 8601 | Last action timestamp |

### Status Fields

| Column | Type | Description |
|--------|------|-------------|
| `CurrentStatus.Status` | string | Location/outcome code |
| `CurrentStatus.HistoryLine` | string | Human-readable action description |
| `CurrentStatus.BillId` | string | BillId at this status (redundant) |

**Status Patterns:**
- Committee: "H Finance", "S Ways & Means"
- Substituted: "H subst for", "S subst for"
- Rules: "H Rules X", "S Rules 3"
- Passed: "C 196 L 23" (Chapter 196, Laws of 2023)
- Vetoed: "Gov vetoed"
- Confirmed: "S Confirmed" (appointments)

### Status Boolean Fields

| Column | Count when 1 | Description |
|--------|--------------|-------------|
| `CurrentStatus.AmendedByOppositeBody` | 384 | Amended by other chamber |
| `CurrentStatus.AmendmentsExist` | 736 | Has amendments |
| `CurrentStatus.PartialVeto` | 27 | Partially vetoed by governor |
| `CurrentStatus.Veto` | 2 | Fully vetoed |

### Companion Bill Fields

| Column | Description |
|--------|-------------|
| `Companions` | Container (empty if none) |
| `Companions.Companion.Biennium` | Always same biennium |
| `Companions.Companion.BillId` | Companion bill ID |
| `Companions.Companion.Status` | Companion's status |

**Stats (2023-24):** 1,006 of 4,800 rows have a companion bill (House/Senate counterpart).

### Other Fields

| Column | Description |
|--------|-------------|
| `Request` | Internal request tracking code (e.g., "H-0113.1") |

---

## 2. Key Relationships

### BillId ↔ BillNumber (Version Relationship)

Multiple rows share the same `BillNumber` when a bill has substitute or engrossed versions:

```
BillNumber 1009:
  HB 1009      Active=0 Sub=0 Eng=0 Status=H subst for    (superseded)
  SHB 1009     Active=0 Sub=1 Eng=0 Status=H subst for    (superseded)
  2SHB 1009    Active=1 Sub=2 Eng=0 Status=C 165 L 23     (current/passed)
```

**BillId Prefix Encoding:**
| Prefix | Meaning |
|--------|---------|
| `HB` / `SB` | House Bill / Senate Bill (original) |
| `SHB` / `SSB` | Substitute (Sub=1) |
| `2SHB` / `2SSB` | 2nd Substitute (Sub=2) |
| `3SHB` / `3SSB` | 3rd Substitute (Sub=3) |
| `EHB` / `ESB` | Engrossed (Eng=1) |
| `ESHB` / `ESSB` | Engrossed Substitute (Sub=1, Eng=1) |
| `E2SHB` / `E2SSB` | Engrossed 2nd Substitute (Sub=2, Eng=1) |
| `2ESHB` | 2nd Engrossed Substitute (Sub=1, Eng=2) |

### Companion Bills

House and Senate versions of the same legislation are linked via `Companions.*` fields:
```
HB 1001 <-> SB 5021
HB 1004 <-> SB 5478
```

Companions are always within the same biennium.

### Active Flag Logic

When a substitute version is created:
- Original bill's `Active` becomes 0
- Original's `CurrentStatus.Status` becomes "H subst for" or "S subst for"
- New substitute's `Active` is 1

