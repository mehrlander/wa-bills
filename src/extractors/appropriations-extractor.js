/**
 * Appropriations Extractor
 * Extracts appropriations data from budget bill sections
 */

import {
  parseAmount,
  extractAgencyCode,
  extractFiscalYears,
  extractAccountType,
  extractFundType,
  cleanText
} from '../utils/text-utils.js';
import {
  upsertAgency,
  upsertProgram,
  upsertAccount,
  insertAppropriation,
  insertFTE,
  logExtraction
} from '../utils/db-utils.js';
import { extractTables } from './xml-parser.js';

/**
 * Extract appropriations from budget bill sections
 */
export function extractAppropriations(db, sections, biennium, billId) {
  console.log(`Extracting appropriations from ${sections.length} sections...`);

  let recordsExtracted = 0;
  let errorsEncountered = 0;

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const section of sections) {
      try {
        const result = extractSectionAppropriation(db, section, biennium, billId);
        recordsExtracted += result.count;
      } catch (error) {
        console.error(`Error processing section ${section.number}:`, error.message);
        errorsEncountered++;
      }
    }

    db.exec('COMMIT;');

    logExtraction(db, {
      billId,
      sectionType: 'appropriations',
      recordsExtracted,
      errorsEncountered,
      notes: `Processed ${sections.length} sections`
    });

    console.log(`Extracted ${recordsExtracted} appropriations records`);
    if (errorsEncountered > 0) {
      console.warn(`Encountered ${errorsEncountered} errors during extraction`);
    }

    return { recordsExtracted, errorsEncountered };

  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

/**
 * Extract appropriation from a single section
 */
function extractSectionAppropriation(db, section, biennium, billId) {
  let count = 0;

  // Extract agency information from section title/content
  const agencyInfo = parseAgencyInfo(section);
  if (!agencyInfo) {
    return { count };
  }

  // Insert or get agency
  const agencyId = upsertAgency(db, {
    agencyCode: agencyInfo.code,
    agencyName: agencyInfo.name,
    agencyFullName: agencyInfo.fullName,
    biennium
  });

  // Extract program information
  const programInfo = parseProgramInfo(section, agencyInfo);
  const programId = upsertProgram(db, {
    agencyId,
    programCode: programInfo.code,
    programName: programInfo.name,
    programIndex: section.number
  });

  // Extract appropriations from tables
  const tables = extractTables(section);
  for (const table of tables) {
    count += processAppropriationsTable(
      db,
      table,
      programId,
      biennium,
      section.number
    );
  }

  // Extract appropriations from text patterns
  count += extractTextualAppropriations(
    db,
    section,
    programId,
    biennium
  );

  // Extract FTE information
  extractFTEData(db, section, programId, biennium);

  return { count };
}

/**
 * Parse agency information from section
 */
function parseAgencyInfo(section) {
  const title = section.title || '';
  const content = section.content || '';

  // Try to match common patterns:
  // "Sec. 123. DEPARTMENT OF CORRECTIONS"
  // "SECTION 123 - OFFICE OF THE GOVERNOR"

  let agencyName = null;
  let agencyCode = null;

  // Extract from all-caps title
  const capsMatch = title.match(/([A-Z][A-Z\s&,.-]+(?:DEPARTMENT|OFFICE|COMMISSION|BOARD|AUTHORITY|PATROL))/);
  if (capsMatch) {
    agencyName = cleanText(capsMatch[1]);
  }

  // Try to extract agency code
  agencyCode = extractAgencyCode(title) || extractAgencyCode(content);

  // If no agency found, this might not be an agency section
  if (!agencyName && !agencyCode) {
    return null;
  }

  return {
    code: agencyCode || `UNK-${section.number}`,
    name: agencyName || 'Unknown Agency',
    fullName: agencyName
  };
}

/**
 * Parse program information from section
 */
function parseProgramInfo(section, agencyInfo) {
  // Look for program/activity titles in subsections
  const content = section.content || '';

  // Common patterns: "General Operations", "Program Management", etc.
  const programMatch = content.match(/(?:Program|Activity|Operations):\s*([^\n]+)/i);

  return {
    code: section.number || null,
    name: programMatch ? cleanText(programMatch[1]) : agencyInfo.name
  };
}

/**
 * Process appropriations table
 */
function processAppropriationsTable(db, table, programId, biennium, sectionNumber) {
  let count = 0;

  if (!table.data || table.data.length === 0) {
    return count;
  }

  const fiscalYears = extractFiscalYears(biennium);

  // Detect table structure
  // Common formats:
  // [Account Name, FY1 Amount, FY2 Amount]
  // [Account, Type, Amount]

  for (const row of table.data) {
    if (row.length < 2) continue;

    try {
      const result = parseAppropriationRow(
        db,
        row,
        programId,
        fiscalYears,
        sectionNumber
      );
      if (result) count++;
    } catch (error) {
      console.warn(`Error parsing table row:`, error.message);
    }
  }

  return count;
}

/**
 * Parse a single appropriation row
 */
function parseAppropriationRow(db, row, programId, fiscalYears, sectionNumber) {
  // Assume format: [Account Name, Amount1, Amount2, ...]
  const [accountName, ...amounts] = row;

  if (!accountName || amounts.length === 0) {
    return null;
  }

  // Generate or extract account code
  const accountCode = extractAccountCode(accountName);

  // Insert or get account
  const accountId = upsertAccount(db, {
    accountCode,
    accountName: cleanText(accountName),
    accountType: extractAccountType(accountName),
    fundType: extractFundType(accountName)
  });

  // Insert appropriations for each fiscal year
  let inserted = false;
  for (let i = 0; i < amounts.length && i < fiscalYears.length; i++) {
    const amount = parseAmount(amounts[i]);
    if (amount > 0) {
      insertAppropriation(db, {
        programId,
        accountId,
        fiscalYear: fiscalYears[i],
        amount,
        appropriationType: 'Operating',
        billSection: sectionNumber,
        subsection: null,
        lineItem: accountName
      });
      inserted = true;
    }
  }

  return inserted ? 1 : null;
}

/**
 * Extract account code from name
 */
function extractAccountCode(accountName) {
  // Try to extract explicit code like "(001)" or "001-"
  const codeMatch = accountName.match(/\((\d{3})\)|\b(\d{3})-/);
  if (codeMatch) {
    return codeMatch[1] || codeMatch[2];
  }

  // Generate hash-based code for uniqueness
  let hash = 0;
  for (let i = 0; i < accountName.length; i++) {
    hash = ((hash << 5) - hash) + accountName.charCodeAt(i);
    hash = hash & hash;
  }
  return `H${Math.abs(hash).toString().slice(0, 6)}`;
}

/**
 * Extract appropriations from textual patterns
 */
function extractTextualAppropriations(db, section, programId, biennium) {
  let count = 0;
  const content = section.content || '';

  // Pattern: "The sum of $X is appropriated from [account]"
  const pattern = /\$[\d,]+\s+(?:is\s+)?appropriated\s+(?:from\s+)?([^.]+)/gi;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    try {
      const amount = parseAmount(match[0]);
      const accountName = cleanText(match[1]);

      if (amount > 0 && accountName) {
        const accountCode = extractAccountCode(accountName);
        const accountId = upsertAccount(db, {
          accountCode,
          accountName,
          accountType: extractAccountType(accountName),
          fundType: extractFundType(accountName)
        });

        const fiscalYears = extractFiscalYears(biennium);
        insertAppropriation(db, {
          programId,
          accountId,
          fiscalYear: fiscalYears[0],
          amount,
          appropriationType: 'Operating',
          billSection: section.number,
          subsection: null,
          lineItem: 'General Appropriation'
        });

        count++;
      }
    } catch (error) {
      console.warn('Error parsing textual appropriation:', error.message);
    }
  }

  return count;
}

/**
 * Extract FTE data from section
 */
function extractFTEData(db, section, programId, biennium) {
  const content = section.content || '';

  // Pattern: "X.X FTE" or "FTE: X.X"
  const ftePattern = /(\d+\.?\d*)\s+FTE|FTE[:\s]+(\d+\.?\d*)/gi;
  let match;

  const fiscalYears = extractFiscalYears(biennium);

  while ((match = ftePattern.exec(content)) !== null) {
    try {
      const fteCount = parseFloat(match[1] || match[2]);
      if (!isNaN(fteCount) && fteCount > 0) {
        // Insert for each fiscal year
        for (const year of fiscalYears) {
          insertFTE(db, {
            programId,
            fiscalYear: year,
            fteCount,
            positionType: 'FTE'
          });
        }
        break; // Only process first match per section
      }
    } catch (error) {
      console.warn('Error parsing FTE data:', error.message);
    }
  }
}
