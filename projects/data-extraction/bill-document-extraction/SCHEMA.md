# JSON Schema Documentation for WA Bill Extraction

## Overview

This document describes the structure of the JSON data extracted from Washington State legislative bills in XML format.

## Root Object Structure

The extracted data is structured as a single JSON object with the following top-level properties:

```json
{
  "metadata": {},
  "votes": {},
  "dates": {},
  "certificate": {},
  "statutoryReferences": {},
  "sections": [],
  "parts": [],
  "definitions": [],
  "agencies": [],
  "programs": [],
  "fiscal": {},
  "legislativeActions": {},
  "statistics": {},
  "extractionMetadata": {}
}
```

---

## Detailed Schema

### `metadata` (Object)

Bill identification and session information.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `shortId` | String | Short bill identifier | "E2SHB 1320.SL" |
| `longId` | String | Full bill name | "ENGROSSED SECOND SUBSTITUTE HOUSE BILL 1320" |
| `asAmended` | String | Chamber that amended the bill | "SENATE" |
| `legislature` | String | Legislature number | "67th Legislature" |
| `session` | String | Legislative session | "2021 Regular Session" |
| `sponsors` | String | Bill sponsors | "House Appropriations (originally sponsored by...)" |
| `briefDescription` | String | Brief description of bill | "Modernizing, harmonizing, and improving..." |
| `chapterLaw` | Object | Session law chapter info | See below |
| `chapterLaw.number` | String | Chapter number | "215" |
| `chapterLaw.year` | String | Year | "2021" |
| `sessionLawCaption` | String | Session law title | "CIVIL PROTECTION ORDERS" |
| `billType` | String | Type of bill | "bill" |
| `certifiedBillType` | String | Certification type | "sl" (session law) |

**Example:**
```json
{
  "metadata": {
    "shortId": "E2SHB 1320.SL",
    "longId": "ENGROSSED SECOND SUBSTITUTE HOUSE BILL 1320",
    "asAmended": "SENATE",
    "legislature": "67th Legislature",
    "session": "2021 Regular Session",
    "chapterLaw": {
      "number": "215",
      "year": "2021"
    },
    "sessionLawCaption": "CIVIL PROTECTION ORDERS",
    "billType": "bill",
    "certifiedBillType": "sl"
  }
}
```

---

### `votes` (Object)

Voting records from both legislative chambers.

| Property | Type | Description |
|----------|------|-------------|
| `house` | Object\|null | House voting record |
| `senate` | Object\|null | Senate voting record |

#### Vote Record Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `chamber` | String | Chamber name | "House" or "Senate" |
| `date` | String | Vote date | "April 14, 2021" |
| `yeas` | Number | Yes votes | 55 |
| `nays` | Number | No votes | 42 |
| `signer` | String | Presiding officer | "LAURIE JINKINS" |

**Example:**
```json
{
  "votes": {
    "house": {
      "chamber": "House",
      "date": "April 14, 2021",
      "yeas": 55,
      "nays": 42,
      "signer": "LAURIE JINKINS"
    },
    "senate": {
      "chamber": "Senate",
      "date": "April 10, 2021",
      "yeas": 27,
      "nays": 20,
      "signer": "DENNY HECK"
    }
  }
}
```

---

### `dates` (Object)

Important dates in the bill's lifecycle.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `effectiveDate` | String | When bill takes effect | "July 1, 2022—Except for sections..." |
| `approvedDate` | String | Governor approval date | "May 10, 2021 3:11 PM" |
| `filedDate` | String | Filed with Secretary of State | "May 10, 2021" |
| `readFirstTime` | String | First reading date | "READ FIRST TIME 02/22/21." |
| `governor` | String | Governor's name | "JAY INSLEE" |

---

### `certificate` (Object|null)

Certification information from the Chief Clerk.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `certifier` | String | Name of certifier | "BERNARD DEAN" |
| `certifierPosition` | String | Position title | "Chief Clerk" |
| `text` | String | Certification text | "I, Bernard Dean, Chief Clerk..." |

---

### `statutoryReferences` (Object)

References to statutes (RCW, USC, CFR).

| Property | Type | Description |
|----------|------|-------------|
| `rcw` | Array | RCW (Revised Code of Washington) citations |
| `federal` | Array | Federal law citations (USC, CFR) |

#### RCW Reference Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `type` | String | Always "RCW" | "RCW" |
| `title` | String | RCW title number | "9" |
| `chapter` | String | RCW chapter number | "41" |
| `section` | String | RCW section number | "040" |
| `fullCitation` | String | Complete citation | "9.41.040" |
| `context` | String | Where found (optional) | "BillTitle" |

#### Federal Reference Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `type` | String | "USC" or "CFR" | "USC" |
| `title` | String | Title number | "18" |
| `section` | String | Section number | "923(b)" |
| `fullCitation` | String | Complete citation | "18 U.S.C. Sec. 923(b)" |

**Example:**
```json
{
  "statutoryReferences": {
    "rcw": [
      {
        "type": "RCW",
        "title": "9",
        "chapter": "41",
        "section": "040",
        "fullCitation": "9.41.040"
      }
    ],
    "federal": [
      {
        "type": "USC",
        "title": "18",
        "section": "923(b)",
        "fullCitation": "18 U.S.C. Sec. 923(b)"
      }
    ]
  }
}
```

---

### `sections` (Array)

All bill sections with metadata.

#### Section Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `index` | Number | Sequential index | 1 |
| `number` | String | Section number | "1" |
| `caption` | String | Section caption | "FINDINGS AND INTENT." |
| `type` | String | Section type | "new" or "amendatory" |
| `action` | String | Legislative action | "amend", "repeal", "addsect", etc. |
| `citation` | Object\|null | RCW citation if amending | See below |
| `content` | String | Full text content | "Sec. 1. FINDINGS AND INTENT..." |
| `history` | String | History notes (optional) | "[2021 c 215 § 1.]" |

#### Citation Object (in Section)

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `title` | String | RCW title | "7" |
| `chapter` | String | RCW chapter | "105" |
| `section` | String | RCW section | "010" |

**Example:**
```json
{
  "sections": [
    {
      "index": 1,
      "number": "1",
      "caption": "FINDINGS AND INTENT.",
      "type": "new",
      "action": null,
      "citation": null,
      "content": "Sec. 1. FINDINGS AND INTENT. (1) Washington state has been..."
    },
    {
      "index": 10,
      "number": "10",
      "caption": null,
      "type": "amendatory",
      "action": "amend",
      "citation": {
        "title": "9",
        "chapter": "41",
        "section": "040"
      },
      "content": "Sec. 10. RCW 9.41.040 and...",
      "history": "[2021 c 215 § 10; ...]"
    }
  ]
}
```

---

### `parts` (Array)

Bill parts/divisions.

#### Part Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `index` | Number | Part number | 1 |
| `title` | String | Part title | "PART I FINDINGS, INTENT, AND DEFINITIONS" |
| `rawText` | String | Original text | Same as title |

**Example:**
```json
{
  "parts": [
    {
      "index": 1,
      "title": "PART I FINDINGS, INTENT, AND DEFINITIONS",
      "rawText": "PART I FINDINGS, INTENT, AND DEFINITIONS"
    }
  ]
}
```

---

### `definitions` (Array)

Legal definitions from definitions sections.

#### Definition Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `number` | String | Definition number | "1" |
| `term` | String | Term being defined | "Abandonment" |
| `definition` | String | Definition text | "means action or inaction by..." |
| `fullText` | String | Complete paragraph | "(1) \"Abandonment\" means..." |

**Example:**
```json
{
  "definitions": [
    {
      "number": "1",
      "term": "Abandonment",
      "definition": "means action or inaction by a person or entity...",
      "fullText": "(1) \"Abandonment\" means action or inaction by a person..."
    }
  ]
}
```

---

### `agencies` (Array\<String>)

List of government agencies and departments mentioned in the bill.

**Example:**
```json
{
  "agencies": [
    "Department Of Social And Health Services",
    "Department Of Children, Youth, And Families",
    "Department Of Licensing",
    "Department Of Corrections"
  ]
}
```

---

### `programs` (Array)

Programs and initiatives referenced.

#### Program Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `type` | String | Program type | "Initiative", "Protection Order" |
| `name` | String | Program name | "Initiative Measure No. 1491" |
| `number` | String | Number (for initiatives) | "1491" |

**Example:**
```json
{
  "programs": [
    {
      "type": "Initiative",
      "name": "Initiative Measure No. 1491",
      "number": "1491"
    },
    {
      "type": "Protection Order",
      "name": "Domestic Violence Protection Order"
    }
  ]
}
```

---

### `fiscal` (Object)

Fiscal information including costs and funding.

| Property | Type | Description |
|----------|------|-------------|
| `amounts` | Array\<String> | Dollar amounts found |
| `fiscalNotes` | Array | Fiscal notes (currently empty) |
| `fundingProvisions` | Array | Funding-related sections |

#### Funding Provision Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `section` | String | Section number | "171" |
| `caption` | String | Section caption | "CONTINGENT FUNDING" |
| `text` | String | Excerpt of text (500 chars) | "If specific funding..." |

**Example:**
```json
{
  "fiscal": {
    "amounts": ["$460,000,000,000", "$15"],
    "fiscalNotes": [],
    "fundingProvisions": [
      {
        "section": "171",
        "caption": null,
        "text": "If specific funding for the purposes of this act..."
      }
    ]
  }
}
```

---

### `legislativeActions` (Object)

Categorized legislative actions.

| Property | Type | Description |
|----------|------|-------------|
| `amending` | Array | Sections amending existing law |
| `repealing` | Array | Sections repealing law |
| `adding` | Array | Sections adding new law |
| `recodifying` | Array | Sections recodifying law |
| `reenacting` | Array | Sections reenacting law |

#### Action Object

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `section` | String | Section number | "10" |
| `caption` | String | Section caption | null or caption text |
| `citation` | Object\|null | RCW citation | `{"title": "9", "chapter": "41", "section": "040"}` |
| `addType` | String | Type of addition (for adding) | "addsect" or "addchap" |

**Example:**
```json
{
  "legislativeActions": {
    "amending": [
      {
        "section": "10",
        "caption": null,
        "citation": {
          "title": "9",
          "chapter": "41",
          "section": "040"
        }
      }
    ],
    "repealing": [
      {
        "section": "170",
        "caption": "REPEALER.",
        "citation": null
      }
    ],
    "adding": [],
    "recodifying": [],
    "reenacting": []
  }
}
```

---

### `statistics` (Object)

Summary statistics about the bill.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `totalSections` | Number | Total number of sections | 172 |
| `totalParts` | Number | Total number of parts | 17 |
| `totalRCWReferences` | Number | Total RCW citations | 227 |
| `totalDefinitions` | Number | Total definitions | 34 |

---

### `extractionMetadata` (Object)

Metadata about the extraction process.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `extractedAt` | String | ISO 8601 timestamp | "2025-11-19T10:30:00.000Z" |
| `sourceFile` | String | Source filename | "1320-S2.xml" |
| `extractorVersion` | String | Extractor version | "1.0.0" |
| `billNumber` | String | Bill identifier | "E2SHB 1320.SL" |

---

## JSON Schema (Formal)

Below is a formal JSON Schema representation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WA Bill Extraction Schema",
  "type": "object",
  "required": ["metadata", "sections", "statistics"],
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "shortId": {"type": "string"},
        "longId": {"type": "string"},
        "asAmended": {"type": "string"},
        "legislature": {"type": "string"},
        "session": {"type": "string"},
        "sponsors": {"type": "string"},
        "briefDescription": {"type": "string"},
        "chapterLaw": {
          "type": "object",
          "properties": {
            "number": {"type": "string"},
            "year": {"type": ["string", "null"]}
          }
        },
        "sessionLawCaption": {"type": "string"},
        "billType": {"type": ["string", "null"]},
        "certifiedBillType": {"type": ["string", "null"]}
      }
    },
    "votes": {
      "type": "object",
      "properties": {
        "house": {
          "type": ["object", "null"],
          "properties": {
            "chamber": {"type": "string"},
            "date": {"type": "string"},
            "yeas": {"type": "number"},
            "nays": {"type": "number"},
            "signer": {"type": "string"}
          }
        },
        "senate": {
          "type": ["object", "null"],
          "properties": {
            "chamber": {"type": "string"},
            "date": {"type": "string"},
            "yeas": {"type": "number"},
            "nays": {"type": "number"},
            "signer": {"type": "string"}
          }
        }
      }
    },
    "dates": {
      "type": "object",
      "properties": {
        "effectiveDate": {"type": "string"},
        "approvedDate": {"type": "string"},
        "filedDate": {"type": "string"},
        "readFirstTime": {"type": "string"},
        "governor": {"type": "string"}
      }
    },
    "certificate": {
      "type": ["object", "null"],
      "properties": {
        "certifier": {"type": "string"},
        "certifierPosition": {"type": "string"},
        "text": {"type": "string"}
      }
    },
    "statutoryReferences": {
      "type": "object",
      "properties": {
        "rcw": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {"type": "string", "const": "RCW"},
              "title": {"type": "string"},
              "chapter": {"type": "string"},
              "section": {"type": "string"},
              "fullCitation": {"type": "string"},
              "context": {"type": "string"}
            }
          }
        },
        "federal": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {"type": "string", "enum": ["USC", "CFR"]},
              "title": {"type": "string"},
              "section": {"type": "string"},
              "fullCitation": {"type": "string"}
            }
          }
        }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {"type": "number"},
          "number": {"type": ["string", "null"]},
          "caption": {"type": ["string", "null"]},
          "type": {"type": ["string", "null"]},
          "action": {"type": ["string", "null"]},
          "citation": {
            "type": ["object", "null"],
            "properties": {
              "title": {"type": "string"},
              "chapter": {"type": "string"},
              "section": {"type": "string"}
            }
          },
          "content": {"type": "string"},
          "history": {"type": "string"}
        }
      }
    },
    "parts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {"type": "number"},
          "title": {"type": "string"},
          "rawText": {"type": "string"}
        }
      }
    },
    "definitions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "number": {"type": "string"},
          "term": {"type": "string"},
          "definition": {"type": "string"},
          "fullText": {"type": "string"}
        }
      }
    },
    "agencies": {
      "type": "array",
      "items": {"type": "string"}
    },
    "programs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {"type": "string"},
          "name": {"type": "string"},
          "number": {"type": "string"}
        }
      }
    },
    "fiscal": {
      "type": "object",
      "properties": {
        "amounts": {
          "type": "array",
          "items": {"type": "string"}
        },
        "fiscalNotes": {"type": "array"},
        "fundingProvisions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "section": {"type": "string"},
              "caption": {"type": ["string", "null"]},
              "text": {"type": "string"}
            }
          }
        }
      }
    },
    "legislativeActions": {
      "type": "object",
      "properties": {
        "amending": {"type": "array"},
        "repealing": {"type": "array"},
        "adding": {"type": "array"},
        "recodifying": {"type": "array"},
        "reenacting": {"type": "array"}
      }
    },
    "statistics": {
      "type": "object",
      "properties": {
        "totalSections": {"type": "number"},
        "totalParts": {"type": "number"},
        "totalRCWReferences": {"type": "number"},
        "totalDefinitions": {"type": "number"}
      }
    },
    "extractionMetadata": {
      "type": "object",
      "properties": {
        "extractedAt": {"type": "string", "format": "date-time"},
        "sourceFile": {"type": "string"},
        "extractorVersion": {"type": "string"},
        "billNumber": {"type": "string"}
      }
    }
  }
}
```

---

## Usage Examples

### Query bill metadata
```javascript
const metadata = billData.metadata;
console.log(metadata.shortId); // "E2SHB 1320.SL"
```

### Find sections amending specific RCW
```javascript
const amendingSections = billData.legislativeActions.amending.filter(
  action => action.citation && action.citation.chapter === "41"
);
```

### Get all definitions
```javascript
const allDefs = billData.definitions;
const firearms = allDefs.find(def => def.term === "Firearm");
```

### Count votes
```javascript
const houseTotal = billData.votes.house.yeas + billData.votes.house.nays;
const senateTotal = billData.votes.senate.yeas + billData.votes.senate.nays;
```

### Search for agencies
```javascript
const healthAgencies = billData.agencies.filter(
  agency => agency.toLowerCase().includes('health')
);
```

---

## Data Quality Notes

1. **Text Normalization**: All text content preserves original spacing and formatting
2. **Null Values**: Fields may be `null` if data is not present in source XML
3. **Arrays**: Empty arrays `[]` indicate no items found, not an error
4. **RCW Citations**: Some sections may have incomplete citations depending on source data
5. **Content Length**: Section `content` fields contain full text and may be very long

---

## Version History

- **v1.0.0** (2025-11-19): Initial schema definition for HB 1320-S2 extraction
