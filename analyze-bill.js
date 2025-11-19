#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and analyze the XML file
const xmlPath = process.argv[2] || './5167-S.xml';
const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

// Parse XML to extract key structure information
const analysis = {
  billType: null,
  structure: {},
  entities: {
    agencies: [],
    appropriations: [],
    sections: [],
    dates: [],
    rcwReferences: [],
    vetoedSections: []
  },
  stats: {}
};

// Extract bill metadata
const billIdMatch = xmlContent.match(/<ShortBillId>(.*?)<\/ShortBillId>/);
const longBillIdMatch = xmlContent.match(/<LongBillId>(.*?)<\/LongBillId>/);
const briefDescMatch = xmlContent.match(/<BriefDescription>(.*?)<\/BriefDescription>/);
const chapterMatch = xmlContent.match(/<ChapterLaw[^>]*>(\d+)<\/ChapterLaw>/);
const effectiveDateMatch = xmlContent.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);

analysis.billType = {
  shortId: billIdMatch ? billIdMatch[1] : null,
  longId: longBillIdMatch ? longBillIdMatch[1] : null,
  description: briefDescMatch ? briefDescMatch[1] : null,
  chapterLaw: chapterMatch ? chapterMatch[1] : null,
  type: 'Operating Budget Bill (Biennial Appropriations)'
};

// Extract effective date
if (effectiveDateMatch) {
  const dateText = effectiveDateMatch[1].replace(/<[^>]+>/g, '').trim();
  analysis.entities.dates.push({
    type: 'effective_date',
    value: dateText
  });
}

// Count bill sections
const sectionMatches = xmlContent.match(/<BillSection[^>]*>/g) || [];
analysis.stats.totalSections = sectionMatches.length;

// Count vetoed sections
const vetoMatches = xmlContent.match(/<BillSection[^>]*veto="[^"]*"/g) || [];
analysis.stats.vetoedSections = vetoMatches.length;

// Extract section numbers and agencies
const sectionPattern = /<BillSection[^>]*>[\s\S]*?<BillSectionNumber>[\s\S]*?<Value[^>]*>(.*?)<\/Value>[\s\S]*?<\/BillSectionNumber>[\s\S]*?(?:<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>[\s\S]*?<\/DeptName>[\s\S]*?<\/Department>)?[\s\S]*?(?:<Appropriations[^>]*agency="(\d+)"[\s\S]*?<\/Appropriations>)?/g;

let match;
let sectionNum = 0;
while ((match = sectionPattern.exec(xmlContent)) !== null && sectionNum < 50) {
  const secNum = match[1];
  const deptName = match[2] ? match[2].replace(/\s+/g, ' ').trim() : null;
  const agencyCode = match[3];

  if (deptName) {
    analysis.entities.sections.push({
      sectionNumber: secNum,
      agency: deptName,
      agencyCode: agencyCode
    });

    if (!analysis.entities.agencies.find(a => a.name === deptName)) {
      analysis.entities.agencies.push({
        name: deptName,
        code: agencyCode,
        sections: [secNum]
      });
    }
  }
  sectionNum++;
}

// Extract appropriations with amounts
const appropPattern = /<Appropriation>[\s\S]*?<AccountName>[\s\S]*?<BudgetP[^>]*>(.*?)<\/BudgetP>[\s\S]*?<\/AccountName>[\s\S]*?<DollarAmount>(.*?)<\/DollarAmount>[\s\S]*?<\/Appropriation>/g;

let appropMatch;
let appropCount = 0;
while ((appropMatch = appropPattern.exec(xmlContent)) !== null && appropCount < 100) {
  const accountName = appropMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const amount = appropMatch[2].replace(/[$,]/g, '');

  analysis.entities.appropriations.push({
    account: accountName,
    amount: parseInt(amount, 10)
  });
  appropCount++;
}

// Extract RCW references
const rcwPattern = /RCW\s+([\d\.]+)/g;
const rcwSet = new Set();
while ((match = rcwPattern.exec(xmlContent)) !== null) {
  rcwSet.add(match[1]);
}
analysis.entities.rcwReferences = Array.from(rcwSet).sort().slice(0, 50);

// Calculate appropriation statistics
if (analysis.entities.appropriations.length > 0) {
  const amounts = analysis.entities.appropriations.map(a => a.amount);
  analysis.stats.appropriations = {
    count: analysis.entities.appropriations.length,
    total: amounts.reduce((sum, amt) => sum + amt, 0),
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    average: Math.floor(amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length)
  };
}

// Extract parts structure
const partMatches = xmlContent.match(/<Part[^>]*>[\s\S]*?<P>(PART [IVXLCDM]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/g) || [];
analysis.structure.parts = partMatches.slice(0, 10).map(p => {
  const partMatch = p.match(/<P>(PART [IVXLCDM]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/);
  return partMatch ? `${partMatch[1]}: ${partMatch[2]}` : null;
}).filter(Boolean);

analysis.stats.totalAgencies = analysis.entities.agencies.length;
analysis.stats.rcwReferencesCount = analysis.entities.rcwReferences.length;

// Output analysis
console.log(JSON.stringify(analysis, null, 2));
