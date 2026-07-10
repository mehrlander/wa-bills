# Coverage Analysis: API Catalog vs Prior Research

**Generated:** 2026-01-02


## Summary

This document compares the official WSDL specifications with prior research reports 
in `legislation/schemaResearch/` to identify gaps, improvements, and new discoveries.


## Coverage Metrics

| Metric | Official Specs | Prior Research | Notes |
|--------|----------------|----------------|-------|
| Services | 9 | 8 (documented) | +1 RcwCiteAffectedService now confirmed |
| Operations | 83 | ~40 (estimated) | +43 operations newly documented |
| Complex Types | 52 | ~15 (estimated) | Complete type definitions now available |
| Enumerations | 2 | 2 (VoteType, RecommendationType) | All enums now confirmed |
| Field Definitions | 84 | Partial | Official data dictionary now integrated |

## Service-by-Service Analysis

### AmendmentService

- **Prior Coverage:** Partially documented
- **Operations in WSDL:** 1
- **Notes:** Simple service - GetAmendments by year confirmed

### CommitteeActionService

- **Prior Coverage:** Partially documented
- **Operations in WSDL:** 17
- **Newly Documented Operations:**
  - `GetDoPassWithAmendmentsToSubByCommittee`
  - `GetWithoutRecommendationByCommittee`
  - `GetLegislationScheduledHearingsByCommittee`
  - `GetLegislationReportedOutOfCommittee`
- **Notes:** Full range of committee action queries now available

### CommitteeMeetingService

- **Prior Coverage:** Documented
- **Operations in WSDL:** 3
- **Newly Documented Operations:**
  - `GetRevisedCommitteeMeetings`
- **Notes:** Revision tracking capability confirmed

### CommitteeService

- **Prior Coverage:** Well documented
- **Operations in WSDL:** 8
- **Newly Documented Operations:**
  - `GetActiveCommittees`
  - `GetActiveHouseCommittees`
  - `GetActiveSenateCommittees`
  - `GetActiveCommitteeMembers`
- **Notes:** Active/current session convenience methods now confirmed

### LegislationService

- **Prior Coverage:** Extensively documented
- **Operations in WSDL:** 39
- **Newly Documented Operations:**
  - `GetLegislativeBillListFeatureData`
  - `GetLegislationNotYetIntroducedInHouseOfOrigin`
  - `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody`
  - `GetPreFiledLegislationInfo`
  - `GetLegislationHistoricalRecapCategoriesByLegislationNumber`
- **Notes:** Multiple convenience query operations now fully documented

### LegislativeDocumentService

- **Prior Coverage:** Documented
- **Operations in WSDL:** 4
- **Notes:** All operations match prior research

### RcwCiteAffectedService

- **Prior Coverage:** Mentioned but sparse
- **Operations in WSDL:** 2
- **Newly Documented Operations:**
  - `GetLegislationAffectingRcw`
  - `GetLegislationAffectingRcwCite`
- **Notes:** Both title-level and section-level RCW queries confirmed

### SessionLawService

- **Prior Coverage:** Documented
- **Operations in WSDL:** 5
- **Newly Documented Operations:**
  - `GetSessionLawByInitiativeNumber`
- **Notes:** Initiative support now confirmed

### SponsorService

- **Prior Coverage:** Documented
- **Operations in WSDL:** 4
- **Newly Documented Operations:**
  - `GetRequesters`
- **Notes:** Requester entities (agencies, Governor, etc.) now exposed

## Key Discoveries from Official Specs

### 1. Operations Missing from Prior Research

The following operations were not mentioned or were only partially documented:

- GetLegislativeBillListFeatureData - Returns DataTable for bill list features
- GetLegislationHistoricalRecapCategoriesByLegislationNumber - Historical action categories
- GetLegislationNotYetIntroducedInHouseOfOrigin - Pre-introduction bills
- GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody - Stalled cross-chamber bills
- GetActiveCommittees/GetActiveHouseCommittees/GetActiveSenateCommittees - Current session shortcuts
- GetLegislationScheduledHearingsByCommittee - Upcoming hearing schedule
- GetLegislationReportedOutOfCommittee - Bills reported out in date range
- GetRevisedCommitteeMeetings - Meetings revised since date
- GetSessionLawByInitiativeNumber - Initiative-specific session law lookup
- GetRequesters - All entities that can request legislation

### 2. Response Schema Clarifications

The official WSDLs provide complete schema definitions including:

- **Cardinality:** minOccurs/maxOccurs for all fields (required vs optional)
- **Type Inheritance:** LegislativeEntity base type for Member, Committee, Sponsor
- **Nesting:** Full nested structure (e.g., RollCall → Votes → Vote)
- **Array Types:** Explicit ArrayOf* wrapper types for collections

### 3. Enumerations Confirmed

Two formal enumerations were confirmed:

- **VoteType:** Yea, Nay, Absent, Excused
- **RecommendationType:** Majority, Minority


### 4. Data Dictionary Integration

The WebServiceDataDictionary.doc provides official definitions for all fields including:

- Maximum lengths for varchar fields
- Allowed values for constrained fields (Agency, HearingType, etc.)
- Business context and examples
- Format specifications (Biennium as YYYY-YY)

## Remaining Gaps

The following were mentioned in prior research but not in official specs:

- **FiscalNoteService:** Referenced in GPT.md but no WSDL provided
- **TestimonyService:** Mentioned as potential but not implemented
- **Gut-and-replace relationships:** Not explicitly exposed via API
- **Striker amendment details:** Available via Description field only

## Recommendations

1. **Use API_CATALOG.json** as source of truth for code generation
2. **Validate biennium format** - must be YYYY-YY (e.g., 2023-24)
3. **Handle optional fields** - most string fields may be null
4. **Leverage Active* methods** for current session queries
5. **Use GetRevisedCommitteeMeetings** for incremental sync of meetings
6. **Join keys confirmed:** Biennium + BillNumber/BillId, AgendaId for meetings, MemberId for members
