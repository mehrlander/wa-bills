-- Washington State Operating Budget Bills Database Schema

-- Main table for budget bills
CREATE TABLE IF NOT EXISTS budget_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT NOT NULL,
    session_year INTEGER NOT NULL,
    biennium TEXT NOT NULL,
    bill_type TEXT CHECK(bill_type IN ('biennial', 'supplemental', 'special_session')) NOT NULL,
    chamber TEXT CHECK(chamber IN ('House', 'Senate', 'Unknown')) NOT NULL,
    title TEXT,
    chapter_number TEXT,
    chapter_year INTEGER,
    enacted_date TEXT,
    effective_date TEXT,
    vetoed BOOLEAN DEFAULT 0,
    partial_veto BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bill_number, session_year)
);

-- Index for searching by biennium
CREATE INDEX IF NOT EXISTS idx_biennium ON budget_bills(biennium);

-- Index for searching by session year
CREATE INDEX IF NOT EXISTS idx_session_year ON budget_bills(session_year);

-- Index for searching by bill type
CREATE INDEX IF NOT EXISTS idx_bill_type ON budget_bills(bill_type);

-- Table for bill formats (XML, HTM, PDF)
CREATE TABLE IF NOT EXISTS bill_formats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    format TEXT CHECK(format IN ('XML', 'HTM', 'PDF')) NOT NULL,
    url TEXT,
    file_path TEXT,
    file_size INTEGER,
    downloaded BOOLEAN DEFAULT 0,
    download_date TEXT,
    checksum TEXT,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    UNIQUE(bill_id, format)
);

-- Index for finding bills by format availability
CREATE INDEX IF NOT EXISTS idx_format ON bill_formats(format);

-- Table for tracking companion bills
CREATE TABLE IF NOT EXISTS companion_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_bill_id INTEGER NOT NULL,
    companion_bill_id INTEGER NOT NULL,
    relationship TEXT CHECK(relationship IN ('companion', 'amended_by', 'superseded_by')) NOT NULL,
    notes TEXT,
    FOREIGN KEY (primary_bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (companion_bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    UNIQUE(primary_bill_id, companion_bill_id, relationship)
);

-- View for easy querying of bills with companion information
CREATE VIEW IF NOT EXISTS bills_summary AS
SELECT
    bb.id,
    bb.bill_number,
    bb.session_year,
    bb.biennium,
    bb.bill_type,
    bb.chamber,
    bb.title,
    bb.chapter_number,
    bb.enacted_date,
    bb.vetoed,
    bb.partial_veto,
    COUNT(DISTINCT bf.format) as available_formats,
    GROUP_CONCAT(DISTINCT bf.format) as formats
FROM budget_bills bb
LEFT JOIN bill_formats bf ON bb.id = bf.bill_id
GROUP BY bb.id
ORDER BY bb.session_year DESC, bb.bill_number;
