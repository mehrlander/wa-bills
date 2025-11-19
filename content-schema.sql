-- Washington State Budget Bills Content Schema
-- This schema captures the actual content of budget bills:
-- appropriations, agencies, programs, funds, and proviso language

-- ============================================================================
-- BILL STRUCTURE
-- ============================================================================

-- Bill sections (e.g., "Sec. 101", "Sec. 201")
CREATE TABLE IF NOT EXISTS bill_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    section_number INTEGER NOT NULL,
    section_code TEXT, -- e.g., "SEC. 101", "Sec. 201"
    part_number INTEGER, -- Part I, Part II, etc.
    part_title TEXT, -- e.g., "GENERAL GOVERNMENT"
    title_number INTEGER, -- Title within a part
    title_text TEXT, -- Title description
    page_number INTEGER, -- Page in bill document
    raw_text TEXT, -- Full text of the section
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    UNIQUE(bill_id, section_number)
);

CREATE INDEX IF NOT EXISTS idx_bill_sections_bill ON bill_sections(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_sections_part ON bill_sections(bill_id, part_number);

-- ============================================================================
-- ORGANIZATIONAL ENTITIES
-- ============================================================================

-- State agencies (normalized across all bills)
CREATE TABLE IF NOT EXISTS agencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE, -- e.g., "DSHS", "DOT", "OSPI"
    name TEXT NOT NULL, -- Full name
    short_name TEXT, -- Abbreviated name
    agency_type TEXT, -- e.g., "executive", "legislative", "judicial", "independent"
    parent_agency_id INTEGER, -- For sub-agencies
    established_year INTEGER,
    notes TEXT,
    FOREIGN KEY (parent_agency_id) REFERENCES agencies(id)
);

CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(code);
CREATE INDEX IF NOT EXISTS idx_agencies_type ON agencies(agency_type);

-- Programs within agencies (can vary by biennium)
CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    code TEXT, -- Program code if available
    name TEXT NOT NULL,
    description TEXT,
    program_index TEXT, -- e.g., "001", "002" for ordering
    parent_program_id INTEGER, -- For sub-programs
    notes TEXT,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_program_id) REFERENCES programs(id)
);

CREATE INDEX IF NOT EXISTS idx_programs_agency ON programs(agency_id);
CREATE INDEX IF NOT EXISTS idx_programs_code ON programs(code);

-- ============================================================================
-- FUNDS AND ACCOUNTS
-- ============================================================================

-- Fund sources (normalized across all bills)
CREATE TABLE IF NOT EXISTS funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE, -- e.g., "001-1", "176-1"
    name TEXT NOT NULL, -- e.g., "General Fund—State", "Motor Vehicle Account"
    fund_type TEXT, -- e.g., "state", "federal", "local", "private"
    description TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_funds_code ON funds(code);
CREATE INDEX IF NOT EXISTS idx_funds_type ON funds(fund_type);

-- Account groups (for rollup reporting)
CREATE TABLE IF NOT EXISTS account_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., "Near General Fund", "Transportation Accounts"
    description TEXT,
    notes TEXT
);

-- Many-to-many: funds can belong to multiple groups
CREATE TABLE IF NOT EXISTS fund_group_membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES account_groups(id) ON DELETE CASCADE,
    UNIQUE(fund_id, group_id)
);

-- ============================================================================
-- APPROPRIATIONS
-- ============================================================================

-- Main appropriations table
CREATE TABLE IF NOT EXISTS appropriations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    agency_id INTEGER NOT NULL,
    program_id INTEGER, -- May be NULL for agency-level appropriations
    appropriation_type TEXT CHECK(appropriation_type IN (
        'direct', 'reappropriation', 'transfer', 'reduction'
    )) NOT NULL,
    fiscal_period TEXT NOT NULL, -- e.g., "2023-25", "FY2023", "FY2024"
    description TEXT,
    total_amount DECIMAL(15, 2), -- Total for this appropriation
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES bill_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES agencies(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

CREATE INDEX IF NOT EXISTS idx_appropriations_bill ON appropriations(bill_id);
CREATE INDEX IF NOT EXISTS idx_appropriations_agency ON appropriations(agency_id);
CREATE INDEX IF NOT EXISTS idx_appropriations_program ON appropriations(program_id);
CREATE INDEX IF NOT EXISTS idx_appropriations_type ON appropriations(appropriation_type);

-- Appropriation amounts by fund source
CREATE TABLE IF NOT EXISTS appropriation_amounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appropriation_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fiscal_year INTEGER, -- Specific year if split (e.g., 2023, 2024)
    notes TEXT,
    FOREIGN KEY (appropriation_id) REFERENCES appropriations(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id)
);

CREATE INDEX IF NOT EXISTS idx_appropriation_amounts_approp ON appropriation_amounts(appropriation_id);
CREATE INDEX IF NOT EXISTS idx_appropriation_amounts_fund ON appropriation_amounts(fund_id);
CREATE INDEX IF NOT EXISTS idx_appropriation_amounts_year ON appropriation_amounts(fiscal_year);

-- ============================================================================
-- FTE AUTHORIZATIONS
-- ============================================================================

-- Full-time equivalent position authorizations
CREATE TABLE IF NOT EXISTS fte_authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appropriation_id INTEGER NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fte_count DECIMAL(6, 2) NOT NULL, -- Can be fractional (e.g., 123.5)
    position_type TEXT, -- e.g., "FTE", "temp", "seasonal"
    notes TEXT,
    FOREIGN KEY (appropriation_id) REFERENCES appropriations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fte_approp ON fte_authorizations(appropriation_id);
CREATE INDEX IF NOT EXISTS idx_fte_year ON fte_authorizations(fiscal_year);

-- ============================================================================
-- PROVISO LANGUAGE
-- ============================================================================

-- Proviso conditions and restrictions
CREATE TABLE IF NOT EXISTS provisos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    section_id INTEGER,
    appropriation_id INTEGER, -- NULL if proviso applies more broadly
    proviso_number INTEGER, -- Sequential number within section/appropriation
    proviso_type TEXT, -- e.g., "restriction", "directive", "reporting", "transfer_authority"
    subject TEXT, -- Brief subject/title
    text TEXT NOT NULL, -- Full proviso text
    amount DECIMAL(15, 2), -- If proviso specifies a dollar amount
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES bill_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (appropriation_id) REFERENCES appropriations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_provisos_bill ON provisos(bill_id);
CREATE INDEX IF NOT EXISTS idx_provisos_section ON provisos(section_id);
CREATE INDEX IF NOT EXISTS idx_provisos_approp ON provisos(appropriation_id);
CREATE INDEX IF NOT EXISTS idx_provisos_type ON provisos(proviso_type);

-- ============================================================================
-- CROSS-REFERENCES
-- ============================================================================

-- References to RCW, other sections, programs, etc.
CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL, -- e.g., "section", "proviso", "appropriation"
    source_id INTEGER NOT NULL, -- ID of the source record
    reference_type TEXT NOT NULL, -- e.g., "rcw", "section", "bill", "program", "agency"
    reference_text TEXT NOT NULL, -- e.g., "RCW 43.88.030", "section 205", "HB 1001"
    reference_id INTEGER, -- ID if reference is to internal entity
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_crossref_source ON cross_references(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_crossref_type ON cross_references(reference_type);

-- ============================================================================
-- SUMMARY/TOTALS TABLES
-- ============================================================================

-- Pre-calculated agency totals by bill (for performance)
CREATE TABLE IF NOT EXISTS agency_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    agency_id INTEGER NOT NULL,
    appropriation_type TEXT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    calculated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    UNIQUE(bill_id, agency_id, appropriation_type)
);

CREATE INDEX IF NOT EXISTS idx_agency_totals_bill ON agency_totals(bill_id);
CREATE INDEX IF NOT EXISTS idx_agency_totals_agency ON agency_totals(agency_id);

-- Pre-calculated fund totals by bill
CREATE TABLE IF NOT EXISTS fund_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    appropriation_type TEXT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    calculated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES budget_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE,
    UNIQUE(bill_id, fund_id, appropriation_type)
);

CREATE INDEX IF NOT EXISTS idx_fund_totals_bill ON fund_totals(bill_id);
CREATE INDEX IF NOT EXISTS idx_fund_totals_fund ON fund_totals(fund_id);

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View: Complete appropriation details
CREATE VIEW IF NOT EXISTS v_appropriation_details AS
SELECT
    ap.id as appropriation_id,
    bb.bill_number,
    bb.biennium,
    bb.session_year,
    ag.code as agency_code,
    ag.name as agency_name,
    p.name as program_name,
    ap.appropriation_type,
    ap.fiscal_period,
    ap.total_amount,
    bs.section_code,
    bs.part_title
FROM appropriations ap
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN agencies ag ON ap.agency_id = ag.id
LEFT JOIN programs p ON ap.program_id = p.id
LEFT JOIN bill_sections bs ON ap.section_id = bs.id;

-- View: Appropriations by fund
CREATE VIEW IF NOT EXISTS v_appropriations_by_fund AS
SELECT
    bb.bill_number,
    bb.biennium,
    ag.code as agency_code,
    ag.name as agency_name,
    p.name as program_name,
    f.code as fund_code,
    f.name as fund_name,
    aa.fiscal_year,
    aa.amount,
    ap.appropriation_type
FROM appropriation_amounts aa
JOIN appropriations ap ON aa.appropriation_id = ap.id
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN agencies ag ON ap.agency_id = ag.id
LEFT JOIN programs p ON ap.program_id = p.id
JOIN funds f ON aa.fund_id = f.id;

-- View: Agency spending summary by biennium
CREATE VIEW IF NOT EXISTS v_agency_summary_by_biennium AS
SELECT
    bb.biennium,
    ag.code as agency_code,
    ag.name as agency_name,
    ap.appropriation_type,
    COUNT(DISTINCT ap.id) as appropriation_count,
    SUM(ap.total_amount) as total_amount
FROM appropriations ap
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN agencies ag ON ap.agency_id = ag.id
GROUP BY bb.biennium, ag.id, ap.appropriation_type;

-- View: Fund summary by biennium
CREATE VIEW IF NOT EXISTS v_fund_summary_by_biennium AS
SELECT
    bb.biennium,
    f.code as fund_code,
    f.name as fund_name,
    f.fund_type,
    SUM(aa.amount) as total_amount,
    COUNT(DISTINCT ap.agency_id) as agency_count
FROM appropriation_amounts aa
JOIN appropriations ap ON aa.appropriation_id = ap.id
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN funds f ON aa.fund_id = f.id
GROUP BY bb.biennium, f.id;

-- View: FTE summary by agency and year
CREATE VIEW IF NOT EXISTS v_fte_summary AS
SELECT
    bb.biennium,
    bb.bill_number,
    ag.code as agency_code,
    ag.name as agency_name,
    fte.fiscal_year,
    SUM(fte.fte_count) as total_ftes
FROM fte_authorizations fte
JOIN appropriations ap ON fte.appropriation_id = ap.id
JOIN budget_bills bb ON ap.bill_id = bb.id
JOIN agencies ag ON ap.agency_id = ag.id
GROUP BY bb.biennium, ag.id, fte.fiscal_year;

-- View: Provisos with context
CREATE VIEW IF NOT EXISTS v_proviso_details AS
SELECT
    pv.id as proviso_id,
    bb.bill_number,
    bb.biennium,
    bs.section_code,
    ag.code as agency_code,
    ag.name as agency_name,
    p.name as program_name,
    pv.proviso_type,
    pv.subject,
    pv.text as proviso_text,
    pv.amount
FROM provisos pv
JOIN budget_bills bb ON pv.bill_id = bb.id
LEFT JOIN bill_sections bs ON pv.section_id = bs.id
LEFT JOIN appropriations ap ON pv.appropriation_id = ap.id
LEFT JOIN agencies ag ON ap.agency_id = ag.id
LEFT JOIN programs p ON ap.program_id = p.id;

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================

-- Virtual table for full-text search of proviso language
CREATE VIRTUAL TABLE IF NOT EXISTS provisos_fts USING fts5(
    proviso_id UNINDEXED,
    bill_number UNINDEXED,
    biennium UNINDEXED,
    agency_code,
    agency_name,
    subject,
    text,
    content=provisos
);

-- Triggers to keep FTS in sync (would need to be added after data insertion)
