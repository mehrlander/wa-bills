#!/usr/bin/env node

/**
 * Extract All Bills Script
 * Processes all WA bills and generates index and data files
 */

const fs = require('fs');
const path = require('path');
const lib = require('./extraction-library');

console.log('WA Bills Extraction System');
console.log('==========================\n');

// Find all XML bill files
const billFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.xml'))
  .sort();

console.log(`Found ${billFiles.length} XML bill files\n`);

// Parse all bills
const allBills = [];
const allEntities = {
  bills: [],
  appropriations: [],
  sections: [],
  parts: [],
  agencies: [],
  departments: new Set(),
  agencyCodes: new Set(),
  rcwReferences: [],
  billReferences: []
};

billFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  console.log(`[${index + 1}/${billFiles.length}] Processing ${file}...`);

  try {
    const billData = lib.parseXMLBill(filePath);
    allBills.push(billData);

    // Extract entities
    const entities = lib.extractAllEntities(billData);

    // Add to master entity lists
    allEntities.bills.push(entities.bill);
    allEntities.appropriations.push(...entities.appropriations);
    allEntities.sections.push(...entities.sections);
    allEntities.parts.push(...entities.parts);
    allEntities.rcwReferences.push(...entities.crossReferences.rcw);
    allEntities.billReferences.push(...entities.crossReferences.bills);

    // Track unique agencies and departments
    billData.agencies.agencyCodes.forEach(code => allEntities.agencyCodes.add(code));
    billData.agencies.departmentNames.forEach(name => allEntities.departments.add(name));

    const summary = lib.getBillSummary(billData);
    console.log(`  Type: ${summary.type}`);
    console.log(`  Sections: ${summary.sections}`);
    console.log(`  Appropriations: ${summary.appropriations}`);
    if (summary.totalAmount > 0) {
      console.log(`  Total Amount: $${summary.totalAmount.toLocaleString()}`);
    }
    console.log(`  Agencies: ${summary.agencies}`);
    console.log('');

  } catch (error) {
    console.error(`  ERROR: ${error.message}`);
    console.log('');
  }
});

// Generate bills-index.json
console.log('\nGenerating bills-index.json...');
const billsIndex = allBills.map(bill => {
  const summary = lib.getBillSummary(bill);

  return {
    billNumber: bill.billNumber,
    type: bill.type,
    sessionLawCaption: bill.metadata.sessionLawCaption,
    briefDescription: bill.metadata.briefDescription,
    session: bill.metadata.session,
    legislature: bill.metadata.legislature,
    chapterLaw: bill.metadata.chapterLaw,
    sponsors: bill.metadata.sponsors,

    // Structure info
    sections: bill.sections.length,
    parts: bill.parts.map(p => ({ number: p.number, name: p.name })),

    // Budget info
    hasAppropriations: bill.appropriations.length > 0,
    appropriationCount: bill.appropriations.length,
    agencyCodes: bill.agencies.agencyCodes,
    agencyCount: bill.agencies.agencyCodes.length,
    departmentCount: bill.agencies.departmentNames.length,
    totalAppropriationAmount: bill.appropriations
      .filter(a => a.isTotal)
      .reduce((sum, a) => sum + (a.amount || 0), 0),

    // Amendment info
    hasAmendments: bill.amendments.hasAmendments,
    amendmentStats: {
      strikeCount: bill.amendments.strikeCount,
      addCount: bill.amendments.addCount
    },

    // Fiscal info
    hasFiscalData: bill.fiscalNotes.hasFiscalImpact,
    fiscalYears: bill.fiscalNotes.fiscalYears,

    // Cross-references
    rcwReferences: bill.crossReferences.rcw.length,
    billReferences: bill.crossReferences.bills.length,

    // Key sections (sections with appropriations or special attributes)
    keySections: bill.sections
      .filter(s => s.hasAppropriations || s.veto)
      .map(s => ({
        sectionNumber: s.sectionNumber,
        type: s.type,
        caption: s.caption,
        hasAppropriations: s.hasAppropriations,
        veto: s.veto
      }))
      .slice(0, 50), // Limit to first 50 key sections

    // Metadata
    fileSize: bill.fileSize,
    effectiveDate: bill.metadata.effectiveDate,
    hasVeto: bill.metadata.hasVeto,
    vetoType: bill.metadata.vetoType,
    passage: bill.metadata.passage
  };
});

fs.writeFileSync(
  path.join(__dirname, 'bills-index.json'),
  JSON.stringify(billsIndex, null, 2)
);
console.log(`✓ Generated bills-index.json (${billsIndex.length} bills)`);

// Generate bills-data.json with all entities
console.log('\nGenerating bills-data.json...');

// Convert Sets to Arrays for JSON serialization
allEntities.agencyCodes = Array.from(allEntities.agencyCodes).sort();
allEntities.departments = Array.from(allEntities.departments).sort();

// Add summary statistics
const billsData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    billCount: allBills.length,
    totalSections: allEntities.sections.length,
    totalAppropriations: allEntities.appropriations.length,
    totalAgencies: allEntities.agencyCodes.length,
    totalDepartments: allEntities.departments.length,
    billTypes: {}
  },

  // Normalized entities
  bills: allEntities.bills,
  appropriations: allEntities.appropriations,
  sections: allEntities.sections,
  parts: allEntities.parts,

  // Lookup lists
  agencies: {
    codes: allEntities.agencyCodes,
    departments: allEntities.departments
  },

  // Cross-references
  crossReferences: {
    rcw: allEntities.rcwReferences,
    bills: allEntities.billReferences
  },

  // Aggregate data for querying
  aggregates: {
    totalAppropriationAmount: allEntities.appropriations
      .filter(a => !a.isTotal)
      .reduce((sum, a) => sum + (a.amount || 0), 0),

    totalAppropriationByType: {},

    appropriationsByAgency: {},

    appropriationsByAccount: {},

    billsByType: {},

    sectionsByType: {}
  }
};

// Calculate bill type counts
allBills.forEach(bill => {
  billsData.metadata.billTypes[bill.type] = (billsData.metadata.billTypes[bill.type] || 0) + 1;
  billsData.aggregates.billsByType[bill.type] = (billsData.aggregates.billsByType[bill.type] || 0) + 1;
});

// Calculate aggregates
allEntities.appropriations.forEach(approp => {
  if (!approp.isTotal && approp.amount) {
    // By agency
    if (!billsData.aggregates.appropriationsByAgency[approp.agencyCode]) {
      billsData.aggregates.appropriationsByAgency[approp.agencyCode] = {
        agencyCode: approp.agencyCode,
        departmentName: approp.departmentName,
        totalAmount: 0,
        count: 0
      };
    }
    billsData.aggregates.appropriationsByAgency[approp.agencyCode].totalAmount += approp.amount;
    billsData.aggregates.appropriationsByAgency[approp.agencyCode].count++;

    // By account type
    const accountKey = approp.accountName.split('—')[0].trim(); // Get account type before dash
    if (!billsData.aggregates.appropriationsByAccount[accountKey]) {
      billsData.aggregates.appropriationsByAccount[accountKey] = {
        accountType: accountKey,
        totalAmount: 0,
        count: 0
      };
    }
    billsData.aggregates.appropriationsByAccount[accountKey].totalAmount += approp.amount;
    billsData.aggregates.appropriationsByAccount[accountKey].count++;
  }
});

// Convert objects to arrays for easier querying
billsData.aggregates.appropriationsByAgency = Object.values(billsData.aggregates.appropriationsByAgency)
  .sort((a, b) => b.totalAmount - a.totalAmount);

billsData.aggregates.appropriationsByAccount = Object.values(billsData.aggregates.appropriationsByAccount)
  .sort((a, b) => b.totalAmount - a.totalAmount);

allEntities.sections.forEach(section => {
  const type = section.type || 'unknown';
  billsData.aggregates.sectionsByType[type] = (billsData.aggregates.sectionsByType[type] || 0) + 1;
});

fs.writeFileSync(
  path.join(__dirname, 'bills-data.json'),
  JSON.stringify(billsData, null, 2)
);
console.log(`✓ Generated bills-data.json`);

// Print summary statistics
console.log('\n=== EXTRACTION SUMMARY ===');
console.log(`\nBills processed: ${allBills.length}`);
console.log(`\nBill types:`);
Object.keys(billsData.metadata.billTypes).sort().forEach(type => {
  console.log(`  ${type}: ${billsData.metadata.billTypes[type]}`);
});
console.log(`\nTotal sections: ${allEntities.sections.length}`);
console.log(`Total appropriations: ${allEntities.appropriations.length}`);
console.log(`Total agencies: ${allEntities.agencyCodes.length}`);
console.log(`Total departments: ${allEntities.departments.length}`);
console.log(`\nTotal appropriation amount: $${billsData.aggregates.totalAppropriationAmount.toLocaleString()}`);

console.log(`\nTop 10 agencies by appropriation amount:`);
billsData.aggregates.appropriationsByAgency.slice(0, 10).forEach((agency, i) => {
  console.log(`  ${i + 1}. ${agency.departmentName || agency.agencyCode}: $${agency.totalAmount.toLocaleString()} (${agency.count} appropriations)`);
});

console.log('\n✓ Extraction complete!');
