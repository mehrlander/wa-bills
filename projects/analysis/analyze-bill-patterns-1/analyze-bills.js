#!/usr/bin/env node

/**
 * Washington State Bill Analysis Tool
 * Analyzes XML and HTM bill files to extract structure, patterns, and data
 */

const fs = require('fs');
const path = require('path');

// Utility to read file with error handling
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Extract basic metadata from XML bills
function extractXMLMetadata(content, filename) {
  const metadata = {
    filename,
    format: 'xml',
    billNumber: filename.replace('.xml', ''),
    type: 'unknown',
    agencies: new Set(),
    hasFiscalData: false,
    sections: [],
    appropriations: [],
    dollarAmounts: [],
    sponsors: null,
    title: null,
    session: null,
    chapterLaw: null,
    effectiveDate: null,
  };

  // Extract bill number
  const shortBillMatch = content.match(/<ShortBillId>(.*?)<\/ShortBillId>/);
  if (shortBillMatch) metadata.billNumber = shortBillMatch[1];

  const longBillMatch = content.match(/<LongBillId>(.*?)<\/LongBillId>/);
  if (longBillMatch) metadata.longBillId = longBillMatch[1];

  // Extract title
  const titleMatch = content.match(/<BillTitle>(.*?)<\/BillTitle>/s);
  if (titleMatch) {
    metadata.title = titleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract brief description
  const briefMatch = content.match(/<BriefDescription>(.*?)<\/BriefDescription>/s);
  if (briefMatch) {
    metadata.briefDescription = briefMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract sponsors
  const sponsorMatch = content.match(/<Sponsors>(.*?)<\/Sponsors>/s);
  if (sponsorMatch) {
    metadata.sponsors = sponsorMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  }

  // Extract session
  const sessionMatch = content.match(/<Session>(.*?)<\/Session>/);
  if (sessionMatch) metadata.session = sessionMatch[1];

  // Extract chapter law
  const chapterMatch = content.match(/<ChapterLaw year="(\d+)">(.*?)<\/ChapterLaw>/);
  if (chapterMatch) {
    metadata.chapterLaw = { year: chapterMatch[1], chapter: chapterMatch[2] };
  }

  // Extract effective date
  const effectiveMatch = content.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);
  if (effectiveMatch) {
    metadata.effectiveDate = effectiveMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Detect budget bill - look for appropriations
  const appropriationMatches = content.match(/<Appropriation>/g);
  if (appropriationMatches && appropriationMatches.length > 10) {
    metadata.type = 'budget';
  } else if (appropriationMatches && appropriationMatches.length > 0) {
    metadata.type = 'mixed';
  } else {
    metadata.type = 'policy';
  }

  // Extract appropriations
  const appropRegex = /<Appropriation>.*?<AccountName>.*?<BudgetP[^>]*>(.*?)<\/BudgetP>.*?<\/AccountName>.*?<DollarAmount>\$([\d,]+)<\/DollarAmount>.*?<\/Appropriation>/gs;
  let appropMatch;
  while ((appropMatch = appropRegex.exec(content)) !== null) {
    metadata.appropriations.push({
      account: appropMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
      amount: appropMatch[2],
    });
  }

  // Extract all dollar amounts
  const dollarRegex = /\$(\d{1,3}(?:,\d{3})*)/g;
  let dollarMatch;
  while ((dollarMatch = dollarRegex.exec(content)) !== null) {
    metadata.dollarAmounts.push(dollarMatch[1]);
  }

  metadata.hasFiscalData = metadata.dollarAmounts.length > 0;

  // Extract department/agency names
  const deptRegex = /<Department>.*?<DeptName>.*?<P>(.*?)<\/P>.*?<\/DeptName>.*?<\/Department>/gs;
  let deptMatch;
  while ((deptMatch = deptRegex.exec(content)) !== null) {
    const agency = deptMatch[1].replace(/<[^>]+>/g, '').replace(/FOR THE /g, '').trim();
    if (agency) metadata.agencies.add(agency);
  }

  // Extract section numbers
  const sectionRegex = /<BillSection[^>]*>.*?<BillSectionNumber>.*?<Value[^>]*>(\d+)<\/Value>/gs;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    metadata.sections.push(parseInt(sectionMatch[1]));
  }

  // Look for fiscal notes
  metadata.hasFiscalNote = content.includes('fiscal') || content.includes('Fiscal');

  // Structural elements
  metadata.structure = {
    hasCertificate: content.includes('<EnrollingCertificate'),
    hasBillHeading: content.includes('<BillHeading'),
    hasBillBody: content.includes('<BillBody'),
    hasBillTitle: content.includes('<BillTitle'),
    hasParts: content.includes('<Part'),
    hasAppropriations: content.includes('<Appropriations'),
    hasAmendments: content.includes('amendingStyle="strike"') || content.includes('amendingStyle="add"'),
    hasTables: content.includes('<Table'),
  };

  metadata.agencies = Array.from(metadata.agencies);

  return metadata;
}

// Extract basic metadata from HTM bills
function extractHTMMetadata(content, filename) {
  const metadata = {
    filename,
    format: 'htm',
    billNumber: filename.replace('.htm', ''),
    type: 'unknown',
    agencies: new Set(),
    hasFiscalData: false,
    sections: [],
    appropriations: [],
    dollarAmounts: [],
    sponsors: null,
    title: null,
    session: null,
  };

  // HTM files contain similar content but in HTML format
  // Extract title from <title> tag or main heading
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Look for bill number in various places
  const billNumMatch = content.match(/(?:HOUSE|SENATE)\s+BILL\s+(\d+(?:-[A-Z]\d*)?)/i);
  if (billNumMatch) metadata.billNumber = billNumMatch[0];

  // Extract all dollar amounts
  const dollarRegex = /\$(\d{1,3}(?:,\d{3})*)/g;
  let dollarMatch;
  while ((dollarMatch = dollarRegex.exec(content)) !== null) {
    metadata.dollarAmounts.push(dollarMatch[1]);
  }

  metadata.hasFiscalData = metadata.dollarAmounts.length > 0;

  // Detect budget bill
  if (metadata.dollarAmounts.length > 50) {
    metadata.type = 'budget';
  } else if (metadata.dollarAmounts.length > 5) {
    metadata.type = 'mixed';
  } else {
    metadata.type = 'policy';
  }

  // Structural elements
  metadata.structure = {
    hasHTMLStructure: content.includes('<!DOCTYPE') || content.includes('<html'),
    hasTables: /<table/i.test(content),
    hasStrikethrough: /<strike/i.test(content) || /<del/i.test(content),
    hasInserts: /<ins/i.test(content),
    hasStyles: /<style/i.test(content),
  };

  metadata.agencies = Array.from(metadata.agencies);

  return metadata;
}

// Main analysis function
function analyzeBills() {
  const billsDir = __dirname;
  const files = fs.readdirSync(billsDir);

  const xmlFiles = files.filter(f => f.endsWith('.xml')).sort();
  const htmFiles = files.filter(f => f.endsWith('.htm')).sort();

  console.log(`Found ${xmlFiles.length} XML files and ${htmFiles.length} HTM files`);

  const billsData = [];

  // Analyze XML files
  for (const file of xmlFiles) {
    console.log(`\nAnalyzing ${file}...`);
    const content = readFile(path.join(billsDir, file));
    if (content) {
      const metadata = extractXMLMetadata(content, file);
      billsData.push(metadata);
      console.log(`  Type: ${metadata.type}`);
      console.log(`  Agencies: ${metadata.agencies.length}`);
      console.log(`  Appropriations: ${metadata.appropriations.length}`);
      console.log(`  Dollar amounts: ${metadata.dollarAmounts.length}`);
      console.log(`  Sections: ${metadata.sections.length}`);
    }
  }

  // Analyze HTM files
  for (const file of htmFiles) {
    // Skip if we already have XML version
    const xmlVersion = file.replace('.htm', '.xml');
    if (xmlFiles.includes(xmlVersion)) {
      console.log(`\nSkipping ${file} (XML version analyzed)`);
      continue;
    }

    console.log(`\nAnalyzing ${file}...`);
    const content = readFile(path.join(billsDir, file));
    if (content) {
      const metadata = extractHTMMetadata(content, file);
      billsData.push(metadata);
      console.log(`  Type: ${metadata.type}`);
      console.log(`  Dollar amounts: ${metadata.dollarAmounts.length}`);
    }
  }

  return billsData;
}

// Run analysis
const billsData = analyzeBills();

// Write preliminary results
fs.writeFileSync(
  path.join(__dirname, 'bills-analysis-preliminary.json'),
  JSON.stringify(billsData, null, 2)
);

console.log('\n=== SUMMARY ===');
console.log(`Total bills analyzed: ${billsData.length}`);
console.log(`Budget bills: ${billsData.filter(b => b.type === 'budget').length}`);
console.log(`Policy bills: ${billsData.filter(b => b.type === 'policy').length}`);
console.log(`Mixed bills: ${billsData.filter(b => b.type === 'mixed').length}`);
console.log(`\nPreliminary analysis written to bills-analysis-preliminary.json`);
