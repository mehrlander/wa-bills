#!/usr/bin/env node
/**
 * Extract structured data from HB 5195-S and save to JSON
 */

const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

// Make DOMParser available globally for the extractor
global.DOMParser = DOMParser;

// Load the extractor library (Node.js optimized version)
const BillExtractor = require('./bill-extractor-node.js');

// Read the XML file
console.log('Reading XML file...');
const xmlContent = fs.readFileSync('./5195-S.xml', 'utf-8');

// Extract all data
console.log('Extracting structured data...');
const extractedData = BillExtractor.extractAll(xmlContent);

// Add file metadata
extractedData.sourceFile = '5195-S.xml';
extractedData.extractorVersion = '1.0.0';

// Write to JSON file
console.log('Writing JSON file...');
const jsonOutput = JSON.stringify(extractedData, null, 2);
fs.writeFileSync('./hb5195-data.json', jsonOutput, 'utf-8');

// Write a summary
console.log('\n=== EXTRACTION SUMMARY ===');
console.log(`Bill: ${extractedData.metadata.billId}`);
console.log(`Description: ${extractedData.metadata.description}`);
console.log(`Legislature: ${extractedData.metadata.legislature}`);
console.log(`Session: ${extractedData.metadata.session}`);
console.log(`\nParts: ${extractedData.parts.length}`);
console.log(`Sections: ${extractedData.sections.length}`);
console.log(`Projects: ${extractedData.projects.length}`);
console.log(`Departments: ${extractedData.agencies.departments.length}`);
console.log(`Accounts: ${extractedData.accounts.length}`);
console.log(`RCW References: ${extractedData.rcwReferences.length}`);
console.log(`\nFiscal Impact:`);
console.log(`  Current Biennium: $${extractedData.fiscalImpact.totalCurrentBiennium.toLocaleString()}`);
console.log(`  Reappropriation: $${extractedData.fiscalImpact.totalReappropriation.toLocaleString()}`);
console.log(`  Grand Total: $${extractedData.fiscalImpact.grandTotal.toLocaleString()}`);
console.log(`\nVeto Information:`);
console.log(`  Has Veto: ${extractedData.vetos.hasVeto}`);
console.log(`  Veto Type: ${extractedData.vetos.vetoType}`);
console.log(`  Vetoed Sections: ${extractedData.vetos.vetoedSections.length}`);

console.log('\n✓ Extraction complete! Data saved to hb5195-data.json');
