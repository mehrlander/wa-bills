#!/usr/bin/env node

/**
 * WA Bills Analysis Script
 * Analyzes all Washington State bills in the repository
 * Extracts structure, appropriations, agencies, and metadata
 */

const fs = require('fs');
const path = require('path');

// Get all bill files
const billFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.xml') || f.endsWith('.htm'))
  .sort();

console.log(`Found ${billFiles.length} bill files`);
console.log('Bill files:', billFiles);

// Group by bill number
const billGroups = {};
billFiles.forEach(file => {
  const billNum = file.replace(/\.(xml|htm)$/, '');
  if (!billGroups[billNum]) {
    billGroups[billNum] = {};
  }
  const format = file.endsWith('.xml') ? 'xml' : 'htm';
  billGroups[billNum][format] = file;
});

console.log('\nBill groups:');
Object.keys(billGroups).sort().forEach(billNum => {
  const formats = Object.keys(billGroups[billNum]).join(', ');
  console.log(`  ${billNum}: ${formats}`);
});

// Analyze each XML file for structure
const results = {
  bills: [],
  totalFiles: billFiles.length,
  billCount: Object.keys(billGroups).length,
  formats: {
    xml: billFiles.filter(f => f.endsWith('.xml')).length,
    htm: billFiles.filter(f => f.endsWith('.htm')).length
  }
};

Object.keys(billGroups).sort().forEach(billNum => {
  console.log(`\n--- Analyzing ${billNum} ---`);

  const billInfo = {
    billNumber: billNum,
    formats: [],
    type: 'unknown',
    sessionLawCaption: null,
    briefDescription: null,
    sponsors: null,
    session: null,
    legislature: null,
    chapterLaw: null,
    effectiveDate: null,
    hasAppropriations: false,
    hasAmendments: false,
    hasTables: false,
    parts: [],
    agencies: [],
    appropriationCount: 0,
    sectionCount: 0,
    fileSize: {}
  };

  // Check formats
  if (billGroups[billNum].xml) {
    billInfo.formats.push('xml');
    const xmlPath = path.join(__dirname, billGroups[billNum].xml);
    billInfo.fileSize.xml = fs.statSync(xmlPath).size;

    // Read and analyze XML
    const content = fs.readFileSync(xmlPath, 'utf-8');

    // Extract metadata
    const sessionLawMatch = content.match(/<SessionLawCaption>(.*?)<\/SessionLawCaption>/s);
    if (sessionLawMatch) {
      billInfo.sessionLawCaption = sessionLawMatch[1].trim();
    }

    const briefMatch = content.match(/<BriefDescription>(.*?)<\/BriefDescription>/s);
    if (briefMatch) {
      billInfo.briefDescription = briefMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const sponsorsMatch = content.match(/<Sponsors>(.*?)<\/Sponsors>/s);
    if (sponsorsMatch) {
      billInfo.sponsors = sponsorsMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
    }

    const sessionMatch = content.match(/<Session>(.*?)<\/Session>/);
    if (sessionMatch) {
      billInfo.session = sessionMatch[1].trim();
    }

    const legislatureMatch = content.match(/<Legislature>(.*?)<\/Legislature>/);
    if (legislatureMatch) {
      billInfo.legislature = legislatureMatch[1].trim();
    }

    const chapterMatch = content.match(/<ChapterLaw year="(\d+)">(\d+)<\/ChapterLaw>/);
    if (chapterMatch) {
      billInfo.chapterLaw = {
        year: chapterMatch[1],
        chapter: chapterMatch[2]
      };
    }

    const effectiveDateMatch = content.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);
    if (effectiveDateMatch) {
      billInfo.effectiveDate = effectiveDateMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // Check for appropriations
    const appropriationMatches = content.match(/<Appropriations agency="([^"]+)">/g);
    if (appropriationMatches) {
      billInfo.hasAppropriations = true;
      billInfo.appropriationCount = appropriationMatches.length;

      // Extract unique agencies
      const agencySet = new Set();
      appropriationMatches.forEach(match => {
        const agencyMatch = match.match(/agency="([^"]+)"/);
        if (agencyMatch) {
          agencySet.add(agencyMatch[1]);
        }
      });
      billInfo.agencies = Array.from(agencySet).sort();
    }

    // Check for amendments
    if (content.includes('amendingStyle="strike"') || content.includes('amendingStyle="add"')) {
      billInfo.hasAmendments = true;
    }

    // Check for tables
    if (content.includes('<Table')) {
      billInfo.hasTables = true;
    }

    // Count sections
    const sectionMatches = content.match(/<BillSection/g);
    if (sectionMatches) {
      billInfo.sectionCount = sectionMatches.length;
    }

    // Extract parts
    const partMatches = content.match(/<Part[^>]*>[\s\S]*?<P>(PART [IVX]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/g);
    if (partMatches) {
      partMatches.forEach(partMatch => {
        const partNumMatch = partMatch.match(/<P>(PART [IVX]+)<\/P>/);
        const partNameMatch = partMatch.match(/<P>(PART [IVX]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/);
        if (partNumMatch && partNameMatch) {
          billInfo.parts.push({
            number: partNumMatch[1],
            name: partNameMatch[2].replace(/<[^>]+>/g, '').trim()
          });
        }
      });
    }

    // Determine bill type
    if (billInfo.hasAppropriations ||
        (billInfo.sessionLawCaption && billInfo.sessionLawCaption.toUpperCase().includes('BUDGET')) ||
        (billInfo.briefDescription && billInfo.briefDescription.toLowerCase().includes('appropriation'))) {
      billInfo.type = 'budget/appropriations';
    } else if (billInfo.hasAmendments && !billInfo.hasAppropriations) {
      billInfo.type = 'policy';
    } else if (billInfo.hasAppropriations && billInfo.hasAmendments) {
      billInfo.type = 'mixed';
    }

    console.log(`  Session Law Caption: ${billInfo.sessionLawCaption}`);
    console.log(`  Type: ${billInfo.type}`);
    console.log(`  Appropriations: ${billInfo.appropriationCount}`);
    console.log(`  Sections: ${billInfo.sectionCount}`);
    console.log(`  Agencies: ${billInfo.agencies.length}`);
  }

  if (billGroups[billNum].htm) {
    billInfo.formats.push('htm');
    const htmPath = path.join(__dirname, billGroups[billNum].htm);
    billInfo.fileSize.htm = fs.statSync(htmPath).size;
  }

  results.bills.push(billInfo);
});

// Summary statistics
console.log('\n\n=== SUMMARY ===');
console.log(`Total bills: ${results.billCount}`);
console.log(`Total files: ${results.totalFiles}`);
console.log(`XML files: ${results.formats.xml}`);
console.log(`HTM files: ${results.formats.htm}`);

const typeCount = {};
results.bills.forEach(bill => {
  typeCount[bill.type] = (typeCount[bill.type] || 0) + 1;
});
console.log('\nBill types:');
Object.keys(typeCount).sort().forEach(type => {
  console.log(`  ${type}: ${typeCount[type]}`);
});

const budgetBills = results.bills.filter(b => b.type === 'budget/appropriations');
console.log(`\nBudget bills (${budgetBills.length}):`);
budgetBills.forEach(bill => {
  console.log(`  ${bill.billNumber}: ${bill.appropriationCount} appropriations, ${bill.agencies.length} agencies`);
  console.log(`    Caption: ${bill.sessionLawCaption}`);
});

// Save results
fs.writeFileSync(
  path.join(__dirname, 'analysis-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n\nResults saved to analysis-results.json');
