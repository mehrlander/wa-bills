#!/usr/bin/env node

/**
 * Script to extract data from HB 1281-S and generate JSON output
 */

const fs = require('fs');
const BillExtractor = require('./bill-extractor.js');

// Read the XML file
console.log('Reading bill XML file...');
const xmlContent = fs.readFileSync('1281-S.xml', 'utf8');

// Create extractor instance
console.log('Extracting bill data...');
const extractor = new BillExtractor(xmlContent);

// Extract all data
const billData = extractor.extractAll();

// Add analysis metadata
billData.analysis = {
  extractedAt: new Date().toISOString(),
  billType: 'Technical Corrections',
  isBudgetBill: false,
  hasAppropriations: billData.fiscalImpacts.monetaryAmounts.length > 0,
  totalSections: billData.sections.length,
  totalRCWReferences: billData.rcwReferences.length,
  totalAgencies: billData.agencies.length,
  structuralPatterns: {
    hasParts: xmlContent.includes('<Part>'),
    hasSubsections: true,
    hasAmendments: billData.amendments.strikeCount > 0 || billData.amendments.addCount > 0,
    amendmentCount: billData.amendments.strikeCount + billData.amendments.addCount
  }
};

// Write JSON output
console.log('Writing extracted data to JSON...');
fs.writeFileSync(
  'hb1281s-extracted-data.json',
  JSON.stringify(billData, null, 2),
  'utf8'
);

console.log('✓ Extraction complete!');
console.log(`  - Total sections: ${billData.sections.length}`);
console.log(`  - RCW references: ${billData.rcwReferences.length}`);
console.log(`  - Agencies mentioned: ${billData.agencies.length}`);
console.log(`  - Dates extracted: ${billData.dates.allMentioned.length}`);
console.log(`  - Output: hb1281s-extracted-data.json`);
