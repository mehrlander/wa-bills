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

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | `int` | Yes |  |

**Returns:** `ArrayOfAmendment`


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

Returns summary legislation information on all bills with status do pass by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetDoPassWithAmendmentsByCommittee`

Returns summary legislation information on all bills with status do pass with amendments by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetDoPassWithAmendmentsToSubByCommittee`

Returns summary legislation information on all bills with status do pass with amendments to sub by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetInCommittee`

Returns summary legislation information on all bills with status in committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetMajorityReportByCommittee`

Returns summary legislation information on all bills with status majority report by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetMinorityReportByCommittee`

Returns summary legislation information on all bills with status minority report by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetReReferralByCommittee`

Returns summary legislation information on all bills with status re-referral by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetReferredToAnotherCommitteeByCommittee`

Returns summary legislation information on all bills with status referred to another committee by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetReferredToCommittee`

Returns summary legislation information on all bills with status referred to committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetCommitteeReferralsByCommittee`

Returns summary legislation information on all bills that have been referred to the committee by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfCommitteeReferral`


#### `GetCommitteeReferralsByBill`

Returns summary legislation information on all bills that have been referred to the committee by bill.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfCommitteeReferral`


#### `GetRemovedFromCommittee`

Returns summary legislation information on all bills with status removed by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetDoPassSubstituteByCommittee`

Returns summary legislation information on all bills with status substitute do pass by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetWithoutRecommendationByCommittee`

Returns summary legislation information on all bills with status without recommendation by committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetCommitteeExecutiveActionsByBill`

Returns executive committee executive actions by bill.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfCommitteeAction`


#### `GetLegislationReportedOutOfCommittee`

Returns summary legislation information on all bills that were reported out of the given committee between the begin and end date.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `committeeName` | `string` | No |  |
| `agency` | `string` | No |  |
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationScheduledHearingsByCommittee`

Returns bills that have had a hearing scheduled in the committee.<br/>Exception thrown for invalid agency or committee name or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.<br/>CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfLegislationFamily`


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

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfCommitteeMeeting`


#### `GetRevisedCommitteeMeetings`

Returns a list of Committee Meetings that have been revised since a given date.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `changedSinceDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfCommitteeMeeting`


#### `GetCommitteeMeetingItems`

Returns a list of meeting items for a specific Committee Meeting.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `agendaId` | `int` | Yes |  |

**Returns:** `ArrayOfCommitteeMeetingItem`


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
Exception thrown for invalid biennium. 
Expects iennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfCommittee`


#### `GetHouseCommittees`

All House standing committees during the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfCommittee`


#### `GetSenateCommittees`

All Senate standing committees during the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfCommittee`


#### `GetCommitteeMembers`

Lists committee members for the given standing committee. 
Exception thrown for invalid biennium, agency, or committee name. 
Expects biennium to be in the format: 2005-06. Agency should be House or Senate.  CommitteeName is the Name Property returned in GetHouseCommittees/GetSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfMember`


#### `GetActiveCommittees`

All active House and Senate standing committees.

**Parameters:** None

**Returns:** `ArrayOfCommittee`


#### `GetActiveHouseCommittees`

All active House standing committees.

**Parameters:** None

**Returns:** `ArrayOfCommittee`


#### `GetActiveSenateCommittees`

All active Senate standing committees.

**Parameters:** None

**Returns:** `ArrayOfCommittee`


#### `GetActiveCommitteeMembers`

Lists active committee members for the given standing committee. 
Exception thrown for invalid agency or committee name. 
Agency should be House or Senate.  CommitteeName is the Name Property returned in GetActiveHouseCommittees/GetActiveSenateCommittees.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `agency` | `string` | No |  |
| `committeeName` | `string` | No |  |

**Returns:** `ArrayOfMember`


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
| `GetLegislation` | Returns legislation information on the bill.  If substitutes to the bill have be... |
| `GetLegislationIntroducedSince` | Returns detailed legislation information on all bills introduced since the date ... |
| `GetPrefiledLegislation` | Returns detailed legislation information on all prefiled bills (currently in pre... |
| `GetLegislativeStatusChangesByBillNumber` |  |
| `GetLegislativeStatusChangesByBillId` |  |
| `GetLegislationHistoricalRecapCategoriesByLegislationNumber` | Returns the legislation historical recap (status) categories for the given bill ... |
| `GetLegislativeStatusChangesByDateRange` |  |
| `GetLegislationByYear` | Returns summary legislation information on all bills active during the year.  If... |
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
| `DataTable` |  |

### Operation Details

#### `GetAmendmentsForYear`

Returns a list of all pending and acted on amendments for the bill during the year. 
Exception thrown for invalid year.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | `int` | Yes |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfAmendment`


#### `GetAmendmentsForBiennium`

Returns a list of all pending and acted on amendments for the bill during the biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfAmendment`


#### `GetHearings`

Returns a list of committee hearings for the bill. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfHearing`


#### `GetLegislationByRequestNumber`

Returns legislation information based on the original request number of the draft submitted. 
Exception thrown for invalid biennium or requestNumber or if no information found. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `requestNumber` | `string` | No |  |

**Returns:** `Legislation`


#### `GetRcwCitesAffected`

Returns RCW Cites referenced within the legislation. 
Exception thrown for invalid biennium or billId. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billId` | `string` | No |  |

**Returns:** `ArrayOfRcwCiteAffected`


#### `GetSessionLawChapter`

Returns chapter and session law information on given bill. 
Exception thrown for invalid biennium or billId. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billId` | `string` | No |  |

**Returns:** `SessionLaw`


#### `GetSponsors`

Returns list of bill sponsors. 
Exception thrown for invalid biennium or billId. 
Expects biennium in the format 2005-06.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billId` | `string` | No |  |

**Returns:** `ArrayOfSponsor`


#### `GetRollCalls`

Returns list of roll calls taken on the bill. 
Exception thrown for invalid biennium. 
Expects biennium in the format 2005-06.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfRollCall`


#### `GetCurrentStatus`

Returns the current status of the bill in the legislative process. 
Exception thrown for invalid biennium or if no status found. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `LegislativeStatus`


#### `GetLegislationTypes`

Returns a list of all valid types of legislation.

**Parameters:** None

**Returns:** `ArrayOfLegislationType`


#### `GetTotalLegislationIntroducedByDateRange`

Returns legislation introduced in the given date range by the given legislation type.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |
| `legTypeId` | `int` | Yes |  |
| `agencyId` | `int` | Yes |  |
| `allVersions` | `boolean` | Yes |  |

**Returns:** `int`


#### `GetLegislation`

Returns legislation information on the bill.  If substitutes to the bill have been proposed, they will be listed separately.  The active flag is true for versions that can be passed on the floor. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `ArrayOfLegislation`


#### `GetLegislationIntroducedSince`

Returns detailed legislation information on all bills introduced since the date given.  If substitutes to the bill have been proposed, they will be listed separately.  The active flag is true for versions that can be passed on the floor.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sinceDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislation`


#### `GetPrefiledLegislation`

Returns detailed legislation information on all prefiled bills (currently in prefiled status). 
Once a bill is formally introduced, its information can be obtained by calling the GetLegislation method.

**Parameters:** None

**Returns:** `ArrayOfLegislation`


#### `GetLegislativeStatusChangesByBillNumber`

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislativeStatus`


#### `GetLegislativeStatusChangesByBillId`

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billId` | `string` | No |  |
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislativeStatus`


#### `GetLegislationHistoricalRecapCategoriesByLegislationNumber`

Returns the legislation historical recap (status) categories for the given bill number. 
Exception thrown for invalid biennium or date range. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationRecapCategories`


#### `GetLegislativeStatusChangesByDateRange`

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislativeStatus`


#### `GetLegislationByYear`

Returns summary legislation information on all bills active during the year.  If substitutes to the bill have been proposed, they will be listed separately.  The active flag is true for versions that can be passed on the floor. 
Exception thrown for invalid year. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | `int` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationInfoIntroducedSince`

Returns summary legislation information on all bills introduced since the date given.  If substitutes to the bill have been proposed, they will be listed separately.  The active flag is true for versions that can be passed on the floor.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sinceDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetPreFiledLegislationInfo`

Returns summary legislation information on all prefiled bills (currently in prefiled status). 
Once a bill is formally introduced, its information can be obtained by calling the GetLegislation method.

**Parameters:** None

**Returns:** `ArrayOfLegislationInfo`


#### `GetHouseLegislationPassedHouse`

Returns summary legislation information on all House bills that have passed the House.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetHouseLegislationPassedSenate`

Returns summary legislation information on all House bills that have passed the Senate.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetSenateLegislationPassedSenate`

Returns summary legislation information on all Senate bills that have passed the Senate.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetSenateLegislationPassedHouse`

Returns summary legislation information on all Senate bills that have passed the House.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedLegislature`

Returns summary legislation information on all bills that have passed the legislature.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedLegislatureWithinTimeFrame`

Returns summary legislation information on all bills that have passed the legislature within the begin and end date.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedHouse`

Returns summary legislation information on all bills that have passed the House.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedSenate`

Returns summary legislation information on all bills that have passed the Senate.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationGovernorSigned`

Returns summary legislation information on all bills that have been signed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationGovernorVeto`

Returns summary legislation information on all bills that have been vetoed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationGovernorPartialVeto`

Returns summary legislation information on all bills that have been partially vetoed by the governor.<br/>Exception thrown for invalid agency or biennium.<br/>Expects biennium to be in the format: 2005-06<br/>Agency should be House or Senate.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `agency` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetPublishedEnrolledLegislation`

Returns summary legislation information on all bills that have been enrolled and published by the legislature.<br/>Exception thrown for invalid biennium.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedHouseWithinTimeFrame`

Returns summary legislation information on all bills that House passed off the floor for the first time between the begin and end date (even if the bill is not currently passed the House - For example, a House bill that the House passed may have been amended in the Senate and the House has not passed the amended version of the bill.  This bill would still be returned in this method.  If you don't want that bill, use the GetLegislationPassedHouse.).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedSenateWithinTimeFrame`

Returns summary legislation information on all bills that Senate passed off the floor for the first time between the begin and end date (even if the bill is not currently passed the House - For example, a Senate bill that the Senate passed may have been amended in the House and the Senate has not passed the amended version of the bill.  This bill would still be returned in this method.  If you don't want that bill, use the GetLegislationPassedSenate.).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `beginDate` | `dateTime` | Yes |  |
| `endDate` | `dateTime` | Yes |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationNotYetIntroducedInHouseOfOrigin`

Returns summary legislation information on bills that are active, have available bill text, and have not yet been introduced in the house of origin.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody`

Returns summary legislation information on bills that have passed the originating body and not yet introduced in opposite body.<br/>Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


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
Expects the biennium in the format: 2005-06.  Information is available back to 1991-92. For Initiatives to the Legislature, enter the following in namedLike: Initiative. 
The results will include URLs to PDF and HTM versions of each document.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `documentClass` | `string` | No |  |
| `namedLike` | `string` | No |  |

**Returns:** `ArrayOfLegislativeDocument`


#### `GetDocuments`

Lists legislative documents with names starting with the namedlike value. 
Exception thrown for invalid biennium or namedLike or when no documents found. 
Expects the biennium in the format: 2005-06. Information is available back to 1991-92.For Initiatives to the Legislature, enter the following in namedLike: Initiative.<br>The results will include URLs to PDF and HTM versions of each document.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `namedLike` | `string` | No |  |

**Returns:** `ArrayOfLegislativeDocument`


#### `GetDocumentClasses`

Returns available bill family document types for the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06.  Information is available back to 1991-92.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfAnyType`


#### `GetAllDocumentsByClass`

Lists all legislative documents of the given document class. 
Exception thrown for invalid biennium or documentClass. 
Expects the biennium in the format: 2005-06.  Information is available back to 1991-92. 
The results will include URLs to PDF and HTM versions of each document.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `documentClass` | `string` | No |  |

**Returns:** `ArrayOfLegislativeDocument`


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
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `rcwCite` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


#### `GetLegislationAffectingRcw`

Returns legislation that affect the RCW within the title, chapter, or section. 
Exception thrown for invalid biennium or rcwCite. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `rcwCite` | `string` | No |  |

**Returns:** `ArrayOfLegislationInfo`


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
Expects biennium to be in the format: 2005-06.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billNumber` | `int` | Yes |  |

**Returns:** `SessionLaw`


#### `GetBillByChapterNumber`

Returns Bill information for a chapter. 
Exception thrown for invalid year or when no legislation found. 
Expects year in the format: YYYY. Session is the SessionCode (0=Regular Session, 1=1st Special Session, etc.).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | `int` | Yes |  |
| `session` | `int` | Yes |  |
| `chapterNumber` | `int` | Yes |  |

**Returns:** `Legislation`


#### `GetChapterNumbersByYear`

Returns all Chapters for a year. 
Exception thrown for invalid year. 
Expects year in the format: YYYY.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | `int` | Yes |  |

**Returns:** `ArrayOfSessionLaw`


#### `GetSessionLawByBillId`

Returns session law information for a billId. 
Exception thrown for invalid biennium or when no session law found. 
Expects biennium to be in the format: 2005-06.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |
| `billId` | `string` | No |  |

**Returns:** `SessionLaw`


#### `GetSessionLawByInitiativeNumber`

Returns session law information for an Initiative to the Legislature. 
Exception thrown when no session law found.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `initiativeNumber` | `int` | Yes |  |

**Returns:** `SessionLaw`


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
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfMember`


#### `GetHouseSponsors`

All Representatives that have served during the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfMember`


#### `GetSenateSponsors`

All Senators that have served during the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfMember`


#### `GetRequesters`

All entities that can request legislation for the given biennium. 
Exception thrown for invalid biennium. 
Expects biennium to be in the format: 2005-06

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `biennium` | `string` | No |  |

**Returns:** `ArrayOfLegislativeEntity`


---

## Common Types

### `Amendment`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `BillNumber` | `int` [1..1] | Yes | 3 or 4 digit number assigned to a piece of legisla |
| `Name` | `string` [0..1] | No | Title of amendment, document, or entity name. Pair |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `LegislativeSession` | `string` [0..1] | No | Session description. In the case of the amendment, |
| `Type` | `string` [0..1] | No | Describes what body originally considered the amen |
| `FloorNumber` | `int` [1..1] | Yes | Number assigned to a floor amendment when it is su |
| `SponsorName` | `string` [0..1] | No | Primary sponsor of the amendment. |
| `Description` | `string` [0..1] | No | Describes the content of the amendment or document |
| `Drafter` | `string` [0..1] | No | Abbreviated designation of the amendment drafter a |
| `FloorAction` | `string` [0..1] | No | Action taken by the legislative body during a floo |
| `FloorActionDate` | `dateTime` [1..1] | Yes | Date of action taken by the legislative body durin |
| `DocumentExists` | `boolean` [1..1] | Yes | True if the legislative document related to the ob |
| `HtmUrl` | `string` [0..1] | No | URL path to HTML version of the legislative docume |
| `PdfUrl` | `string` [0..1] | No | URL path to PDF version of the legislative documen |
| `Agency` | `string` [0..1] | No | Legislative Body. |

### `ArrayOfAmendment`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Amendment` | `Amendment` [0..∞] | No |  |

### `ArrayOfAnyType`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `anyType` | `None` [0..∞] | No |  |

### `ArrayOfCommittee`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Committee` | `Committee` [0..∞] | No |  |

### `ArrayOfCommitteeAction`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CommitteeAction` | `CommitteeAction` [0..∞] | No |  |

### `ArrayOfCommitteeMeeting`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CommitteeMeeting` | `CommitteeMeeting` [0..∞] | No |  |

### `ArrayOfCommitteeMeetingItem`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CommitteeMeetingItem` | `CommitteeMeetingItem` [0..∞] | No |  |

### `ArrayOfCommitteeRecommendation`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CommitteeRecommendation` | `CommitteeRecommendation` [0..∞] | No |  |

### `ArrayOfCommitteeReferral`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CommitteeReferral` | `CommitteeReferral` [0..∞] | No |  |

### `ArrayOfCompanion`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Companion` | `Companion` [0..∞] | No |  |

### `ArrayOfHearing`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Hearing` | `Hearing` [0..∞] | No |  |

### `ArrayOfLegislation`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Legislation` | `Legislation` [0..∞] | No |  |

### `ArrayOfLegislationFamily`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationFamily` | `LegislationFamily` [0..∞] | No |  |

### `ArrayOfLegislationFamilyMeeting`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationFamilyMeeting` | `LegislationFamilyMeeting` [0..∞] | No |  |

### `ArrayOfLegislationInfo`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationInfo` | `LegislationInfo` [0..∞] | No |  |

### `ArrayOfLegislationRecapCategories`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationRecapCategories` | `LegislationRecapCategories` [0..∞] | No |  |

### `ArrayOfLegislationType`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationType` | `LegislationType` [0..∞] | No |  |

### `ArrayOfLegislativeDocument`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislativeDocument` | `LegislativeDocument` [0..∞] | No |  |

### `ArrayOfLegislativeEntity`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislativeEntity` | `LegislativeEntity` [0..∞] | No |  |

### `ArrayOfLegislativeStatus`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislativeStatus` | `LegislativeStatus` [0..∞] | No |  |

### `ArrayOfMember`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Member` | `Member` [0..∞] | No |  |

### `ArrayOfRcwCiteAffected`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `RcwCiteAffected` | `RcwCiteAffected` [0..∞] | No |  |

### `ArrayOfRollCall`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `RollCall` | `RollCall` [0..∞] | No |  |

### `ArrayOfSessionLaw`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `SessionLaw` | `SessionLaw` [0..∞] | No |  |

### `ArrayOfSignature`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Signature` | `Signature` [0..∞] | No |  |

### `ArrayOfSponsor`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Sponsor` | `Sponsor` [0..∞] | No | Common display string of sponsor name. If the bill |

### `ArrayOfVote`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Vote` | `Vote` [0..∞] | No |  |

### `Committee`

*Extends: `LegislativeEntity`*

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Phone` | `string` [0..1] | No | Phone number. |

### `CommitteeAction`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `AgendaId` | `int` [1..1] | Yes | Unique integer for a standing committee meeting. |
| `HearingDate` | `dateTime` [1..1] | Yes | The date the committee action occurred. |
| `LegislationInfo` | `LegislationInfo` [0..1] | No |  |
| `Committee` | `Committee` [0..1] | No |  |
| `ReferredToCommittee` | `Committee` [0..1] | No |  |
| `CommitteeRecommendations` | `ArrayOfCommitteeRecommendation` [0..1] | No |  |

### `CommitteeMeeting`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `AgendaId` | `int` [1..1] | Yes | Unique integer for a standing committee meeting. |
| `Agency` | `string` [0..1] | No | Legislative Body. |
| `Committees` | `ArrayOfCommittee` [0..1] | No |  |
| `Room` | `string` [0..1] | No | Reference to a room in a building on the legislati |
| `Building` | `string` [0..1] | No | Reference to building on the legislative campus. |
| `Address` | `string` [0..1] | No | Street address. |
| `City` | `string` [0..1] | No | City name. |
| `State` | `string` [0..1] | No | State name. |
| `ZipCode` | `int` [1..1] | Yes | Postal zip code. |
| `Date` | `dateTime` [1..1] | Yes |  |
| `Cancelled` | `boolean` [1..1] | Yes | True if the committee meeting has been cancelled. |
| `RevisedDate` | `dateTime` [1..1] | Yes |  |
| `ContactInformation` | `string` [0..1] | No | Contact information for the staff coordinating the |
| `CommitteeType` | `string` [0..1] | No |  |
| `Notes` | `string` [0..1] | No |  |

### `CommitteeMeetingItem`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `AgendaId` | `int` [1..1] | Yes | Unique integer for a standing committee meeting. |
| `HearingType` | `string` [0..1] | No | The type of activity that the standing committee w |
| `HearingTypeDescription` | `string` [0..1] | No |  |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `ItemDescription` | `string` [0..1] | No | Less than a sentence summary describing an item on |
| `Order` | `int` [1..1] | Yes | Used to determine sort order. |
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `SortOrderString` | `string` [0..1] | No |  |

### `CommitteeRecommendation`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Recommendation` | `string` [0..1] | No | Committee recommendation. |
| `LongRecommendation` | `string` [0..1] | No | A more descriptive version of Recommendation. |
| `RecommendationType` | `RecommendationType` [1..1] | Yes | The type of committee recommendation. |
| `MembersSigned` | `string` [0..1] | No |  |
| `Signatures` | `ArrayOfSignature` [0..1] | No |  |

### `CommitteeReferral`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `LegislationInfo` | `LegislationInfo` [0..1] | No |  |
| `Committee` | `Committee` [0..1] | No |  |
| `ReferredDate` | `dateTime` [1..1] | Yes | Date the bill was referred to the committee. |

### `Companion`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `Status` | `string` [0..1] | No | Abbreviated description of the status of a piece o |

### `Hearing`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `CommitteeMeeting` | `CommitteeMeeting` [0..1] | No |  |
| `HearingType` | `string` [0..1] | No | The type of activity that the standing committee w |
| `HearingTypeDescription` | `string` [0..1] | No |  |

### `Legislation`

*Extends: `LegislationInfo`*

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `StateFiscalNote` | `boolean` [1..1] | Yes | True if legislation has one or more state fiscal n |
| `LocalFiscalNote` | `boolean` [1..1] | Yes | True if legislation has one or more local fiscal n |
| `Appropriations` | `boolean` [1..1] | Yes | True if the bill has appropriations. |
| `RequestedByGovernor` | `boolean` [1..1] | Yes | True if the legislation is introduced by request o |
| `RequestedByBudgetCommittee` | `boolean` [1..1] | Yes | True if the legislation is introduced by request o |
| `RequestedByDepartment` | `boolean` [1..1] | Yes | True if the legislation is introduced by request o |
| `RequestedByOther` | `boolean` [1..1] | Yes | True if the legislation is introduced by request o |
| `ShortDescription` | `string` [0..1] | No | Brief description of the legislation. This is comm |
| `Request` | `string` [0..1] | No | Request number and version created by the staff in |
| `IntroducedDate` | `dateTime` [1..1] | Yes | Date that the bill was read first time on the floo |
| `CurrentStatus` | `LegislativeStatus` [0..1] | No |  |
| `Sponsor` | `string` [0..1] | No | Common display string of sponsor name. If the bill |
| `PrimeSponsorID` | `int` [1..1] | Yes | Unique identifier for the primary sponsor of the l |
| `LongDescription` | `string` [0..1] | No | Summary of legislation written by staff in the Cod |
| `LegalTitle` | `string` [0..1] | No | Summary of legislation or jingle. |
| `Companions` | `ArrayOfCompanion` [0..1] | No |  |

### `LegislationFamily`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `LegislationNumber` | `int` [1..1] | Yes |  |
| `LegislationType` | `LegislationType` [0..1] | No |  |
| `OriginalAgency` | `string` [0..1] | No | Legislative body that the legislation was original |
| `ScheduledMeetings` | `ArrayOfLegislationFamilyMeeting` [0..1] | No |  |

### `LegislationFamilyMeeting`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `MeetingTime` | `dateTime` [1..1] | Yes |  |
| `Committees` | `ArrayOfCommittee` [0..1] | No |  |
| `HearingType` | `string` [0..1] | No | The type of activity that the standing committee w |

### `LegislationInfo`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `BillNumber` | `int` [1..1] | Yes | 3 or 4 digit number assigned to a piece of legisla |
| `SubstituteVersion` | `int` [1..1] | Yes | Substitute version of the legislation. Standing co |
| `EngrossedVersion` | `int` [1..1] | Yes | The engrossed version of the bill number. Each tim |
| `ShortLegislationType` | `LegislationType` [0..1] | No | Abbreviated designation of the type of legislation |
| `OriginalAgency` | `string` [0..1] | No | Legislative body that the legislation was original |
| `Active` | `boolean` [1..1] | Yes |  |
| `DisplayNumber` | `string` [0..1] | No |  |

### `LegislationRecapCategories`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `BillNumber` | `int` [1..1] | Yes | 3 or 4 digit number assigned to a piece of legisla |
| `HistoryText` | `string` [0..1] | No |  |
| `ActionDate` | `dateTime` [1..1] | Yes | Date that action was taken on the legislation. |
| `Category` | `string` [0..1] | No |  |
| `Agency` | `string` [0..1] | No | Legislative Body. |

### `LegislationType`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ShortLegislationType` | `string` [0..1] | No | Abbreviated designation of the type of legislation |
| `LongLegislationType` | `string` [0..1] | No | Descriptive designation of the type of legislation |

### `LegislativeDocument`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Name` | `string` [0..1] | No | Title of amendment, document, or entity name. Pair |
| `ShortFriendlyName` | `string` [0..1] | No | Short description of the document name. |
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `LongFriendlyName` | `string` [0..1] | No | Long description of the document name. |
| `Description` | `string` [0..1] | No | Describes the content of the amendment or document |
| `Type` | `string` [0..1] | No | Describes what body originally considered the amen |
| `Class` | `string` [0..1] | No | Category of legislative document. |
| `HtmUrl` | `string` [0..1] | No | URL path to HTML version of the legislative docume |
| `HtmCreateDate` | `dateTime` [1..1] | Yes | Date and time the HTM version was created. |
| `HtmLastModifiedDate` | `dateTime` [1..1] | Yes | Date and time the HTML version of the document was |
| `PdfUrl` | `string` [0..1] | No | URL path to PDF version of the legislative documen |
| `PdfCreateDate` | `dateTime` [1..1] | Yes | Date and time the PDF version was created. Cannot  |
| `PdfLastModifiedDate` | `dateTime` [1..1] | Yes | Date and time the PDF version was modified. Cannot |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |

### `LegislativeEntity`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Id` | `int` [1..1] | Yes | Unique integer for entity. |
| `Name` | `string` [0..1] | No | Title of amendment, document, or entity name. Pair |
| `LongName` | `string` [0..1] | No | In reference to legislative entities such as membe |
| `Agency` | `string` [0..1] | No | Legislative Body. |
| `Acronym` | `string` [0..1] | No | Abbreviation for Legislative Entity. Only unique w |

### `LegislativeStatus`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `HistoryLine` | `string` [0..1] | No | One line describing the action taken on the legisl |
| `ActionDate` | `dateTime` [1..1] | Yes | Date that action was taken on the legislation. |
| `AmendedByOppositeBody` | `boolean` [1..1] | Yes | True if the chamber that did not introduce the bil |
| `PartialVeto` | `boolean` [1..1] | Yes | True if the governor has partially vetoed the bill |
| `Veto` | `boolean` [1..1] | Yes | True if the governor has vetoed the legislation. |
| `AmendmentsExist` | `boolean` [1..1] | Yes |  |
| `Status` | `string` [0..1] | No | Abbreviated description of the status of a piece o |

### `Member`

*Extends: `LegislativeEntity`*

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Party` | `string` [0..1] | No |  |
| `District` | `string` [0..1] | No |  |
| `Phone` | `string` [0..1] | No | Phone number. |
| `Email` | `string` [0..1] | No | E-mail address. |
| `FirstName` | `string` [0..1] | No | First name. |
| `LastName` | `string` [0..1] | No | Last name. |

### `RcwCiteAffected`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `RcwCite` | `string` [0..1] | No | Reference to a title, chapter, or section of the R |
| `Action` | `string` [0..1] | No | The action the legislation is taking on the Revise |

### `RollCall`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Agency` | `string` [0..1] | No | Legislative Body. |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `Motion` | `string` [0..1] | No |  |
| `SequenceNumber` | `int` [1..1] | Yes |  |
| `VoteDate` | `dateTime` [1..1] | Yes |  |
| `YeaVotes` | `RollCallType` [0..1] | No |  |
| `NayVotes` | `RollCallType` [0..1] | No |  |
| `AbsentVotes` | `RollCallType` [0..1] | No |  |
| `ExcusedVotes` | `RollCallType` [0..1] | No |  |
| `Votes` | `ArrayOfVote` [0..1] | No |  |

### `RollCallType`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Count` | `int` [1..1] | Yes |  |
| `MembersVoting` | `string` [0..1] | No |  |

### `SessionLaw`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ChapterNumber` | `int` [1..1] | Yes | Session Law Chapter Number assigned to passed legi |
| `Year` | `int` [1..1] | Yes | In the SessionLaw class, this refers to the year t |
| `LegislativeSession` | `string` [0..1] | No | Session description. In the case of the amendment, |
| `LegislatureNumber` | `int` [1..1] | Yes | Number of the Washington State legislative session |
| `EffectiveDate` | `dateTime` [1..1] | Yes | Date the legislation will take effect. |
| `MultipleEffectiveDates` | `boolean` [1..1] | Yes | True if there are multiple dates that the parts of |
| `BillId` | `string` [0..1] | No | Prefix and bill number of a piece of legislation.  |
| `Biennium` | `string` [0..1] | No | Two year time period beginning on odd years. Legis |
| `BillTitle` | `string` [0..1] | No |  |
| `PartialVeto` | `boolean` [1..1] | Yes | True if the governor has partially vetoed the bill |
| `Veto` | `boolean` [1..1] | Yes | True if the governor has vetoed the legislation. |
| `LegTypeId` | `int` [1..1] | Yes |  |

### `Signature`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `MemberId` | `int` [1..1] | Yes | Unique integer for a member. |
| `Name` | `string` [0..1] | No | Title of amendment, document, or entity name. Pair |
| `Position` | `string` [0..1] | No | A member's position on a committee. |
| `PositionSort` | `int` [1..1] | Yes | Used for determining the proper order of members l |

### `Sponsor`

*Extends: `LegislativeEntity`*

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Type` | `string` [0..1] | No | Describes what body originally considered the amen |
| `Order` | `int` [1..1] | Yes | Used to determine sort order. |
| `Phone` | `string` [0..1] | No | Phone number. |
| `Email` | `string` [0..1] | No | E-mail address. |
| `FirstName` | `string` [0..1] | No | First name. |
| `LastName` | `string` [0..1] | No | Last name. |

### `Vote`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `MemberId` | `int` [1..1] | Yes | Unique integer for a member. |
| `Name` | `string` [0..1] | No | Title of amendment, document, or entity name. Pair |
| `VOte` | `VoteType` [1..1] | Yes |  |

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

### Biennium Format
The biennium parameter must be in the format `YYYY-YY` (e.g., `2023-24`).

### Error Handling
Invalid parameters will result in SOAP fault responses.

### Rate Limits
No formal rate limits are documented; use reasonable request intervals.
