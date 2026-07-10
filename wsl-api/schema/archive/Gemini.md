Architectural Blueprint for WSL Data Integration

1. Executive Technical Summary

This report establishes a definitive architectural blueprint for integrating external applications with the Washington State Legislative (WSL) Web Services. The primary objective is to translate a legacy, SOAP-based, procedural service interface into a modern, relational, and robust data storage system. The target audience for this document includes systems architects, database designers, and senior backend engineers tasked with building high-fidelity legislative tracking systems.

The Washington State Legislature exposes its data through a suite of SOAP (Simple Object Access Protocol) endpoints that reflect the internal document-processing workflows of the legislative support staff rather than a semantic data model optimized for external consumption. As a result, a naive integration strategy—one that attempts to map SOAP objects directly to database tables 1:1—will fail to capture the nuance of legislative progression, specifically regarding version control, sponsorship inheritance, and statutory impact.

This blueprint proposes a State Reconstruction Architecture. In this model, the consuming application does not merely “sync” data; it reconstructs the legislative reality by ingesting disparate signals—status history lines, document existence flags, and session law citations—to synthesize a coherent relational model. The core architectural innovation detailed herein is the strict bifurcation of the Bill (the invariant legislative vehicle) from the Version (the variant content instance). By decoupling these entities, the system can gracefully handle complex legislative maneuvers such as “gut-and-replace” striker amendments, committee substitutions, and engrossment without corrupting the historical lineage of the legislation.

The analysis proceeds through a rigorous decomposition of the entity model, a detailed field-level dictionary mapping, an analysis of endpoint input/output economics, and a set of heuristic algorithms for preserving data integrity during the chaotic “cutoff” periods of the legislative session.

⸻

2. Architectural Domain Model & Entity Architecture

The foundational challenge in modeling WSL data is the separation of the “container” from the “content.” In the legislative process, the Bill is merely a container that moves through a parliamentary workflow. The Content—the actual text of the law—changes frequently, often radically, while the container remains identifyingly consistent (e.g., “HB 1000”). The WSL Web Services do not explicitly model this parent-child relationship in a single object graph; instead, they provide a flat Legislation object that mixes current status with historical attributes.

To build a robust system, we must impose a relational structure that normalizes these concepts into two primary entities: the Bill and the Version.

2.1 The Bill Entity (The Invariant Container)

The Bill entity represents the legislative vehicle itself. Its primary function is to serve as the stable anchor for all variable data. It is defined by a composite natural key consisting of the Biennium and the Bill Number. Once a bill is introduced, the attributes of the Bill entity remain largely static, with the exception of its CurrentStatus and FinalDisposition.

Architecturally, the Bill table acts as the root of the aggregate. It answers the question, “What is this legislation called, and where is it right now?” It does not answer the question, “What does the legislation say?” or “Who supports it now?”—those are concerns of the Version entity.

2.1.1 Invariance and Identification
The primary identifier for a bill is the BillNumber. However, BillNumber is not unique across time; it is reused every biennium. Therefore, the architectural requirement is a composite key:
	•	Biennium + Agency + BillNumber

The Agency attribute is critical. While usually inferred from the bill number range (e.g., House bills typically start at 1000, Senate bills at 5000), the LegislationService exposes an OriginalAgency field. This field must be persisted to handle edge cases where special session bills or initiatives might defy standard numbering conventions.

2.1.2 The Prime Sponsor Constraint
A critical data integrity requirement is the preservation of the Human Prime Sponsor. In the WSL data feed, specifically the LegislationService.GetLegislation endpoint, the Sponsor field is mutable. When a bill is substituted by a committee (e.g., HB 1000 becomes SHB 1000), the Sponsor field often changes from “Representative Smith” to “House Committee on Education.”

If the database simply updates the Bill table with the latest data from the service, the original human sponsor is lost. This destroys the ability to perform accurate sponsor analytics (e.g., “How many bills did Rep. Smith introduce?”).

Architectural Decision: The Bill entity must have a PrimeSponsorID column that is populated only upon the initial ingestion of the “Original” version of the bill. This field must be treated as immutable by the sync pipeline unless a specific “Sponsor Correction” event is detected in the history log. The LegislationService provides a PrimeSponsorID integer which generally points to the SponsorService entity. This integer is the “Golden Record” for the human sponsor and must be privileged over the string-based Sponsor field in the Bill table.

2.2 The Version Entity (The Variant Content)

The Version entity captures the bill at a specific discrete point in its evolutionary lifecycle. A bill theoretically has infinite potential states, but computationally, we care about states that produce a new Document.

There is no single “GetVersions” endpoint in the WSL services. This is a significant architectural gap that must be bridged by logic. The LegislationService returns a boolean flag Active which indicates if a specific version is currently passable, but it does not return a list of all historical versions.

To construct the Version table, the architecture relies on the LegislativeDocumentService. Specifically, the GetDocumentsByClass operation with documentClass="Bill" returns a list of filenames associated with a bill number (e.g., SB 5000.PL, SSB 5000, ESB 5000).

Synthesis Logic: The architecture must implement a parser that reads these document names to generate Version records.
	•	Original (ORG): Indicated by the root bill number (e.g., SB 5000).
	•	Substitute (SUB): Indicated by an S prefix (e.g., SSB 5000). This represents a committee’s complete rewrite of the bill.
	•	Second Substitute (S2): Indicated by 2S or S2 (e.g., 2SSB 5000). This represents a second committee’s rewrite (e.g., Policy committee passed a sub, then Fiscal committee passed a different sub).
	•	Engrossed (ENG): Indicated by an E prefix (e.g., ESB 5000). This indicates the bill has been amended on the floor of the house of origin.
	•	Enrolled (PL/ENR): Indicated by PL (Passed Legislature) suffix. This is the final version sent to the Governor.

Each of these distinct documents represents a row in the Version table. This allows the system to link specific amendments, fiscal notes, and committee reports to the exact version they reference, rather than vaguely linking them to the Bill.

2.2.3 Committee Sponsorship as a Version Attribute
While the Bill entity preserves the Human Prime Sponsor, the Version entity must capture the Institutional Sponsor. When SSB 5000 is created, the sponsor is technically the “Senate Committee on [Name].” This data is found in the LegislationService when querying for the specific substitute version. The Version table should therefore contain a SponsorName field that allows for this drift (e.g., Version 1: “Sen. Doe”, Version 2: “Senate Committee on Law & Justice”).

2.3 Satellite Entities

Satellite entities orbit the Bill or Version and have independent lifecycles. They are often populated by “Specialist” endpoints (defined in Section 3).

2.3.1 Committee Actions (Hearings)
Hearings are temporal events linked to a Bill. The LegislationService provides a GetHearings endpoint which returns a list of hearings for a specific bill.
	•	Data Model: BillHearing table
	•	Key Attributes: HearingDate, CommitteeName, HearingType (Public Hearing, Executive Session), Location
	•	Parent: Bill (WSL links them to the Bill ID)

2.3.2 Roll Call Votes
Votes represent the definitive “action” taken by the legislature. The LegislationService provides a GetRollCalls operation.
	•	Data Model: RollCall table
	•	Key Attributes: VoteDate, Motion (e.g., “Final Passage”), Yeas, Nays, Absent, Excused
	•	Parent: Bill

2.3.3 Documents (Amendments, Reports, Fiscal Notes)
The LegislativeDocumentService is a generic file retrieval system. However, in our relational model, these documents must be typed and linked.
	•	Data Model: LegislativeDocument table
	•	Attributes: DocumentClass (Amendment, Fiscal Note, Bill Report), Description (e.g., “Striking Amendment”), Url, PdfUrl
	•	Parent: Version (ideally)

Since WSL links documents to the Bill Number, the architecture must infer the Version link based on dates or naming conventions. For example, a fiscal note dated after the creation of the Substitute bill but before the Engrossed bill likely belongs to the Substitute version.

⸻

3. Comprehensive Field Dictionary & Schema Mapping

This section provides the translation layer between the SOAP XML response fields and the target relational schema. It resolves ambiguity in naming conventions and defines specific transformation rules.

3.1 Bill Table Definition

The Bill table is the primary registry.

Target Column	Data Type	Source Service	Source Field	Transformation / Logic
BillID	PK (Int)	N/A	N/A	Auto-increment internal ID.
Biennium	Varchar(7)	User Context	Argument	Input parameter for calls (e.g., “2025-26”). Acts as partition key.
BillNumber	Varchar(10)	LegislationService	BillNumber	String to support alphanumeric prefixes if they occur, though usually numeric.
Agency	Char(1)	LegislationService	OriginalAgency	“House” → H, “Senate” → S.
Type	Varchar(20)	LegislationService	LongLegislationType	Enum: “Bill”, “Resolution”, “Joint Memorial”, “Initiative”.
LegalTitle	Text	LegislationService	LegalTitle	The long “An Act…” title. Invariant.
ShortDescription	Varchar(255)	LegislationService	ShortDescription	“Friendly” title. Mutable only early in process.
PrimeSponsorID	Int	LegislationService	PrimeSponsorID	Capture on first ingestion. Do not overwrite with 0 if committee takes over.
IntroductionDate	DateTime	LegislationService	IntroducedDate	The date of First Reading.
CurrentStatus	Varchar(50)	LegislationService	CurrentStatus.Status	—
IsRequest	Boolean	LegislationService	Request	Indicates Departmental/Governor request.
StateFiscalNote	Boolean	LegislationService	StateFiscalNote	—
LocalFiscalNote	Boolean	LegislationService	LocalFiscalNote	—

3.2 Version Table Definition

The Version table normalizes the document list.

Target Column	Data Type	Source Service	Source Field	Transformation / Logic
VersionID	PK (Int)	N/A	N/A	Auto-increment.
BillID	FK (Int)	N/A	N/A	Link to Bill table.
VersionCode	Varchar(10)	LegislationService	HistoryLine (Parsed)	Derived from parsing history lines for “Substitute”, “Engrossed”.
FormalName	Varchar(50)	LegislativeDocumentService	Name	e.g., “SSB 5000”, “E2SHB 1234”.
PdfUrl	Varchar(512)	LegislativeDocumentService	PdfUrl	Direct link to content.
HtmUrl	Varchar(512)	LegislativeDocumentService	HtmUrl	Direct link to HTML content.
IsActive	Boolean	LegislationService	Active	True if this is the version currently on the floor.
PostedDate	DateTime	LegislativeDocumentService	Metadata	Date the document was published to the system.

3.3 Session Law Map Table Definition

This table bridges the gap between the legislative proposal and the enacted statute.

Target Column	Data Type	Source Service	Source Field	Transformation / Logic
SessionLawID	PK (Int)	N/A	N/A	Auto-increment.
BillID	FK (Int)	N/A	N/A	Link to Bill table.
ChapterNumber	Int	SessionLawService	ChapterNumber	Sequential law number (e.g., Chapter 102).
Year	Int	SessionLawService	Year	Year of enactment (e.g., 2025).
SessionCode	Int	SessionLawService	Session	0=Regular, 1=Special. Critical for uniqueness.
EffectiveDate	DateTime	SessionLawService	EffectiveDate	When the law comes into force.
VetoStatus	Varchar(20)	LegislationService	Veto / PartialVeto	Derived from booleans: Signed, Vetoed, Partial.

3.4 RCW Reference Table Definition

This table enables “Statutory Tracing”—showing which bills affect which existing laws.

Target Column	Data Type	Source Service	Source Field	Transformation / Logic
RefID	PK (Int)	N/A	N/A	Auto-increment.
BillID	FK (Int)	N/A	N/A	Link to Bill table.
Citation	Varchar(50)	RcwCiteAffectedService	RcwCite	e.g., “43.132.020”.
Action	Varchar(20)	RcwCiteAffectedService	Action	“Amend”, “New Section”, “Repeal”.


⸻

4. Endpoint Efficiency Matrix & Economics

The WSL SOAP API is chatty. A naive implementation that loops through bill numbers calling GetLegislation will suffer from severe latency (the “N+1 Query Problem”). To maximize throughput and minimize load, we classify endpoints by their economic utility.

4.1 “Much from Little” (The Sync Workhorses)

These endpoints return broad datasets with minimal input. They are the primary drivers of the synchronization loop.

Endpoint	Service	Economic Profile	Use Case
GetLegislativeStatusChangesByDateRange	LegislationService	High Value. Returns all bills that changed status within a time window.	The Poller. Heartbeat of sync system. Run every 5–10 minutes. Triggers heavier calls.
GetDocumentClasses	LegislativeDocumentService	High Value. Returns valid document types for the biennium.	Configuration. Run once at startup; cache valid doc types (“Bill”, “Amendment”, “Fiscal Note”).
GetLegislationByYear	LegislationService	Medium Value. Summary info for all active bills in a year.	Cold Start / Bootstrap; good for nightly reconciliation.
GetRcwCitesAffected	LegislationService	High Value. Bulk mapping of Bill-to-RCW.	Nightly background job; efficiently populates RCW_Reference.

4.2 “Little from Much” (The Targeted Specialists)

These endpoints require specific keys (BillID, Biennium) and return deep, specific data. Call on demand when triggered by a Workhorse endpoint.

Endpoint	Service	Trigger Condition	Data Retrieved
GetLegislation	LegislationService	StatusChange detected in Poller	Full Legislation object: sponsors, detailed history, flags.
GetDocumentsByClass	LegislativeDocumentService	Status indicates “Substituted” or “Amended”	PDF/HTML URLs for Version table; essential for text.
GetRollCalls	LegislationService	Status implies floor vote (“Passed”, “Failed”, “Adopting”)	Vote tallies.
GetHearings	LegislationService	Status “Referred to Committee”	Hearing schedules; populate BillHearing.
GetBillByChapterNumber	SessionLawService	Status “Signed” or “Delivered to Governor”	Official chapter number.

4.3 Efficiency Analysis: The “GetLegislation” Trap

Developers often default to calling GetLegislation for every bill they track. This is an anti-pattern.
	•	Cost: Payload includes full history log, sponsor list, companion list.
	•	Redundancy: 99% of bills do not change on any given day.
	•	Solution: Never call GetLegislation in a loop. Only call it when GetLegislativeStatusChangesByDateRange indicates a delta.

⸻

5. Synchronization Logic & Decision Tree

This section provides the logic flow for the “Sync Worker.” This process assumes a persistent state (e.g., a LastSyncTimestamp stored in the database).

5.1 The Sync Loop

Input: CurrentBiennium (e.g., “2025-26”), LastSyncTime (DateTime)
	1.	Poll for Changes
	•	Call LegislationService.GetLegislativeStatusChangesByDateRange(biennium, beginDate=LastSyncTime, endDate=Now).
	•	Result: list of LegislativeStatus objects containing BillId, Status, HistoryLine, ActionDate.
	2.	Iterate and Filter
	•	For each item:
	•	If BillId missing locally → flag for Full Import
	•	Else compare Status and HistoryLine; if different → flag for Update
	3.	Execute Updates (Branching Logic)
	•	Branch A: Full Import (New Bill)
	•	Call LegislationService.GetLegislation(BillId)
	•	Insert into Bill (preserve PrimeSponsorID)
	•	Call LegislativeDocumentService.GetDocumentsByClass(BillId, 'Bill') → populate Version
	•	Call LegislationService.GetHearings(BillId)
	•	Branch B: Status Update (Parliamentary Move)
	•	Condition: Status changed (e.g., “H Rules R” → “H Passed 3rd”)
	•	Call LegislationService.GetLegislation(BillId) → update CurrentStatus, append History
	•	Heuristic: if Status contains “Passed” or “Adopting” → call LegislationService.GetRollCalls(BillId)
	•	Branch C: Version Change (Substitution/Engrossment)
	•	Condition: HistoryLine includes “Substitute… substituted” or “Amendment… adopted”
	•	Call LegislativeDocumentService.GetDocumentsByClass(BillId, 'Bill')
	•	Compare returned filenames vs local Version
	•	Insert new filenames as new Version rows; set IsActive from Legislation flags
	•	Branch D: Document Update (Fiscal Notes/Amendments)
	•	Condition: every 12–24 hours (“Deep Sweep”)
	•	Call GetDocumentsByClass(BillId, 'Fiscal Note') and GetDocumentsByClass(BillId, 'Amendment')
	•	Update LegislativeDocument table with new URLs
	4.	Finalize
	•	Update LastSyncTime to Now

⸻

6. Data Integrity & Lineage Preservation

WSL data is “stateful” in that it reflects the current moment. It often overwrites historical context. The blueprint requires specific logic to preserve lineage.

6.1 Sponsor Inheritance Logic

When a committee substitutes a bill, the Sponsor field in the Legislation object changes to the committee name.

Extraction Strategy:
	1.	Original ingestion: first seen (Status “Introduced”) → store PrimeSponsorID and Sponsor string in Bill.PrimeSponsorID and lock it.
	2.	Substitution event: detect substitute via documents list (SHB… / SSB…) and confirm Sponsor drift in GetLegislation.
	3.	Resolution: do not update Bill.PrimeSponsorID; update Version.SponsorName for the new substitute row.
	4.	UI implication: show both:
	•	Prime Sponsor: [Original Human]
	•	Current Version Sponsor: [Committee]

6.2 The Resolution Gap (Passed vs. Chaptered)

A bill may show “Passed Legislature” / “Delivered to Governor” before a session law chapter is available, because chapter assignment lags.

Detection & Resolution:
	•	State: Bill Status is “Passed Legislature” OR “Delivered to Governor”
	•	Check: Bill.ChapterNumber IS NULL
	•	Action: engage a secondary poller:
	•	Query SessionLawService.GetBillByChapterNumber or GetSessionLawByBillId periodically
	•	Principle: SessionLawService is the chapter “system of record.”
	•	Note: no provisional chapter numbers; don’t guess.

6.3 Silent Updates (Fiscal Notes & Flags)

Fiscal notes can appear without a status change.
	•	Problem: arrival may not generate a new history line (bill still in committee)
	•	Fix: use StateFiscalNote / LocalFiscalNote booleans in GetLegislation
	•	Strategy: nightly “Flags Sweep”
	•	Query GetLegislation for bills where StateFiscalNote=False
	•	If flips to True → call GetDocumentsByClass(..., 'Fiscal Note') and ingest

⸻

7. Temporal Considerations

The legislative clock is distinct from the wall clock.

7.1 Stability of Fields
	•	Stable (Safe to Cache): BillNumber, Biennium, LegalTitle, IntroductionDate, PrimeSponsorID (Original)
	•	Volatile (Must Poll): CurrentStatus, ShortDescription (can be corrected/updated), Sponsor string, Version Active flags

7.2 Polling Cadence

The legislature operates in bursts.
	•	Session Mode (Jan–Apr): polling every 5–10 minutes for status changes; velocity peaks on cutoff days.
	•	Interim Mode (May–Dec): polling hourly/daily; run full reconciliation (GetLegislationByYear) to catch corrections.

7.3 Change Detection Hints

No reliable ETag/Last-Modified for granular changes. The reliable dirty signal is the HistoryLine in LegislativeStatus—if history count increases or the last line changes, treat as dirty.

⸻

8. Edge Case Catalog & Anti-Patterns

8.1 Edge Case: Striker Amendments

A striker replaces the bill text after the enacting clause.
	•	Identification: LegislativeDocumentService documents of class “Amendment”; description/text contains “Striker” or “Strike everything”
	•	Handling: still an Amendment (not a Version) until adopted/engrossed
	•	Logic: if DocumentClass == "Amendment" AND Description contains “Striker” → LegislativeDocument.IsStriker=True

8.2 Edge Case: Partial Vetoes

Governor may veto specific sections.
	•	Signal: LegislationService.PartialVeto = True
	•	Status often: “Gov Prtl Veto”
	•	SessionLawService still assigns a chapter number
	•	Store FinalDisposition enum including PartialVeto

8.3 Edge Case: Initiatives
	•	Data anomaly: high bill numbers (e.g., “Initiative 900”)
	•	Sponsor gap: may be null or placeholder (“People of Washington”)
	•	Validation: Bill.PrimeSponsorID nullable
	•	Retrieval: use document search by name like “Initiative” if standard bill queries fail

8.4 Anti-Pattern: The “Request Number” Confusion

Bills begin as request numbers (Z-drafts), and there’s GetLegislationByRequestNumber.
	•	Avoid building primary architecture around request numbers.
	•	Use only if tracking executive agency drafts pre-introduction.

8.5 Anti-Pattern: Redundant Status Codes

Human-readable statuses aren’t normalized.
	•	Example: “H Rules R” vs “House Rules R”
	•	Mitigation: do not drive logic directly from raw strings; normalize to app enums (e.g., IN_COMMITTEE, ON_FLOOR, PASSED, VETOED)

⸻

9. Conclusion

The Washington State Legislative Web Services provide a comprehensive, albeit fragmented, view of the legislative process. The keys to a successful integration are:
	1.	Inversion of Control: Don’t ask “What is the text of Bill 1000?” Ask “What documents exist for Bill 1000?” and derive version history.
	2.	Bifurcation: Rigorously separate the Bill (Container) from the Version (Content).
	3.	Efficiency: Use status-change endpoints as triggers and avoid the GetLegislation polling trap.
	4.	Skepticism: Trust PrimeSponsorID over Sponsor string, and trust SessionLawService over LegislationService for chapter numbers.

By implementing the Bill, Version, SessionLawMap, and LegislativeDocument entities as described, the system will achieve high fidelity with the legislative reality, handling complex parliamentary maneuvers with data integrity intact.

⸻

Works cited

1. LegislationService - Washington State Legislative Web Services
   https://wslwebservices.leg.wa.gov/legislationservice.asmx

2. LegislationService - GetLegislativeStatusChangesByDateRange
   https://wslwebservices.leg.wa.gov/legislationservice.asmx?op=GetLegislativeStatusChangesByDateRange

3. Web Service Data Dictionary
   https://wslwebservices.leg.wa.gov/WebServiceDataDictionary.doc

4. LegislationService - GetHearings
   https://wslwebservices.leg.wa.gov/legislationservice.asmx?op=GetHearings

5. SessionLawService - GetBillByChapterNumber
   https://wslwebservices.leg.wa.gov/sessionlawservice.asmx?op=GetBillByChapterNumber

6. LegislativeDocumentService Web Service
   https://wslwebservices.leg.wa.gov/legislativedocumentservice.asmx

7. LegislativeDocumentService - GetDocumentsByClass
   https://wslwebservices.leg.wa.gov/legislativedocumentservice.asmx?op=GetDocumentsByClass

8. CommitteeMeetingService - GetCommitteeMeetingItems
   https://wslwebservices.leg.wa.gov/committeemeetingservice.asmx?op=GetCommitteeMeetingItems

9. House vote on HB 1589 in Washington 2023-2024 Regular Session - Open States
   https://open.pluralpolicy.com/vote/e16e411c-4260-42b1-a8f2-f2aad1df96e1/

10. SessionLawService - Washington State Legislative Web Services
    https://wslwebservices.leg.wa.gov/sessionlawservice.asmx