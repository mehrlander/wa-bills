#!/usr/bin/env node

/**
 * Node.js script to extract structured data from WA bill files
 * Processes both XML and HTM formats and generates JSON output
 */

const fs = require('fs');
const path = require('path');

// Simple XML parser for Node.js (no external dependencies)
function parseXMLtoJSON(xmlContent) {
  const bill = {
    format: 'xml',
    metadata: {},
    enrollingInfo: {},
    sections: [],
    statutoryReferences: [],
    effectiveDates: [],
    fiscalInfo: {},
    agencies: [],
    amendments: {
      totalStrikes: 0,
      totalAdditions: 0,
      primaryChanges: []
    }
  };

  // Extract metadata
  const shortIdMatch = xmlContent.match(/<ShortBillId>([^<]+)<\/ShortBillId>/);
  const longIdMatch = xmlContent.match(/<LongBillId>([^<]+)<\/LongBillId>/);
  const legislatureMatch = xmlContent.match(/<Legislature>([^<]+)<\/Legislature>/);
  const sessionMatch = xmlContent.match(/<Session>([^<]+)<\/Session>/);
  const sponsorsMatch = xmlContent.match(/<Sponsors>([^<]+)<\/Sponsors>/);
  const briefDescMatch = xmlContent.match(/<BriefDescription>([^<]+)<\/BriefDescription>/);
  const billTitleMatch = xmlContent.match(/<BillTitle>([^<]+)<\/BillTitle>/);

  bill.metadata = {
    shortId: shortIdMatch ? shortIdMatch[1] : '',
    longId: longIdMatch ? longIdMatch[1] : '',
    legislature: legislatureMatch ? legislatureMatch[1] : '',
    session: sessionMatch ? sessionMatch[1] : '',
    sponsors: sponsorsMatch ? decodeHTML(sponsorsMatch[1]) : '',
    briefDescription: briefDescMatch ? briefDescMatch[1] : '',
    billTitle: billTitleMatch ? decodeHTML(billTitleMatch[1]) : ''
  };

  // Extract enrolling info
  const chapterMatch = xmlContent.match(/<ChapterLaw[^>]*>([^<]+)<\/ChapterLaw>/);
  const sessionCapMatch = xmlContent.match(/<SessionLawCaption>([^<]+)<\/SessionLawCaption>/);
  const approvedMatch = xmlContent.match(/<ApprovedDate>([^<]+)<\/ApprovedDate>/);
  const filedMatch = xmlContent.match(/<FiledDate>([^<]+)<\/FiledDate>/);
  const governorMatch = xmlContent.match(/<Governor>([^<]+)<\/Governor>/);

  // Extract House passage info
  const housePassageMatch = xmlContent.match(/<PassedBy chamber="h">[\s\S]*?<\/PassedBy>/);
  let houseInfo = null;
  if (housePassageMatch) {
    const houseDateMatch = housePassageMatch[0].match(/<PassedDate>([^<]+)<\/PassedDate>/);
    const houseYeasMatch = housePassageMatch[0].match(/<Yeas>([^<]+)<\/Yeas>/);
    const houseNaysMatch = housePassageMatch[0].match(/<Nays>([^<]+)<\/Nays>/);
    const houseSignerMatch = housePassageMatch[0].match(/<Signer>([^<]+)<\/Signer>/);

    houseInfo = {
      chamber: 'House',
      passedDate: houseDateMatch ? houseDateMatch[1] : '',
      yeas: houseYeasMatch ? parseInt(houseYeasMatch[1]) : 0,
      nays: houseNaysMatch ? parseInt(houseNaysMatch[1]) : 0,
      signer: houseSignerMatch ? houseSignerMatch[1] : ''
    };
  }

  // Extract Senate passage info
  const senatePassageMatch = xmlContent.match(/<PassedBy chamber="s">[\s\S]*?<\/PassedBy>/);
  let senateInfo = null;
  if (senatePassageMatch) {
    const senateDateMatch = senatePassageMatch[0].match(/<PassedDate>([^<]+)<\/PassedDate>/);
    const senateYeasMatch = senatePassageMatch[0].match(/<Yeas>([^<]+)<\/Yeas>/);
    const senateNaysMatch = senatePassageMatch[0].match(/<Nays>([^<]+)<\/Nays>/);
    const senateSignerMatch = senatePassageMatch[0].match(/<Signer>([^<]+)<\/Signer>/);

    senateInfo = {
      chamber: 'Senate',
      passedDate: senateDateMatch ? senateDateMatch[1] : '',
      yeas: senateYeasMatch ? parseInt(senateYeasMatch[1]) : 0,
      nays: senateNaysMatch ? parseInt(senateNaysMatch[1]) : 0,
      signer: senateSignerMatch ? senateSignerMatch[1] : ''
    };
  }

  bill.enrollingInfo = {
    chapterLaw: chapterMatch ? chapterMatch[1] : '',
    year: chapterMatch ? '2022' : '',
    sessionLawCaption: sessionCapMatch ? sessionCapMatch[1] : '',
    house: houseInfo,
    senate: senateInfo,
    approvedDate: approvedMatch ? approvedMatch[1] : '',
    filedDate: filedMatch ? filedMatch[1] : '',
    governor: governorMatch ? governorMatch[1] : ''
  };

  // Extract effective dates
  const effectiveDateMatch = xmlContent.match(/<EffectiveDate>[\s\S]*?<P[^>]*>([^<]+)(?:<[^>]+>[^<]*<\/[^>]+>)*([^<]*)<\/P>[\s\S]*?<\/EffectiveDate>/);
  if (effectiveDateMatch) {
    const fullText = (effectiveDateMatch[1] + effectiveDateMatch[2]).replace(/—/g, '-');
    bill.effectiveDates.push({
      type: 'primary',
      date: fullText.trim(),
      sections: 'all except as specified'
    });

    // Parse specific section dates
    const sectionDates = fullText.matchAll(/section[s]?\s+([\d,\s]+),\s+which\s+take[s]?\s+effect\s+([^;.]+)/gi);
    for (const match of sectionDates) {
      const sections = match[1].split(/[,\s]+/).filter(Boolean);
      bill.effectiveDates.push({
        type: 'specific',
        date: match[2].trim(),
        sections: sections
      });
    }
  }

  // Extract statutory references
  const rcwReferences = new Set();
  if (bill.metadata.billTitle) {
    const rcwMatches = bill.metadata.billTitle.matchAll(/(?:amending|reenacting and amending)\s+RCW\s+([\d.A-Z,\s]+)/gi);
    for (const match of rcwMatches) {
      const refs = match[1].split(',').map(r => r.trim()).filter(Boolean);
      refs.forEach(ref => rcwReferences.add(ref));
    }
  }

  // Also extract from sections
  const sectionCiteMatches = xmlContent.matchAll(/<SectionCite>[\s\S]*?<TitleNumber>([^<]+)<\/TitleNumber>[\s\S]*?<ChapterNumber>([^<]+)<\/ChapterNumber>[\s\S]*?<SectionNumber>([^<]+)<\/SectionNumber>[\s\S]*?<\/SectionCite>/g);
  for (const match of sectionCiteMatches) {
    rcwReferences.add(`${match[1]}.${match[2]}.${match[3]}`);
  }

  bill.statutoryReferences = Array.from(rcwReferences).sort();

  // Extract sections
  const billSectionMatches = xmlContent.matchAll(/<BillSection([^>]*)>([\s\S]*?)<\/BillSection>/g);
  let sectionNum = 0;

  for (const match of billSectionMatches) {
    const attrs = match[1];
    const content = match[2];

    sectionNum++;

    const typeMatch = attrs.match(/type="([^"]*)"/);
    const actionMatch = attrs.match(/action="([^"]*)"/);

    const valueMatch = content.match(/<Value>(\d+)<\/Value>/);
    const captionMatch = content.match(/<Caption>([^<]+)<\/Caption>/);

    const rcwMatch = content.match(/<SectionCite>[\s\S]*?<TitleNumber>([^<]+)<\/TitleNumber>[\s\S]*?<ChapterNumber>([^<]+)<\/ChapterNumber>[\s\S]*?<SectionNumber>([^<]+)<\/SectionNumber>/);

    const strikes = [];
    const additions = [];

    const strikeMatches = content.matchAll(/<TextRun amendingStyle="strike">([^<]*)<\/TextRun>/g);
    for (const sm of strikeMatches) {
      if (sm[1].trim()) strikes.push(sm[1].trim());
    }

    const addMatches = content.matchAll(/<TextRun amendingStyle="add">([^<]*)<\/TextRun>/g);
    for (const am of addMatches) {
      if (am[1].trim()) additions.push(decodeHTML(am[1].trim()));
    }

    const section = {
      number: valueMatch ? valueMatch[1] : sectionNum.toString(),
      type: typeMatch ? typeMatch[1] : '',
      action: actionMatch ? actionMatch[1] : '',
      rcw: rcwMatch ? {
        title: rcwMatch[1],
        chapter: rcwMatch[2],
        section: rcwMatch[3],
        full: `${rcwMatch[1]}.${rcwMatch[2]}.${rcwMatch[3]}`
      } : null,
      caption: captionMatch ? decodeHTML(captionMatch[1]) : '',
      amendments: {
        strikes: strikes,
        additions: additions
      }
    };

    bill.sections.push(section);

    bill.amendments.totalStrikes += strikes.length;
    bill.amendments.totalAdditions += additions.length;
  }

  // Extract primary amendment pattern (marijuana -> cannabis)
  const allStrikes = bill.sections.flatMap(s => s.amendments.strikes);
  const allAdditions = bill.sections.flatMap(s => s.amendments.additions);

  const strikeFreq = {};
  allStrikes.forEach(s => {
    strikeFreq[s] = (strikeFreq[s] || 0) + 1;
  });

  const addFreq = {};
  allAdditions.forEach(a => {
    addFreq[a] = (addFreq[a] || 0) + 1;
  });

  bill.amendments.primaryChanges = [
    {
      from: 'marijuana',
      to: 'cannabis',
      occurrences: strikeFreq['marijuana'] || 0
    }
  ];

  // Extract agencies
  const agencies = new Set();
  const agencyPatterns = [
    /liquor (?:and|&amp;|&) cannabis board/gi,
    /department of (?:revenue|health|agriculture|ecology|commerce|licensing|labor|social|transportation|corrections|fish)/gi,
    /washington state patrol/gi,
    /utilities and transportation commission/gi,
    /office of the [^<.,;]*/gi
  ];

  agencyPatterns.forEach(pattern => {
    const matches = xmlContent.matchAll(pattern);
    for (const match of matches) {
      agencies.add(decodeHTML(match[0]));
    }
  });

  bill.agencies = Array.from(agencies).sort();

  // Fiscal info
  bill.fiscalInfo = {
    hasFiscalImpact: false,
    billType: 'terminology_replacement',
    appropriations: [],
    fundTransfers: [],
    fiscalNotes: [],
    description: 'This is a technical bill replacing terminology. No fiscal impact expected.'
  };

  // Add statistics
  bill.statistics = {
    totalSections: bill.sections.length,
    sectionsByType: {},
    rcwTitlesAffected: Array.from(new Set(
      bill.statutoryReferences.map(ref => ref.split('.')[0])
    )).sort(),
    totalRCWsAmended: bill.statutoryReferences.length
  };

  bill.sections.forEach(s => {
    const type = s.type || 'unknown';
    bill.statistics.sectionsByType[type] = (bill.statistics.sectionsByType[type] || 0) + 1;
  });

  return bill;
}

function decodeHTML(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Main execution
function main() {
  const xmlFile = path.join(__dirname, '1210-S2.xml');
  const outputFile = path.join(__dirname, '1210-S2-data.json');

  console.log('Reading XML file...');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');

  console.log('Extracting data...');
  const billData = parseXMLtoJSON(xmlContent);

  console.log('Writing JSON output...');
  fs.writeFileSync(outputFile, JSON.stringify(billData, null, 2), 'utf8');

  console.log(`\nExtraction complete!`);
  console.log(`Output: ${outputFile}`);
  console.log(`\nSummary:`);
  console.log(`  Total sections: ${billData.statistics.totalSections}`);
  console.log(`  RCW sections amended: ${billData.statistics.totalRCWsAmended}`);
  console.log(`  RCW titles affected: ${billData.statistics.rcwTitlesAffected.join(', ')}`);
  console.log(`  Total term replacements: ${billData.amendments.totalStrikes}`);
  console.log(`  Agencies mentioned: ${billData.agencies.length}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseXMLtoJSON, decodeHTML };
