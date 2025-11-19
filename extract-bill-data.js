#!/usr/bin/env node

/**
 * Extract structured data from HB 5187-S XML file
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the extraction library
const extractorCode = fs.readFileSync('./bill-extractor.js', 'utf8');

// Read the XML file
const xmlContent = fs.readFileSync('./5187-S.xml', 'utf8');

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  contentType: 'text/html',
  includeNodeLocations: false
});

global.DOMParser = dom.window.DOMParser;
global.document = dom.window.document;

// Load the extractor class
eval(extractorCode);

// Create extractor and extract data
console.log('Starting extraction from 5187-S.xml...');
const extractor = new WABillExtractor(xmlContent);

console.log('Extracting all data...');
const data = extractor.extractAll();

console.log('Getting summary...');
const summary = extractor.getSummary();

console.log('\n=== EXTRACTION SUMMARY ===');
console.log(`Bill ID: ${summary.billId}`);
console.log(`Title: ${summary.billTitle}`);
console.log(`Session: ${summary.session}`);
console.log(`Effective Date: ${summary.effectiveDate}`);
console.log(`Total Parts: ${summary.totalParts}`);
console.log(`Total Sections: ${summary.totalSections}`);
console.log(`Total Appropriations: ${summary.totalAppropriations}`);
console.log(`Total Amount: $${summary.totalAmount?.toLocaleString()}`);
console.log(`Has Vetoes: ${summary.hasVetos}`);
console.log(`Vetoed Sections: ${summary.vetoedSectionsCount}`);

// Write the full data to JSON file
const outputData = {
  summary: summary,
  data: data,
  extractedAt: new Date().toISOString(),
  sourceFile: '5187-S.xml'
};

fs.writeFileSync('./5187-S-data.json', JSON.stringify(outputData, null, 2));
console.log('\n✓ Full data written to 5187-S-data.json');

// Write a compact version for browser use
fs.writeFileSync('./5187-S-data-compact.json', JSON.stringify(outputData));
console.log('✓ Compact data written to 5187-S-data-compact.json');

console.log('\nExtraction complete!');
