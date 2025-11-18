#!/usr/bin/env node
/**
 * WA Budget Bill Parser
 * Main entry point for parsing Washington State budget bills
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join } from 'path';
import { initDatabase } from './init-db.js';
import { parseXMLBill, extractSections, extractBillMetadata } from './extractors/xml-parser.js';
import { extractAppropriations } from './extractors/appropriations-extractor.js';
import { extractProvisos, extractCrossReferences } from './extractors/proviso-extractor.js';
import { insertBillMetadata, getExtractionStats } from './utils/db-utils.js';

/**
 * Parse a budget bill file
 */
export async function parseBudgetBill(filePath, options = {}) {
  const {
    dbPath = './wa-budget.db',
    biennium = '2025-27',
    billId = 'ESSB-5167',
    resetDb = false
  } = options;

  console.log('='.repeat(60));
  console.log('WA Budget Bill Parser');
  console.log('='.repeat(60));

  // Initialize database
  if (resetDb && existsSync(dbPath)) {
    console.log('Resetting database...');
    const fs = await import('fs/promises');
    await fs.unlink(dbPath);
  }

  const db = existsSync(dbPath)
    ? new Database(dbPath)
    : initDatabase(dbPath);

  try {
    // Parse XML file
    console.log('\n1. Parsing XML file...');
    const parsedXML = parseXMLBill(filePath);

    // Extract metadata
    console.log('\n2. Extracting bill metadata...');
    const metadata = extractBillMetadata(parsedXML);
    console.log(`   Bill: ${metadata.billNumber || billId}`);
    console.log(`   Title: ${metadata.title}`);

    // Insert metadata
    insertBillMetadata(db, {
      billId,
      billTitle: metadata.title,
      biennium,
      effectiveDate: metadata.effectiveDate,
      chapterNumber: 'Chapter 424, 2025 Laws PV',
      totalBudget: null,
      generalFundTotal: null,
      fileFormat: 'XML',
      filePath,
      extractionDate: new Date().toISOString(),
      parserVersion: '1.0.0'
    });

    // Extract sections
    console.log('\n3. Extracting sections...');
    const sections = extractSections(parsedXML);
    console.log(`   Found ${sections.length} sections`);

    // Extract appropriations
    console.log('\n4. Extracting appropriations...');
    const appropResult = extractAppropriations(db, sections, biennium, billId);
    console.log(`   Extracted ${appropResult.recordsExtracted} appropriation records`);

    // Extract provisos
    console.log('\n5. Extracting provisos...');
    const provisoResult = extractProvisos(db, sections, billId);
    console.log(`   Extracted ${provisoResult.recordsExtracted} proviso records`);

    // Extract cross-references
    console.log('\n6. Extracting cross-references...');
    const refResult = extractCrossReferences(db, sections, billId);
    console.log(`   Extracted ${refResult.recordsExtracted} cross-references`);

    // Get final statistics
    console.log('\n7. Extraction complete!');
    console.log('='.repeat(60));
    const stats = getExtractionStats(db);
    console.log('Database Statistics:');
    console.log(`   Agencies:        ${stats.agencies}`);
    console.log(`   Programs:        ${stats.programs}`);
    console.log(`   Accounts:        ${stats.accounts}`);
    console.log(`   Appropriations:  ${stats.appropriations}`);
    console.log(`   Provisos:        ${stats.provisos}`);
    console.log(`   FTEs:            ${stats.ftes}`);
    console.log(`   Cross-refs:      ${stats.crossReferences}`);
    console.log('='.repeat(60));

    return {
      success: true,
      stats,
      dbPath
    };

  } catch (error) {
    console.error('\nError during parsing:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
WA Budget Bill Parser

Usage: node src/index.js <bill-file> [options]

Arguments:
  <bill-file>          Path to budget bill XML file

Options:
  --db <path>          Database path (default: ./wa-budget.db)
  --biennium <year>    Biennium (default: 2025-27)
  --bill-id <id>       Bill identifier (default: ESSB-5167)
  --reset              Reset database before parsing
  --help, -h           Show this help message

Examples:
  node src/index.js bills/2025-27/operating/ESSB-5167.xml
  node src/index.js bills/2025-27/operating/ESSB-5167.xml --reset
  node src/index.js bills/2025-27/operating/ESSB-5167.xml --db custom.db
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    console.error('\nPlease download the bill file first. See bills/2025-27/operating/README.md');
    process.exit(1);
  }

  const options = {
    dbPath: args.includes('--db') ? args[args.indexOf('--db') + 1] : './wa-budget.db',
    biennium: args.includes('--biennium') ? args[args.indexOf('--biennium') + 1] : '2025-27',
    billId: args.includes('--bill-id') ? args[args.indexOf('--bill-id') + 1] : 'ESSB-5167',
    resetDb: args.includes('--reset')
  };

  try {
    const result = await parseBudgetBill(filePath, options);
    console.log(`\nDatabase saved to: ${result.dbPath}`);
    process.exit(0);
  } catch (error) {
    console.error('\nParsing failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
