Washington State Legislature Web Services API Overview

The Washington State Legislature provides an official SOAP-based Web Services API for accessing real-time legislative data ￼. This API exposes various endpoints (SOAP web services) that allow developers to query information about bills, actions in the legislative process, voting records, committees, schedules, session laws, and legislators. The API is free to use and does not require authentication. It is organized by legislative session (bienniums) and returns data in XML format via SOAP responses. Below is a comprehensive catalog of the available API services and methods, along with request/response structures, examples of usage, and important considerations for developers.

Available API Endpoints and Data Catalog

The Legislature’s SOAP API is divided into multiple web service endpoints (each with its own WSDL and set of operations) corresponding to different data categories. The key services include:
	•	LegislationService – Bill information and legislative actions (status history, bill text references, etc.) ￼
	•	CommitteeService – Legislative committee information (committees and their members) ￼
	•	CommitteeActionService – Actions on bills at the committee stage (referrals, reports, etc.) ￼
	•	CommitteeMeetingService – Committee schedules and meeting agendas ￼
	•	LegislativeDocumentService – Legislative documents (bill texts, reports, amendments in PDF/HTML form) ￼
	•	AmendmentService – Amendments submitted (generally for all bills in a given year) ￼
	•	SessionLawService – Session law data (chapter numbers for passed bills, linking passed bills to codified law) ￼
	•	SponsorService – Sponsor and legislator information (rosters of House/Senate members by session, with contact details) ￼ ￼

Each service contains one or more operations (methods) accessible via SOAP. Below, we detail each category of data, the relevant service operations, request/response formats, and how they interrelate.

Legislation (Bill Data and Legislative Actions)

LegislationService is the primary endpoint for bill data. It provides operations to retrieve bill details, status, and to query bills by various criteria. For example, the GetLegislation method returns detailed information for a specific bill (given a biennium and bill number) ￼. A sample SOAP request for GetLegislation might look like:

<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetLegislation xmlns="http://WSLWebServices.leg.wa.gov/">
      <biennium>2023-24</biennium>
      <billNumber>1234</billNumber>
    </GetLegislation>
  </soap:Body>
</soap:Envelope>

The SOAP response returns a <Legislation> XML element with key fields describing the bill ￼ ￼. For example, the response includes flags like whether a fiscal note is required, the ShortDescription (summary), LongDescription (full title), the IntroducedDate, and the current status of the bill ￼ ￼. An abbreviated example of the response structure is:

<GetLegislationResponse xmlns="http://WSLWebServices.leg.wa.gov/">
  <GetLegislationResult>
    <Legislation>
      <ShortDescription>Making appropriations for higher education.</ShortDescription>
      <IntroducedDate>2024-01-10T10:00:00</IntroducedDate>
      <CurrentStatus>
        <ActionDate>2024-02-05T14:30:00</ActionDate>
        <Status>Referred to Senate Committee on Ways & Means</Status>
        <BillId>12345</BillId>
        <HistoryLine>Referred to Ways & Means on 2/5/2024</HistoryLine>
      </CurrentStatus>
      <Sponsor>Rep. Jane Doe</Sponsor>
      <PrimeSponsorID>42</PrimeSponsorID>
      <!-- ... other fields ... -->
    </Legislation>
  </GetLegislationResult>
</GetLegislationResponse>

In this example, CurrentStatus provides the latest action (with a status description, action date, and a shorthand history line) ￼. The Sponsor name and an internal PrimeSponsorID are included for the primary sponsor ￼. Many fields are present (such as flags for fiscal notes or whether the bill was requested by the Governor or another entity), offering a comprehensive view of the bill.

LegislationService also supports bill history and status tracking. The GetLegislativeStatusChanges family of methods can retrieve a timeline of actions (status changes) on bills. For example, GetLegislativeStatusChangesByBillNumber returns all status changes for a given bill over a date range ￼, while other overloads allow querying by bill ID or by an entire date range (to get all legislation status changes in the legislature within a timeframe) ￼. Using these, a developer can pull the full history of actions (first reading, committee referrals, amendments adopted, etc.) for a bill or detect what actions occurred on a given day.

Other query operations in LegislationService provide ways to list bills by status or timeframe. For instance, there are methods to get all bills introduced since a certain date, all bills that passed a certain chamber, or all bills signed by the governor, etc. For example:
	•	GetLegislationInfoIntroducedSince returns a summary list of all bills introduced after a specified date ￼ (useful for finding newly introduced bills).
	•	GetLegislationPassedHouse or GetLegislationPassedSenate list all bills that have passed the House or Senate in a biennium ￼ ￼.
	•	GetLegislationPassedLegislature lists all bills passed by the full Legislature (i.e. fully enacted) for a biennium ￼.
	•	There are also methods filtering vetoed bills (GetLegislationGovernorVeto, GetLegislationGovernorPartialVeto, etc.) and enacted bills (GetLegislationGovernorSigned) by chamber ￼.

Many of these “list” operations return summary legislation info for each bill (often omitting detailed history to keep the payload smaller). The API distinguishes some calls as returning summary vs detailed data. For example, GetLegislationInfoIntroducedSince provides summary info, whereas GetLegislationIntroducedSince provides detailed info on the same set ￼. Typically, “Info” methods omit long text fields or extensive history to improve performance, whereas the non-“Info” versions include full details.

Amendments: Information about bill amendments is available through both LegislationService and a dedicated AmendmentService. In LegislationService, GetAmendmentsForBiennium (and a similar GetAmendmentsForYear) returns all amendments associated with a particular bill ￼. For example, calling GetAmendmentsForBiennium with a bill returns an array of <Amendment> entries including fields such as amendment name/number, the sponsor of the amendment, a description, and the outcome ￼ ￼. Each amendment record also provides DocumentExists and URLs for HTML/PDF versions of the amendment text ￼ ￼. This allows developers to retrieve the actual amendment document if needed. The separate AmendmentService has a simpler role: its GetAmendments method lists all amendments submitted to the rostrum in a given year ￼ (essentially a year-wide amendment index), which is less frequently used for per-bill queries but could be used to scan all amendments in a session.

Statutes Affected: To support legal research, the API can show which statutes (Revised Code of Washington sections) a bill would affect. Via LegislationService’s GetRcwCitesAffected, one can retrieve all RCW citations referenced in a given bill ￼. This returns a list of RCW sections that the legislation proposes to create or amend. (Note: The API does not directly provide a reverse lookup by statute, but a developer could gather bills affecting a particular RCW by scanning all bills or using this call on known bills.)

Session Law (Chapter Law): Once a bill is enacted, it receives a session law chapter number. LegislationService provides GetSessionLawChapter to retrieve the session law chapter info (chapter number and year) for a given bill ￼. Additionally, the SessionLawService offers more extensive queries on session laws. For example, GetSessionLawByBill or ...ByBillId will return the session law details for a given bill (including chapter number, year, and citation) ￼, and GetBillByChapterNumber does the inverse – given a year and chapter number, it identifies the bill associated with that session law ￼. SessionLawService also lists all chaptered laws for a year via GetChapterNumbersByYear ￼. These endpoints help link the bill data to the final published session laws.

Vote Records (Roll Calls)

Vote data (roll call records for floor votes) are accessible through LegislationService. The method GetRollCalls returns all roll call votes for a given bill ￼ ￼. Each roll call entry includes details about the vote event: which chamber (Agency = House or Senate), the motion text (e.g. “Final Passage”), the sequence or roll call number, the date/time of the vote, and the breakdown of votes ￼ ￼. The response structure for a roll call includes sub-elements for Yeas, Nays, Absent, and Excused votes, each with a count and a list of the members’ names in that category ￼ ￼. For example:

<RollCall>
  <Agency>House</Agency>
  <Motion>Final Passage as Amended</Motion>
  <VoteDate>2024-02-10T11:15:00</VoteDate>
  <YeaVotes>
    <Count>98</Count>
    <MembersVoting>DOE; SMITH; ... (names of yea voters)</MembersVoting>
  </YeaVotes>
  <NayVotes>
    <Count>0</Count>
    <MembersVoting />
  </NayVotes>
  <AbsentVotes>
    <Count>0</Count>
    <MembersVoting />
  </AbsentVotes>
  <ExcusedVotes>
    <Count>0</Count>
    <MembersVoting>JONES</MembersVoting>
  </ExcusedVotes>
</RollCall>

In the above hypothetical snippet, the House had 98 Yeas, 0 Nays, 0 Absent, and 0 Excused (with one member excused, JONES). The MembersVoting field is a string listing legislators’ last names (or last name plus initials) who voted in each category ￼. The SOAP response may also include a <Votes> list with individual <Vote> records (the sample shows placeholders) ￼, which in practice can enumerate each member’s vote with more structure (depending on the SOAP client’s handling of the data contract). This allows developers to parse vote results either by using the aggregated names string or by iterating through structured vote records if provided.

With this data, a developer can display roll call results, compute vote totals (which are also provided), and even cross-reference legislator details for each voter. For instance, if one wanted to show party affiliation next to each name, they could take the names from MembersVoting and look up those members in the SponsorService (described below) to get party info.

Committee Data (Standing Committees)

The CommitteeService provides information on legislative committees. Committees in Washington are typically standing committees in each chamber (House or Senate). Key operations include:
	•	GetActiveCommittees – lists all currently active committees (both House and Senate) ￼. There are also specific versions: GetActiveHouseCommittees and GetActiveSenateCommittees for each chamber ￼ ￼. These calls do not require specifying a biennium; they return committees that are active in the current session.
	•	GetCommittees – lists all committees (House and Senate) for a specified biennium ￼ (useful for historical committees or if you need committee names from a past session). Similarly GetHouseCommittees and GetSenateCommittees limit the query to one chamber ￼. These calls require a biennium parameter (e.g., “2021-22”).
	•	GetCommitteeMembers – given a biennium, chamber (“House” or “Senate”), and a committee name, it returns the roster of members (and their roles) for that committee during that biennium ￼ ￼. If you want the current membership of an active committee, there is also GetActiveCommitteeMembers which does the same for the current session without needing a biennium ￼.

These methods allow assembly of detailed committee rosters. For example, calling GetCommitteeMembers for the House Appropriations Committee in biennium “2023-24” would return a list of <Member> entries, each likely including the legislator’s name and possibly their role on the committee (e.g., Chair, Vice Chair, Ranking Member). (The API documentation for CommitteeService’s output suggests it will include the Name and possibly an ID or role, though the exact XML structure for committee membership is not shown above. Typically, it might have fields like Member Name and maybe Legislator ID or position on committee.)

Using CommitteeService, developers can map committee names to their members, which is helpful for understanding which legislators are involved in particular policy areas. For instance, if a bill’s status says it was referred to the “Senate Health & Long Term Care” committee, one can call GetCommitteeMembers for that committee to list all senators on it, providing context on who might hold a hearing for the bill.

Committee Actions and Referrals

The CommitteeActionService focuses on legislative actions at the committee level. It provides various queries to find bills based on their committee status. Examples of operations include:
	•	GetCommitteeReferralsByCommittee – list all bills referred to a specific committee (in a given biennium) ￼ ￼. For example, you can retrieve all bills currently in the House Education Committee for the 2023-24 biennium. This requires specifying the chamber and the exact committee name, as returned by CommitteeService.
	•	GetCommitteeReferralsByBill – get the committee referral history for a specific bill ￼ (e.g., which committees the bill has been referred to, if multiple).
	•	GetDoPassByCommittee, GetDoPassWithAmendmentsByCommittee, GetWithoutRecommendationByCommittee, etc. – these return lists of bills that have received particular outcomes in a given committee ￼ ￼. For instance, GetDoPassByCommittee gives all bills that a committee reported out with a “Do Pass” recommendation ￼. Similarly, there are methods for “Do Pass Substitute”, “Do Pass with Amendments”, “Without recommendation”, “Majority report”, “Minority report”, etc., keyed by committee ￼ ￼ ￼. These correspond to the various report statuses a committee can issue.
	•	GetLegislationReportedOutOfCommittee – returns all bills that were reported out of a given committee between two dates ￼ (useful for tracking committee output over time).
	•	GetLegislationScheduledHearingsByCommittee – returns bills that have had a hearing scheduled in the committee ￼. This can be used to see upcoming (or past) hearing items by committee.

In essence, CommitteeActionService lets you filter or find bills based on where they are in the committee process and what actions committees have taken. For example, a watchdog application might use GetCommitteeReferralsByCommittee regularly to see what new bills have been assigned to a committee, or use GetLegislationScheduledHearingsByCommittee to list measures on an upcoming hearing agenda (which can complement the CommitteeMeeting schedule data below).

All these methods expect the biennium and committee identifiers, and return summary bill information (similar to other list queries) for the bills meeting the criteria ￼ ￼. The returned bill info typically includes bill number, title, and perhaps current status, allowing the developer to then fetch more details via GetLegislation if needed.

Calendars and Schedules (Hearings)

“Calendars and schedules” refers to the scheduling of legislative activities. In the context of the API, this is primarily covered by the CommitteeMeetingService, which deals with committee meeting schedules (hearings, work sessions, etc.). Key operations are:
	•	GetCommitteeMeetings – retrieves a list of all committee meetings within a given date range ￼. You supply a start and end date, and the service returns all meetings (from all committees) scheduled in that window. Each meeting entry includes details like the committee name, meeting date/time, location, and possibly agenda notes. This is useful for building a legislative calendar of upcoming hearings or past meeting archives.
	•	GetCommitteeMeetingItems – given a specific committee meeting (identified by an ID or some combination of date/committee – likely the object returned from the above call includes an ID), this returns the list of agenda items (bills or topics) for that meeting ￼. For example, if a committee meeting on 2024-02-10 has several bills scheduled for public hearing or executive session, this call would list each bill number and possibly a description of the agenda item.
	•	GetRevisedCommitteeMeetings – returns meetings that have been revised/updated since a given date ￼. This is helpful for detecting changes in the schedule (e.g., added or cancelled meetings, time changes) without fetching all meetings repeatedly. A developer could poll this to update a calendar if any meeting details were modified.

Using CommitteeMeetingService, one can build daily schedules or calendars of hearings. For instance, an app could call GetCommitteeMeetings for the next 7 days to display all upcoming legislative committee meetings, or use GetCommitteeMeetingItems to show which bills will be discussed in a particular hearing.

Floor Calendars: It’s worth noting that the API services above focus on committee schedules. The floor session calendars (orders of business or lists of bills up for floor debate) are not directly exposed via the SOAP API. Those are typically published on the legislature’s website as HTML or PDFs. Developers interested in floor calendars might need to scrape the website or rely on external sources, since the SOAP API does not have a dedicated “floor schedule” endpoint. However, the LegislationService’s various “Passed House/Senate” methods can indicate what has passed or not, and GetLegislationNotYetIntroducedInHouseOfOrigin or similar calls can hint at what stage bills are in ￼, but the actual real-time floor agenda is outside the SOAP API’s scope.

Session Metadata and Utility Information

The API requires understanding how Washington’s sessions are identified. Washington operates on biennial sessions, and most API calls use a biennium parameter in the format "YYYY-YY" (e.g., "2023-24") to scope the data ￼. A biennium covers two years (the first year of the legislature’s term and the second year). Data is generally segmented by these bienniums. For example, a bill number re-starts each biennium, so you must provide the correct biennium to get the right bill.

Some calls instead use a single year and a session code. For example, SessionLawService’s GetBillByChapterNumber expects a year and a session identifier (where session codes are 0 = Regular Session, 1 = 1st Special Session, etc.) ￼. This reflects that some data (like session laws) are organized by annual session rather than the full biennium.

Types of Legislation: The API can provide meta-information like the types of legislation available. GetLegislationTypes in LegislationService returns a list of all valid measure types (e.g., House Bill, Senate Bill, House Joint Resolution, Senate Joint Memorial, etc.) ￼. This can be useful to know what prefixes and categories are used in that session.

Miscellaneous Utility Data: The SponsorService’s GetRequesters method returns all entities that can request legislation in a biennium ￼ – for instance, state agencies or committees that request bills (in WA, bills can be “by request” of a department or the Governor). This is a form of session metadata about the session’s actors.

Historical Coverage: The Web Services cover data going back several decades, but the availability varies by service. Legislative documents and bills are available as far back as the early 1990s. For example, the LegislativeDocumentService notes that information is available back to 1991-92 biennium for documents ￼. This implies you can retrieve PDFs of bills and amendments from 1991 onward. Other data, like committee information or sponsors, likely goes back as far as the Legislature’s digital records (the API expects biennium strings even for the 1990s, so one could query “1991-92”, “1993-94”, etc.). However, some features (like detailed status tracking) may be more complete in later years. Always check if a given biennium returns data. The API will throw an exception (SOAP fault) if you request an invalid biennium or a format it doesn’t support ￼ ￼.

Linking Data Across Endpoints

One strength of the API is that data from different endpoints can be combined to build rich information tools. The services are interrelated by key identifiers:
	•	Biennium & Bill Number: This pair identifies a bill and is used in many calls. For example, you use biennium+billNumber to get bill details, amendments, sponsors, and roll calls for that bill. The same biennium+number can be used across LegislationService (GetLegislation), Amendment queries, and GetRollCalls. This means after pulling a list of bills from a query (say, all bills in committee X), you can loop through each to get detailed info or votes.
	•	Bill IDs: Internally, each bill has a BillId (as seen in some responses ￼). Some methods like GetLegislativeStatusChangesByBillId or SessionLawService.GetSessionLawByBillId use this internal ID ￼. The BillId is provided in LegislationService outputs (e.g., in CurrentStatus or amendment info), so you can capture it for use in those calls.
	•	Sponsor (Legislator) IDs: In LegislationService, each bill’s prime sponsor often comes with a PrimeSponsorID ￼. This ID corresponds to the legislator in the SponsorService lists. While you typically don’t need to manually match by ID (since you could match by name), the ID can serve as a key. The SponsorService does not have a direct lookup by ID, but its lists of members contain each legislator’s contact info. For example, if a bill’s prime sponsor is ID 42 with name “Rep. Jane Doe,” you can find “Jane Doe” in the GetHouseSponsors list for that biennium to retrieve her party, district, phone, and email ￼. This allows linking bill data to richer legislator data (party affiliation, etc.).
	•	Sponsor Names: GetSponsors (note: this operation name appears in two contexts) – In LegislationService, GetSponsors returns the list of sponsors of a specific bill ￼. This will list all prime and co-sponsors for the bill, typically giving their names (and possibly an ID for each). A developer might use this to display all sponsors of a bill. Those names can then be cross-referenced with SponsorService’s data to get full details (e.g., showing each sponsor’s chamber and district). In SponsorService, GetSponsors (with a biennium) returns all legislators of both chambers in that biennium ￼ – one could filter that result by matching names to find the sponsors of a particular bill along with their metadata.
	•	Committee Names: When a bill’s status or history indicates referral to a committee, you can use the exact committee name and chamber to query CommitteeService for membership or CommitteeActionService for other bills in that committee. For example, if a bill status says “referred to Senate Transportation Committee,” you can call CommitteeService.GetCommitteeMembers(biennium, "Senate", "Transportation") to list that committee’s members. Or use CommitteeActionService.GetCommitteeReferralsByCommittee(biennium, "Senate", "Transportation") to find all other bills in that committee (perhaps to see what else is in their workload). The consistency of committee naming is important – the API expects the Name exactly as given in the committees list (sometimes includes spaces or punctuation as listed on the site) ￼.
	•	Document Links: The LegislativeDocumentService provides URLs for documents (PDF and HTML) related to bills ￼ ￼. Often, the LegislationService will give you a bill BillId or the bill number which is part of document naming. Using GetDocuments or GetDocumentsByClass, you can retrieve, for example, all versions of a bill text or all bill reports for a given bill. Example: Suppose you have bill HB 1234. You might call GetDocumentsByClass(biennium="2023-24", documentClass="Bills", namedLike="HB 1234") to get all bill documents whose name begins with “HB 1234” ￼. That would likely return the original bill text PDF, any substitute or amended versions, and so on, each with a URL. Similarly, using classes for “Bill Reports”, you could get House and Senate bill analysis documents for that bill. This way, you can link from a bill record to the actual text or analysis documents easily. (The GetAllDocumentsByClass method can list all documents of a given type for a biennium ￼, which is a large list – usually GetDocumentsByClass with a name filter is more targeted.)

By combining these endpoints, developers can create a cohesive data model. For instance, one could build a dashboard for a bill that shows the bill’s info (from GetLegislation), its sponsors (from GetSponsors + SponsorService), its progress history (from GetLegislativeStatusChanges), upcoming hearings (from CommitteeMeetingService filtered by that bill via GetCommitteeMeetingItems), and votes taken (from GetRollCalls). All pieces are accessible via the API.

Typical Use Cases and Developer Utilization

Developers and civic tech enthusiasts use the Washington Legislature’s API to power a variety of applications, including tracking tools, alert systems, and research dashboards. Some common use cases include:
	•	Bill Tracking and Alerts: Given the large number of bills (often 2000+ each session) ￼, keeping up can be challenging. Developers use the API to automate tracking. For example, one can periodically call GetLegislationInfoIntroducedSince to find new bills, or use GetLegislativeStatusChangesByDateRange to detect any bill status updates in the last day. By storing these or comparing to previous data, an app can trigger notifications for subscribers when a bill they care about is updated. The Washington Legislature itself leveraged such APIs to create a citizen notification system where users subscribe to a bill and get email updates whenever that bill’s status changes ￼ ￼. This was accomplished by automatically generating “topics” for each bill and using a messaging service (GovDelivery) integrated with the API to know when to send updates ￼. Third-party developers can similarly build email or SMS alert systems by checking the API at intervals for changes in specific bills’ status or new actions (hearings scheduled, votes taken, etc.).
	•	Dashboards and Websites: Many websites present legislative data in user-friendly ways (for example, a site that lists all bills related to a topic, or a dashboard for a particular legislator’s sponsored bills). The SOAP API provides the back-end for such tools. A developer might use GetLegislationByYear to pull all active bills of the current year ￼, store them in a local database, and then allow users to filter by topic or sponsor. Or they might use CommitteeActionService.GetDoPassByCommittee to show how many bills each committee has approved. Because the data can be combined, one could create visualizations (e.g., a table showing each committee and the bills referred to it, or a timeline of actions for a bill). The real-time nature means these dashboards can update daily or even hourly as the legislature moves. Some organizations integrate this data to monitor the progress of legislation in specific areas (like environmental bills or education bills) without manually checking the official site.
	•	Research and Analytics: The historical depth of the API allows researchers to analyze trends. For example, using the API one could fetch all bills from 1991 to present and analyze how many bills are introduced vs. passed each biennium, or track sponsorship patterns. Programmatically, one might call GetChapterNumbersByYear for each year to see how many bills became law, or use GetSponsors (bill-specific) across all bills to see which legislators collaborate frequently. While the API is SOAP (which is a bit archaic by modern standards), developers often write scripts (in Python, R, etc. using SOAP client libraries) to pull bulk data for analysis. The data can feed into legislative scorecards, accountability reports, or academic research on lawmaking patterns.
	•	Mobile Apps / Interactive Tools: A few applications use the API to provide real-time info on mobile or chat platforms. For example, a mobile app could let a user search a bill number, then behind the scenes call GetLegislation to show bill details and call GetRollCalls to display latest vote counts, giving constituents easy access to their legislature’s activity. Another example is integrating the data with communication platforms: the Granicus case study mentioned Washington’s use of a “Topics API” in combination with legislative data to automate communications ￼ – which illustrates how the legislative API can be a feed into other services.

Workflow considerations: Developers typically will periodically poll the API for new or changed data, since the service does not push updates. For tracking many bills, it’s common to use date-range queries (like “introduced since” or “status changes since”) rather than querying every bill individually. Once changes are identified, targeted calls can retrieve details. It’s also common to cache results in a local database for responsiveness, especially if building a public-facing site. The SOAP API calls can be a bit slow if pulling thousands of records in one go, so caching and incremental updates (using the “since date” methods) are prudent strategies.

Technical Details, Limits and Considerations

When working with the Washington Legislature SOAP API, developers should keep in mind a few quirks and best practices:
	•	SOAP Protocol: The API is SOAP-based, meaning each request must be an XML SOAP envelope, and the response is XML. Developers can use tools like SOAP client libraries (e.g., Apache Axis, .NET’s built-in service references, Python Zeep, etc.) by pointing at the WSDL (for example, the WSDL for LegislationService is at https://wslwebservices.leg.wa.gov/LegislationService.asmx?WSDL). The WSDLs allow easy client stub generation. If not using a SOAP library, one must manually POST XML to the service endpoints with the correct SOAPAction header ￼ ￼. The API supports SOAP 1.1 and 1.2 bindings. The request and response examples provided in the documentation (as shown in the code blocks above) are very useful for understanding the format.
	•	Data Formats and Parameters: Pay attention to the required format for parameters:
	•	Biennium must be a string of the form "YYYY-YY" (e.g., “2005-06”) ￼. An incorrect format (like “2005-6” or an invalid year range) will result in an error.
	•	Dates for methods requiring date ranges should be in ISO date format (the WSDL likely expects dateTime types, e.g., “2024-01-15T00:00:00”).
	•	Agency parameters are usually the literal strings "House" or "Senate" (case-sensitive) ￼.
	•	Committee names must match exactly the names returned by the CommitteeService (including capitalization and punctuation) ￼.
	•	Session codes for special sessions (used in SessionLawService) are numeric (0, 1, 2…) as documented ￼.
	•	No API Key / Authentication: The services are open to the public with no key or login. This means anyone can query them. However, with that openness comes the need to be a “good citizen” in terms of load. There’s no formal rate limit documented, but the Legislative Service Center (LSC) notes that they “can make no guarantees regarding the performance or response time of services” ￼. In practice, moderate use is fine, but avoid extremely high-frequency calls or pulling huge datasets in a single shot repeatedly. If you need all bills from 20 years, it’s better to do it in batches or during off-peak hours.
	•	Performance and Timeouts: The response time can vary. Some methods that return large lists (e.g., all documents since 1991, or all bills in a busy biennium) may be slow or could time out on your end. If using a SOAP client with a timeout, you may need to increase it for big data pulls. The servers are generally reliable, but during peak legislative activity or maintenance windows, you might experience slower responses. It’s wise to build in retry logic or failover if your application depends on timely data.
	•	Error Handling: If a query is made for a bill or biennium that doesn’t exist, the API will return a SOAP Fault exception. For example, asking for GetLegislation on “1901-02” biennium would fault out as invalid. Similarly, if no data is found (e.g., no bill matches the criteria), some methods might return an empty result set, while others might throw an exception saying “not found” – the documentation often notes “Exception thrown for invalid … or if no information found.” ￼. Developers should code to catch SOAP faults and handle them (e.g., treat “no data” gracefully).
	•	Data Freshness: The API is real-time or near real-time. Updates in the legislative database (such as a bill’s status change or a newly scheduled hearing) are reflected through the API almost immediately ￼. This is great for up-to-the-minute applications. However, it also means if the legislature’s system enters data with minor delays (e.g., a vote might only appear after the chamber clerk publishes it), the API reflects those same delays. Generally, data is very current, but be aware that certain actions (like the exact timestamp of a vote) might only appear once officially logged.
	•	Documentation and Testing: The primary documentation is the web service itself. Visiting the .asmx URL in a browser (e.g., .../LegislationService.asmx) presents a human-readable page listing operations and their parameters ￼. You can click an operation name on that page to see details and even test by inputting parameters (this uses a simple HTTP POST form) ￼. Additionally, the sample SOAP request/response on those pages (some of which are cited in this report) are extremely helpful as templates ￼ ￼. There isn’t a separate comprehensive guide or developer portal, so one is expected to use these provided descriptions. The Data.WA.gov and Data.gov entries ￼ summarizing the API are more for catalog purposes and point back to these official pages.
	•	Maintenance and Changes: The API has been in place for many years and uses a stable SOAP interface. It’s unlikely to change frequently (e.g., method names have remained consistent as they correspond to legislative business processes). If new features of the legislative process emerge, new methods might be added, but this is infrequent. Always retrieving the latest WSDL at runtime can ensure your client knows all available operations. As of the latest update (2025), the methods listed in this report cover the key functionality.
	•	Focus on Official Data Only: The question specifically notes not to confuse this with third-party services like LegiScan or Open States. Those services often repackage or scrape legislative data (including Washington’s) into REST APIs. While those can be useful, the official SOAP API is the source authorized by the state. It ensures you get exactly what the legislature publishes, in real time, and often with more detail (like draft amendment texts, which third-parties might not always have). The trade-off is the SOAP format and the need to handle the data integration yourself.

In summary, the Washington State Legislature’s Web Services API is a robust and comprehensive source for legislative data. It exposes everything from bill texts and statuses to vote counts, committee rosters, and session laws. By understanding the structure of each endpoint and how to combine them, developers can create powerful tools for tracking legislation, informing the public, and analyzing lawmaking – all using the live data from the state’s system. The SOAP interface may feel dated, but it is well-documented with consistent XML schemas, and with modern tools or libraries, it remains an invaluable resource for civic tech in Washington State.

Sources: The information above is drawn from the official Washington State Legislative Web Services documentation and examples ￼ ￼ ￼ ￼ ￼ ￼, which describe the API’s operations, request/response formats, and intended usage. These sources include the descriptions of each service’s methods and sample SOAP messages provided on the Legislature’s web service site, as well as a case study of how the API is used for public bill tracking notifications ￼ ￼. All citations refer to these official resources for accuracy and context.