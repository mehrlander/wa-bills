#!/usr/bin/env node

/**
 * Extract structured data from HB 5950-S bill files
 * This script runs in Node.js and uses JSDOM to parse XML/HTML
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.DOMParser = dom.window.DOMParser;
global.document = dom.window.document;

// Load the bill extractor
const BillExtractor = require('./bill-extractor.js');

// Read the XML file
console.log('Reading 5950-S.xml...');
const xmlContent = fs.readFileSync(path.join(__dirname, '5950-S.xml'), 'utf8');

// Extract all data
console.log('Extracting structured data...');
const extractedData = BillExtractor.extractFromXML(xmlContent);

// Add extraction metadata
const outputData = {
  extractionDate: new Date().toISOString(),
  extractorVersion: '1.0.0',
  sourceFile: '5950-S.xml',
  billData: extractedData
};

// Write to JSON file
const outputPath = path.join(__dirname, 'hb-5950-s-data.json');
console.log('Writing extracted data to', outputPath);
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

console.log('Extraction complete!');
console.log('');
console.log('Summary:');
console.log('- Bill Type:', extractedData.billType.description);
console.log('- Agencies:', extractedData.agencies.length);
console.log('- Appropriations:', extractedData.appropriations.length);
console.log('- Statutory References:', extractedData.statutoryReferences.length);
console.log('- Dates:', extractedData.dates.length);
console.log('- Conditions/Limitations:', extractedData.conditionsAndLimitations.length);
console.log('- Programs:', extractedData.programs.length);
console.log('- Accounts:', extractedData.accounts.length);
console.log('- Total Appropriations: $' + extractedData.fiscalImpacts.totalAppropriations.toLocaleString());
