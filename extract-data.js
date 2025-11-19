#!/usr/bin/env node
/**
 * Extract data from HB 5693-S and generate JSON output
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

// Load the extraction library
const BillExtractor = require('./bill-extractor.js');

// Read the XML file
const xmlPath = path.join(__dirname, '5693-S.xml');
console.log('Reading XML file:', xmlPath);

const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

console.log('Extracting data from XML...');
const extractedData = BillExtractor.extractFromXML(xmlContent);

// Add extraction metadata
extractedData.extractionMetadata = {
  extractedAt: new Date().toISOString(),
  extractorVersion: BillExtractor.version,
  sourceFile: '5693-S.xml',
  billType: 'Supplemental Operating Budget'
};

// Generate summary statistics
extractedData.summary = {
  totalAgencies: extractedData.agencies.length,
  totalAppropriations: extractedData.appropriations.length,
  totalStatutoryReferences: extractedData.statutoryReferences.length,
  totalPrograms: extractedData.programs.length,
  totalVetoedSections: extractedData.vetoes.length,
  totalBillSections: extractedData.billSections.length,
  fiscalYears: Object.keys(extractedData.fiscalImpacts.byFiscalYear),
  totalFiscalImpact: extractedData.fiscalImpacts.total
};

// Write JSON output
const outputPath = path.join(__dirname, 'hb5693-data.json');
console.log('Writing extracted data to:', outputPath);

fs.writeFileSync(
  outputPath,
  JSON.stringify(extractedData, null, 2),
  'utf-8'
);

console.log('\nExtraction complete!');
console.log('Summary:');
console.log('  - Agencies:', extractedData.summary.totalAgencies);
console.log('  - Appropriations:', extractedData.summary.totalAppropriations);
console.log('  - Statutory References:', extractedData.summary.totalStatutoryReferences);
console.log('  - Programs:', extractedData.summary.totalPrograms);
console.log('  - Vetoed Sections:', extractedData.summary.totalVetoedSections);
console.log('  - Bill Sections:', extractedData.summary.totalBillSections);
console.log('  - Total Fiscal Impact: $' + extractedData.fiscalImpacts.total.change.toLocaleString());
console.log('\nOutput file:', outputPath);
