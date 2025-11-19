#!/usr/bin/env node

const { BillExtractor, calculateSummary } = require('./bill-extractor.js');
const fs = require('fs');

// Load the XML file
const xmlContent = fs.readFileSync('./5167-S.xml', 'utf-8');
const extractor = new BillExtractor(xmlContent, 'xml');

console.log('Extracting data from HB 5167-S...');

// Extract all data
const data = extractor.extractAll();

// Calculate summary
const summary = calculateSummary(data);

// Create the final output
const output = {
  _meta: {
    extractedAt: new Date().toISOString(),
    sourceFile: '5167-S.xml',
    extractor: 'bill-extractor.js v1.0'
  },
  summary,
  ...data
};

// Write to file
fs.writeFileSync('HB5167-S-data.json', JSON.stringify(output, null, 2));

console.log('✓ Data extracted successfully to HB5167-S-data.json');
console.log(`  - ${data.sections.length} sections`);
console.log(`  - ${data.agencies.length} agencies`);
console.log(`  - ${data.appropriations.length} appropriations`);
console.log(`  - ${data.statutoryReferences.length} RCW references`);
console.log(`  - ${data.vetoes.length} vetoed sections`);
