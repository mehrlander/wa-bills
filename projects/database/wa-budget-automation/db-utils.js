/**
 * Database utilities for inserting and querying data
 */

/**
 * Insert or get agency
 */
export function upsertAgency(db, { agencyCode, agencyName, agencyFullName, biennium }) {
  const existing = db.prepare(
    'SELECT agency_id FROM agencies WHERE agency_code = ? AND biennium = ?'
  ).get(agencyCode, biennium);

  if (existing) {
    return existing.agency_id;
  }

  const result = db.prepare(`
    INSERT INTO agencies (agency_code, agency_name, agency_full_name, biennium)
    VALUES (?, ?, ?, ?)
  `).run(agencyCode, agencyName, agencyFullName, biennium);

  return result.lastInsertRowid;
}

/**
 * Insert or get program
 */
export function upsertProgram(db, { agencyId, programCode, programName, programIndex }) {
  const existing = db.prepare(
    'SELECT program_id FROM programs WHERE agency_id = ? AND program_code = ?'
  ).get(agencyId, programCode);

  if (existing) {
    return existing.program_id;
  }

  const result = db.prepare(`
    INSERT INTO programs (agency_id, program_code, program_name, program_index)
    VALUES (?, ?, ?, ?)
  `).run(agencyId, programCode, programName, programIndex);

  return result.lastInsertRowid;
}

/**
 * Insert or get account
 */
export function upsertAccount(db, { accountCode, accountName, accountType, fundType }) {
  const existing = db.prepare(
    'SELECT account_id FROM accounts WHERE account_code = ?'
  ).get(accountCode);

  if (existing) {
    return existing.account_id;
  }

  const result = db.prepare(`
    INSERT INTO accounts (account_code, account_name, account_type, fund_type)
    VALUES (?, ?, ?, ?)
  `).run(accountCode, accountName, accountType, fundType);

  return result.lastInsertRowid;
}

/**
 * Insert appropriation
 */
export function insertAppropriation(db, {
  programId,
  accountId,
  fiscalYear,
  amount,
  appropriationType,
  billSection,
  subsection,
  lineItem
}) {
  const result = db.prepare(`
    INSERT INTO appropriations (
      program_id, account_id, fiscal_year, amount,
      appropriation_type, bill_section, subsection, line_item
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    programId, accountId, fiscalYear, amount,
    appropriationType, billSection, subsection, lineItem
  );

  return result.lastInsertRowid;
}

/**
 * Insert proviso
 */
export function insertProviso(db, {
  appropriationId,
  programId,
  agencyId,
  provisoText,
  provisoType,
  billSection,
  subsection,
  paragraphRef
}) {
  const result = db.prepare(`
    INSERT INTO provisos (
      appropriation_id, program_id, agency_id,
      proviso_text, proviso_type,
      bill_section, subsection, paragraph_ref
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    appropriationId, programId, agencyId,
    provisoText, provisoType,
    billSection, subsection, paragraphRef
  );

  return result.lastInsertRowid;
}

/**
 * Insert FTE data
 */
export function insertFTE(db, { programId, fiscalYear, fteCount, positionType }) {
  const result = db.prepare(`
    INSERT INTO ftes (program_id, fiscal_year, fte_count, position_type)
    VALUES (?, ?, ?, ?)
  `).run(programId, fiscalYear, fteCount, positionType);

  return result.lastInsertRowid;
}

/**
 * Insert cross reference
 */
export function insertCrossReference(db, {
  sourceSection,
  targetSection,
  referenceType,
  referenceText,
  billId
}) {
  const result = db.prepare(`
    INSERT INTO cross_references (
      source_section, target_section, reference_type, reference_text, bill_id
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(sourceSection, targetSection, referenceType, referenceText, billId);

  return result.lastInsertRowid;
}

/**
 * Insert bill metadata
 */
export function insertBillMetadata(db, metadata) {
  const result = db.prepare(`
    INSERT OR REPLACE INTO bill_metadata (
      bill_id, bill_title, biennium, effective_date, chapter_number,
      total_budget, general_fund_total, file_format, file_path,
      extraction_date, parser_version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    metadata.billId,
    metadata.billTitle,
    metadata.biennium,
    metadata.effectiveDate,
    metadata.chapterNumber,
    metadata.totalBudget,
    metadata.generalFundTotal,
    metadata.fileFormat,
    metadata.filePath,
    metadata.extractionDate,
    metadata.parserVersion
  );

  return result.lastInsertRowid;
}

/**
 * Log extraction activity
 */
export function logExtraction(db, {
  billId,
  sectionType,
  recordsExtracted,
  errorsEncountered,
  notes
}) {
  const extractionDate = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO extraction_log (
      bill_id, extraction_date, section_type,
      records_extracted, errors_encountered, notes
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(billId, extractionDate, sectionType, recordsExtracted, errorsEncountered, notes);

  return result.lastInsertRowid;
}

/**
 * Get extraction statistics
 */
export function getExtractionStats(db) {
  return {
    agencies: db.prepare('SELECT COUNT(*) as count FROM agencies').get().count,
    programs: db.prepare('SELECT COUNT(*) as count FROM programs').get().count,
    accounts: db.prepare('SELECT COUNT(*) as count FROM accounts').get().count,
    appropriations: db.prepare('SELECT COUNT(*) as count FROM appropriations').get().count,
    provisos: db.prepare('SELECT COUNT(*) as count FROM provisos').get().count,
    ftes: db.prepare('SELECT COUNT(*) as count FROM ftes').get().count,
    crossReferences: db.prepare('SELECT COUNT(*) as count FROM cross_references').get().count
  };
}
