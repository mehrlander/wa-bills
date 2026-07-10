#!/usr/bin/env node

/**
 * Extract structured data from HB 1320-S2 XML file
 * Generates JSON output for browser-based querying
 */

const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

// Make DOMParser available globally for the extractor
global.DOMParser = DOMParser;

// Load the extractor library
const BillExtractor = require('./billExtractor.js');

// Read the XML file
const xmlPath = '/home/user/wa-bills/1320-S2.xml';
console.log('Reading XML file:', xmlPath);
const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

console.log('Extracting bill data...');
const billData = BillExtractor.extractBillData(xmlContent);

// Add extraction metadata
billData.extractionMetadata = {
    extractedAt: new Date().toISOString(),
    sourceFile: '1320-S2.xml',
    extractorVersion: '1.0.0',
    billNumber: billData.metadata.shortId
};

// Write to JSON file
const outputPath = '/home/user/wa-bills/HB-1320-S2-data.json';
console.log('Writing extracted data to:', outputPath);
fs.writeFileSync(
    outputPath,
    JSON.stringify(billData, null, 2),
    'utf-8'
);

// Generate summary statistics
console.log('\n=== Extraction Summary ===');
console.log('Bill:', billData.metadata.shortId);
console.log('Title:', billData.metadata.sessionLawCaption);
console.log('Total Sections:', billData.statistics.totalSections);
console.log('Total Parts:', billData.statistics.totalParts);
console.log('RCW References:', billData.statutoryReferences.rcw.length);
console.log('Federal References:', billData.statutoryReferences.federal.length);
console.log('Definitions:', billData.definitions.length);
console.log('Agencies:', billData.agencies.length);
console.log('Programs:', billData.programs.length);
console.log('Fiscal Amounts Found:', billData.fiscal.amounts.length);
console.log('\nJSON file created successfully!');
