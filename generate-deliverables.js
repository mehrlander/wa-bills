#!/usr/bin/env node

/**
 * Generate all deliverables for WA Bills analysis
 */

const fs = require('fs');
const path = require('path');
const lib = require('./extraction-library');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✓ Generated ${filename}`);
}

function main() {
  console.log('WA Bills Analysis - Generating Deliverables\n');

  const billsDir = __dirname;
  const files = fs.readdirSync(billsDir);

  // Get all XML files (prefer XML over HTM when both exist)
  const xmlFiles = files.filter(f => f.endsWith('.xml')).sort();
  const htmFiles = files.filter(f => f.endsWith('.htm')).sort();

  // Process XML files
  const allBills = [];
  const processedBillNumbers = new Set();

  console.log('Processing XML bills...');
  for (const file of xmlFiles) {
    console.log(`  ${file}`);
    const content = readFile(path.join(billsDir, file));
    if (content) {
      const billData = lib.extractBill(content, file);
      allBills.push(billData);
      processedBillNumbers.add(file.replace('.xml', ''));
    }
  }

  // Process HTM files (only those without XML version)
  console.log('\nProcessing HTM bills (unique only)...');
  for (const file of htmFiles) {
    const baseName = file.replace('.htm', '');
    if (processedBillNumbers.has(baseName)) {
      console.log(`  ${file} - skipped (XML version processed)`);
      continue;
    }

    console.log(`  ${file}`);
    const content = readFile(path.join(billsDir, file));
    if (content) {
      const billData = lib.extractBill(content, file);
      allBills.push(billData);
    }
  }

  console.log(`\nTotal bills processed: ${allBills.length}\n`);

  // Generate bills-index.json (metadata only)
  console.log('Generating bills-index.json...');
  const billsIndex = allBills.map(bill => ({
    billNumber: bill.billNumber,
    longBillId: bill.longBillId,
    filename: bill.filename,
    format: bill.format,
    type: bill.type,
    title: bill.title,
    briefDescription: bill.briefDescription,
    sponsors: bill.sponsors,
    session: bill.session,
    legislature: bill.legislature,
    chapterLaw: bill.chapterLaw,
    effectiveDate: bill.effectiveDate,
    passage: bill.passage,
    hasVeto: bill.hasVeto,
    vetoAction: bill.vetoAction,
    agenciesMentioned: bill.agencies ? bill.agencies.map(a => a.name) : [],
    hasFiscalData: bill.fiscal && bill.fiscal.dollarAmounts.length > 0,
    stats: bill.stats,
    keySections: bill.sections ? bill.sections.parts : [],
  }));

  writeJSON('bills-index.json', billsIndex);

  // Generate bills-data.json (all extracted entities)
  console.log('Generating bills-data.json...');
  const entities = lib.extractEntities(allBills);

  // Add summary statistics
  const billsData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalBills: allBills.length,
      budgetBills: allBills.filter(b => b.type === lib.BillType.BUDGET).length,
      policyBills: allBills.filter(b => b.type === lib.BillType.POLICY).length,
      mixedBills: allBills.filter(b => b.type === lib.BillType.MIXED).length,
      totalAgencies: entities.agencies.length,
      totalAppropriations: entities.appropriations.length,
      totalAccounts: entities.accounts.length,
      fiscalYears: entities.fiscalYears,
    },
    bills: entities.bills,
    agencies: entities.agencies,
    appropriations: entities.appropriations,
    accounts: entities.accounts,
    rcwReferences: entities.rcwReferences,
    fullBillData: allBills, // Include full data for comprehensive analysis
  };

  writeJSON('bills-data.json', billsData);

  // Generate summary statistics for the report
  console.log('\n=== SUMMARY STATISTICS ===');
  console.log(`Total Bills: ${allBills.length}`);
  console.log(`  Budget Bills: ${billsData.metadata.budgetBills}`);
  console.log(`  Policy Bills: ${billsData.metadata.policyBills}`);
  console.log(`  Mixed Bills: ${billsData.metadata.mixedBills}`);
  console.log(`Total Agencies: ${entities.agencies.length}`);
  console.log(`Total Appropriations: ${entities.appropriations.length}`);
  console.log(`Total Accounts: ${entities.accounts.length}`);
  console.log(`Fiscal Years: ${entities.fiscalYears.join(', ')}`);
  console.log(`RCW References: ${entities.rcwReferences.length}`);

  // Calculate total appropriations
  const totalApprop = entities.appropriations.reduce((sum, a) => sum + a.numericAmount, 0);
  console.log(`Total Appropriations Amount: $${totalApprop.toLocaleString()}`);

  // Top agencies by bill appearances
  console.log('\nTop 10 Agencies by Bill Appearances:');
  const topAgencies = entities.agencies
    .sort((a, b) => b.billsAppearingIn.length - a.billsAppearingIn.length)
    .slice(0, 10);

  topAgencies.forEach((agency, i) => {
    console.log(`  ${i + 1}. ${agency.name} (${agency.billsAppearingIn.length} bills)`);
  });

  // Top accounts by total amount
  console.log('\nTop 10 Accounts by Total Appropriations:');
  const topAccounts = entities.accounts
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  topAccounts.forEach((account, i) => {
    console.log(`  ${i + 1}. ${account.account}: $${account.totalAmount.toLocaleString()} (${account.occurrences} appropriations)`);
  });

  // Analysis by bill type
  console.log('\n=== BILL TYPE ANALYSIS ===');
  const budgetBills = allBills.filter(b => b.type === lib.BillType.BUDGET);
  const policyBills = allBills.filter(b => b.type === lib.BillType.POLICY);

  console.log('\nBudget Bills:');
  budgetBills.forEach(bill => {
    console.log(`  ${bill.billNumber}: ${bill.stats.appropriationCount} appropriations, ${bill.stats.agencyCount} agencies`);
  });

  console.log('\nPolicy Bills:');
  policyBills.forEach(bill => {
    console.log(`  ${bill.billNumber}: ${bill.title ? bill.title.substring(0, 80) + '...' : 'No title'}`);
  });

  // Structural analysis
  console.log('\n=== STRUCTURAL ANALYSIS ===');
  console.log('\nXML Structure Elements (occurrence in bills):');
  const xmlBills = allBills.filter(b => b.format === lib.FormatType.XML);
  const structureStats = {};

  xmlBills.forEach(bill => {
    if (bill.structure && bill.structure.elements) {
      Object.entries(bill.structure.elements).forEach(([key, value]) => {
        if (value) {
          structureStats[key] = (structureStats[key] || 0) + 1;
        }
      });
    }
  });

  Object.entries(structureStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([element, count]) => {
      console.log(`  ${element}: ${count}/${xmlBills.length} bills`);
    });

  console.log('\n✓ All deliverables generated successfully!');
}

main();
