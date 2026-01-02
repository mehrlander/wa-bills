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

**Important:** Multiple versions can have `Active=1` simultaneously. See Section 3 for analysis.

---

## 3. Multi-Version Bill Analysis

### Version Distribution

Of the 2,826 unique bills (type B) in 2023-24:

| Versions | Bills | Percentage |
|----------|-------|------------|
| 1 | 1,721 | 60.9% |
| 2 | 890 | 31.5% |
| 3 | 205 | 7.3% |
| 4 | 8 | 0.3% |
| 5 | 2 | 0.1% |

**Summary:** 1,105 bills (39.1%) have multiple versions.

### Substitute/Engrossed Breakdown

```
SubstituteVersion: 0=2826, 1=1105, 2=215, 3=10, 4=2
EngrossedVersion:  0=3819, 1=327, 2=12
```

### Active Flag Distribution

- Total rows with Active=1: 3,252
- Bills with multiple Active=1: **380 of 2,826** (13.4%)

This finding invalidates the assumption that each bill has a single "final" version. The schema must preserve all versions rather than attempting to identify one canonical version.

---

## 4. Field Stability Analysis

Analysis of 1,105 multi-version bills to determine which fields remain constant across versions vs which vary.

### 100% Stable Fields (Bill-Level Candidates)

| Field | Stable | Varying | Stability |
|-------|--------|---------|-----------|
| Biennium | 1,105 | 0 | 100.0% |
| OriginalAgency | 1,105 | 0 | 100.0% |
| PrimeSponsorID | 1,105 | 0 | 100.0% |
| Appropriations | 1,105 | 0 | 100.0% |
| RequestedByGovernor | 1,105 | 0 | 100.0% |
| RequestedByDepartment | 1,105 | 0 | 100.0% |
| RequestedByBudgetCommittee | 1,105 | 0 | 100.0% |
| RequestedByOther | 1,105 | 0 | 100.0% |

### Highly Stable Fields (>90%)

| Field | Stable | Varying | Stability |
|-------|--------|---------|-----------|
| CurrentStatus.Veto | 1,103 | 2 | 99.8% |
| CurrentStatus.PartialVeto | 1,084 | 21 | 98.1% |
| ShortDescription | 1,067 | 38 | 96.6% |
| LegalTitle | 1,029 | 76 | 93.1% |
| LongDescription | 1,007 | 98 | 91.1% |

### Variable Fields (Version-Level)

| Field | Stable | Varying | Stability |
|-------|--------|---------|-----------|
| BillId | 0 | 1,105 | 0.0% |
| SubstituteVersion | 0 | 1,105 | 0.0% |
| IntroducedDate | 1 | 1,104 | 0.1% |
| Sponsor | 17 | 1,088 | 1.5% |
| Active | 377 | 728 | 34.1% |
| CurrentStatus.Status | 378 | 727 | 34.2% |
| CurrentStatus.HistoryLine | 378 | 727 | 34.2% |
| CurrentStatus.ActionDate | 378 | 727 | 34.2% |
| CurrentStatus.AmendmentsExist | 547 | 558 | 49.5% |
| StateFiscalNote | 755 | 350 | 68.3% |
| CurrentStatus.AmendedByOppositeBody | 802 | 303 | 72.6% |
| EngrossedVersion | 830 | 275 | 75.1% |
| LocalFiscalNote | 959 | 146 | 86.8% |

### Sponsor Field Behavior

The `Sponsor` text field varies across versions due to committee prefixes:
- Original: `(Leavitt)`
- After committee action: `APP(Leavitt)`, `ED(Leavitt)`, `TEDV(Leavitt)`

**Key finding:** `PrimeSponsorID` remains constant (100% stable) even though `Sponsor` text changes. The schema should use `PrimeSponsorID` at bill level and extract the base sponsor name from the original version's `Sponsor` field.

---

## 5. Fiscal Note Analysis

### Variance Across Versions

Of 1,105 multi-version bills:
- **386 bills (34.9%)** have different fiscal notes across versions
- StateFiscalNote varies in 350 bills (31.7%)
- LocalFiscalNote varies in 146 bills (13.2%)

This significant variance (approximately 35%) supports placing fiscal note fields at the version level rather than bill level.

### Fiscal Note Distribution (2023-24, all type B rows)

| Field | Count=1 | Count=0 |
|-------|---------|---------|
| StateFiscalNote | 2,931 | 1,227 |
| LocalFiscalNote | 1,071 | 3,087 |
| Appropriations | 4 | 4,154 |

---

## 6. Bill Outcomes

### Outcome Statistics (Active Versions Only)

| Outcome | Count |
|---------|-------|
| Passed (status starts with "C ") | 846 |
| Partially vetoed | 27 |
| Fully vetoed | 2 |

### Companion Bills

- Rows with companion bill link: 992
- Unique bills with companion: 992
- Companions are always within the same biennium

---

## 7. Data Quality Notes

### Placeholder Records

Some records have incomplete status data:
- `CurrentStatus.ActionDate = 0001-01-01`
- Empty `CurrentStatus.HistoryLine`
- Empty `CurrentStatus.Status`

**Distribution by biennium:**

| Biennium | Total Rows | Placeholder Records | Percentage |
|----------|-----------|---------------------|------------|
| 2009-10 | 2,318 | 6 | 0.3% |
| 2011-12 | 5,003 | 11 | 0.2% |
| 2013-14 | 4,906 | 13 | 0.3% |
| 2015-16 | 5,216 | 0 | 0.0% |
| 2017-18 | 5,577 | 14 | 0.3% |
| 2019-20 | 5,766 | 22 | 0.4% |
| 2021-22 | 3,390 | 9 | 0.3% |
| 2023-24 | 4,800 | 8 | 0.2% |
| 2025-26 | 3,184 | 188 | 5.9% |

The active biennium (2025-26) has significantly more placeholder records, representing in-progress or proposed states.

### Duplicate BillId Issue (2025-26 Only)

In completed bienniums (2009-10 through 2023-24), BillId is unique. However, the active 2025-26 biennium contains **5 cases of duplicate BillIds**:

| BillId | Duplicate Rows | Pattern |
|--------|---------------|---------|
| ESHB 1688 | 2 | One passed (Active=1), one placeholder (Active=0) |
| ESHB 2049 | 2 | One passed (Active=1), one placeholder (Active=0) |
| HB 1217 | 3 | All placeholders (Active=0) |
| SB 5167 | 3 | Mixed: one real date, two placeholders |
| SSB 5316 | 2 | One passed (Active=1), one placeholder (Active=0) |

**Key finding:** `SubstituteVersion` and `EngrossedVersion` do NOT distinguish these duplicates—they have identical values. The distinguishing factors are:
- `Active` flag (typically 1 vs 0)
- `CurrentStatus.ActionDate` (valid date vs 0001-01-01)

**Recommendation:** When processing active bienniums, filter out records with placeholder dates or prefer records where `Active=1`.

---

## 8. Schema Design Recommendations

Based on this analysis:

### Bill-Level Fields (100% Stable)

These fields never vary across versions and belong at the bill level:
- Biennium, BillNumber, OriginalAgency
- PrimeSponsorID
- Appropriations
- All RequestedBy flags (can be combined into single field)

### Pragmatic Bill-Level Fields (>90% Stable)

These fields rarely vary and can be placed at bill level with minimal data loss:
- ShortDescription (96.6% stable)
- LongDescription (91.1% stable)

Use values from the original (Sub=0, Eng=0) version.

### Version-Level Fields

These fields vary significantly and must be tracked per version:
- BillId, SubstituteVersion, EngrossedVersion
- Active, IntroducedDate
- All CurrentStatus fields
- StateFiscalNote, LocalFiscalNote (35% variance)
- Sponsor text (extract name, but track per version if needed)

### Multiple Active Versions

With 380 bills (13.4%) having multiple `Active=1` versions, the schema must NOT attempt to identify a single "final" version. Preserve the full version array and let consumers decide which version(s) to use.

### BillId Uniqueness

- For completed bienniums: BillId can be used as a unique identifier
- For active bienniums: Apply deduplication logic (prefer Active=1, filter placeholder dates)

