## Data Dictionary

Official field definitions from WebServiceDataDictionary.doc.

| Field | Data Type | Max Length | Description |
|-------|-----------|------------|-------------|
| `Acronym` | `varchar` | 4 | Abbreviation for Legislative Entity. Only unique when paired... |
| `Action` | `varchar` | 4 | The action the legislation is taking on the Revised Code Was... |
| `ActionDate` | `datetime` | - | Date that action was taken on the legislation. |
| `Address` | `varchar` | 50 | Street address. |
| `Agency` | `varchar` | 6 | Legislative Body. |
| `AgendaId` | `int` | - | Unique integer for a standing committee meeting. |
| `AmendedByOppositeBody` | `bool` | - | True if the chamber that did not introduce the bill passed a... |
| `AmendmentExists` | `bool` | - | True if the legislation has amendments. |
| `Appropriations` | `bool` | - | True if the bill has appropriations. |
| `Biennium` | `varchar` | 7 | Two year time period beginning on odd years. Legislation int... |
| `BillId` | `varchar` | 14 | Prefix and bill number of a piece of legislation. When paire... |
| `BillNumber` | `int` | 4 | 3 or 4 digit number assigned to a piece of legislation. |
| `Building` | `varchar` | 50 | Reference to building on the legislative campus. |
| `Cancelled` | `bool` | - | True if the committee meeting has been cancelled. |
| `ChapterNumber` | `int` | - | Session Law Chapter Number assigned to passed legislation. |
| `City` | `varchar` | 20 | City name. |
| `Class` | `varchar` | 50 | Category of legislative document. |
| `ContactInformation` | `varchar` | 50 | Contact information for the staff coordinating the committee... |
| `Description` | `varchar` | 50 | Describes the content of the amendment or document. For amen... |
| `DocumentExists` | `bool` | - | True if the legislative document related to the object's met... |
| `Drafter` | `varchar` | 50 | Abbreviated designation of the amendment drafter and draft v... |
| `EffectiveDate` | `datetime` | - | Date the legislation will take effect. |
| `Email` | `varchar` | 128 | E-mail address. |
| `EngrossedVersion` | `int` | - | The engrossed version of the bill number. Each time the bill... |
| `FirstName` | `varchar` | 25 | First name. |
| `FloorAction` | `varchar` | 50 | Action taken by the legislative body during a floor session. |
| `FloorActionDate` | `datetime` | - | Date of action taken by the legislative body during a floor ... |
| `FloorNumber` | `int` | - | Number assigned to a floor amendment when it is submitted to... |
| `HearingDate` | `datetime` | - | The date the committee action occurred. |
| `HearingType` | `varchar` | 17 | The type of activity that the standing committee will do in ... |
| `HistoryLine` | `varchar` | 620 | One line describing the action taken on the legislation. |
| `HtmCreateDate` | `datetime` | - | Date and time the HTM version was created. |
| `HtmLastModifiedDate` | `datetime` | - | Date and time the HTML version of the document was modified. |
| `HtmUrl` | `varchar` | 400 | URL path to HTML version of the legislative document. |
| `Id` | `int` | - | Unique integer for entity. |
| `IntroducedDate` | `datetime` | - | Date that the bill was read first time on the floor of the o... |
| `ItemDescription` | `varchar` | 500 | Less than a sentence summary describing an item on the agend... |
| `LastName` | `varchar` | 25 | Last name. |
| `LegalTitle` | `varchar` | 500 | Summary of legislation or jingle. |
| `LegislativeSession` | `varchar` | 50 | Session description. In the case of the amendment, it is the... |
| `LegislatureNumber` | `int` | - | Number of the Washington State legislative session. |
| `LocalFiscalNote` | `bool` | - | True if legislation has one or more local fiscal notes. |
| `LongDescription` | `varchar` | 5000 | Summary of legislation written by staff in the Code Reviser'... |
| `LongFriendlyName` | `varchar` | 200 | Long description of the document name. |
| `LongLegislationType` | `varchar` | 25 | Descriptive designation of the type of legislation. |
| `LongName` | `varchar` | 100 | In reference to legislative entities such as members and com... |
| `LongRecommendation` | `varchar` | max | A more descriptive version of Recommendation. |
| `MemberId` | `int` | - | Unique integer for a member. |
| `MultipleEffectiveDates` | `bool` | - | True if there are multiple dates that the parts of the legis... |
| `Name` | `varchar` | 260 | Title of amendment, document, or entity name. Paired with th... |
| `Order` | `int` | - | Used to determine sort order. |
| `OriginalAgency` | `varchar` | 6 | Legislative body that the legislation was originally introdu... |
| `PartialVeto` | `bool` | - | True if the governor has partially vetoed the bill. |
| `PdfCreateDate` | `datetime` | - | Date and time the PDF version was created. Cannot be null. |
| `PdfLastModifiedDate` | `datetime` | - | Date and time the PDF version was modified. Cannot be null. |
| `PdfUrl` | `varchar` | 400 | URL path to PDF version of the legislative document. |
| `Phone` | `varchar` | 14 | Phone number. |
| `Position` | `varchar` | 60 | A member's position on a committee. |
| `PositionSort` | `int` | - | Used for determining the proper order of members listed on a... |
| `PrimeSponsorID` | `int` | - | Unique identifier for the primary sponsor of the legislation... |
| `RcwCite` | `varchar` | 24 | Reference to a title, chapter, or section of the Revised Cod... |
| `Recommendation` | `varchar` | 20 | Committee recommendation. |
| `RecommendationType` | `varchar` | 8 | The type of committee recommendation. |
| `ReferredDate` | `datetime` | - | Date the bill was referred to the committee. |
| `Request` | `varchar` | 8 | Request number and version created by the staff in the Code ... |
| `RequestedByBudgetCommittee` | `bool` | - | True if the legislation is introduced by request of a budget... |
| `RequestedByDepartment` | `bool` | - | True if the legislation is introduced by request of a depart... |
| `RequestedByGovernor` | `bool` | - | True if the legislation is introduced by request of the Gove... |
| `RequestedByOther` | `bool` | - | True if the legislation is introduced by request of others. |
| `Room` | `varchar` | 50 | Reference to a room in a building on the legislative campus. |
| `Session` | `int` | - | Number of the special session. This will be 0 for the regula... |
| `ShortDescription` | `varchar` | 28 | Brief description of the legislation. This is commonly used ... |
| `ShortFriendlyName` | `varchar` | 100 | Short description of the document name. |
| `ShortLegislationType` | `varchar` | 2 | Abbreviated designation of the type of legislation. |
| `Sponsor` | `varchar` | 80 | Common display string of sponsor name. If the bill is a comm... |
| `SponsorName` | `varchar` | 100 | Primary sponsor of the amendment. |
| `State` | `varchar` | 20 | State name. |
| `StateFiscalNote` | `bool` | - | True if legislation has one or more state fiscal notes. |
| `Status` | `varchar` | 15 | Abbreviated description of the status of a piece of legislat... |
| `SubstituteVersion` | `int` | - | Substitute version of the legislation. Standing committees i... |
| `Type` | `varchar` | 50 | Describes what body originally considered the amendment (Ame... |
| `Veto` | `bool` | - | True if the governor has vetoed the legislation. |
| `Year` | `int` | - | In the SessionLaw class, this refers to the year the legisla... |
| `ZipCode` | `int` | - | Postal zip code. |
