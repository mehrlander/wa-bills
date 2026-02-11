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

| Operation | Signature |
|-----------|-----------|
| `GetAmendments` | `([int]year) => ArrayOfAmendment` |

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

| Operation | Signature |
|-----------|-----------|
| `GetCommitteeReferralsByCommittee` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfCommitteeReferral` |
| `GetCommitteeReferralsByBill` | `([str]biennium?, [int]billNumber) => ArrayOfCommitteeReferral` |
| `GetCommitteeExecutiveActionsByBill` | `([str]biennium?, [int]billNumber) => ArrayOfCommitteeAction` |
| `GetLegislationReportedOutOfCommittee` | `([str]committeeName?, [str]agency?, [dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo` |
| `GetLegislationScheduledHearingsByCommittee` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationFamily` |

> **Examples:**
> [`GetCommitteeReferralsByBill?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx/GetCommitteeReferralsByBill?biennium=2025-26&billNumber=1000)
> | [`GetLegislationReportedOutOfCommittee?committeeName=Appropriations&agency=House&beginDate=2025-01-01&endDate=2025-12-31`](https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx/GetLegislationReportedOutOfCommittee?committeeName=Appropriations&agency=House&beginDate=2025-01-01&endDate=2025-12-31)

---

## CommitteeMeetingService

https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx

| Operation | Signature |
|-----------|-----------|
| `GetCommitteeMeetings` | `([dt]beginDate, [dt]endDate) => ArrayOfCommitteeMeeting` |
| `GetRevisedCommitteeMeetings` | `([dt]changedSinceDate) => ArrayOfCommitteeMeeting` |
| `GetCommitteeMeetingItems` | `([int]agendaId) => ArrayOfCommitteeMeetingItem` |

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

| Operation | Signature |
|-----------|-----------|
| `GetCommitteeMembers` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfMember` |
| `GetActiveCommitteeMembers` | `([str]agency?, [str]committeeName?) => ArrayOfMember` |

**Note:** CommitteeName for `GetCommitteeMembers` from `GetHouseCommittees` / `GetSenateCommittees`. For `GetActiveCommitteeMembers` from `GetActiveHouseCommittees` / `GetActiveSenateCommittees`.

> **Examples:**
> [`GetCommitteeMembers?biennium=2025-26&agency=House&committeeName=Appropriations`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetCommitteeMembers?biennium=2025-26&agency=House&committeeName=Appropriations)
> | [`GetActiveCommitteeMembers?agency=Senate&committeeName=Ways%20%26%20Means`](https://wslwebservices.leg.wa.gov/CommitteeService.asmx/GetActiveCommitteeMembers?agency=Senate&committeeName=Ways%20%26%20Means)

---

## LegislationService

https://wslwebservices.leg.wa.gov/LegislationService.asmx

#### Bill-Specific Queries

| Operation | Signature |
|-----------|-----------|
| `GetLegislation` | `([str]biennium?, [int]billNumber) => ArrayOfLegislation` |
| `GetLegislationByRequestNumber` | `([str]biennium?, [str]requestNumber?) => Legislation` |
| `GetCurrentStatus` | `([str]biennium?, [int]billNumber) => LegislativeStatus` |
| `GetSponsors` (format: `2005-06`) | `([str]biennium?, [str]billId?) => ArrayOfSponsor` |
| `GetRollCalls` | `([str]biennium?, [int]billNumber) => ArrayOfRollCall` |
| `GetHearings` | `([str]biennium?, [int]billNumber) => ArrayOfHearing` |
| `GetAmendmentsForYear` (pending & acted-on) | `([int]year, [int]billNumber) => ArrayOfAmendment` |
| `GetAmendmentsForBiennium` (pending & acted-on) | `([str]biennium?, [int]billNumber) => ArrayOfAmendment` |
| `GetRcwCitesAffected` | `([str]biennium?, [str]billId?) => ArrayOfRcwCiteAffected` |
| `GetSessionLawChapter` | `([str]biennium?, [str]billId?) => SessionLaw` |

**Note:** `GetLegislation` returns substitutes listed separately; active flag indicates passable on floor.

> **Examples:**
> [`GetLegislation?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislation?biennium=2025-26&billNumber=1000)
> | [`GetSponsors?biennium=2025-26&billId=HB%201000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetSponsors?biennium=2025-26&billId=HB%201000)
> | [`GetRollCalls?biennium=2025-26&billNumber=1000`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetRollCalls?biennium=2025-26&billNumber=1000)

#### Status Changes

| Operation | Signature |
|-----------|-----------|
| `GetLegislativeStatusChangesByBillNumber` | `([str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` |
| `GetLegislativeStatusChangesByBillId` | `([str]biennium?, [str]billId?, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` |
| `GetLegislativeStatusChangesByDateRange` | `([str]biennium?, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` |
| `GetLegislationHistoricalRecapCategoriesByLegislationNumber` | `([str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate) => ArrayOfLegislationRecapCategories` |

> **Example:** [`GetLegislativeStatusChangesByBillNumber?biennium=2025-26&billNumber=1000&beginDate=2025-01-01&endDate=2025-12-31`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislativeStatusChangesByBillNumber?biennium=2025-26&billNumber=1000&beginDate=2025-01-01&endDate=2025-12-31)

#### Legislation Listings

`ArrayOfLegislation` returns detailed fields; `ArrayOfLegislationInfo` is a summary subset. Substitutes listed separately; active flag = passable on the floor.

| Operation | Signature |
|-----------|-----------|
| `GetLegislationIntroducedSince` | `([dt]sinceDate) => ArrayOfLegislation` |
| `GetPrefiledLegislation` | `() => ArrayOfLegislation` |
| `GetLegislationByYear` | `([int]year) => ArrayOfLegislationInfo` |
| `GetLegislationInfoIntroducedSince` | `([dt]sinceDate) => ArrayOfLegislationInfo` |
| `GetPreFiledLegislationInfo` | `() => ArrayOfLegislationInfo` |
| `GetLegislationTypes` | `() => ArrayOfLegislationType` |
| `GetTotalLegislationIntroducedByDateRange` | `([dt]beginDate, [dt]endDate, [int]legTypeId, [int]agencyId, [bool]allVersions) => int` |

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

| Operation | Signature |
|-----------|-----------|
| `GetLegislationNotYetIntroducedInHouseOfOrigin` (with available text) | `([str]biennium?) => ArrayOfLegislationInfo` |
| `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody` | `([str]biennium?) => ArrayOfLegislationInfo` |
| `GetLegislativeBillListFeatureData` (internal) | `() => DataTable` |

> **Example:** [`GetLegislationNotYetIntroducedInHouseOfOrigin?biennium=2025-26`](https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationNotYetIntroducedInHouseOfOrigin?biennium=2025-26)

---

## LegislativeDocumentService

https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx

Data available back to 1991-92. For initiatives, use `namedLike: "Initiative"`.

| Operation | Signature |
|-----------|-----------|
| `GetDocumentsByClass` | `([str]biennium?, [str]documentClass?, [str]namedLike?) => ArrayOfLegislativeDocument` |
| `GetDocuments` | `([str]biennium?, [str]namedLike?) => ArrayOfLegislativeDocument` |
| `GetAllDocumentsByClass` | `([str]biennium?, [str]documentClass?) => ArrayOfLegislativeDocument` |
| `GetDocumentClasses` | `([str]biennium?) => ArrayOfAnyType` |

> **Examples:**
> [`GetDocumentClasses?biennium=2025-26`](https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetDocumentClasses?biennium=2025-26)
> | [`GetDocumentsByClass?biennium=2025-26&documentClass=Bills&namedLike=1000`](https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx/GetDocumentsByClass?biennium=2025-26&documentClass=Bills&namedLike=1000)

---

## RcwCiteAffectedService

https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx

RCW cites affected by legislation.

| Operation | Signature |
|-----------|-----------|
| `GetLegislationAffectingRcwCite` (specific cite) | `([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo` |
| `GetLegislationAffectingRcw` (title, chapter, or section) | `([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo` |

> **Examples:**
> [`GetLegislationAffectingRcwCite?biennium=2025-26&rcwCite=28A.150.220`](https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx/GetLegislationAffectingRcwCite?biennium=2025-26&rcwCite=28A.150.220)
> | [`GetLegislationAffectingRcw?biennium=2025-26&rcwCite=28A`](https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx/GetLegislationAffectingRcw?biennium=2025-26&rcwCite=28A)

---

## SessionLawService

https://wslwebservices.leg.wa.gov/SessionLawService.asmx

| Operation | Signature |
|-----------|-----------|
| `GetSessionLawByBill` (excludes initiatives) | `([str]biennium?, [int]billNumber) => SessionLaw` |
| `GetSessionLawByBillId` (excludes initiatives) | `([str]biennium?, [str]billId?) => SessionLaw` |
| `GetSessionLawByInitiativeNumber` (Initiative to Legislature) | `([int]initiativeNumber) => SessionLaw` |
| `GetBillByChapterNumber` (Session: 0=Regular, 1=1st Special, etc.) | `([int]year, [int]session, [int]chapterNumber) => Legislation` |
| `GetChapterNumbersByYear` | `([int]year) => ArrayOfSessionLaw` |

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

| Operation | Signature |
|-----------|-----------|
| `GetRequesters` (entities that can request legislation) | `([str]biennium?) => ArrayOfLegislativeEntity` |

> **Example:** [`GetRequesters?biennium=2025-26`](https://wslwebservices.leg.wa.gov/SponsorService.asmx/GetRequesters?biennium=2025-26)
