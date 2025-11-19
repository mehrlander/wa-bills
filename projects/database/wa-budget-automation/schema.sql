-- WA Budget Bills Normalized Database Schema
-- Designed to extract and structure appropriations data from WA operating budget bills

-- Core entity tables

CREATE TABLE IF NOT EXISTS agencies (
    agency_id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_code TEXT UNIQUE,          -- e.g., "027", "070"
    agency_name TEXT NOT NULL,         -- e.g., "Department of Corrections"
    agency_full_name TEXT,             -- Full official name if different
    biennium TEXT NOT NULL,            -- e.g., "2025-27"
    UNIQUE(agency_code, biennium)
);

CREATE TABLE IF NOT EXISTS programs (
    program_id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    program_code TEXT,                 -- Program identifier within agency
    program_name TEXT NOT NULL,        -- e.g., "Adult Corrections"
    program_index TEXT,                -- Section/subsection reference
    FOREIGN KEY (agency_id) REFERENCES agencies(agency_id),
    UNIQUE(agency_id, program_code)
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code TEXT UNIQUE NOT NULL, -- e.g., "001", "127"
    account_name TEXT NOT NULL,        -- e.g., "General Fund-State", "State Toxics Control Account"
    account_type TEXT,                 -- e.g., "State", "Federal", "Private/Local"
    fund_type TEXT                     -- e.g., "General Fund", "Special Fund", "Trust Fund"
);

-- Appropriations data

CREATE TABLE IF NOT EXISTS appropriations (
    appropriation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    fiscal_year INTEGER NOT NULL,      -- e.g., 2026, 2027
    amount INTEGER NOT NULL,           -- Amount in dollars (stored as integer cents to avoid floating point)
    appropriation_type TEXT,           -- e.g., "Operating", "Capital", "Transportation"
    bill_section TEXT,                 -- Section number in bill
    subsection TEXT,                   -- Subsection reference if applicable
    line_item TEXT,                    -- Specific line item description
    FOREIGN KEY (program_id) REFERENCES programs(program_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- Proviso language and conditions

CREATE TABLE IF NOT EXISTS provisos (
    proviso_id INTEGER PRIMARY KEY AUTOINCREMENT,
    appropriation_id INTEGER,          -- NULL if proviso applies to entire program/agency
    program_id INTEGER,
    agency_id INTEGER,
    proviso_text TEXT NOT NULL,        -- Full text of the proviso
    proviso_type TEXT,                 -- e.g., "Restriction", "Directive", "Reporting", "Intent"
    bill_section TEXT,
    subsection TEXT,
    paragraph_ref TEXT,                -- Paragraph reference within section
    FOREIGN KEY (appropriation_id) REFERENCES appropriations(appropriation_id),
    FOREIGN KEY (program_id) REFERENCES programs(program_id),
    FOREIGN KEY (agency_id) REFERENCES agencies(agency_id)
);

-- Cross-references between sections

CREATE TABLE IF NOT EXISTS cross_references (
    reference_id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_section TEXT NOT NULL,      -- Section making the reference
    target_section TEXT NOT NULL,      -- Section being referenced
    reference_type TEXT,               -- e.g., "See", "Subject to", "In addition to"
    reference_text TEXT,               -- Context of the reference
    bill_id TEXT                       -- Bill identifier (e.g., "ESSB-5167")
);

-- FTE (Full-Time Equivalent) positions

CREATE TABLE IF NOT EXISTS ftes (
    fte_id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fte_count REAL NOT NULL,           -- Can be fractional (e.g., 123.5)
    position_type TEXT,                -- e.g., "FTE", "Permanent", "Temporary"
    FOREIGN KEY (program_id) REFERENCES programs(program_id)
);

-- Metadata and extraction tracking

CREATE TABLE IF NOT EXISTS bill_metadata (
    bill_id TEXT PRIMARY KEY,          -- e.g., "ESSB-5167"
    bill_title TEXT,
    biennium TEXT NOT NULL,
    effective_date TEXT,
    chapter_number TEXT,               -- e.g., "Chapter 424, 2025 Laws PV"
    total_budget INTEGER,              -- Total budget in dollars
    general_fund_total INTEGER,        -- General fund portion
    file_format TEXT,                  -- e.g., "XML", "HTM", "PDF"
    file_path TEXT,
    extraction_date TEXT,              -- ISO 8601 date
    parser_version TEXT
);

CREATE TABLE IF NOT EXISTS extraction_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id TEXT,
    extraction_date TEXT,
    section_type TEXT,                 -- e.g., "appropriations", "provisos", "ftes"
    records_extracted INTEGER,
    errors_encountered INTEGER,
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES bill_metadata(bill_id)
);

-- Views for common queries

CREATE VIEW IF NOT EXISTS appropriations_summary AS
SELECT
    a.agency_name,
    p.program_name,
    ac.account_name,
    ap.fiscal_year,
    ap.amount / 100.0 as amount_dollars,
    ap.bill_section
FROM appropriations ap
JOIN programs p ON ap.program_id = p.program_id
JOIN agencies a ON p.agency_id = a.agency_id
JOIN accounts ac ON ap.account_id = ac.account_id
ORDER BY a.agency_name, p.program_name, ap.fiscal_year;

CREATE VIEW IF NOT EXISTS agency_totals AS
SELECT
    a.agency_name,
    ap.fiscal_year,
    SUM(ap.amount) / 100.0 as total_amount_dollars,
    COUNT(DISTINCT p.program_id) as program_count
FROM appropriations ap
JOIN programs p ON ap.program_id = p.program_id
JOIN agencies a ON p.agency_id = a.agency_id
GROUP BY a.agency_id, ap.fiscal_year
ORDER BY total_amount_dollars DESC;

-- Indexes for performance

CREATE INDEX IF NOT EXISTS idx_appropriations_program ON appropriations(program_id);
CREATE INDEX IF NOT EXISTS idx_appropriations_account ON appropriations(account_id);
CREATE INDEX IF NOT EXISTS idx_appropriations_fiscal_year ON appropriations(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_programs_agency ON programs(agency_id);
CREATE INDEX IF NOT EXISTS idx_provisos_appropriation ON provisos(appropriation_id);
CREATE INDEX IF NOT EXISTS idx_provisos_program ON provisos(program_id);
CREATE INDEX IF NOT EXISTS idx_provisos_agency ON provisos(agency_id);
