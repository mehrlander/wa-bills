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
