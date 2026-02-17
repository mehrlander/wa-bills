### Logic and Functionality

This tool processes raw OFM Fiscal Note data by normalizing its structure and merging it with legislative metadata (mainly because the fiscal note API doesn't give bill name).  We join by bill number not by bill ID with prefix.  

Some bills don't join because the bill number on the fiscal note side is a draft or non-standard.  The prefixes could be matched to some extent but to get the bill title we don't need to.

### Sample Raw FN Reponse
```json
[
  {
    "Agency": "014",
    "AgencyName": "Joint Leg. Audit & Review Committee",
    "BillNumber": "6303      ",
    "BillPrefix": "SB",
    "BillStatus": " ",
    "FNStatus": "Distributed Revised ",
    "StatusDateTime": "02/05/2024  9:16AM",
    "CurrentBiennium": "2023-25",
    "NextBiennium": "2025-27",
    "CurrentBiennOperatingExpNGFS": "0",
    "CurrentBiennOperatingExpTotal": "7",
    "NextBiennOperatingExpNGFS": "0",
    "NextBiennOperatingExpTotal": "17",
    "NonZeroIndeterminateOperatingCost": "No ",
    "AgencyContact": "Eric Thomas",
    "OFMAnalyst": "Gaius Horton",
    "LeadOFMAnalyst": "Amy Hatfield",
    "LeadAgency": "140"
  },
  {
    "Agency": "014",
    "AgencyName": "Joint Leg. Audit & Review Committee",
    "BillNumber": "S-3942.1  ",
    "BillPrefix": "",
    "BillStatus": " ",
    "FNStatus": "Distributed Final ",
    "StatusDateTime": "01/23/2024  1:13PM",
    "CurrentBiennium": "2023-25",
    "NextBiennium": "2025-27",
    "CurrentBiennOperatingExpNGFS": "0",
    "CurrentBiennOperatingExpTotal": "17",
    "NextBiennOperatingExpNGFS": "0",
    "NextBiennOperatingExpTotal": "10",
    "NonZeroIndeterminateOperatingCost": "No ",
    "AgencyContact": "Eric Thomas",
    "OFMAnalyst": "Gaius Horton",
    "LeadOFMAnalyst": "Amy Hatfield",
    "LeadAgency": "140"
  }
]

```

### Dependencies

* **Source Data**: Relies on legislative metadata located in the `legislation/data/GetLegislationSinceHistorical/json/` directory.
* **File Correspondence**: Each fiscal note file in `FiscalNotes/json` corresponds directly to a legislative JSON file for the same biennium (e.g., `2021-22.json`).
* **Exclusions**: Data for the **2009-10** biennium is excluded due to unresolved data quality and join issues.

### The Mechanics

* **The Join**: Matches the `BillNumber` from the paste to the `num` in the legislative library.
* **Session Detection**: The page currently identifies the correct biennium by scanning the `StatusDateTime` in the paste to determine a consensus session year based on the most common date found. Because of this, it depends on loading **one year at a time**.
* **The Pivot**: Aggregates `cNGFS`, `cTotal`, `nNGFS`, and `nTotal` into a single horizontal row. This allows for an immediate comparison between current and future fiscal impacts.
* **The Companion Link**: Generates a `CompanionKey` (e.g., `2081|5815`) by stripping digits from the bill and its companion. It sorts these numerically so the smaller number is always first, keeping House and Senate notes grouped together regardless of which one was pasted.
* **Data Cleaning**: To maintain a flat audit set, the tool removes nested `versions`, `final`, and raw `companion` objects from the legislative metadata before the join.

### Data Population Workflow

This tool was used to fill and verify the files in the `FiscalNotes/json` directory through the following process:

1. **Fetch**: Raw session data is retrieved by running a fetch command in the browser console while on the OFM API domain:
```javascript
fetch('https://fnspublic.ofm.wa.gov/api/FNSPublicWebService/GetFNS075Data?sessionYear=2021')
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error('Fetch failed:', err));

```


2. **Audit**: The resulting JSON is pasted into this tool to join it with legislative titles and check for "Unmatched" records.
3. **Validate**: The **Match Diagnostics** table is used to identify any bill numbers or years missing from the library.
4. **Export**: Once audited and pivoted, the **Copy JSON** button is used to extract the clean, flattened data to be saved into the corresponding biennium file.

### Library Coverage

Covers biennia from 2011-12 through 2025-26.  Biennium 2009-10 gave messy joins for reasons not yet determined.

### Future Development

A planned future step is to load this tool as a popup on the OFM domain. This would allow for built-in functionality to fetch data directly from the API, removing the need for manual console scripts and pasting.
