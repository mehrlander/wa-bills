# Washington State Legislative Web Services API Reference

**Source:** https://wslwebservices.leg.wa.gov/

**Generated:** 2026-01-02

**Historical Coverage:** Data available from 1991-92 biennium to current

**Authentication:** None required

## Overview

- **Services:** 9
- **Total Operations:** 82

## Table of Contents

1. [AmendmentService](#amendmentservice)
2. [CommitteeActionService](#committeeactionservice)
3. [CommitteeMeetingService](#committeemeetingservice)
4. [CommitteeService](#committeeservice)
5. [LegislationService](#legislationservice)
6. [LegislativeDocumentService](#legislativedocumentservice)
7. [RcwCiteAffectedService](#rcwciteaffectedservice)
8. [SessionLawService](#sessionlawservice)
9. [SponsorService](#sponsorservice)

---

## AmendmentService

https://wslwebservices.leg.wa.gov/AmendmentService.asmx

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetAmendments` (ArrayOfAmendment) | `[int]year` |

> **Example:** [`GetAmendments?year=2025`](https://wslwebservices.leg.wa.gov/AmendmentService.asmx/GetAmendments?year=2025)

---

## CommitteeActionService

https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx

#### Bills by Committee Status

Returns legislation with the specified committee status. CommitteeName is the Name property from `GetActiveHouseCommittees` / `GetActiveSenateCommittees`.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

- `GetDoPassByCommittee`
- `GetDoPassWithAmendmentsByCommittee`
- `GetDoPassWithAmendmentsToSubByCommittee`
- `GetDoPassSubstituteByCommittee`
- `GetInCommittee`
- `GetMajorityReportByCommittee`
- `GetMinorityReportByCommittee`
- `GetReReferralByCommittee`
- `GetReferredToAnotherCommitteeByCommittee`
- `GetReferredToCommittee`
- `GetRemovedFromCommittee`
- `GetWithoutRecommendationByCommittee`

> **Example:** [`GetInCommittee?biennium=2025-26&agency=House&committeeName=Appropriations`](https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx/GetInCommittee?biennium=2025-26&agency=House&committeeName=Appropriations)

#### Other Operations

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetCommitteeReferralsByCommittee` (ArrayOfCommitteeReferral) | `[str]biennium?, [str]agency?, [str]committeeName?` |
| `GetCommitteeReferralsByBill` (ArrayOfCommitteeReferral) | `[str]biennium?, [int]billNumber` |
| `GetCommitteeExecutiveActionsByBill` (ArrayOfCommitteeAction) | `[str]biennium?, [int]billNumber` |
| `GetLegislationReportedOutOfCommittee` (ArrayOfLegislationInfo) | `[str]committeeName?, [str]agency?, [dt]beginDate, [dt]endDate` |
| `GetLegislationScheduledHearingsByCommittee` (ArrayOfLegislationFamily) | `[str]biennium?, [str]agency?, [str]committeeName?` |

> **Examples:**
> [`GetCommitteeReferralsByBill?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx/GetCommitteeReferralsByBill?biennium=2025-26&billNumber=1000)
> | [`GetLegislationReportedOutOfCommittee?committeeName=Appropriations&agency=House&beginDate=2025-01-01&endDate=2025-12-31`](https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx/GetLegislationReportedOutOfCommittee?committeeName=Appropriations&agency=House&beginDate=2025-01-01&endDate=2025-12-31)

---

## CommitteeMeetingService

https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetCommitteeMeetings` (ArrayOfCommitteeMeeting) | `[dt]beginDate, [dt]endDate` |
| `GetRevisedCommitteeMeetings` (ArrayOfCommitteeMeeting) | `[dt]changedSinceDate` |
| `GetCommitteeMeetingItems` (ArrayOfCommitteeMeetingItem) | `[int]agendaId` |

> **Examples:**
> [`GetCommitteeMeetings?beginDate=2025-01-01&endDate=2025-03-31`](https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx/GetCommitteeMeetings?beginDate=2025-01-01&endDate=2025-03-31)
> | [`GetRevisedCommitteeMeetings?changedSinceDate=2025-01-01`](https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx/GetRevisedCommitteeMeetings?changedSinceDate=2025-01-01)

---

## CommitteeService

https://wslwebservices.leg.wa.gov/CommitteeService.asmx

#### Standing Committees by Biennium

`([str]biennium?) => ArrayOfCommittee`

- `GetCommittees`
- `GetHouseCommittees`
- `GetSenateCommittees`

> **Example:** [`GetCommittees?biennium=2025-26`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetCommittees?biennium=2025-26)

#### Active Standing Committees

`() => ArrayOfCommittee`

- `GetActiveCommittees`
- `GetActiveHouseCommittees`
- `GetActiveSenateCommittees`

> **Example:** [`GetActiveCommittees`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetActiveCommittees)

#### Committee Members

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetCommitteeMembers` (ArrayOfMember) | `[str]biennium?, [str]agency?, [str]committeeName?` |
| `GetActiveCommitteeMembers` (ArrayOfMember) | `[str]agency?, [str]committeeName?` |

**Note:** CommitteeName for `GetCommitteeMembers` from `GetHouseCommittees` / `GetSenateCommittees`. For `GetActiveCommitteeMembers` from `GetActiveHouseCommittees` / `GetActiveSenateCommittees`.

> **Examples:**
> [`GetCommitteeMembers?biennium=2025-26&agency=House&committeeName=Appropriations`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetCommitteeMembers?biennium=2025-26&agency=House&committeeName=Appropriations)
> | [`GetActiveCommitteeMembers?agency=Senate&committeeName=Ways%20%26%20Means`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetActiveCommitteeMembers?agency=Senate&committeeName=Ways%20%26%20Means)

---

## LegislationService

https://wslwebservices.leg.wa.gov/LegislationService.asmx

#### Bill-Specific Queries

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetLegislation` (ArrayOfLegislation) | `[str]biennium?, [int]billNumber` |
| `GetLegislationByRequestNumber` (Legislation) | `[str]biennium?, [str]requestNumber?` |
| `GetCurrentStatus` (LegislativeStatus) | `[str]biennium?, [int]billNumber` |
| `GetSponsors` (format: `2005-06`) (ArrayOfSponsor) | `[str]biennium?, [str]billId?` |
| `GetRollCalls` (ArrayOfRollCall) | `[str]biennium?, [int]billNumber` |
| `GetHearings` (ArrayOfHearing) | `[str]biennium?, [int]billNumber` |
| `GetAmendmentsForYear` (pending & acted-on) (ArrayOfAmendment) | `[int]year, [int]billNumber` |
| `GetAmendmentsForBiennium` (pending & acted-on) (ArrayOfAmendment) | `[str]biennium?, [int]billNumber` |
| `GetRcwCitesAffected` (ArrayOfRcwCiteAffected) | `[str]biennium?, [str]billId?` |
| `GetSessionLawChapter` (SessionLaw) | `[str]biennium?, [str]billId?` |

**Note:** `GetLegislation` returns substitutes listed separately; active flag indicates passable on floor.

> **Examples:**
> [`GetLegislation?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislation?biennium=2025-26&billNumber=1000)
> | [`GetSponsors?biennium=2025-26&billId=HB%201000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetSponsors?biennium=2025-26&billId=HB%201000)
> | [`GetRollCalls?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetRollCalls?biennium=2025-26&billNumber=1000)

#### Status Changes

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetLegislativeStatusChangesByBillNumber` (ArrayOfLegislativeStatus) | `[str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate` |
| `GetLegislativeStatusChangesByBillId` (ArrayOfLegislativeStatus) | `[str]biennium?, [str]billId?, [dt]beginDate, [dt]endDate` |
| `GetLegislativeStatusChangesByDateRange` (ArrayOfLegislativeStatus) | `[str]biennium?, [dt]beginDate, [dt]endDate` |
| `GetLegislationHistoricalRecapCategoriesByLegislationNumber` (ArrayOfLegislationRecapCategories) | `[str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate` |

> **Example:** [`GetLegislativeStatusChangesByBillNumber?biennium=2025-26&billNumber=1000&beginDate=2025-01-01&endDate=2025-12-31`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislativeStatusChangesByBillNumber?biennium=2025-26&billNumber=1000&beginDate=2025-01-01&endDate=2025-12-31)

#### Legislation Listings

`ArrayOfLegislation` returns detailed fields; `ArrayOfLegislationInfo` is a summary subset. Substitutes listed separately; active flag = passable on the floor.

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetLegislationIntroducedSince` (ArrayOfLegislation) | `[dt]sinceDate` |
| `GetPrefiledLegislation` (ArrayOfLegislation) | |
| `GetLegislationByYear` (ArrayOfLegislationInfo) | `[int]year` |
| `GetLegislationInfoIntroducedSince` (ArrayOfLegislationInfo) | `[dt]sinceDate` |
| `GetPreFiledLegislationInfo` (ArrayOfLegislationInfo) | |
| `GetLegislationTypes` (ArrayOfLegislationType) | |
| `GetTotalLegislationIntroducedByDateRange` (int) | `[dt]beginDate, [dt]endDate, [int]legTypeId, [int]agencyId, [bool]allVersions` |

**Note:** Use `GetLegislation` instead of `GetPrefiledLegislation` after bill introduction.

> **Examples:**
> [`GetLegislationByYear?year=2025`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationByYear?year=2025)
> | [`GetLegislationIntroducedSince?sinceDate=2025-01-01`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=2025-01-01)
> | [`GetLegislationTypes`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationTypes)

#### Passed Legislation by Biennium

`([str]biennium?) => ArrayOfLegislationInfo`

- `GetHouseLegislationPassedHouse`
- `GetHouseLegislationPassedSenate`
- `GetSenateLegislationPassedSenate`
- `GetSenateLegislationPassedHouse`
- `GetLegislationPassedHouse`
- `GetLegislationPassedSenate`
- `GetLegislationPassedLegislature`
- `GetPublishedEnrolledLegislation`

> **Example:** [`GetLegislationPassedHouse?biennium=2025-26`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationPassedHouse?biennium=2025-26)

#### Passed Legislation by Time Frame

Returns bills that first passed the given body within the date range, even if no longer in passed status (e.g., amended by the opposite body). For current-status filtering, use the biennium variants above.

`([dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

- `GetLegislationPassedHouseWithinTimeFrame`
- `GetLegislationPassedSenateWithinTimeFrame`
- `GetLegislationPassedLegislatureWithinTimeFrame`

> **Example:** [`GetLegislationPassedHouseWithinTimeFrame?beginDate=2025-01-01&endDate=2025-12-31`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationPassedHouseWithinTimeFrame?beginDate=2025-01-01&endDate=2025-12-31)

#### Governor Actions

`([str]biennium?, [str]agency?) => ArrayOfLegislationInfo`

- `GetLegislationGovernorSigned`
- `GetLegislationGovernorVeto`
- `GetLegislationGovernorPartialVeto`

> **Example:** [`GetLegislationGovernorSigned?biennium=2025-26&agency=House`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationGovernorSigned?biennium=2025-26&agency=House)

#### Other

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetLegislationNotYetIntroducedInHouseOfOrigin` (with available text) (ArrayOfLegislationInfo) | `[str]biennium?` |
| `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody` (ArrayOfLegislationInfo) | `[str]biennium?` |
| `GetLegislativeBillListFeatureData` (internal) (DataTable) | |

> **Example:** [`GetLegislationNotYetIntroducedInHouseOfOrigin?biennium=2025-26`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationNotYetIntroducedInHouseOfOrigin?biennium=2025-26)

---

## LegislativeDocumentService

https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx

Data available back to 1991-92. For initiatives, use `namedLike: "Initiative"`.

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetDocumentsByClass` (ArrayOfLegislativeDocument) | `[str]biennium?, [str]documentClass?, [str]namedLike?` |
| `GetDocuments` (ArrayOfLegislativeDocument) | `[str]biennium?, [str]namedLike?` |
| `GetAllDocumentsByClass` (ArrayOfLegislativeDocument) | `[str]biennium?, [str]documentClass?` |
| `GetDocumentClasses` (ArrayOfAnyType) | `[str]biennium?` |

> **Examples:**
> [`GetDocumentClasses?biennium=2025-26`](https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetDocumentClasses?biennium=2025-26)
> | [`GetDocumentsByClass?biennium=2025-26&documentClass=Bills&namedLike=1000`](https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetDocumentsByClass?biennium=2025-26&documentClass=Bills&namedLike=1000)

---

## RcwCiteAffectedService

https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetLegislationAffectingRcwCite` (specific cite) (ArrayOfLegislationInfo) | `[str]biennium?, [str]rcwCite?` |
| `GetLegislationAffectingRcw` (title, chapter, or section) (ArrayOfLegislationInfo) | `[str]biennium?, [str]rcwCite?` |

> **Examples:**
> [`GetLegislationAffectingRcwCite?biennium=2025-26&rcwCite=28A.150.220`](https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx/GetLegislationAffectingRcwCite?biennium=2025-26&rcwCite=28A.150.220)
> | [`GetLegislationAffectingRcw?biennium=2025-26&rcwCite=28A`](https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx/GetLegislationAffectingRcw?biennium=2025-26&rcwCite=28A)

---

## SessionLawService

https://wslwebservices.leg.wa.gov/SessionLawService.asmx

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetSessionLawByBill` (excludes initiatives) (SessionLaw) | `[str]biennium?, [int]billNumber` |
| `GetSessionLawByBillId` (excludes initiatives) (SessionLaw) | `[str]biennium?, [str]billId?` |
| `GetSessionLawByInitiativeNumber` (Initiative to Legislature) (SessionLaw) | `[int]initiativeNumber` |
| `GetBillByChapterNumber` (Session: 0=Regular, 1=1st Special, etc.) (Legislation) | `[int]year, [int]session, [int]chapterNumber` |
| `GetChapterNumbersByYear` (ArrayOfSessionLaw) | `[int]year` |

> **Examples:**
> [`GetChapterNumbersByYear?year=2025`](https://wslwebservices.leg.wa.gov/SessionLawService.asmx/GetChapterNumbersByYear?year=2025)
> | [`GetSessionLawByBill?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/SessionLawService.asmx/GetSessionLawByBill?biennium=2025-26&billNumber=1000)

---

## SponsorService

https://wslwebservices.leg.wa.gov/SponsorService.asmx

#### Legislators by Biennium

`([str]biennium?) => ArrayOfMember`

- `GetSponsors`
- `GetHouseSponsors`
- `GetSenateSponsors`

> **Example:** [`GetSponsors?biennium=2025-26`](https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetSponsors?biennium=2025-26)

#### Other

| Operation (Returns) | Parameters |
|---------------------|------------|
| `GetRequesters` (entities that can request legislation) (ArrayOfLegislativeEntity) | `[str]biennium?` |

> **Example:** [`GetRequesters?biennium=2025-26`](https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetRequesters?biennium=2025-26)
