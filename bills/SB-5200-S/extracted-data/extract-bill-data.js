#!/usr/bin/env node

/**
 * Extract structured data from HB 5200-S XML file
 * Generates JSON output for browser-based querying
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

// Make DOMParser available globally for the extractor
global.DOMParser = DOMParser;

// Load the extractor library
const WaBillExtractor = require('./bill-extractor.js');

function main() {
  const billFile = path.join(__dirname, '5200-S.xml');
  const outputFile = path.join(__dirname, 'hb5200-data.json');

  console.log('Reading bill file:', billFile);
  const xmlContent = fs.readFileSync(billFile, 'utf-8');

  console.log('Parsing XML and extracting data...');
  const extractor = new WaBillExtractor(xmlContent);

  console.log('Extracting all structured data...');
  const data = extractor.extractAll();

  console.log('\n=== Extraction Summary ===');
  console.log(`Bill: ${data.metadata.shortId}`);
  console.log(`Title: ${data.metadata.briefDescription}`);
  console.log(`Session: ${data.metadata.session}`);
  console.log(`\nStructure:`);
  console.log(`  - Parts: ${data.structure.parts.length}`);
  console.log(`  - Total Sections: ${data.structure.totalSections}`);
  console.log(`\nAgencies: ${data.agencies.length}`);
  console.log(`Projects: ${data.projects.length}`);
  console.log(`Appropriations: ${data.appropriations.length}`);
  console.log(`Grant Projects: ${data.grants.length}`);
  console.log(`Statutory References: ${data.statutoryReferences.length}`);

  console.log('\n=== Fiscal Summary ===');
  console.log(`Total Appropriation: $${formatCurrency(data.fiscalSummary.totalAppropriation)}`);
  console.log(`Total Reappropriation: $${formatCurrency(data.fiscalSummary.totalReappropriation)}`);
  console.log(`Grand Total (Approp + Reapprop): $${formatCurrency(data.fiscalSummary.grandTotal)}`);
  console.log(`Prior Biennia (Expenditures): $${formatCurrency(data.fiscalSummary.totalPriorBiennia)}`);
  console.log(`Future Biennia (Projected): $${formatCurrency(data.fiscalSummary.totalFutureBiennia)}`);

  console.log('\n=== Top 10 Agencies by Total Appropriation ===');
  const topAgencies = Object.entries(data.fiscalSummary.byAgency)
    .map(([code, amounts]) => ({
      code,
      ...amounts,
      name: data.agencies.find(a => a.index === code)?.name || 'Unknown'
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  topAgencies.forEach((agency, i) => {
    console.log(`${i + 1}. ${agency.name} (${agency.code}): $${formatCurrency(agency.total)}`);
  });

  console.log('\n=== Top 10 Funding Accounts ===');
  const topAccounts = Object.entries(data.fiscalSummary.byAccount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topAccounts.forEach(([account, amount], i) => {
    console.log(`${i + 1}. ${account}: $${formatCurrency(amount)}`);
  });

  console.log('\n=== Sample Grant Projects ===');
  data.grants.slice(0, 5).forEach(grant => {
    console.log(`- ${grant.grantee}: $${formatCurrency(grant.amount)} (${grant.program})`);
  });

  // Write JSON output
  console.log(`\nWriting JSON output to: ${outputFile}`);
  fs.writeFileSync(
    outputFile,
    JSON.stringify(data, null, 2),
    'utf-8'
  );

  console.log('✓ Extraction complete!');
  console.log(`\nJSON file size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
}

function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Run the extraction
try {
  main();
} catch (error) {
  console.error('Error during extraction:', error);
  process.exit(1);
}
