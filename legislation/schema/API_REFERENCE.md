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

**Endpoint:** `https://wslwebservices.leg.wa.gov/AmendmentService.asmx`

Amendments to legislation considered by the Washington State Legislature.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetAmendments` | `([int]year) => ArrayOfAmendment` | Amendments submitted to the rostrum during the year. |

---

## CommitteeActionService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx`

Committee actions by the Washington State Legislature.

#### Bills by Committee Status

Returns legislation with the specified committee status. CommitteeName is the Name property from `GetActiveHouseCommittees` / `GetActiveSenateCommittees`.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

| Operation | Status |
|-----------|--------|
| `GetDoPassByCommittee` | Do pass |
| `GetDoPassWithAmendmentsByCommittee` | Do pass with amendments |
| `GetDoPassWithAmendmentsToSubByCommittee` | Do pass with amendments to substitute |
| `GetDoPassSubstituteByCommittee` | Substitute do pass |
| `GetInCommittee` | In committee |
| `GetMajorityReportByCommittee` | Majority report |
| `GetMinorityReportByCommittee` | Minority report |
| `GetReReferralByCommittee` | Re-referral |
| `GetReferredToAnotherCommitteeByCommittee` | Referred to another committee |
| `GetReferredToCommittee` | Referred to committee |
| `GetRemovedFromCommittee` | Removed from committee |
| `GetWithoutRecommendationByCommittee` | Without recommendation |

#### Other Operations

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetCommitteeReferralsByCommittee` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfCommitteeReferral` | Bills referred to the committee. |
| `GetCommitteeReferralsByBill` | `([str]biennium?, [int]billNumber) => ArrayOfCommitteeReferral` | Committee referrals for a bill. |
| `GetCommitteeExecutiveActionsByBill` | `([str]biennium?, [int]billNumber) => ArrayOfCommitteeAction` | Executive committee actions for a bill. |
| `GetLegislationReportedOutOfCommittee` | `([str]committeeName?, [str]agency?, [dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo` | Bills reported out of committee within a date range. |
| `GetLegislationScheduledHearingsByCommittee` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationFamily` | Bills with hearings scheduled in the committee. |

---

## CommitteeMeetingService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx`

Committee meetings of the Washington State Legislature.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetCommitteeMeetings` | `([dt]beginDate, [dt]endDate) => ArrayOfCommitteeMeeting` | Meetings within a date range. |
| `GetRevisedCommitteeMeetings` | `([dt]changedSinceDate) => ArrayOfCommitteeMeeting` | Meetings revised since a given date. |
| `GetCommitteeMeetingItems` | `([int]agendaId) => ArrayOfCommitteeMeetingItem` | Items for a specific meeting. |

---

## CommitteeService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeService.asmx`

Committees of the Washington State Legislature.

#### Standing Committees by Biennium

`([str]biennium?) => ArrayOfCommittee`

| Operation | Scope |
|-----------|-------|
| `GetCommittees` | House and Senate |
| `GetHouseCommittees` | House only |
| `GetSenateCommittees` | Senate only |

#### Active Standing Committees

`() => ArrayOfCommittee`

| Operation | Scope |
|-----------|-------|
| `GetActiveCommittees` | House and Senate |
| `GetActiveHouseCommittees` | House only |
| `GetActiveSenateCommittees` | Senate only |

#### Committee Members

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetCommitteeMembers` | `([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfMember` | Members for a biennium. CommitteeName from `GetHouseCommittees` / `GetSenateCommittees`. |
| `GetActiveCommitteeMembers` | `([str]agency?, [str]committeeName?) => ArrayOfMember` | Current members. CommitteeName from `GetActiveHouseCommittees` / `GetActiveSenateCommittees`. |

---

## LegislationService

**Endpoint:** `https://wslwebservices.leg.wa.gov/LegislationService.asmx`

Legislation being considered by the Washington State Legislature.

#### Bill-Specific Queries

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetLegislation` | `([str]biennium?, [int]billNumber) => ArrayOfLegislation` | Detailed bill info. Substitutes listed separately; active flag = passable on floor. |
| `GetLegislationByRequestNumber` | `([str]biennium?, [str]requestNumber?) => Legislation` | Legislation by original draft request number. |
| `GetCurrentStatus` | `([str]biennium?, [int]billNumber) => LegislativeStatus` | Current status in the legislative process. |
| `GetSponsors` | `([str]biennium?, [str]billId?) => ArrayOfSponsor` | Bill sponsors. Biennium format: `2005-06`. |
| `GetRollCalls` | `([str]biennium?, [int]billNumber) => ArrayOfRollCall` | Roll calls taken on a bill. |
| `GetHearings` | `([str]biennium?, [int]billNumber) => ArrayOfHearing` | Committee hearings for a bill. |
| `GetAmendmentsForYear` | `([int]year, [int]billNumber) => ArrayOfAmendment` | Pending and acted-on amendments during the year. |
| `GetAmendmentsForBiennium` | `([str]biennium?, [int]billNumber) => ArrayOfAmendment` | Pending and acted-on amendments during the biennium. |
| `GetRcwCitesAffected` | `([str]biennium?, [str]billId?) => ArrayOfRcwCiteAffected` | RCW cites referenced in the bill. |
| `GetSessionLawChapter` | `([str]biennium?, [str]billId?) => SessionLaw` | Chapter and session law info for a bill. |

#### Status Changes

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetLegislativeStatusChangesByBillNumber` | `([str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` | By bill number within a date range. |
| `GetLegislativeStatusChangesByBillId` | `([str]biennium?, [str]billId?, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` | By bill ID within a date range. |
| `GetLegislativeStatusChangesByDateRange` | `([str]biennium?, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus` | All changes within a date range. |
| `GetLegislationHistoricalRecapCategoriesByLegislationNumber` | `([str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate) => ArrayOfLegislationRecapCategories` | Historical recap (status) categories for a bill. |

#### Legislation Listings

`ArrayOfLegislation` returns detailed fields; `ArrayOfLegislationInfo` is a summary subset. Substitutes listed separately; active flag = passable on the floor.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetLegislationIntroducedSince` | `([dt]sinceDate) => ArrayOfLegislation` | Detailed — bills introduced since date. |
| `GetPrefiledLegislation` | `() => ArrayOfLegislation` | Detailed — prefiled bills. Use `GetLegislation` after introduction. |
| `GetLegislationByYear` | `([int]year) => ArrayOfLegislationInfo` | Summary — bills active during the year. |
| `GetLegislationInfoIntroducedSince` | `([dt]sinceDate) => ArrayOfLegislationInfo` | Summary — bills introduced since date. |
| `GetPreFiledLegislationInfo` | `() => ArrayOfLegislationInfo` | Summary — prefiled bills. |
| `GetLegislationTypes` | `() => ArrayOfLegislationType` | All valid legislation types. |
| `GetTotalLegislationIntroducedByDateRange` | `([dt]beginDate, [dt]endDate, [int]legTypeId, [int]agencyId, [bool]allVersions) => int` | Count of legislation introduced in date range by type. |

#### Passed Legislation by Biennium

`([str]biennium?) => ArrayOfLegislationInfo`

| Operation | Description |
|-----------|-------------|
| `GetHouseLegislationPassedHouse` | House bills passed the House |
| `GetHouseLegislationPassedSenate` | House bills passed the Senate |
| `GetSenateLegislationPassedSenate` | Senate bills passed the Senate |
| `GetSenateLegislationPassedHouse` | Senate bills passed the House |
| `GetLegislationPassedHouse` | All bills passed the House |
| `GetLegislationPassedSenate` | All bills passed the Senate |
| `GetLegislationPassedLegislature` | All bills passed the legislature |
| `GetPublishedEnrolledLegislation` | Bills enrolled and published |

#### Passed Legislation by Time Frame

Returns bills that first passed the given body within the date range, even if no longer in passed status (e.g., amended by the opposite body). For current-status filtering, use the biennium variants above.

`([dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

| Operation | Body |
|-----------|------|
| `GetLegislationPassedHouseWithinTimeFrame` | House |
| `GetLegislationPassedSenateWithinTimeFrame` | Senate |
| `GetLegislationPassedLegislatureWithinTimeFrame` | Legislature |

#### Governor Actions

`([str]biennium?, [str]agency?) => ArrayOfLegislationInfo`

| Operation | Action |
|-----------|--------|
| `GetLegislationGovernorSigned` | Signed |
| `GetLegislationGovernorVeto` | Vetoed |
| `GetLegislationGovernorPartialVeto` | Partially vetoed |

#### Other

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetLegislationNotYetIntroducedInHouseOfOrigin` | `([str]biennium?) => ArrayOfLegislationInfo` | Active bills with available text, not yet introduced in house of origin. |
| `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody` | `([str]biennium?) => ArrayOfLegislationInfo` | Bills passed originating body, not yet introduced in opposite body. |
| `GetLegislativeBillListFeatureData` | `() => DataTable` | Internal — .NET DataTable for the LegislativeBillList SharePoint feature. |

---

## LegislativeDocumentService

**Endpoint:** `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx`

Documents relating to legislation. Results include PDF and HTM URLs. Data available back to 1991-92. For initiatives, use `namedLike: "Initiative"`.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetDocumentsByClass` | `([str]biennium?, [str]documentClass?, [str]namedLike?) => ArrayOfLegislativeDocument` | Documents of a given class matching `namedLike`. |
| `GetDocuments` | `([str]biennium?, [str]namedLike?) => ArrayOfLegislativeDocument` | Documents matching `namedLike`. |
| `GetAllDocumentsByClass` | `([str]biennium?, [str]documentClass?) => ArrayOfLegislativeDocument` | All documents of a given class. |
| `GetDocumentClasses` | `([str]biennium?) => ArrayOfAnyType` | Available document types for the biennium. |

---

## RcwCiteAffectedService

**Endpoint:** `https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx`

RCW cites affected by legislation.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetLegislationAffectingRcwCite` | `([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo` | Legislation affecting a specific RCW cite. |
| `GetLegislationAffectingRcw` | `([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo` | Legislation affecting an RCW by title, chapter, or section. |

---

## SessionLawService

**Endpoint:** `https://wslwebservices.leg.wa.gov/SessionLawService.asmx`

Session laws of the Washington State Legislature.

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetSessionLawByBill` | `([str]biennium?, [int]billNumber) => SessionLaw` | Session law for a bill (not initiatives). |
| `GetSessionLawByBillId` | `([str]biennium?, [str]billId?) => SessionLaw` | Session law for a bill by ID. |
| `GetSessionLawByInitiativeNumber` | `([int]initiativeNumber) => SessionLaw` | Session law for an Initiative to the Legislature. |
| `GetBillByChapterNumber` | `([int]year, [int]session, [int]chapterNumber) => Legislation` | Bill for a chapter. Session: 0=Regular, 1=1st Special, etc. |
| `GetChapterNumbersByYear` | `([int]year) => ArrayOfSessionLaw` | All chapters for a year. |

---

## SponsorService

**Endpoint:** `https://wslwebservices.leg.wa.gov/SponsorService.asmx`

Sponsors of legislation in the Washington State Legislature.

#### Legislators by Biennium

`([str]biennium?) => ArrayOfMember`

| Operation | Scope |
|-----------|-------|
| `GetSponsors` | All Representatives and Senators |
| `GetHouseSponsors` | Representatives only |
| `GetSenateSponsors` | Senators only |

#### Other

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `GetRequesters` | `([str]biennium?) => ArrayOfLegislativeEntity` | Entities that can request legislation. |
