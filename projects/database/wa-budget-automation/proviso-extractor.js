/**
 * Proviso Extractor
 * Extracts proviso language and conditions from budget bill sections
 */

import { cleanText, classifyProviso } from '../utils/text-utils.js';
import { insertProviso, logExtraction } from '../utils/db-utils.js';

/**
 * Extract provisos from sections
 */
export function extractProvisos(db, sections, billId) {
  console.log(`Extracting provisos from ${sections.length} sections...`);

  let recordsExtracted = 0;
  let errorsEncountered = 0;

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const section of sections) {
      try {
        const result = extractSectionProvisos(db, section);
        recordsExtracted += result.count;
      } catch (error) {
        console.error(`Error processing section ${section.number}:`, error.message);
        errorsEncountered++;
      }
    }

    db.exec('COMMIT;');

    logExtraction(db, {
      billId,
      sectionType: 'provisos',
      recordsExtracted,
      errorsEncountered,
      notes: `Processed ${sections.length} sections`
    });

    console.log(`Extracted ${recordsExtracted} proviso records`);
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
 * Extract provisos from a single section
 */
function extractSectionProvisos(db, section) {
  let count = 0;

  const content = section.content || '';

  // Common proviso patterns in WA budget bills:
  // "(1) The appropriation is provided solely for..."
  // "(a) ...shall report to the legislature..."
  // "PROVIDED, That..."

  const provisos = [];

  // Pattern 1: Numbered/lettered paragraphs with proviso keywords
  const paragraphPattern = /\((\d+|[a-z])\)\s+([^()]+(?:\([^)]+\)[^()]*)*)/gi;
  let match;

  while ((match = paragraphPattern.exec(content)) !== null) {
    const paragraphRef = match[1];
    const text = cleanText(match[2]);

    if (isProviso(text)) {
      provisos.push({
        text,
        paragraphRef,
        type: classifyProviso(text)
      });
    }
  }

  // Pattern 2: "PROVIDED" clauses
  const providedPattern = /PROVIDED[,\s]+(?:That\s+)?([^.]+)/gi;
  while ((match = providedPattern.exec(content)) !== null) {
    const text = cleanText(match[1]);
    provisos.push({
      text: 'PROVIDED, That ' + text,
      paragraphRef: null,
      type: classifyProviso(text)
    });
  }

  // Insert provisos into database
  // Note: We don't have appropriation_id or program_id context here
  // These would need to be linked in a more sophisticated parsing pass
  for (const proviso of provisos) {
    insertProviso(db, {
      appropriationId: null,
      programId: null,
      agencyId: null,
      provisoText: proviso.text,
      provisoType: proviso.type,
      billSection: section.number,
      subsection: null,
      paragraphRef: proviso.paragraphRef
    });
    count++;
  }

  return { count };
}

/**
 * Determine if text is a proviso
 */
function isProviso(text) {
  const lowerText = text.toLowerCase();

  const provisoKeywords = [
    'provided solely',
    'is provided',
    'shall',
    'must',
    'may be used only',
    'may not',
    'shall report',
    'must report',
    'intent of the legislature',
    'subject to',
    'contingent upon',
    'notwithstanding'
  ];

  return provisoKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Extract cross-references from provisos
 */
export function extractCrossReferences(db, sections, billId) {
  console.log(`Extracting cross-references from ${sections.length} sections...`);

  let recordsExtracted = 0;

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const section of sections) {
      const content = section.content || '';

      // Pattern: "section X", "subsection (Y)", "chapter Z"
      const refPattern = /(?:section|subsection|chapter)\s+(\d+(?:\([a-z0-9]+\))?)/gi;
      let match;

      while ((match = refPattern.exec(content)) !== null) {
        const targetSection = match[1];

        db.prepare(`
          INSERT INTO cross_references (
            source_section, target_section, reference_type, reference_text, bill_id
          )
          VALUES (?, ?, ?, ?, ?)
        `).run(
          section.number,
          targetSection,
          'reference',
          match[0],
          billId
        );

        recordsExtracted++;
      }
    }

    db.exec('COMMIT;');

    logExtraction(db, {
      billId,
      sectionType: 'cross_references',
      recordsExtracted,
      errorsEncountered: 0,
      notes: `Extracted from ${sections.length} sections`
    });

    console.log(`Extracted ${recordsExtracted} cross-references`);

    return { recordsExtracted };

  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}
