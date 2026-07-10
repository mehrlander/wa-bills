# Bill Extractor v3

### 🛠 Core Capabilities
* **Directory Scanning:** Crawls legislative file indexes to identify new bills.
* **Persistent Storage:** Uses **IndexedDB (via Dexie)** to store bill data permanently in the browser.
* **Deep Extraction:** * Parses **RCW links** and cross-references.
    * Extracts **Sponsors**, **Titles**, and **Bill Headings**.
    * Generates a **Master Keyword Index** for all captured documents.
* **Batch Processing:** Supports automated import of entire folders with rate-limiting to avoid server blocks.
* **Metadata Analysis:** Groups files by "Property Set" signatures to identify data structural changes.

### 📂 Operational Modes
1.  **Staging (List):** Live view of the remote web directory. Used to discover and "capture" new files.
2.  **Library (All):** Local view of the personal database. Allows for offline analysis and data exports.

### 🚀 Tech Stack
Alpine.js, daisyUI 5, Tabulator, Dexie, and Fast-XML-Parser.
