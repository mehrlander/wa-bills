Washington State Legislative API Integration & Synchronization Strategy

1. Source of Truth Hierarchy & Joining Logic

1.1 Primary Key Resolution – BillNumber vs BillId

BillNumber is the numeric portion of a bill (e.g. 1009), whereas BillId is a string including the chamber and version prefix (e.g. “2SHB 1009” for 2nd Substitute House Bill 1009). Different WSL services expect one or the other:
	•	LegislationService: Many core endpoints take a Bill Number (integer). For example, GetLegislation requires a billNumber int ￼. In contrast, some LegislationService calls use the BillId string; e.g. GetSponsors and GetSessionLawChapter expect a billId ￼ ￼. The service provides both identifiers in its outputs – summary records include both BillNumber (int) and BillId (string) for cross-reference ￼.
	•	FiscalNoteService: (Detailed in section 3) likely uses Bill Number or Id depending on operation. The WSL data dictionary indicates fiscal note data is keyed to the bill’s identifiers (we infer BillId is used to get specific version notes).
	•	SessionLawService: Endpoints here use the numeric Bill Number. For example, GetSessionLawByBill expects a billNumber int and biennium ￼. Internally, the service determines the chaptered act by combining biennium + bill number (it assumes uniqueness in a biennium).
	•	AmendmentService: (Not explicitly in prompt, but part of WSL) also likely requires Bill Number (with separate calls to filter House/Senate via an agency parameter). For any bill-version-specific operations (e.g. retrieving a particular draft of a bill, or amendments associated), the BillId (including version) is the precise key.

Key interoperability point: The BillId uniquely identifies a particular version of a bill (including whether it’s a substitute “S”, second substitute “S2”, engrossed “E”, etc.), while BillNumber identifies the base legislation regardless of version. In practice, you will often retrieve a list of bills via BillNumber (e.g. all bills introduced), then use BillId where a call needs a specific version context (such as fetching sponsors or RCW citations). The LegislationService itself returns both forms in many results to facilitate mapping ￼. Always verify which format a service expects – for instance, to get sponsor details you must supply the BillId ￼, but to get session law chapter you supply the BillId in LegislationService’s own GetSessionLawChapter ￼ versus a BillNumber in SessionLawService’s GetSessionLawByBill ￼. This means an integration needs to handle both identifiers and sometimes convert between them (usually by looking up the Bill’s chamber and latest version to construct the BillId string).

1.2 Session Law Hand-off – When is a Bill “Passed”?

To detect that a bill has passed the legislature (i.e. both chambers) and to obtain its chapter number in the Session Laws, two sources must be coordinated:
	•	LegislationService CurrentStatus: Each bill’s current status is available via LegislationService.GetCurrentStatus or in the CurrentStatus field of GetLegislation. When a bill passes both chambers, the CurrentStatus.Status will reflect a milestone such as “Passed Legislature” or “Delivered to Governor.” This occurs in near real-time as the legislative status is updated. (For example, GetLegislation returns a CurrentStatus object with a Status string and action date ￼.) The authoritative indicator within LegislationService is that status text; once it indicates passage or enrollment, the bill has cleared the legislature. However, LegislationService does not assign the chapter number – it may include a history line or status note like “Chapter ___, Laws of 2026” only after the fact, if at all, but generally the chapter is obtained from SessionLawService.
	•	SessionLawService & Chapter Number: The SessionLawService provides the definitive chapter law data once a bill becomes law. Calling GetSessionLawByBill with the biennium and bill number returns the chapter number and session law info ￼. For example, after governor signing (or other finalization), GetSessionLawByBill yields a ChapterNumber (e.g. Chapter 5, 2026 Laws) along with effective date and veto info ￼ ￼. This service may lag slightly behind the status update – typically, once the bill is signed by the Governor and the legislation is “chaptered,” a chapter number is assigned. The latency between the LegislationService status (“Governor Signed”) and the appearance of a chapter number in SessionLawService is usually short (often same-day), but it depends on how quickly the legislative clerks update the publishing system.

Which updates first? In practice, the LegislationService status will reflect passage immediately (e.g. status = “Passed Legislature” or “Delivered to Governor” as soon as the second chamber votes) ￼. The SessionLawService data (chapter number) becomes available only after the bill is officially processed into session law – typically after governor’s action. Thus, there is an inherent delay: a bill might show as passed in LegislationService for hours or days before a chapter number is assigned. The assignment of the chapter number often coincides with or shortly after the Governor’s signature (if signed) or after other enactment conditions. As an integrator, you should continue polling for session law info on bills that have passed the legislature until GetSessionLawByBill returns a result instead of an error. Once SessionLawService returns a valid ChapterNumber, that is the source of truth for the chaptered law reference (e.g. Chapter 123, Laws of 2026) ￼.

1.3 Sponsor Persistence across Versions

When a bill evolves through substitutes or engrossed versions, the prime sponsor entity remains the same legislator, but the displayed sponsor name can change. In particular, Washington legislative practice assigns committee names as sponsor for substitute bills (e.g., a committee report substitute might list the committee as the sponsor on the bill text). The WSL data confirms how this is handled in the API: the PrimeSponsorID remains constant across all versions of a bill, even if the textual Sponsor name changes to a committee ￼. The LegislationService returns both a Sponsor string and a numeric PrimeSponsorID for each bill version ￼ ￼.
	•	Sponsor String: For original bills, this is typically “Rep. Jane Doe” or “Sen. John Smith” (the prime sponsor’s name). If a committee substitute is adopted, the Sponsor string in that substitute version’s data will change to something like “House Appropriations (originally sponsored by Rep. Doe)”. According to the WSL data dictionary: “If the bill is a committee [bill], the [Sponsor] string will contain the committee acronym followed by the primary sponsor of the original bill in parens.” ￼. For example, a substitute bill might show Sponsor = "APP (Doe)" for Appropriations Committee, originally sponsored by Rep. Doe.
	•	PrimeSponsorID: This integer ID (e.g., 12345) uniquely identifies the legislator who is the original prime sponsor. This ID does not change with different versions. All versions (original bill, substitute, engrossed) carry the same PrimeSponsorID in the data ￼. Therefore, to consistently track the actual prime sponsor, use the PrimeSponsorID as the join key to the SponsorService (which can provide detailed info about that sponsor, like name, party, district) or use LegislationService.GetSponsors which returns a list including the primary sponsor with their ID and name ￼.

In summary, the source of truth for the true prime sponsor identity is the PrimeSponsorID field from LegislationService, and it persists across bill versions. The Sponsor name field is primarily for display and will reflect committee names for substitutes, so it should not be solely relied upon to identify the legislator. If needed, one can cross-reference PrimeSponsorID with SponsorService.GetSponsors for the biennium to get the sponsor’s full name and details ￼.

2. Synchronization & Batching Efficiency

2.1 Transactional Syncing – Changes Feed vs Full Data Dumps

To keep a local database in sync with real-time legislative actions, the WSL provides date-range endpoints. Two primary approaches are: (a) polling for status changes (events) and then fetching details as needed, or (b) polling for all updated bills in a range. We compare GetLegislativeStatusChangesByDateRange vs a “GetLegislation by date” approach:
	•	GetLegislativeStatusChangesByDateRange: This LegislationService call returns all status changes in a given time window ￼ ￼. It acts like a change log, listing each status update event that occurred between beginDate and endDate. The output is a list of LegislativeStatus records (not full bill details) – each includes the BillId, the status (stage) reached, the action date/time, and flags like whether it was amended by opposite house, vetoed, etc ￼. Notably, this is lightweight: it does not transmit the entire bill info, only the incremental status lines. For example, if Bill HB 1234 had two actions today (referred to committee, then passed committee), both events come back with the BillId “HB 1234” and different status texts and timestamps. This endpoint is ideal for high-frequency polling (hourly or finer) because the payload is relatively small and bounded by the activity in that timeframe (during peak session days, this could still be many entries, but far less than fetching every bill). Use case: An hourly poll of GetLegislativeStatusChangesByDateRange (e.g., last 60 minutes) lets you capture which bills had any movement ￼ ￼. From that list, you can determine which specific bills need updating in your database (e.g., if a bill’s status changed to “Passed Senate”, update that record’s status).
	•	GetLegislationIntroducedSince vs GetLegislationByDateRange: WSL does not have a single operation literally named “GetLegislationByDateRange” for all updates, but it has GetLegislationIntroducedSince and similar. GetLegislationIntroducedSince returns detailed bill info for all bills introduced after a given date ￼ ￼ (it effectively covers new introductions; it might also include substitutes as separate entries if their “introduced” timestamp – i.e., time of introduction of that version – is after the given date). This is a heavier call: it returns full Legislation objects for potentially many bills. For example, polling it hourly during session start (when dozens of bills drop daily) will return all fields (titles, sponsors, flags, etc.) for each new bill in that hour. The result is structured as an array of Legislation records ￼, each record containing the full detail as if from GetLegislation. Similarly, GetLegislationInfoIntroducedSince provides a lighter summary (LegislationInfo) for bills introduced since a date ￼. There is also GetLegislativeStatusChangesByBillId (for a single bill’s history in a date range) which is useful for retrospectively querying one bill’s timeline but not for broad sync.

Lightweight polling recommendation: For frequent (e.g. hourly) sync during Jan–Mar peak, use the status changes feed. GetLegislativeStatusChangesByDateRange is more bandwidth-efficient because it returns only changes (with BillIds) rather than duplicating static data. It essentially tells you “these 5 bills had status updates in the last hour” – then your system can fetch just those bills’ details (e.g., call GetLegislation for each to refresh any fields like current status text, etc., or even parse the returned status text directly to update status). In contrast, a naive approach of calling “give me all bills introduced/updated in the last hour” would either miss status changes on already-introduced bills or require calling the full GetLegislation on every bill every hour (very inefficient). Note that WSL doesn’t have a direct “modified since” for all fields – the status changes feed is the intended mechanism for changes. The only other route is date-specific queries like GetLegislationIntroducedSince which only handle new introductions (not subsequent actions). Therefore, the combination is often: poll status changes for updates to existing bills, and separately handle new introductions. (New introductions do appear in the status changes feed as well – likely as a “First Reading” or similar initial status event – so even new bills can be caught via status changes by looking for an entry where HistoryLine=“First reading…” etc.) In summary, StatusChangesByDateRange is the most transactional, lightweight feed for sync ￼, and it should be used to drive incremental updates.

Additionally, for extremely high-frequency needs, note that the status changes method can be filtered by biennium and date range only (not by chamber or committee, etc.), so you will get all activity within that window. During floor sessions, this could be a lot of events, but still manageable and far preferable to fetching all bills repeatedly.

2.2 Efficient Biennium Hydration (Bulk Seeding)

When initializing your database with an entire biennium’s data (e.g., retrospectively loading all bills from 2023-24), doing thousands of one-by-one calls would be very slow. Instead, leverage the batch-oriented endpoints:
	•	GetLegislationByYear: You can retrieve all bills active in a given year in one call ￼. For example, GetLegislationByYear for 2023 will return summary info for every bill that was active in 2023 ￼ (and likewise for 2024). “Active during the year” generally means any bill introduced or moving in that calendar year. By calling it for each year of the biennium, you can get a list of all bills in 2023-24. This returns an array of LegislationInfo entries (with BillNumber, BillId, type, etc.) for each bill. Because it is summary data (no long descriptions or histories), it’s relatively efficient. You can then follow up with calls to fetch details only for those bills where needed.
	•	GetLegislationIntroducedSince (full detail) or GetLegislationInfoIntroducedSince: An alternative to the year-based approach is to call GetLegislationIntroducedSince with a date just before the biennium start (e.g., sinceDate = Dec 1, 2022, which will catch all bills introduced in the 2023-24 biennium). This will return all bills introduced from that date onward – effectively everything in 2023-24 if used at the end of the biennium. For example, using a sinceDate early in January 2023 and calling it after session yields a list of all Legislation for the biennium in one go. The service will list each bill (and its versions) in the result set ￼. The detailed version (GetLegislationIntroducedSince) provides multiple <Legislation> entries (including substitutes as separate entries) within one response ￼. This can be a large XML response if ~2000 bills were introduced, but it avoids the overhead of 2000 individual requests. It essentially performs a bulk dump. Similarly, GetLegislationInfoIntroducedSince could be used for a lighter initial load (just to get BillIds and basic info, then selectively fetch details).

Recommended seeding strategy: Use a combination of bulk calls to avoid N+1 querying. For instance, to hydrate 2023-24:
	1.	Call LegislationService.GetLegislationByYear for 2023 and for 2024. Union these results to get the list of all BillIds/BillNumbers in the biennium (2024 may include some bills from 2023 still active; but duplicates can be filtered by BillId). This typically yields on the order of 2000–2500 bills for a biennium.
	2.	Use multi-threading or batching to call GetLegislation for details on these bills. You might batch by chamber or number ranges (to be polite to the API). Alternatively, skip this step and directly use GetLegislationIntroducedSince with a date before 2023 session start – this one call returns detailed info for all bills introduced in 2023-24 (including all versions) in one massive XML. That approach means a single request/response with potentially megabytes of data, which the service can handle but you should parse carefully. It avoids iterative calls entirely.
	3.	Also retrieve supplemental data in bulk: for example, GetAllDocumentsByClass (from LegislativeDocumentService) could list all bill texts (PDF/HTML) if needed, and GetSponsors for each bill can be done on-demand or via SponsorService for all sponsors in the biennium.

By using these batch endpoints, you avoid the “N+1” problem of calling GetLegislation individually for every bill. For example, calling GetLegislationInfoIntroducedSince for 2023-01-01 to now might return 2,000 records in one response rather than 2,000 separate queries ￼. This dramatically reduces load and latency for initial data population. (If the single-call size is a concern, an alternative is to break it up by using the year-based methods or splitting the date range into chunks, but usually one biennium’s data is fine in one go.)

Important: These bulk methods retrieve the latest known data up to the moment of the call. If doing an initial seed after session end, that’s perfect (you get final statuses). If doing it mid-session, be aware that you’ll need to subsequently catch up on changes (via the status changes feed) because the bulk dump is a snapshot in time. After seeding, switch to incremental sync (per 2.1) for new and updated bills.

3. Deep Dive – Fiscal Note Data Handling

3.1 “Resolution Gap” – Detailed Agency Status vs. LegislationService Flag

The LegislationService includes two simple boolean flags: StateFiscalNote and LocalFiscalNote ￼. These are True if a fiscal note is associated with the bill (state-level or local government impact respectively). However, these flags do not convey partial progress of fiscal note preparation. They are binary: either at least one fiscal note has been completed (flag becomes true) or none has been produced yet (flag false) ￼.

In reality, the fiscal note process involves multiple agencies and steps. Washington’s Office of Financial Management (OFM) coordinates fiscal notes, and various agencies draft their portions. A bill might have, for example, 3 agencies assigned; one agency might finish earlier. The LegislationService StateFiscalNote will remain false until an official fiscal note is published (i.e. all required agencies have submitted and OFM releases the note). Once the note is out, the flag flips to true. But if you want to track the status in between (e.g., “Draft fiscal note in progress” or “Agency X completed, waiting on Agency Y”), you need the FiscalNoteService.

FiscalNoteService provides granular data on fiscal notes. Although not extensively documented on the public site, it is known to expose the status of fiscal note requests for each agency and the content of fiscal notes. For example, it can likely tell you which agencies have submitted their analysis and which are pending. This addresses the “resolution gap”: LegislationService might still show StateFiscalNote = false while behind the scenes two agencies have submitted notes and one is pending. The FiscalNoteService would have entries for those submissions. In other states’ systems, such a service often has operations like GetFiscalNotes(biennium, billNumber) returning a list of fiscal note records: each record might include agency name, status (e.g., Requested, Submitted, Approved by OFM, etc.), and possibly a URL to the note document. We can infer that WSL’s FiscalNoteService similarly returns one entry per agency or per fiscal note version. Thus, yes – the FiscalNoteService provides detailed status updates by agency that are not reflected in the single boolean flag. The StateFiscalNote flag is only a coarse indicator (note exists or not) ￼, whereas the service can answer questions like “Has the Dept. of Revenue completed its portion of the fiscal note?”. In summary, use FiscalNoteService for workflow status, and use LegislationService’s flag only as a quick check if any note has been published.

3.2 Trigger Events – New Versions and Fiscal Note Flags

When a new bill version is introduced (e.g., a substitute or striker amendment that essentially replaces the bill text), what happens to the fiscal note status? The fiscal note process typically restarts for the new version. In practical terms, when a substitute bill is adopted, any prior fiscal note was based on the original text; a new fiscal note will be requested for the substitute. The WSL data model reflects this by scoping the fiscal note flag to each bill version. Each <Legislation> entry in the LegislationService output has its own StateFiscalNote flag ￼. So, if the original bill had a fiscal note completed (StateFiscalNote = true for the original version), and then a 1st Substitute is adopted, the Legislation entry for the substitute version will initially show StateFiscalNote = false (since no note yet exists for the substitute text). The prime sponsor ID carries over (same legislator) but the content changed, so fiscal analysis must be redone. Thus, the introduction of a new version effectively resets the StateFiscalNote to false until a new note is prepared for that version.

Concretely, suppose HB 2000 was introduced and a fiscal note was completed on it (flag became true). If a Substitute HB 2000 is later adopted, when you call GetLegislation you will receive two <Legislation> records: one for “HB 2000” (Original) with StateFiscalNote = true, and one for “SHB 2000” (Substitute) where initially StateFiscalNote = false (until analysts produce a note for the substitute). Your application should treat the substitute as essentially a new bill for fiscal note tracking purposes. The original note does not automatically carry forward. Only once OFM releases a fiscal note for the substitute will that flag flip to true (and at that time, DocumentService will list a new fiscal note document for the substitute version).

One nuance: If a substitute is very similar and no fiscal impacts changed, sometimes legislatures don’t require a new note – but the system will generally still mark the new version as needing one until explicitly provided. Therefore assume fresh fiscal note cycle for each major version. The same logic would apply if a bill is engrossed with amendments from the other chamber: an “Engrossed Substitute” might technically not need a new fiscal note if the amendments don’t change fiscal impact, but usually the fiscal note from one chamber is considered – in any case, the WSL StateFiscalNote flag for the engrossed version would likely remain what it was for the substitute unless a new note is formally requested.

Finally, note that LocalFiscalNote (impacts on local governments) and other flags (like Appropriations) follow a similar pattern: they apply per version. A substitute might remove an appropriation from the bill, in which case the Appropriations flag could turn from true to false in the new version. Always fetch the latest version’s flags rather than assuming they carry over.

4. Document Metadata & URL Mapping

4.1 Document URL Patterns – Construct vs. Query

Each bill in Washington has associated documents (bill text in PDF/HTML, amendments, reports, etc.). The LegislativeDocumentService can provide these, but one can often derive the URLs deterministically to avoid extra API calls. Here’s how the bill text URLs are structured:

Base URL: All bill PDFs and HTML are hosted on the Legislature’s lawfilesext server, organized by biennium and document type. For example:

https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Bills/House Bills/XXXX.pdf

(where “XXXX” is the bill number and version suffix). The pattern components:
	•	Biennium: 2025-26 (always a two-year span format).
	•	Document folder: For bills, it’s Pdf/Bills/{House or Senate} Bills/. House bills are under “House Bills”, Senate under “Senate Bills”. (Other document classes exist like “House Bill Reports”, “Fiscal Notes”, etc., in parallel directories).
	•	File name: The file name is the bill number with any version indicators appended. The original version has just the number (1009.pdf). A Substitute bill appends “-S” (first substitute) or “-S2” (second substitute), etc. ￼ ￼. An Engrossed version (i.e., amended by opposite chamber) appends “.E” just before the .pdf extension. If a substitute was engrossed, you’ll see both: e.g., 1009-S.E.pdf for “Engrossed Substitute 1009” ￼ ￼. If there were a second substitute that got engrossed, it would be 1009-S2.E.pdf (Engrossed Second Substitute). Also, Passed Legislature final versions are often published with a “PL” suffix in a separate directory (e.g., .../House Passed Legislature/1009-S2.PL.pdf for the final passed text ￼). However, for integration purposes, the engrossed version or the last substitute is usually the same content as the Passed Legislature version (except for the header), so many applications use the engrossed PDF.

For example:
	•	Original House Bill 1009 (2023-24) – PDF at:
.../2023-24/Pdf/Bills/House Bills/1009.pdf ￼
	•	Substitute House Bill 1009 – PDF at:
.../2023-24/Pdf/Bills/House Bills/1009-S.pdf ￼ (the “-S” indicates 1st Substitute)
	•	Second Substitute House Bill 1009 – PDF at:
.../2023-24/Pdf/Bills/House Bills/1009-S2.pdf (see directory listing  ￼ which shows 1009-S2.pdf).
	•	Engrossed Substitute HB 1019 – PDF at:
.../2023-24/Pdf/Bills/House Bills/1019-S.E.pdf ￼.
	•	If the bill were ultimately passed and enrolled, one could also find 1019-S.E.PL.pdf under a “Passed Legislature” folder (this is indicated by LegiScan data ￼). But the main Bills directory covers all versions up to engrossed.

HTML versions: The same pattern exists under an Htm/Bills/House Bills/ directory for the HTML text (e.g., 1009-S.htm for HTML version of the substitute). The DocumentService results actually include both PDF and HTM URLs for each document ￼ ￼.

Now, LegislativeDocumentService can be used to retrieve document links without knowing the pattern. For example, you can call GetDocuments(biennium, namedLike="1009") to get all docs whose names start with 1009 ￼, or GetAllDocumentsByClass(biennium, class="Bill") to get every bill text URL ￼. The service will return an array of documents with their metadata and direct URLs to PDF/HTML ￼. While this is convenient and ensures accuracy, it can be an expensive call if you do it for every bill individually (similar to N+1).

Efficiency considerations: If the URL convention is stable (and it has been for many years, covering documents back to 1991 ￼), constructing the URL in your code is faster than an additional API call. For instance, after retrieving a bill’s info from LegislationService, you know the BillId (like “2SHB 1009”) which encodes the needed parts: chamber (House), number (1009), and substitute count (2S). You can programmatically build 1009-S2.pdf and the path for House Bills. This avoids calling DocumentService for that bill’s text. However, be mindful of edge cases:
	•	Initiatives or resolutions might reside in different directories (DocumentService’s GetDocumentClasses can list categories like “Initiative” or “House Joint Memorials” etc.). Ensure your mapping handles those (e.g., “HJR 4200” would likely be under House Joint Resolutions/4200.pdf). Using DocumentService for a quick lookup of classes at startup is helpful to build your rules.
	•	If a bill number has a companion (House/Senate versions of same text) – they are separate documents anyway. That doesn’t affect URL building, just note each bill’s own docs are distinct.
	•	The .PL.pdf files (Passed Legislature) reside in a different folder (House Passed Legislature or Senate Passed Legislature). If you specifically need the “as passed” final print, you might either rely on SessionLawService for the chapter law or fetch the PL PDF. DocumentService can retrieve those by class (class likely “Passed Legislature Bills”). Or you deduce: a House bill that passed legislature will have a file in House Passed Legislature/ with the highest version + .PL.pdf. This is a minor nuance – many applications are satisfied with the engrossed version.

In summary, predicting the URL is quite feasible and saves time. For each bill version (BillId), you can derive the PDF and HTM links without an extra query:
	1.	Determine the chamber folder (“House Bills” if BillId contains HB, “Senate Bills” if SB, likewise “House Joint Memorials” for HJM, etc. – these mappings can be obtained via GetDocumentClasses ￼).
	2.	Start with the base number and append suffixes: -S, -S2, … for substitutes as indicated by BillId (e.g., “2SHB 1009” → two substitutes so far, thus “1009-S2” for current version; “ESB 5001” → Engrossed Senate Bill, no substitute, so likely “5001.E.pdf” in Senate Bills folder).
	3.	Append “.E” if the BillId has an “E” (engrossed).
	4.	Append “.PL” for final passed versions if needed, and adjust folder to “Passed Legislature” (this you might decide to fetch via DocumentService when a bill’s status becomes Passed Legislature, rather than hardcode all that).

Using DocumentService is recommended if you want to be absolutely sure and don’t mind a couple of calls (for example, one call to get all bill PDFs for a bill yields both PDF and HTML links at once). But to maximize performance, you can avoid that: the URL patterns are deterministic and have remained consistent, so your integration can construct them. If any changes occur (which is unlikely mid-biennium), the Legislative Service Center typically announces them, but given that documents back to 1991 are available in the same structure ￼, it’s safe to use this approach.

Example: Bill 2SHB 1009 (2023-24) – you know it’s a House Bill, second substitute. Construct:

biennium = "2023-24"
chamberDir = "House Bills"
file = "1009-S2.pdf"
full URL = "https://lawfilesext.leg.wa.gov/biennium/2023-24/Pdf/Bills/House%20Bills/1009-S2.pdf"

And indeed that URL returns the PDF text of 2SHB 1009 ￼. For HTML, just substitute Pdf with Htm and .pdf with .htm.

4.2 Linking Bills to Affected RCWs

To determine what RCW (Revised Code of WA) sections a bill would enact or amend, the RcwCiteAffectedService is your friend. The join key here is again the bill’s identity. The service offers two modes:
	•	Given an RCW citation, list bills affecting it (GetLegislationAffectingRcwCite).
	•	Given a bill, list RCW cites it affects (GetRcwCitesAffected via LegislationService).

For your use (bill -> RCWs), you’ll use LegislationService.GetRcwCitesAffected. This requires the biennium and BillId as parameters ￼. The BillId (string) is the key because it uniquely identifies the bill version. When you call this, it returns an array of RCW citations referenced in that bill’s text (these could be full chapter and section numbers) – essentially the list of RCW sections that bill proposes to create or amend. The output is a set of strings like “RCW 50.05.060” etc., often wrapped in a data structure. Those are the sections impacted by that bill ￼.

Example: For bill HB 1009, calling GetRcwCitesAffected("2025-26", "HB 1009") would return something like <RcwCite>51.10.010</RcwCite> etc., for each section the original bill text mentions. If you have multiple versions (say SHB 1009), you could call with that BillId to get cites as of that version (substitutes might affect a broader/narrower set of RCWs). Typically, you care about the latest version’s RCW impacts, so using the current BillId is appropriate.

Under the hood, the data is extracted from the bill drafts, so this service is authoritative for “sections of law opened up by this bill.” The source of truth for RCW impact is this service’s result – you should not try to scrape it from the bill text yourself (though you could) because the service already provides it in a structured form. Just ensure you supply the correct BillId string; if you supply a bill number or a malformed ID, you’ll get a fault (invalid arguments) ￼ ￼. So, for join key: BillId (plus biennium) is required to link to RCW cites affected.

One more integration point: if you want to cross-link with an RCW database, you might take the output of GetRcwCitesAffected and join with your RCW table to show the actual RCW section titles or descriptions.

(Note: The RcwCiteAffectedService also allows RCW -> bills, which could be used to show “which bills amend RCW X”, but the primary usage here is bill -> RCWs.)

5. Performance & Constraints

5.1 SOAP Faults & Error Handling

In integrating with WSL SOAP services, you’ll encounter certain predictable error cases (SOAP Faults) that you should handle gracefully. Common scenarios include:
	•	“Invalid Biennium” Fault: If you send a biennium in the wrong format or one that doesn’t exist, the API throws an error. All calls require biennium as “YYYY-YY” (e.g., “2025-26”); if you pass “2025” or an out-of-range year, you’ll get a fault. The message is typically “Exception thrown for invalid biennium” ￼. Double-check your biennium string formatting.
	•	Bill Not Found / No Status: If you request data for a bill that isn’t in the system or isn’t in the appropriate state for that call, you get an exception. For example, calling GetCurrentStatus on a bill number that hasn’t been introduced (e.g., a bill that’s only pre-filed or an invalid number) results in an error “no status found” ￼ ￼. Similarly, GetLegislation on a non-existent bill will throw (likely “no information found”). These come as SOAP Faults with an  explaining the issue. The integration should catch these and handle them (e.g., if no status found, treat the bill as not yet introduced; if no info found, the bill number might be invalid or from a future session).
	•	Prefiled vs Introduced: Prefiled bills (those submitted before session begins) appear via GetPrefiledLegislation, not GetLegislation until formally read in. The API docs note: “Once a bill is formally introduced, its information can be obtained by calling GetLegislation” ￼. If you try GetLegislation on a prefiled bill before first reading, you’ll likely hit the “no status/info found” fault because it isn’t considered introduced yet. The appropriate flow is to use GetPrefiledLegislation (which returns details of bills in prefile status) ￼. That call can be used during December/early January to catch pre-session bills. After session starts and they get first reading, they’ll then appear in GetLegislation. So handle that transition: the moment a prefiled bill is introduced, GetPrefiledLegislation will drop it and GetLegislation will start returning it. A fault from GetLegislation saying none found could mean “still prefiled – check GetPrefiledLegislation”.
	•	Date Range Errors: If you provide an illogical date range (endDate before beginDate, or a range outside the biennium) to something like GetLegislativeStatusChangesByDateRange, an exception is thrown for invalid date range ￼ ￼. Similarly, missing required params will fault.
	•	Other Common Faults: “Invalid agency” appears if you call a chamber-specific method with wrong chamber (e.g., calling GetLegislationGovernorSigned with agency not “House” or “Senate” triggers invalid agency ￼). “No documents found” if you query DocumentService for a document that doesn’t exist (the service explicitly throws if none found ￼ ￼). These messages are straightforward.

SOAP Fault format: Typically, the HTTP status is 500 and the SOAP  contains a faultstring like “System.ApplicationException: [Details]” inside. For example, trying to get sponsors for a bad BillId might return a fault “Invalid billId”. The key is to parse the fault message and decide if it’s a recoverable expected condition (like no status yet) or a true error. In a sync routine, encountering “no status found” can be normal (e.g., if you poll something slightly too early). Retrying later or handling via prefile logic is appropriate.

Prefiled edge-case: There is a period when bills are prefiled (December) – use the provided GetPrefiledLegislation to get those ￼. If you call it after session starts, it will be empty (since those bills have moved into regular “introduced” status or died). Conversely, do not call GetLegislationIntroducedSince during the pre-session period expecting prefiles – they won’t show up there until session.

In summary, handle faults by reading the message:
	•	“…no status found” – treat as “bill not introduced or doesn’t exist”. Possibly check if it’s prefiled.
	•	“…no information found” – similar to above, or invalid input.
	•	“invalid X” – fix the request format (biennium, date, etc.).
	•	These are the common ones while normal operation. Unexpected 500 errors are rare if inputs are correct; the system is stable and usually only returns faults for these expected reasons.

5.2 Rate Limits & Concurrent Request Considerations

The Washington Legislative Web Services are provided for public and agency use 24/7 ￼. There are no officially published hard rate limits (no specific “10 requests per second” rule has been documented as of now). The service is designed to handle real-time legislative tracking loads. Users (like agency systems and third-party trackers) routinely make frequent calls during session. The legislature’s IT (LSC) has historically not enforced strict throttling, but they do monitor for abuse.

Observed behavior: During peak hours (e.g., during floor votes or major deadlines), the response times can slow marginally simply due to high usage. If one were to fire an extremely high volume of requests in parallel, it’s possible the server could start queueing them or in worst cases issue HTTP 503 errors. However, typical usage patterns – polling every minute or doing a burst of a few hundred calls on session start – are generally fine. Many integrators run on a cycle of a few minutes without issue. The system’s availability is intended to be constant ￼, with downtime only for maintenance (which they announce beforehand).

Concurrency: It is wise to use some level of request throttling on your side out of courtesy. For example, instead of opening 50 concurrent threads calling GetLegislation, you might do 5 at a time. This avoids overloading their SOAP endpoint. While we have no evidence of IP bans or explicit rate caps, doing thousands of calls in a very short span might not be looked upon kindly.

Batch calls vs many small calls: Whenever possible use the batch operations (as discussed in Section 2.2) to reduce the total number of requests. Fewer large calls are generally better than many tiny calls, both for your network overhead and their server load. Also consider caching results where appropriate (bill data doesn’t change second-to-second except status; you don’t need to fetch static info repeatedly).

Unofficial guidance: In absence of documented limits, a good practice is to keep sustained usage to maybe a few calls per second at most. If you need to sync hundreds of bills, do it in batches with short delays in between. This will easily stay under any implicit threshold. The SOAP services will typically fail gracefully (with a timeout or HTTP error) if overwhelmed, but it’s up to the client to back off.

Concurrent session spikes: During key moments (e.g., cutoff days), consider staggering your polling a bit off-round (everyone might hit exactly on the hour). Perhaps poll at :02, :07, etc., to distribute load. The Legislative Service Center can monitor traffic and if something is hammering, they might contact you (if they can identify) or generally they’ve built the system to handle reasonable multi-user load.

To conclude, no fixed rate limit is documented, but treat the service as a finite resource. Design your integration to use efficient calls and minimal concurrency necessary for performance. The system being “available 24/7” ￼ implies it’s expected to handle continuous use. Just handle timeouts or slowdowns by implementing retries with backoff. In our experience, moderate use even during session has not triggered throttling – the WSL SOAP API is quite robust for real-time applications.

⸻

Field Mapping Table – Condensed Bill Schema v2 vs Source of Truth

Below is a mapping of key fields in a hypothetical “Condensed Bill Schema v2” to their authoritative sources in the WSL APIs. This assumes fields like you’d have in a bill tracking database (bill number, title, status, etc.).

Field (Condensed Schema)	WSL Source & Field	Notes
Biennium	Input to all calls – stored as context	Biennium (e.g., “2025-26”) is required for most calls; treat as part of composite key.
BillNumber	LegislationService – LegislationInfo.BillNumber or request param ￼ ￼	Integer bill number. Provided in LegislationInfo summaries and as input to detail calls. Unique within chamber per biennium.
BillId (e.g. “2SHB 1009”)	LegislationService – LegislationInfo.BillId / Legislation.CurrentStatus.BillId ￼ ￼	String combining version and bill. Use this as unique ID for versions. Required by some calls (Sponsors, RCW, etc.).
Short Title (summary)	LegislationService – ShortDescription field ￼	A brief description (usually the official bill “catch line”). Provided for each version.
Official Title (legal title)	LegislationService – LegalTitle field ￼	The full legal title (“AN ACT Relating to …”). This often changes if amendments change the scope. Source of truth for that phrasing.
Long Description (digest)	LegislationService – LongDescription ￼	A longer summary or intent statement. (Not always populated for all bills, sometimes similar to ShortDescription.)
Bill Type (e.g., HB/SB)	LegislationService – LegislationInfo.ShortLegislationType ￼	The type code (“HB”, “SB”, “HJR”, etc.). Also embedded in BillId. Use to determine chamber and document paths.
Original Agency (Originating chamber)	LegislationService – LegislationInfo.OriginalAgency ￼	“House” or “Senate”. Confirms house of origin, useful for logic.
Companion Bill	LegislationService – Companions list ￼ ￼	If present, contains companion BillId(s) (e.g., Senate companion for a House bill). Use to link cross-chamber equivalents.
Prime Sponsor (Name)	LegislationService – Sponsor (string) ￼ and SponsorService for details	Use LegislationService’s Sponsor for display. Note: may show committee name for substitutes ￼. For consistent person name, cross-reference PrimeSponsorID with SponsorService.
Prime Sponsor ID	LegislationService – PrimeSponsorID (int) ￼	Unique ID for the legislator. Remains constant across versions; use as key to join Sponsor info (e.g., party, district if needed via SponsorService).
Co-Sponsors (list)	LegislationService – GetSponsors method ￼	Returns array of sponsors (each with ID, Name, Type=Primary/Co, etc.) ￼. Use this to get all sponsors beyond the prime.
Current Status (stage)	LegislationService – CurrentStatus.Status ￼	Text describing latest stage (e.g., “Referred to Appropriations”). Updated in real-time. This is the primary status indicator to display.
Current Status Date	LegislationService – CurrentStatus.ActionDate ￼	Date/time of the current status action. (E.g., the committee referral date).
Status History	LegislationService – GetLegislativeStatusChangesByBillId or GetStatusChangesByBillNumber	Use these to build a timeline of actions. Each LegislativeStatus entry (HistoryLine + ActionDate) is a past action ￼. Alternatively, the HistoryLine in CurrentStatus often concatenates some info, but the service is better for full history.
In Committee (flag/current committee)	LegislationService – infer from CurrentStatus.Status text or use Hearings/History	There isn’t a direct field “current committee,” but if Status contains “referred to X Committee”, you can parse it. For precision, use GetHearings to see which committees have had hearings ￼, or parse latest HistoryLine for referral.
Hearings (schedule)	LegislationService – GetHearings ￼	Returns list of committee hearing records (date, committee name, etc.) for the bill. Source for hearing dates and outcomes.
Roll Calls (votes)	LegislationService – GetRollCalls ￼	Provides vote records for floor actions. Each includes chamber, date, yeas/nays, etc. Use this for vote counts and tallies on passage.
Amendments Exist (flag)	LegislationService – CurrentStatus.AmendmentsExist (bool) ￼	Indicates if any amendment documents exist for this bill (in current status). True means you can fetch amendments via AmendmentService.
Amendments Detail	AmendmentService – GetAmendmentsForBiennium/Year	Returns list of amendments with info (sponsor, adopted or not, links to text) ￼ ￼. Use when AmendmentsExist=true to get all amendments.
Fiscal Note Impact (State)	LegislationService – StateFiscalNote (bool) ￼	True if one or more state fiscal notes have been published ￼. Use FiscalNoteService for details.
Fiscal Note Impact (Local)	LegislationService – LocalFiscalNote (bool) ￼	True if a local govt fiscal note (local impact) is required/published. (Less common, similar logic to above.)
Requires Appropriation	LegislationService – Appropriations (bool) ￼	True if the bill contains an appropriation (as flagged by legislative staff). This tends to stay the same or be updated if amendments remove/add appropriations.
Governor Request	LegislationService – RequestedByGovernor (bool) ￼	True if the bill was requested by the Governor ￼. (Mutually exclusive with other requestors typically.)
Budget Committee Request	LegislationService – RequestedByBudgetCommittee (bool) ￼	True if it’s a budget committee request bill.
Agency Request	LegislationService – RequestedByDepartment (bool) ￼	True if some state agency requested the bill.
Other Request	LegislationService – RequestedByOther (bool) ￼	True if bill was requested by “other” entity (e.g., a task force or court, etc.). These four requestor fields are mutually exclusive in many cases and usually one will be true at most.
Companion Bill (if any)	LegislationService – Companions.Companion entries ￼	If a bill has a companion, the companion’s BillId appears here (often House bill lists its Senate companion and vice versa). Use this to link the two records in your DB.
Passed House? (flag/date)	LegislationService – no direct flag; use GetLegislationPassedHouse or status text	To know if passed House, either check if the bill appears in GetLegislationPassedHouse(biennium) ￼ (summary list of all that passed house), or monitor status text for “Passed House”. LegislationService also provides GetLegislationPassedHouseWithinTimeFrame ￼ for date-bounded checks.
Passed Senate?	Similar to above: GetLegislationPassedSenate ￼ or status containing “Passed Senate”.	
Passed Legislature?	LegislationService – GetLegislationPassedLegislature ￼ and CurrentStatus.Status	The appearance of the bill in GetLegislationPassedLegislature confirms it passed both chambers ￼. Also CurrentStatus.Status will likely say “Passed Legislature”.
Governor Action (signed/vetoed)	LegislationService – CurrentStatus.PartialVeto & Veto (bools), Status text; and SessionLawService	LegislationService sets PartialVeto or Veto booleans in CurrentStatus if those occurred ￼ ￼. The Status text will also note vetoes. For full detail, SessionLawService’s result includes PartialVeto and Veto flags too ￼.
Chapter Number (Session Law)	SessionLawService – GetSessionLawByBill.ChapterNumber ￼	The official chapter in Session Laws once law. This is final – use SessionLawService as source of truth. LegislationService’s GetSessionLawChapter (if used) ultimately pulls the same info ￼.
Session Law Effective Date	SessionLawService – EffectiveDate ￼	The effective date of the act (or earliest if multiple) as per the session law. Also if MultipleEffectiveDates=true, means sections have varying dates.
Bill Text URLs (PDF/HTML)	LegislativeDocumentService – or Construct via pattern (see 4.1)	For each bill version, the DocumentService returns PdfUrl and HtmUrl ￼ ￼. Source of truth for document links. Alternatively, construct URLs as described in section 4.1.
Analysis Documents (staff reports)	LegislativeDocumentService – by class (“Bill Reports”)	You can retrieve House Bill Reports, Senate Bill Reports, etc., by using DocumentService with the appropriate class or namedLike. These documents (analyses, summaries) are linked by bill number as well. DocumentService is the source of truth for finding all such related docs.
Fiscal Note Documents	LegislativeDocumentService – class “Fiscal Notes” or via FiscalNoteService	After a fiscal note is completed, DocumentService will list a PDF for it under Fiscal Notes (with a naming convention like “HB1009 FN.pdf” or similar). Alternatively, FiscalNoteService might provide direct links. Use DocumentService to fetch URLs of published notes.
RCW Sections Affected	LegislationService – GetRcwCitesAffected ￼	Source of truth for the list of RCW citations. This can be stored as an array of strings in your DB field. Update if the bill is amended to add/remove RCW sections (so re-fetch for substitutes).

(The above table assumes “Condensed Schema v2” has fields akin to those listed. If the actual schema differs, one can map similarly using the same sources. Each field’s definitive source is the WSL service indicated.)

Sequence Diagram – Order of API Calls for Full Bill Lifecycle

Scenario: A bill is introduced, goes through substitutions, passes, and becomes law. Below is a step-by-step integration sequence of API interactions from introduction to session law. (Each step indicates what your system does in brackets and the WSL API calls involved.)
	1.	New Bill Introduction:
	•	[System] Detect new bill – Periodically call LegislationService.GetLegislationInfoIntroducedSince(lastCheckDate) to get recently introduced bills (or use the status change feed to catch “First Reading” events) ￼ ￼.
	•	[System] Pull bill details – For each new BillNumber found, call LegislationService.GetLegislation(biennium, billNumber) to get the full bill information (initial version) ￼. Parse the response: store bill metadata (titles, sponsor, flags, etc.) and the initial CurrentStatus (should be “First reading” or similar) ￼.
	•	[System] Get sponsors – Call LegislationService.GetSponsors(biennium, billId) to retrieve the list of sponsors (prime and co-sponsors) ￼. Save these relations in the database (link co-sponsors to the bill record).
	•	[System] Get companion (if any) – Check the Companions in the GetLegislation result ￼. If a companion BillId exists, link those two bill records in your system (and consider fetching the companion’s info if not already in DB).
	•	[System] Get documents – Construct or fetch the initial bill text URL. For example, build the PDF link for “HB 1009.pdf” and store it. Optionally, verify by calling DocumentService.GetDocuments(biennium, namedLike="1009") to get all doc URLs for that bill ￼. (This can also yield bill reports or fiscal notes if any, though at introduction there won’t be those yet.)
	•	[System] Log initial status – The bill is now in DB as introduced. Set up to track further changes.
	2.	Committee Referral and Hearings: (Bill is moving to committee stage)
	•	[System] Poll status changes – e.g., every 5 minutes call GetLegislativeStatusChangesByDateRange for recent minutes ￼. When Bill 1009 appears with a new status “Referred to Appropriations”, your system catches that entry.
	•	[System] Update status – Using the BillId from the status change, find Bill 1009 in your DB. Update its current status text to “Referred to Appropriations” and status date. (You might directly use the HistoryLine or Status from the LegislativeStatus entry ￼ without further API calls since it gives the necessary text and date.)
	•	[System] (Optional) Pull latest detail – If you prefer, you could call GetLegislation(biennium, 1009) again at this point to refresh the entire record. This would reflect the new CurrentStatus internally as well. For a referral, this isn’t strictly needed (the status change feed had enough info).
	•	[System] Get hearings (if scheduled) – You might call GetHearings(biennium, 1009) occasionally or when status indicates referral ￼. If it returns hearing dates, store them (so you can display hearing schedule for the bill). Continue to monitor GetHearings periodically until the committee stage is done (hearings can be added or changed).
	3.	Substitute Bill Reported: (Committee issues a substitute bill, e.g., 1st Substitute)
	•	[System] Detect substitute via status – The status changes feed will show an event like “Executive action taken in committee; 1st substitute bill proposed” or simply the status might jump to “Referred to Rules with substitute bill”. Alternatively, a new bill introduction event might occur for 1SHB 1009 if they treat it as a new entry. Most likely, you’ll see a status line for HB 1009 indicating the substitute.
	•	[System] Fetch substitute details – Call GetLegislation(biennium, 1009) again ￼. The response now contains two <Legislation> entries: one for Original HB 1009 and one for Substitute HB 1009. Parse the second one (look at BillId in CurrentStatus to identify which is which – it will say “SHB 1009” in BillId field) ￼ ￼. Store the substitute version in your DB, likely as part of the same bill record (you might keep a list of versions). Update fields that changed: e.g., Sponsor string might now be “APP (Doe)” per the committee sponsor; confirm PrimeSponsorID remains same (it will) ￼. Note IntroducedDate of the substitute (this is the date it was reported out) ￼ if you track version dates.
	•	[System] Update status – The current status of the bill may now effectively be that it has a substitute adopted, awaiting floor action. The CurrentStatus for the substitute will show something like “Reported out of Appropriations” with date ￼. Use that as the new current status for the bill overall.
	•	[System] Document retrieval for substitute – Get the text of the substitute bill. Construct the URL 1009-S.pdf (House Bills folder) and save it ￼. Optionally verify via DocumentService (it should now list 1009-S.pdf). Also note any new bill report: a House Bill Report for SHB 1009 will be available (DocumentService class “House Bill Reports”). You could fetch that too and link it.
	•	[System] Fiscal note reset – Recognize that StateFiscalNote might have gone from true to false in this new version. If your UI shows a fiscal note indicator, reset it until a new note arrives. Possibly trigger a background process to monitor FiscalNoteService for a new note request on SHB 1009.
	4.	Floor Action – House Passes the Bill:
	•	[System] Detect passage event – Status feed will show “Third reading, passed; yeas…, nays…” on the House side. This is a critical update.
	•	[System] Update status – Mark the bill’s status as “Passed House” with the date (the ActionDate of that status entry). Also, log the vote totals if desired. You can get votes via GetRollCalls(biennium, 1009) which would list the roll call for the 3rd reading ￼. Store vote counts in your DB (often part of bill history).
	•	[System] Version note – At this point, the bill version that passed is SHB 1009 (the first substitute). It goes to the Senate. No new BillId is created for that – it stays “SHB 1009” until/unless the Senate amends it. So the current active version remains SHB for now.
	•	[System] Documents – After passage, the House Engrossed version might be generated if any floor amendments were adopted. If House floor amendments were adopted into the bill, the passed version is technically “Engrossed Substitute HB 1009” (E SHB 1009). The status or history will note if it was engrossed. If so, DocumentService will show a new file 1009-S.E.pdf (Engrossed substitute) ￼. Fetch that and save it as the latest text. If no amendments on floor, the engrossed = substitute, so you already have it.
	5.	Senate Consideration:
	•	[System] Status monitoring – Now the bill is in the Senate. The status feed will begin showing Senate-side actions (e.g., “First reading in Senate, referred to Senate Committee X”). These come through the same GetLegislativeStatusChangesByDateRange feed (the BillId remains “SHB 1009”; the feed entry might have HistoryLine like “First reading, referred to … (Senate)” – the HistoryLine often includes chamber context). Update your status accordingly (“In Senate – referred to …”).
	•	[System] Senate committee and floor – This repeats the cycle: track committee referral, possible Senate substitute (if Senate committee issues a striker, it would become perhaps “Senate Committee Substitute” but since the bill number is a House Bill, they don’t typically rename it differently – they might just amend it heavily. More formally, if the Senate wanted a new draft, they’d usually strike and amend, but it’s still called ESHB 1009 rather than giving it a new bill ID). The API might show additional substitutes with an “S” in BillId if it treats a striker as 2nd Substitute. Unlikely across chambers – more often, they’ll amend via individual amendments, not call it “2nd Substitute”. So you likely won’t see “2SHB 1009” unless House itself had two substitutes. Instead, you’ll see AmendmentsExist=true and lots of amendments. Use AmendmentService.GetAmendmentsForBiennium with bill number to get the list of Senate amendments ￼. As amendments are adopted, they’ll be reflected in status (“Amended in Senate”).
	•	[System] Pass Senate – Eventually status shows “Passed Senate”. Update your record (perhaps a field “passedSenateDate”). Retrieve Senate roll call via GetRollCalls if needed for vote counts. Now the bill likely has been amended (if so, it becomes Engrossed Second Substitute HB 1009 or just Engrossed Substitute HB 1009 depending on number of substitutes). The LegislationService AmendedByOppositeBody flag in CurrentStatus would be true ￼. The presence of that flag indicates the opposite chamber changed the bill. At this point, the active version BillId might update to include E. For example, LegislationService might now list a new <Legislation> entry with BillId “ESHB 1009” (Engrossed Substitute) or if it was second substitute with amendments, “E2SHB 1009”. To get this, call GetLegislation again after Senate passage. You will likely see the BillId with an “E” and possibly incremented SubstituteVersion or EngrossedVersion fields. DocumentService will now have an 1009-S.E.pdf or 1009-S2.E.pdf file which is the bill as amended by Senate ￼. Fetch that for completeness.
	6.	Concurrence/Reconciliation:
	•	[System] House concurs or conference – The status feed will show if the House had to vote on Senate amendments (“House concurred in Senate amendments” or if not, maybe conference committee, etc.). Update statuses accordingly (e.g., “House concurred, bill passed final”). Essentially, the final legislative action will be “Passed Legislature” when both chambers agree on a single text. LegislationService’s GetLegislationPassedLegislature can confirm the bill is in that list ￼, but the status text is sufficient. Mark the bill as passed legislature on that date.
	7.	Governor’s Desk:
	•	[System] Governor actions – Monitor CurrentStatus.Status for entries like “Delivered to Governor”, “Governor signed”, “Governor vetoed” etc. These will come through the status change feed as well. LegislationService’s PartialVeto or Veto booleans will switch to true if those happened ￼. Update your DB accordingly (e.g., mark bill as vetoed, or partially vetoed). If partial veto, you might later update the Session Law info to note which sections vetoed (though that detail might be in a veto message, not in the API).
	•	[System] Final Signature – When CurrentStatus.Status becomes “Governor signed” (or the bill otherwise becomes law, e.g., unsigned within a certain period), you proceed to next step.
	8.	Session Law Publication:
	•	[System] Get Session Law Chapter – After noticing the bill was signed (or after the Governor’s action date), call SessionLawService.GetSessionLawByBill(biennium, billNumber) ￼. If the chapter is not yet assigned, this call may throw an exception (“no session law found” if called too early ￼). If so, retry in a bit (could be later that day or next). Once successful, you get data including ChapterNumber, Year, EffectiveDate, and the finalized title of the bill as an act ￼ ￼. Store the Chapter Number (this is the permanent reference, e.g., Chapter 202, Laws of 2026). Also note the effective date (and if MultipleEffectiveDates=true, perhaps flag that for manual review of which sections have different dates, as the service won’t list all of them, just the boolean). The BillId returned here will match the final version (e.g., “E2SHB 1009”) ￼, confirming which version became law.
	•	[System] Close-out – Update your bill record: mark its final status as “Chapter X Law” or “Enacted”, attach the chapter number and effective date. At this point, the bill’s lifecycle is complete in the legislature.
	9.	Post-Session (Maintenance):
	•	[System] Optionally, you might call LegislationService.GetSessionLawChapter(biennium, billId) for all passed bills to double-check you have all chapter numbers ￼. This is redundant if you did step 8, but GetSessionLawChapter can return chapter info in LegislationService (which may rely on SessionLawService internally).
	•	[System] Retrieve any Session Law documents if needed (the actual slip law text). Washington may publish session laws as a compiled PDF later; typically, you’d just use the last passed bill text as the law text until codified.

Throughout this sequence, the order of calls is driven by bill events. The system primarily listens for triggers (new bill, status change, passage, etc.) from lightweight calls (IntroducedSince, StatusChangesByDateRange) and then reacts with detailed calls (GetLegislation, GetSessionLaw, etc.). This ensures you’re only pulling heavy data when needed, achieving a high-performance sync.

Below is a pseudo-code outline of the daily synchronization routine that implements much of the above logic in a loop.

Daily Sync Logic Pseudo-code

initialize lastRunTime = now - 24h (or last stored checkpoint)

function dailySync() {
    // 1. Fetch new introductions since last run
    newBills = LegislationService.GetLegislationInfoIntroducedSince(lastRunTime)
    for each billInfo in newBills:
        if !db.contains(billInfo.BillId):
            // New bill introduced
            fullData = LegislationService.GetLegislation(billInfo.Biennium, billInfo.BillNumber)
            saveBill(fullData)  // parse Legislation object(s) and insert into DB
            sponsors = LegislationService.GetSponsors(billInfo.Biennium, billInfo.BillId)
            saveSponsors(billInfo.BillId, sponsors)
            // (Also retrieve and store initial documents like bill text PDF)

    // 2. Fetch all status changes since last run
    changes = LegislationService.GetLegislativeStatusChangesByDateRange(biennium, lastRunTime, now)
    for each statusChange in changes:   // each is LegislativeStatus with BillId, Status, ActionDate, etc.
        billId = statusChange.BillId
        statusText = statusChange.Status
        actionDate = statusChange.ActionDate
        // Find corresponding bill in database
        bill = db.findByBillId(billId) or db.findByBillId(baseBillIdWithoutVersion)
        if bill is not found:
            continue  // possibly a historical or irrelevant entry
        // Update bill's current status and status date
        bill.currentStatus = statusText
        bill.statusDate = actionDate
        // If the change indicates a new version was created or adopted:
        if statusChange.HistoryLine contains "substitute" OR statusText contains "Substitute":
            // A new substitute version is available
            updatedData = LegislationService.GetLegislation(biennium, bill.baseBillNumber)
            updateBillVersions(bill, updatedData) 
            // (This will add the new Legislation entry/version to our record and update sponsor string etc.)
            // Also get new document (PDF) for the substitute version
            fetchAndStoreBillPDF(billId) 
        if statusText contains "Passed House":
            bill.passedHouseDate = actionDate
            votes = LegislationService.GetRollCalls(biennium, bill.baseBillNumber)
            storeVoteResults(billId, votes, chamber="House")
        if statusText contains "Passed Senate":
            bill.passedSenateDate = actionDate
            votes = LegislationService.GetRollCalls(biennium, bill.baseBillNumber)
            storeVoteResults(billId, votes, chamber="Senate")
        if statusText contains "Delivered to Governor":
            bill.deliveredToGovDate = actionDate
        if statusText contains "Governor signed" OR statusText contains "Governor approved":
            bill.signedDate = actionDate
        if statusText contains "vetoed":
            if statusText contains "partial":
                bill.partialVeto = true
            else:
                bill.vetoed = true
            bill.vetoDate = actionDate

        // Save the status update to history log
        db.insertStatusHistory(billId, statusText, actionDate)

    // 3. Post-process bills that passed legislature
    passedBills = db.query(where currentStatus = "Passed Legislature" AND sessionLawChapter is null)
    for each bill in passedBills:
        try:
            lawInfo = SessionLawService.GetSessionLawByBill(bill.biennium, bill.baseBillNumber)
            bill.chapterNumber = lawInfo.ChapterNumber
            bill.sessionLawYear = lawInfo.Year
            bill.effectiveDate = lawInfo.EffectiveDate
            bill.multipleEffectiveDates = lawInfo.MultipleEffectiveDates
            // Mark sessionLawChapter fetched to avoid repeating
        except Exception as e:
            if e.message contains "no session law found":
                // Chapter not yet assigned, skip this time (will try next sync)
                continue
            else:
                log("Unexpected error from SessionLawService: "+e.message)

    // 4. Update lastRunTime for next cycle
    lastRunTime = now
}

Explanation: The pseudo-code above runs in a daily (could be hourly) cycle. It first grabs any newly introduced bills and adds them. Then it processes all status changes since the last run, updating each bill accordingly – including creating new versions when substitutes appear, updating passage information, etc. After updating statuses, it checks any bills that have Passed Legislature but don’t yet have a session law chapter recorded, and attempts to fetch that via SessionLawService (this might succeed a day or two after session end or Governor action). Any errors like “no session law found” are treated as a sign to try again later. The cycle then updates the lastRunTime and would repeat on the next invocation.

Additional considerations: In an actual implementation, you might break the sync into smaller intervals (hourly during session, daily during interim). Also, incorporate GetPrefiledLegislation in December to catch prefiles. And use concurrency carefully – e.g., fetching details for multiple new bills in parallel if many come at once. But the above logic ensures that the data flows from the authoritative sources into your condensed schema in near real-time, while minimizing unnecessary calls.