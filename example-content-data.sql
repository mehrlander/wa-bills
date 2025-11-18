-- Example Content Data
-- This file demonstrates how actual budget bill content would be populated
-- in the content schema. Uses realistic (but simplified) WA budget data.

-- This assumes the base schema has been loaded and we have a bill record:
-- bill_id = 1 for ESSB 5187 (2023-25 operating budget)

-- ============================================================================
-- REFERENCE DATA (normalized across all bills)
-- ============================================================================

-- Agencies
INSERT INTO agencies (code, name, short_name, agency_type) VALUES
('GOV', 'Office of the Governor', 'Governor', 'executive'),
('LT_GOV', 'Office of the Lieutenant Governor', 'Lt. Governor', 'executive'),
('DSHS', 'Department of Social and Health Services', 'DSHS', 'executive'),
('DOT', 'Department of Transportation', 'DOT', 'executive'),
('OSPI', 'Office of Superintendent of Public Instruction', 'OSPI', 'executive'),
('DOC', 'Department of Corrections', 'DOC', 'executive'),
('ECOLOGY', 'Department of Ecology', 'Ecology', 'executive'),
('DNR', 'Department of Natural Resources', 'DNR', 'executive'),
('COMMERCE', 'Department of Commerce', 'Commerce', 'executive'),
('WSP', 'Washington State Patrol', 'State Patrol', 'executive'),
('LEG', 'Legislature', 'Legislature', 'legislative'),
('SENATE', 'Senate', 'Senate', 'legislative'),
('HOUSE', 'House of Representatives', 'House', 'legislative'),
('COURTS', 'Judicial Branch', 'Courts', 'judicial'),
('HCA', 'Health Care Authority', 'HCA', 'executive');

-- Common Funds
INSERT INTO funds (code, name, fund_type) VALUES
('001-1', 'General Fund—State', 'state'),
('001-2', 'General Fund—Federal', 'federal'),
('001-3', 'General Fund—Local', 'local'),
('001-4', 'General Fund—Private/Local', 'private'),
('176-1', 'Motor Vehicle Account—State', 'state'),
('177-1', 'Puget Sound Ferry Operations Account—State', 'state'),
('406-1', 'State Building Construction Account—State', 'state'),
('569-1', 'Education Legacy Trust Account—State', 'state'),
('588-1', 'Climate Commitment Account—State', 'state'),
('23H-1', 'State Health Care Authority Administrative Account—State', 'state'),
('001-5', 'Pension Funding Stabilization Account', 'state');

-- Account Groups
INSERT INTO account_groups (name, description) VALUES
('Near General Fund', 'General Fund and closely related accounts'),
('Transportation', 'Transportation-related accounts'),
('Climate & Environment', 'Climate and environmental accounts'),
('Health Care', 'Health care related accounts');

-- Fund group memberships
INSERT INTO fund_group_membership (fund_id, group_id) VALUES
(1, 1), -- General Fund—State -> Near General Fund
(2, 1), -- General Fund—Federal -> Near General Fund
(5, 2), -- Motor Vehicle Account -> Transportation
(6, 2), -- Puget Sound Ferry -> Transportation
(9, 3), -- Climate Commitment Account -> Climate & Environment
(10, 4); -- HCA Admin Account -> Health Care

-- ============================================================================
-- BILL STRUCTURE FOR ESSB 5187 (2023-25)
-- ============================================================================

-- Example sections (simplified - real bill has hundreds)
INSERT INTO bill_sections (bill_id, section_number, section_code, part_number, part_title, title_number, title_text) VALUES
(1, 101, 'Sec. 101', 1, 'GENERAL GOVERNMENT', NULL, NULL),
(1, 102, 'Sec. 102', 1, 'GENERAL GOVERNMENT', NULL, NULL),
(1, 103, 'Sec. 103', 1, 'GENERAL GOVERNMENT', NULL, NULL),
(1, 201, 'Sec. 201', 2, 'HUMAN SERVICES', NULL, NULL),
(1, 202, 'Sec. 202', 2, 'HUMAN SERVICES', NULL, NULL),
(1, 301, 'Sec. 301', 3, 'NATURAL RESOURCES', NULL, NULL),
(1, 401, 'Sec. 401', 4, 'TRANSPORTATION', NULL, NULL),
(1, 501, 'Sec. 501', 5, 'PUBLIC SCHOOLS', NULL, NULL),
(1, 601, 'Sec. 601', 6, 'HIGHER EDUCATION', NULL, NULL),
(1, 701, 'Sec. 701', 7, 'OTHER EDUCATION', NULL, NULL),
(1, 801, 'Sec. 801', 8, 'SPECIAL APPROPRIATIONS', NULL, NULL);

-- ============================================================================
-- PROGRAMS (specific to agencies in this budget)
-- ============================================================================

-- DSHS Programs
INSERT INTO programs (agency_id, code, name, program_index) VALUES
((SELECT id FROM agencies WHERE code = 'DSHS'), '001', 'Central Administration', '001'),
((SELECT id FROM agencies WHERE code = 'DSHS'), '002', 'Developmental Disabilities', '002'),
((SELECT id FROM agencies WHERE code = 'DSHS'), '003', 'Aging and Long-Term Support', '003'),
((SELECT id FROM agencies WHERE code = 'DSHS'), '004', 'Behavioral Health and Service Integration', '004'),
((SELECT id FROM agencies WHERE code = 'DSHS'), '005', 'Economic Services Administration', '005');

-- DOT Programs
INSERT INTO programs (agency_id, code, name, program_index) VALUES
((SELECT id FROM agencies WHERE code = 'DOT'), 'A', 'Highway Maintenance', 'A'),
((SELECT id FROM agencies WHERE code = 'DOT'), 'B', 'Highway Construction', 'B'),
((SELECT id FROM agencies WHERE code = 'DOT'), 'C', 'Washington State Ferries', 'C');

-- OSPI Programs
INSERT INTO programs (agency_id, code, name, program_index) VALUES
((SELECT id FROM agencies WHERE code = 'OSPI'), '001', 'Basic Education', '001'),
((SELECT id FROM agencies WHERE code = 'OSPI'), '002', 'Special Education', '002'),
((SELECT id FROM agencies WHERE code = 'OSPI'), '003', 'Student Achievement', '003');

-- ============================================================================
-- APPROPRIATIONS - OFFICE OF THE GOVERNOR (Sec. 101)
-- ============================================================================

INSERT INTO appropriations (
    bill_id, section_id, agency_id, program_id,
    appropriation_type, fiscal_period, total_amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101),
    (SELECT id FROM agencies WHERE code = 'GOV'),
    NULL, -- Agency-level appropriation
    'direct',
    '2023-25',
    10357000
);

-- Break down by fund and fiscal year
INSERT INTO appropriation_amounts (appropriation_id, fund_id, amount, fiscal_year) VALUES
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101)),
    (SELECT id FROM funds WHERE code = '001-1'),
    5123000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101)),
    (SELECT id FROM funds WHERE code = '001-1'),
    5234000,
    2025
);

-- FTEs for Governor's Office
INSERT INTO fte_authorizations (appropriation_id, fiscal_year, fte_count) VALUES
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101)),
    2024,
    42.5
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101)),
    2025,
    43.0
);

-- Proviso for Governor's Office
INSERT INTO provisos (
    bill_id, section_id, appropriation_id,
    proviso_number, proviso_type, subject, text, amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101),
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 101)),
    1,
    'restriction',
    'Climate resilience study',
    '$500,000 of the general fund—state appropriation for fiscal year 2024 is provided solely for a climate resilience study to assess statewide climate adaptation needs.',
    500000
);

-- ============================================================================
-- APPROPRIATIONS - DSHS BEHAVIORAL HEALTH (Sec. 201)
-- ============================================================================

INSERT INTO appropriations (
    bill_id, section_id, agency_id, program_id,
    appropriation_type, fiscal_period, total_amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201),
    (SELECT id FROM agencies WHERE code = 'DSHS'),
    (SELECT id FROM programs WHERE agency_id = (SELECT id FROM agencies WHERE code = 'DSHS') AND code = '004'),
    'direct',
    '2023-25',
    2847512000
);

-- Multi-fund appropriation
INSERT INTO appropriation_amounts (appropriation_id, fund_id, amount, fiscal_year) VALUES
-- General Fund—State
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    (SELECT id FROM funds WHERE code = '001-1'),
    750000000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    (SELECT id FROM funds WHERE code = '001-1'),
    765000000,
    2025
),
-- General Fund—Federal
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    (SELECT id FROM funds WHERE code = '001-2'),
    650000000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    (SELECT id FROM funds WHERE code = '001-2'),
    682512000,
    2025
);

-- FTEs for DSHS Behavioral Health
INSERT INTO fte_authorizations (appropriation_id, fiscal_year, fte_count) VALUES
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    2024,
    1285.3
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    2025,
    1298.7
);

-- Multiple provisos for DSHS Behavioral Health
INSERT INTO provisos (
    bill_id, section_id, appropriation_id,
    proviso_number, proviso_type, subject, text, amount
) VALUES
(
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201),
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    1,
    'restriction',
    'Crisis stabilization services',
    '$25,000,000 of the general fund—state appropriation for fiscal year 2024 and $25,000,000 of the general fund—state appropriation for fiscal year 2025 are provided solely for expansion of crisis stabilization services.',
    50000000
),
(
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201),
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    2,
    'directive',
    'Community behavioral health beds',
    'The department shall work with managed care organizations to increase the number of community behavioral health beds by at least 500 beds by June 30, 2025.',
    NULL
),
(
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201),
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 201)),
    3,
    'reporting',
    'Quarterly spending reports',
    'The department shall provide quarterly reports to the legislature on expenditures for behavioral health services, including crisis services, inpatient care, and community-based treatment.',
    NULL
);

-- ============================================================================
-- APPROPRIATIONS - DOT FERRIES (Sec. 401)
-- ============================================================================

INSERT INTO appropriations (
    bill_id, section_id, agency_id, program_id,
    appropriation_type, fiscal_period, total_amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 401),
    (SELECT id FROM agencies WHERE code = 'DOT'),
    (SELECT id FROM programs WHERE agency_id = (SELECT id FROM agencies WHERE code = 'DOT') AND code = 'C'),
    'direct',
    '2023-25',
    1250000000
);

-- Ferry operations from dedicated account
INSERT INTO appropriation_amounts (appropriation_id, fund_id, amount, fiscal_year) VALUES
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 401)),
    (SELECT id FROM funds WHERE code = '177-1'),
    620000000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 401)),
    (SELECT id FROM funds WHERE code = '177-1'),
    630000000,
    2025
);

-- FTEs for Ferries
INSERT INTO fte_authorizations (appropriation_id, fiscal_year, fte_count) VALUES
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 401)),
    2024,
    1850.0
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 401)),
    2025,
    1865.0
);

-- ============================================================================
-- APPROPRIATIONS - OSPI BASIC EDUCATION (Sec. 501)
-- ============================================================================

INSERT INTO appropriations (
    bill_id, section_id, agency_id, program_id,
    appropriation_type, fiscal_period, total_amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501),
    (SELECT id FROM agencies WHERE code = 'OSPI'),
    (SELECT id FROM programs WHERE agency_id = (SELECT id FROM agencies WHERE code = 'OSPI') AND code = '001'),
    'direct',
    '2023-25',
    18500000000
);

-- Education funding from multiple sources
INSERT INTO appropriation_amounts (appropriation_id, fund_id, amount, fiscal_year) VALUES
-- General Fund—State (primary source)
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501)),
    (SELECT id FROM funds WHERE code = '001-1'),
    8750000000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501)),
    (SELECT id FROM funds WHERE code = '001-1'),
    9000000000,
    2025
),
-- Education Legacy Trust
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501)),
    (SELECT id FROM funds WHERE code = '569-1'),
    375000000,
    2024
),
(
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501)),
    (SELECT id FROM funds WHERE code = '569-1'),
    375000000,
    2025
);

-- Proviso for class size reduction
INSERT INTO provisos (
    bill_id, section_id, appropriation_id,
    proviso_number, proviso_type, subject, text, amount
) VALUES (
    1,
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501),
    (SELECT id FROM appropriations WHERE section_id = (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 501)),
    1,
    'restriction',
    'Class size reduction',
    '$250,000,000 of the general fund—state appropriation for fiscal year 2024 and $275,000,000 of the general fund—state appropriation for fiscal year 2025 are provided solely for the continuation of class size reduction in grades K-3.',
    525000000
);

-- ============================================================================
-- CROSS-REFERENCES
-- ============================================================================

-- Example: Proviso references RCW
INSERT INTO cross_references (source_type, source_id, reference_type, reference_text) VALUES
(
    'proviso',
    (SELECT id FROM provisos WHERE subject = 'Climate resilience study'),
    'rcw',
    'RCW 43.21A.080'
),
(
    'proviso',
    (SELECT id FROM provisos WHERE subject = 'Community behavioral health beds'),
    'rcw',
    'RCW 71.24.025'
);

-- Example: Section references another section
INSERT INTO cross_references (source_type, source_id, reference_type, reference_text) VALUES
(
    'section',
    (SELECT id FROM bill_sections WHERE bill_id = 1 AND section_number = 801),
    'section',
    'section 201 of this act'
);

-- ============================================================================
-- SUMMARY TABLES (would be calculated automatically via triggers/procedures)
-- ============================================================================

-- Agency totals for this bill
INSERT INTO agency_totals (bill_id, agency_id, appropriation_type, total_amount) VALUES
(1, (SELECT id FROM agencies WHERE code = 'GOV'), 'direct', 10357000),
(1, (SELECT id FROM agencies WHERE code = 'DSHS'), 'direct', 2847512000),
(1, (SELECT id FROM agencies WHERE code = 'DOT'), 'direct', 1250000000),
(1, (SELECT id FROM agencies WHERE code = 'OSPI'), 'direct', 18500000000);

-- Fund totals for this bill
INSERT INTO fund_totals (bill_id, fund_id, appropriation_type, total_amount) VALUES
-- General Fund—State totals across all agencies
(1, (SELECT id FROM funds WHERE code = '001-1'), 'direct',
    5357000 + 1515000000 + 17750000000), -- GOV + DSHS + OSPI
-- General Fund—Federal
(1, (SELECT id FROM funds WHERE code = '001-2'), 'direct', 1332512000),
-- Puget Sound Ferry Operations
(1, (SELECT id FROM funds WHERE code = '177-1'), 'direct', 1250000000),
-- Education Legacy Trust
(1, (SELECT id FROM funds WHERE code = '569-1'), 'direct', 750000000);

-- ============================================================================
-- QUERIES TO VERIFY DATA
-- ============================================================================

/*
-- Total appropriations by agency
SELECT
    ag.name,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN appropriations ap ON aa.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
WHERE ap.bill_id = 1
GROUP BY ag.id
ORDER BY total DESC;

-- Appropriations by fund type
SELECT
    f.fund_type,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN funds f ON aa.fund_id = f.id
JOIN appropriations ap ON aa.appropriation_id = ap.id
WHERE ap.bill_id = 1
GROUP BY f.fund_type;

-- Total FTEs by agency
SELECT
    ag.name,
    SUM(fte.fte_count) as total_ftes
FROM fte_authorizations fte
JOIN appropriations ap ON fte.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
WHERE ap.bill_id = 1
GROUP BY ag.id;

-- Provisos by type
SELECT
    proviso_type,
    COUNT(*) as count
FROM provisos
WHERE bill_id = 1
GROUP BY proviso_type;

-- Programs with largest appropriations
SELECT
    ag.name as agency,
    p.name as program,
    SUM(aa.amount) as total
FROM appropriation_amounts aa
JOIN appropriations ap ON aa.appropriation_id = ap.id
JOIN agencies ag ON ap.agency_id = ag.id
LEFT JOIN programs p ON ap.program_id = p.id
WHERE ap.bill_id = 1 AND p.id IS NOT NULL
GROUP BY ag.id, p.id
ORDER BY total DESC;
*/
