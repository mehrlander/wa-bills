# Washington State Legislative Web Services API Reference

**Source:** https://wslwebservices.leg.wa.gov/

**Generated:** 2026-01-02

**Historical Coverage:** Data available from 1991-92 biennium to current

**Authentication:** None required

## Overview

- **Services:** 9
- **Total Operations:** 83
- **Complex Types:** 52
- **Enumerations:** 2

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
10. [Common Types](#common-types)
11. [Enumerations](#enumerations)

---

## AmendmentService

**Endpoint:** `https://wslwebservices.leg.wa.gov/AmendmentService.asmx`

**Description:** Information on Amendments to legislation considered by the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetAmendments` | Returns list of amendments submitted to the rostrum during the year. ... |

### Operation Details

#### `GetAmendments`
Returns list of amendments submitted to the rostrum during the year. 
Exception thrown for invalid year.

`([int]year) => ArrayOfAmendment`

---

## CommitteeActionService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeActionService.asmx`

**Description:** Information on committee actions by the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetDoPassByCommittee` | Returns summary legislation information on all bills with status do pass by comm... |
| `GetDoPassWithAmendmentsByCommittee` | Returns summary legislation information on all bills with status do pass with am... |
| `GetDoPassWithAmendmentsToSubByCommittee` | Returns summary legislation information on all bills with status do pass with am... |
| `GetInCommittee` | Returns summary legislation information on all bills with status in committee.<b... |
| `GetMajorityReportByCommittee` | Returns summary legislation information on all bills with status majority report... |
| `GetMinorityReportByCommittee` | Returns summary legislation information on all bills with status minority report... |
| `GetReReferralByCommittee` | Returns summary legislation information on all bills with status re-referral by ... |
| `GetReferredToAnotherCommitteeByCommittee` | Returns summary legislation information on all bills with status referred to ano... |
| `GetReferredToCommittee` | Returns summary legislation information on all bills with status referred to com... |
| `GetCommitteeReferralsByCommittee` | Returns summary legislation information on all bills that have been referred to ... |
| `GetCommitteeReferralsByBill` | Returns summary legislation information on all bills that have been referred to ... |
| `GetRemovedFromCommittee` | Returns summary legislation information on all bills with status removed by comm... |
| `GetDoPassSubstituteByCommittee` | Returns summary legislation information on all bills with status substitute do p... |
| `GetWithoutRecommendationByCommittee` | Returns summary legislation information on all bills with status without recomme... |
| `GetCommitteeExecutiveActionsByBill` | Returns executive committee executive actions by bill.<br/>Exception thrown for ... |
| `GetLegislationReportedOutOfCommittee` | Returns summary legislation information on all bills that were reported out of t... |
| `GetLegislationScheduledHearingsByCommittee` | Returns bills that have had a hearing scheduled in the committee.<br/>Exception ... |

### Operation Details

#### `GetDoPassByCommittee`
Returns summary legislation information on all bills with status do pass by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetDoPassWithAmendmentsByCommittee`
Returns summary legislation information on all bills with status do pass with amendments by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetDoPassWithAmendmentsToSubByCommittee`
Returns summary legislation information on all bills with status do pass with amendments to sub by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetInCommittee`
Returns summary legislation information on all bills with status in committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetMajorityReportByCommittee`
Returns summary legislation information on all bills with status majority report by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetMinorityReportByCommittee`
Returns summary legislation information on all bills with status minority report by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetReReferralByCommittee`
Returns summary legislation information on all bills with status re-referral by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetReferredToAnotherCommitteeByCommittee`
Returns summary legislation information on all bills with status referred to another committee by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetReferredToCommittee`
Returns summary legislation information on all bills with status referred to committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetCommitteeReferralsByCommittee`
Returns summary legislation information on all bills that have been referred to the committee by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfCommitteeReferral`

#### `GetCommitteeReferralsByBill`
Returns summary legislation information on all bills that have been referred to the committee by bill.<br/><br/>

`([str]biennium?, [int]billNumber) => ArrayOfCommitteeReferral`

#### `GetRemovedFromCommittee`
Returns summary legislation information on all bills with status removed by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetDoPassSubstituteByCommittee`
Returns summary legislation information on all bills with status substitute do pass by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetWithoutRecommendationByCommittee`
Returns summary legislation information on all bills with status without recommendation by committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationInfo`

#### `GetCommitteeExecutiveActionsByBill`
Returns executive committee executive actions by bill.<br/><br/>

`([str]biennium?, [int]billNumber) => ArrayOfCommitteeAction`

#### `GetLegislationReportedOutOfCommittee`
Returns summary legislation information on all bills that were reported out of the given committee between the begin and end date.

`([str]committeeName?, [str]agency?, [dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

#### `GetLegislationScheduledHearingsByCommittee`
Returns bills that have had a hearing scheduled in the committee.<br/><br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfLegislationFamily`

---

## CommitteeMeetingService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeMeetingService.asmx`

**Description:** Information on committee meetings of the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetCommitteeMeetings` | Returns a list of Committee Meetings for a given date range. ... |
| `GetRevisedCommitteeMeetings` | Returns a list of Committee Meetings that have been revised since a given date. |
| `GetCommitteeMeetingItems` | Returns a list of meeting items for a specific Committee Meeting. |

### Operation Details

#### `GetCommitteeMeetings`
Returns a list of Committee Meetings for a given date range. 
Exception thrown for invalid date range.

`([dt]beginDate, [dt]endDate) => ArrayOfCommitteeMeeting`

#### `GetRevisedCommitteeMeetings`
Returns a list of Committee Meetings that have been revised since a given date.

`([dt]changedSinceDate) => ArrayOfCommitteeMeeting`

#### `GetCommitteeMeetingItems`
Returns a list of meeting items for a specific Committee Meeting.

`([int]agendaId) => ArrayOfCommitteeMeetingItem`

---

## CommitteeService

**Endpoint:** `https://wslwebservices.leg.wa.gov/CommitteeService.asmx`

**Description:** Information on committees of the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetCommittees` | All House and Senate standing committees during the given biennium. ... |
| `GetHouseCommittees` | All House standing committees during the given biennium. ... |
| `GetSenateCommittees` | All Senate standing committees during the given biennium. ... |
| `GetCommitteeMembers` | Lists committee members for the given standing committee. ... |
| `GetActiveCommittees` | All active House and Senate standing committees. |
| `GetActiveHouseCommittees` | All active House standing committees. |
| `GetActiveSenateCommittees` | All active Senate standing committees. |
| `GetActiveCommitteeMembers` | Lists active committee members for the given standing committee. ... |

### Operation Details

#### `GetCommittees`
All House and Senate standing committees during the given biennium. 
 
Expects iennium to be in the format: 2005-06

`([str]biennium?) => ArrayOfCommittee`

#### `GetHouseCommittees`
All House standing committees during the given biennium.

`([str]biennium?) => ArrayOfCommittee`

#### `GetSenateCommittees`
All Senate standing committees during the given biennium.

`([str]biennium?) => ArrayOfCommittee`

#### `GetCommitteeMembers`
Lists committee members for the given standing committee. 
Exception thrown for invalid biennium, agency, or committee name. 
. CommitteeName is the Name Property returned in GetHouseCommittees/GetSenateCommittees.

`([str]biennium?, [str]agency?, [str]committeeName?) => ArrayOfMember`

#### `GetActiveCommittees`
All active House and Senate standing committees.

`() => ArrayOfCommittee`

#### `GetActiveHouseCommittees`
All active House standing committees.

`() => ArrayOfCommittee`

#### `GetActiveSenateCommittees`
All active Senate standing committees.

`() => ArrayOfCommittee`

#### `GetActiveCommitteeMembers`
Lists active committee members for the given standing committee. 
Exception thrown for invalid agency or committee name. 
 CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

`([str]agency?, [str]committeeName?) => ArrayOfMember`

---

## LegislationService

**Endpoint:** `https://wslwebservices.leg.wa.gov/LegislationService.asmx`

**Description:** Information on legislation being considered by the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetAmendmentsForYear` | Returns a list of all pending and acted on amendments for the bill during the ye... |
| `GetAmendmentsForBiennium` | Returns a list of all pending and acted on amendments for the bill during the bi... |
| `GetHearings` | Returns a list of committee hearings for the bill. ... |
| `GetLegislationByRequestNumber` | Returns legislation information based on the original request number of the draf... |
| `GetRcwCitesAffected` | Returns RCW Cites referenced within the legislation. ... |
| `GetSessionLawChapter` | Returns chapter and session law information on given bill. ... |
| `GetSponsors` | Returns list of bill sponsors. ... |
| `GetRollCalls` | Returns list of roll calls taken on the bill. ... |
| `GetCurrentStatus` | Returns the current status of the bill in the legislative process. ... |
| `GetLegislationTypes` | Returns a list of all valid types of legislation. |
| `GetTotalLegislationIntroducedByDateRange` | Returns legislation introduced in the given date range by the given legislation ... |
| `GetLegislation` | Returns legislation information on the bill. If substitutes to the bill have be... |
| `GetLegislationIntroducedSince` | Returns detailed legislation information on all bills introduced since the date ... |
| `GetPrefiledLegislation` | Returns detailed legislation information on all prefiled bills (currently in pre... |
| `GetLegislativeStatusChangesByBillNumber` | |
| `GetLegislativeStatusChangesByBillId` | |
| `GetLegislationHistoricalRecapCategoriesByLegislationNumber` | Returns the legislation historical recap (status) categories for the given bill ... |
| `GetLegislativeStatusChangesByDateRange` | |
| `GetLegislationByYear` | Returns summary legislation information on all bills active during the year. If... |
| `GetLegislationInfoIntroducedSince` | Returns summary legislation information on all bills introduced since the date g... |
| `GetPreFiledLegislationInfo` | Returns summary legislation information on all prefiled bills (currently in pref... |
| `GetHouseLegislationPassedHouse` | Returns summary legislation information on all House bills that have passed the ... |
| `GetHouseLegislationPassedSenate` | Returns summary legislation information on all House bills that have passed the ... |
| `GetSenateLegislationPassedSenate` | Returns summary legislation information on all Senate bills that have passed the... |
| `GetSenateLegislationPassedHouse` | Returns summary legislation information on all Senate bills that have passed the... |
| `GetLegislationPassedLegislature` | Returns summary legislation information on all bills that have passed the legisl... |
| `GetLegislationPassedLegislatureWithinTimeFrame` | Returns summary legislation information on all bills that have passed the legisl... |
| `GetLegislationPassedHouse` | Returns summary legislation information on all bills that have passed the House.... |
| `GetLegislationPassedSenate` | Returns summary legislation information on all bills that have passed the Senate... |
| `GetLegislationGovernorSigned` | Returns summary legislation information on all bills that have been signed by th... |
| `GetLegislationGovernorVeto` | Returns summary legislation information on all bills that have been vetoed by th... |
| `GetLegislationGovernorPartialVeto` | Returns summary legislation information on all bills that have been partially ve... |
| `GetPublishedEnrolledLegislation` | Returns summary legislation information on all bills that have been enrolled and... |
| `GetLegislationPassedHouseWithinTimeFrame` | Returns summary legislation information on all bills that House passed off the f... |
| `GetLegislationPassedSenateWithinTimeFrame` | Returns summary legislation information on all bills that Senate passed off the ... |
| `GetLegislationNotYetIntroducedInHouseOfOrigin` | Returns summary legislation information on bills that are active, have available... |
| `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody` | Returns summary legislation information on bills that have passed the originatin... |
| `GetLegislativeBillListFeatureData` | Returns a .net DataTable for the LegislativeBillList SharePoint Feature |
| `DataTable` | |

### Operation Details

#### `GetAmendmentsForYear`
Returns a list of all pending and acted on amendments for the bill during the year. 
Exception thrown for invalid year.

`([int]year, [int]billNumber) => ArrayOfAmendment`

#### `GetAmendmentsForBiennium`
Returns a list of all pending and acted on amendments for the bill during the biennium.

`([str]biennium?, [int]billNumber) => ArrayOfAmendment`

#### `GetHearings`
Returns a list of committee hearings for the bill.

`([str]biennium?, [int]billNumber) => ArrayOfHearing`

#### `GetLegislationByRequestNumber`
Returns legislation information based on the original request number of the draft submitted.

`([str]biennium?, [str]requestNumber?) => Legislation`

#### `GetRcwCitesAffected`
Returns RCW Cites referenced within the legislation. 
Exception thrown for invalid biennium or billId.

`([str]biennium?, [str]billId?) => ArrayOfRcwCiteAffected`

#### `GetSessionLawChapter`
Returns chapter and session law information on given bill. 
Exception thrown for invalid biennium or billId.

`([str]biennium?, [str]billId?) => SessionLaw`

#### `GetSponsors`
Returns list of bill sponsors. 
Exception thrown for invalid biennium or billId. 
Expects biennium in the format 2005-06.

`([str]biennium?, [str]billId?) => ArrayOfSponsor`

#### `GetRollCalls`
Returns list of roll calls taken on the bill. 
 
Expects biennium in the format 2005-06.

`([str]biennium?, [int]billNumber) => ArrayOfRollCall`

#### `GetCurrentStatus`
Returns the current status of the bill in the legislative process. 
Exception thrown for invalid biennium or if no status found.

`([str]biennium?, [int]billNumber) => LegislativeStatus`

#### `GetLegislationTypes`
Returns a list of all valid types of legislation.

`() => ArrayOfLegislationType`

#### `GetTotalLegislationIntroducedByDateRange`
Returns legislation introduced in the given date range by the given legislation type.

`([dt]beginDate, [dt]endDate, [int]legTypeId, [int]agencyId, [bool]allVersions) => int`

#### `GetLegislation`
Returns legislation information on the bill. If substitutes to the bill have been proposed, they will be listed separately. The active flag is true for versions that can be passed on the floor.

`([str]biennium?, [int]billNumber) => ArrayOfLegislation`

#### `GetLegislationIntroducedSince`
Returns detailed legislation information on all bills introduced since the date given. If substitutes to the bill have been proposed, they will be listed separately. The active flag is true for versions that can be passed on the floor.

`([dt]sinceDate) => ArrayOfLegislation`

#### `GetPrefiledLegislation`
Returns detailed legislation information on all prefiled bills (currently in prefiled status). 
Once a bill is formally introduced, its information can be obtained by calling the GetLegislation method.

`() => ArrayOfLegislation`

#### `GetLegislativeStatusChangesByBillNumber`
**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No | |
| `billNumber` | `int` | Yes | |
| `beginDate` | `dateTime` | Yes | |
| `endDate` | `dateTime` | Yes | |

**Returns:** `ArrayOfLegislativeStatus`

#### `GetLegislativeStatusChangesByBillId`

`([str]biennium?, [str]billId?, [dt]beginDate, [dt]endDate) => ArrayOfLegislativeStatus`

#### `GetLegislationHistoricalRecapCategoriesByLegislationNumber`
Returns the legislation historical recap (status) categories for the given bill number. 
Exception thrown for invalid biennium or date range.

`([str]biennium?, [int]billNumber, [dt]beginDate, [dt]endDate) => ArrayOfLegislationRecapCategories`

#### `GetLegislativeStatusChangesByDateRange`
**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No | |
| `beginDate` | `dateTime` | Yes | |
| `endDate` | `dateTime` | Yes | |

**Returns:** `ArrayOfLegislativeStatus`

#### `GetLegislationByYear`

Returns summary legislation information on all bills active during the year. If substitutes to the bill have been proposed, they will be listed separately. The active flag is true for versions that can be passed on the floor. 
Exception thrown for invalid year.

`([int]year) => ArrayOfLegislationInfo`

#### `GetLegislationInfoIntroducedSince`
Returns summary legislation information on all bills introduced since the date given. If substitutes to the bill have been proposed, they will be listed separately. The active flag is true for versions that can be passed on the floor.

`([dt]sinceDate) => ArrayOfLegislationInfo`

#### `GetPreFiledLegislationInfo`
Returns summary legislation information on all prefiled bills (currently in prefiled status). 
Once a bill is formally introduced, its information can be obtained by calling the GetLegislation method.

`() => ArrayOfLegislationInfo`

#### `GetHouseLegislationPassedHouse`
Returns summary legislation information on all House bills that have passed the House.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetHouseLegislationPassedSenate`
Returns summary legislation information on all House bills that have passed the Senate.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetSenateLegislationPassedSenate`
Returns summary legislation information on all Senate bills that have passed the Senate.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetSenateLegislationPassedHouse`
Returns summary legislation information on all Senate bills that have passed the House.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationPassedLegislature`
Returns summary legislation information on all bills that have passed the legislature.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationPassedLegislatureWithinTimeFrame`
Returns summary legislation information on all bills that have passed the legislature within the begin and end date.

`([dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

#### `GetLegislationPassedHouse`
Returns summary legislation information on all bills that have passed the House.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationPassedSenate`
Returns summary legislation information on all bills that have passed the Senate.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationGovernorSigned`
Returns summary legislation information on all bills that have been signed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>

`([str]biennium?, [str]agency?) => ArrayOfLegislationInfo`

#### `GetLegislationGovernorVeto`
Returns summary legislation information on all bills that have been vetoed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>

`([str]biennium?, [str]agency?) => ArrayOfLegislationInfo`

#### `GetLegislationGovernorPartialVeto`
Returns summary legislation information on all bills that have been partially vetoed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>

`([str]biennium?, [str]agency?) => ArrayOfLegislationInfo`

#### `GetPublishedEnrolledLegislation`
Returns summary legislation information on all bills that have been enrolled and published by the legislature.<br/><br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationPassedHouseWithinTimeFrame`
Returns summary legislation information on all bills that House passed off the floor for the first time between the begin and end date (even if the bill is not currently passed the House - For example, a House bill that the House passed may have been amended in the Senate and the House has not passed the amended version of the bill. This bill would still be returned in this method. If you don't want that bill, use the GetLegislationPassedHouse.).

`([dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

#### `GetLegislationPassedSenateWithinTimeFrame`
Returns summary legislation information on all bills that Senate passed off the floor for the first time between the begin and end date (even if the bill is not currently passed the House - For example, a Senate bill that the Senate passed may have been amended in the House and the Senate has not passed the amended version of the bill. This bill would still be returned in this method. If you don't want that bill, use the GetLegislationPassedSenate.).

`([dt]beginDate, [dt]endDate) => ArrayOfLegislationInfo`

#### `GetLegislationNotYetIntroducedInHouseOfOrigin`
Returns summary legislation information on bills that are active, have available bill text, and have not yet been introduced in the house of origin.<br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody`
Returns summary legislation information on bills that have passed the originating body and not yet introduced in opposite body.<br/>

`([str]biennium?) => ArrayOfLegislationInfo`

#### `GetLegislativeBillListFeatureData`
Returns a .net DataTable for the LegislativeBillList SharePoint Feature

**Parameters:** None

#### `DataTable`

**Parameters:** None

---

## LegislativeDocumentService

**Endpoint:** `https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx`

**Description:** Information on documents relating to legislation of the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetDocumentsByClass` | Lists legislative documents of the given document class with names starting with... |
| `GetDocuments` | Lists legislative documents with names starting with the namedlike value. ... |
| `GetDocumentClasses` | Returns available bill family document types for the given biennium. ... |
| `GetAllDocumentsByClass` | Lists all legislative documents of the given document class. ... |

### Operation Details

#### `GetDocumentsByClass`

Lists legislative documents of the given document class with names starting with the namedlike value. 
Exception thrown for invalid biennium, documentClass or namedLike or when no documents found. 
Expects the biennium in the format: 2005-06. Information is available back to 1991-92. For Initiatives to the Legislature, enter the following in namedLike: Initiative. 
The results will include URLs to PDF and HTM versions of each document.

`([str]biennium?, [str]documentClass?, [str]namedLike?) => ArrayOfLegislativeDocument`

#### `GetDocuments`
Lists legislative documents with names starting with the namedlike value. 
Exception thrown for invalid biennium or namedLike or when no documents found. 
Expects the biennium in the format: 2005-06. Information is available back to 1991-92.For Initiatives to the Legislature, enter the following in namedLike: Initiative.<br>The results will include URLs to PDF and HTM versions of each document.

`([str]biennium?, [str]namedLike?) => ArrayOfLegislativeDocument`

#### `GetDocumentClasses`
Returns available bill family document types for the given biennium. 
 
. Information is available back to 1991-92.

`([str]biennium?) => ArrayOfAnyType`

#### `GetAllDocumentsByClass`
Lists all legislative documents of the given document class. 
Exception thrown for invalid biennium or documentClass. 
Expects the biennium in the format: 2005-06. Information is available back to 1991-92. 
The results will include URLs to PDF and HTM versions of each document.

`([str]biennium?, [str]documentClass?) => ArrayOfLegislativeDocument`

---

## RcwCiteAffectedService

**Endpoint:** `https://wslwebservices.leg.wa.gov/RcwCiteAffectedService.asmx`

**Description:** Information on RCW cites affected by legislation of the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetLegislationAffectingRcwCite` | Returns legislation that affect the RCW Cite. ... |
| `GetLegislationAffectingRcw` | Returns legislation that affect the RCW within the title, chapter, or section. ... |

### Operation Details

#### `GetLegislationAffectingRcwCite`
Returns legislation that affect the RCW Cite. 
Exception thrown for invalid biennium or rcwCite.

`([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo`

#### `GetLegislationAffectingRcw`
Returns legislation that affect the RCW within the title, chapter, or section. 
Exception thrown for invalid biennium or rcwCite.

`([str]biennium?, [str]rcwCite?) => ArrayOfLegislationInfo`

---

## SessionLawService

**Endpoint:** `https://wslwebservices.leg.wa.gov/SessionLawService.asmx`

**Description:** Information on legislation relating to session laws of the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetSessionLawByBill` | Returns session law information for a bill. Note: This will not return informati... |
| `GetBillByChapterNumber` | Returns Bill information for a chapter. ... |
| `GetChapterNumbersByYear` | Returns all Chapters for a year. ... |
| `GetSessionLawByBillId` | Returns session law information for a billId. ... |
| `GetSessionLawByInitiativeNumber` | Returns session law information for an Initiative to the Legislature. ... |

### Operation Details

#### `GetSessionLawByBill`
Returns session law information for a bill. Note: This will not return information on Initiatives to the Legislature. 
Exception thrown for invalid biennium or when no session law found. 
.

`([str]biennium?, [int]billNumber) => SessionLaw`

#### `GetBillByChapterNumber`
Returns Bill information for a chapter. 
Exception thrown for invalid year or when no legislation found. 
Expects year in the format: YYYY. Session is the SessionCode (0=Regular Session, 1=1st Special Session, etc.).

`([int]year, [int]session, [int]chapterNumber) => Legislation`

#### `GetChapterNumbersByYear`
Returns all Chapters for a year. 
Exception thrown for invalid year. 
Expects year in the format: YYYY.

`([int]year) => ArrayOfSessionLaw`

#### `GetSessionLawByBillId`
Returns session law information for a billId. 
Exception thrown for invalid biennium or when no session law found. 
.

`([str]biennium?, [str]billId?) => SessionLaw`

#### `GetSessionLawByInitiativeNumber`
Returns session law information for an Initiative to the Legislature. 
Exception thrown when no session law found.

`([int]initiativeNumber) => SessionLaw`

---

## SponsorService

**Endpoint:** `https://wslwebservices.leg.wa.gov/SponsorService.asmx`

**Description:** Information on sponsors of legislation in the Washington State Legislature.

### Operations Summary

| Operation | Description |
|-----------|-------------|
| `GetSponsors` | All Representatives and Senators that have served during the given biennium. ... |
| `GetHouseSponsors` | All Representatives that have served during the given biennium. ... |
| `GetSenateSponsors` | All Senators that have served during the given biennium. ... |
| `GetRequesters` | All entities that can request legislation for the given biennium. ... |

### Operation Details

#### `GetSponsors`
All Representatives and Senators that have served during the given biennium.

`([str]biennium?) => ArrayOfMember`

#### `GetHouseSponsors`
All Representatives that have served during the given biennium.

`([str]biennium?) => ArrayOfMember`

#### `GetSenateSponsors`
All Senators that have served during the given biennium.

`([str]biennium?) => ArrayOfMember`

#### `GetRequesters`
All entities that can request legislation for the given biennium.

`([str]biennium?) => ArrayOfLegislativeEntity`

---

## Common Types

### `Amendment`

```ts
interface Amendment {
  BillNumber: int
  Name?: string
  BillId?: string
  LegislativeSession?: string
  Type?: string
  FloorNumber: int
  SponsorName?: string
  Description?: string
  Drafter?: string
  FloorAction?: string
  FloorActionDate: dateTime
  DocumentExists: boolean
  HtmUrl?: string
  PdfUrl?: string
  Agency?: string
}
```

### `ArrayOfAmendment`

`type ArrayOfAmendment = Amendment[]`

### `ArrayOfAnyType`

`type ArrayOfAnyType = None[]`

### `ArrayOfCommittee`

`type ArrayOfCommittee = Committee[]`

### `ArrayOfCommitteeAction`

`type ArrayOfCommitteeAction = CommitteeAction[]`

### `ArrayOfCommitteeMeeting`

`type ArrayOfCommitteeMeeting = CommitteeMeeting[]`

### `ArrayOfCommitteeMeetingItem`

`type ArrayOfCommitteeMeetingItem = CommitteeMeetingItem[]`

### `ArrayOfCommitteeRecommendation`

`type ArrayOfCommitteeRecommendation = CommitteeRecommendation[]`

### `ArrayOfCommitteeReferral`

`type ArrayOfCommitteeReferral = CommitteeReferral[]`

### `ArrayOfCompanion`

`type ArrayOfCompanion = Companion[]`

### `ArrayOfHearing`

`type ArrayOfHearing = Hearing[]`

### `ArrayOfLegislation`

`type ArrayOfLegislation = Legislation[]`

### `ArrayOfLegislationFamily`

`type ArrayOfLegislationFamily = LegislationFamily[]`

### `ArrayOfLegislationFamilyMeeting`

`type ArrayOfLegislationFamilyMeeting = LegislationFamilyMeeting[]`

### `ArrayOfLegislationInfo`

`type ArrayOfLegislationInfo = LegislationInfo[]`

### `ArrayOfLegislationRecapCategories`

`type ArrayOfLegislationRecapCategories = LegislationRecapCategories[]`

### `ArrayOfLegislationType`

`type ArrayOfLegislationType = LegislationType[]`

### `ArrayOfLegislativeDocument`

`type ArrayOfLegislativeDocument = LegislativeDocument[]`

### `ArrayOfLegislativeEntity`

`type ArrayOfLegislativeEntity = LegislativeEntity[]`

### `ArrayOfLegislativeStatus`

`type ArrayOfLegislativeStatus = LegislativeStatus[]`

### `ArrayOfMember`

`type ArrayOfMember = Member[]`

### `ArrayOfRcwCiteAffected`

`type ArrayOfRcwCiteAffected = RcwCiteAffected[]`

### `ArrayOfRollCall`

`type ArrayOfRollCall = RollCall[]`

### `ArrayOfSessionLaw`

`type ArrayOfSessionLaw = SessionLaw[]`

### `ArrayOfSignature`

`type ArrayOfSignature = Signature[]`

### `ArrayOfSponsor`

`type ArrayOfSponsor = Sponsor[]`

### `ArrayOfVote`

`type ArrayOfVote = Vote[]`

### `Committee` Extends: `LegislativeEntity`

```ts
interface Committee {
  Phone?: string
}
```

### `CommitteeAction`

```ts
interface CommitteeAction {
  AgendaId: int
  HearingDate: dateTime
  LegislationInfo?: LegislationInfo
  Committee?: Committee
  ReferredToCommittee?: Committee
  CommitteeRecommendations?: ArrayOfCommitteeRecommendation
}
```

### `CommitteeMeeting`

```ts
interface CommitteeMeeting {
  AgendaId: int
  Agency?: string
  Committees?: ArrayOfCommittee
  Room?: string
  Building?: string
  Address?: string
  City?: string
  State?: string
  ZipCode: int
  Date: dateTime
  Cancelled: boolean
  RevisedDate: dateTime
  ContactInformation?: string
  CommitteeType?: string
  Notes?: string
}
```

### `CommitteeMeetingItem`

```ts
interface CommitteeMeetingItem {
  AgendaId: int
  HearingType?: string
  HearingTypeDescription?: string
  BillId?: string
  ItemDescription?: string
  Order: int
  Biennium?: string
  SortOrderString?: string
}
```

### `CommitteeRecommendation`

```ts
interface CommitteeRecommendation {
  Recommendation?: string
  LongRecommendation?: string
  RecommendationType: RecommendationType
  MembersSigned?: string
  Signatures?: ArrayOfSignature
}
```

### `CommitteeReferral`

```ts
interface CommitteeReferral {
  LegislationInfo?: LegislationInfo
  Committee?: Committee
  ReferredDate: dateTime
}
```

### `Companion`

```ts
interface Companion {
  Biennium?: string
  BillId?: string
  Status?: string
}
```

### `Hearing`

```ts
interface Hearing {
  BillId?: string
  Biennium?: string
  CommitteeMeeting?: CommitteeMeeting
  HearingType?: string
  HearingTypeDescription?: string
}
```

### `Legislation` Extends: `LegislationInfo`

```ts
interface Legislation {
  StateFiscalNote: boolean
  LocalFiscalNote: boolean
  Appropriations: boolean
  RequestedByGovernor: boolean
  RequestedByBudgetCommittee: boolean
  RequestedByDepartment: boolean
  RequestedByOther: boolean
  ShortDescription?: string
  Request?: string
  IntroducedDate: dateTime
  CurrentStatus?: LegislativeStatus
  Sponsor?: string
  PrimeSponsorID: int
  LongDescription?: string
  LegalTitle?: string
  Companions?: ArrayOfCompanion
}
```

### `LegislationFamily`

```ts
interface LegislationFamily {
  Biennium?: string
  LegislationNumber: int
  LegislationType?: LegislationType
  OriginalAgency?: string
  ScheduledMeetings?: ArrayOfLegislationFamilyMeeting
}
```

### `LegislationFamilyMeeting`

```ts
interface LegislationFamilyMeeting {
  MeetingTime: dateTime
  Committees?: ArrayOfCommittee
  HearingType?: string
}
```

### `LegislationInfo`

```ts
interface LegislationInfo {
  Biennium?: string
  BillId?: string
  BillNumber: int
  SubstituteVersion: int
  EngrossedVersion: int
  ShortLegislationType?: LegislationType
  OriginalAgency?: string
  Active: boolean
  DisplayNumber?: string
}
```

### `LegislationRecapCategories`

```ts
interface LegislationRecapCategories {
  BillNumber: int
  HistoryText?: string
  ActionDate: dateTime
  Category?: string
  Agency?: string
}
```

### `LegislationType`

```ts
interface LegislationType {
  ShortLegislationType?: string
  LongLegislationType?: string
}
```

### `LegislativeDocument`

```ts
interface LegislativeDocument {
  Name?: string
  ShortFriendlyName?: string
  Biennium?: string
  LongFriendlyName?: string
  Description?: string
  Type?: string
  Class?: string
  HtmUrl?: string
  HtmCreateDate: dateTime
  HtmLastModifiedDate: dateTime
  PdfUrl?: string
  PdfCreateDate: dateTime
  PdfLastModifiedDate: dateTime
  BillId?: string
}
```

### `LegislativeEntity`

```ts
interface LegislativeEntity {
  Id: int
  Name?: string
  LongName?: string
  Agency?: string
  Acronym?: string
}
```

### `LegislativeStatus`

```ts
interface LegislativeStatus {
  BillId?: string
  HistoryLine?: string
  ActionDate: dateTime
  AmendedByOppositeBody: boolean
  PartialVeto: boolean
  Veto: boolean
  AmendmentsExist: boolean
  Status?: string
}
```

### `Member` Extends: `LegislativeEntity`

```ts
interface Member {
  Party?: string
  District?: string
  Phone?: string
  Email?: string
  FirstName?: string
  LastName?: string
}
```

### `RcwCiteAffected`

```ts
interface RcwCiteAffected {
  RcwCite?: string
  Action?: string
}
```

### `RollCall`

```ts
interface RollCall {
  Agency?: string
  BillId?: string
  Biennium?: string
  Motion?: string
  SequenceNumber: int
  VoteDate: dateTime
  YeaVotes?: RollCallType
  NayVotes?: RollCallType
  AbsentVotes?: RollCallType
  ExcusedVotes?: RollCallType
  Votes?: ArrayOfVote
}
```

### `RollCallType`

```ts
interface RollCallType {
  Count: int
  MembersVoting?: string
}
```

### `SessionLaw`

```ts
interface SessionLaw {
  ChapterNumber: int
  Year: int
  LegislativeSession?: string
  LegislatureNumber: int
  EffectiveDate: dateTime
  MultipleEffectiveDates: boolean
  BillId?: string
  Biennium?: string
  BillTitle?: string
  PartialVeto: boolean
  Veto: boolean
  LegTypeId: int
}
```

### `Signature`

```ts
interface Signature {
  MemberId: int
  Name?: string
  Position?: string
  PositionSort: int
}
```

### `Sponsor` Extends: `LegislativeEntity`

```ts
interface Sponsor {
  Type?: string
  Order: int
  Phone?: string
  Email?: string
  FirstName?: string
  LastName?: string
}
```

### `Vote`

```ts
interface Vote {
  MemberId: int
  Name?: string
  VOte: VoteType
}
```

---

## Enumerations

### `RecommendationType`

*Base type: `string`*

**Values:**
- `Majority`
- `Minority`

### `VoteType`

*Base type: `string`*

**Values:**
- `Yea`
- `Nay`
- `Absent`
- `Excused`

---

## SOAP Notes

### Format
The biennium parameter must be in the format `YYYY-YY` (e.g., `2023-24`).
Agency should be House or Senate.

### Error Handling
Invalid parameters will result in SOAP fault responses.

### Rate Limits
No formal rate limits are documented; use reasonable request intervals.
