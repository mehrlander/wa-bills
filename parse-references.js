#!/usr/bin/env node

/**
 * Statutory Reference Parser for Washington State Bills
 * Extracts RCW citations, WAC references, and session law references
 */

const fs = require('fs');
const path = require('path');

// Regular expressions for matching different reference types
const patterns = {
  // RCW patterns
  rcw: {
    // Standard: RCW 12.34.567
    standard: /\bRCW\s+(\d+)\.(\d+)\.(\d+)(?:\((\d+)\)(?:\(([a-z])\))?)?/gi,
    // Chapter reference: chapter 12.34 RCW
    chapter: /\bchapter\s+(\d+)\.(\d+)\s+RCW\b/gi,
    // Title reference: Title 12 RCW
    title: /\bTitle\s+(\d+)\s+RCW\b/gi,
    // Section cite in XML: <SectionCite>RCW 12.34.567</SectionCite>
    sectionCite: /<SectionCite>[\s\S]*?<TitleNumber>(\d+)<\/TitleNumber>[\s\S]*?<ChapterNumber>(\d+)<\/ChapterNumber>[\s\S]*?<SectionNumber>(\d+(?:\.\d+)?)<\/SectionNumber>/gi
  },

  // WAC patterns
  wac: {
    // Standard: WAC 123-456-789
    standard: /\bWAC\s+(\d+)-(\d+)-(\d+)/gi
  },

  // Session law patterns
  sessionLaw: {
    // Year chapter section: 2018 c 68 s 1
    standard: /\b(\d{4})\s+c\s+(\d+)\s+(?:s|§)\s+(\d+)/gi,
    // In History tags
    history: /<History>(.*?)<\/History>/gi
  },

  // Bill section patterns
  billSection: /<BillSection\s+type="([^"]+)"(?:\s+action="([^"]+)")?/gi
};

/**
 * Parse a single XML bill file
 */
function parseBillFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const billName = path.basename(filePath, '.xml');

  const result = {
    bill: billName,
    rcwReferences: [],
    wacReferences: [],
    sessionLawReferences: [],
    amendedStatutes: [],
    sections: []
  };

  // Extract bill metadata
  const billIdMatch = content.match(/<ShortBillId>(.*?)<\/ShortBillId>/);
  const sessionMatch = content.match(/<Session>(.*?)<\/Session>/);
  const yearMatch = content.match(/<ChapterLaw year="(\d+)">/);
  const chapterMatch = content.match(/<ChapterLaw year="\d+">(\d+)<\/ChapterLaw>/);

  result.billId = billIdMatch ? billIdMatch[1] : billName;
  result.session = sessionMatch ? sessionMatch[1] : 'Unknown';
  result.year = yearMatch ? yearMatch[1] : 'Unknown';
  result.chapter = chapterMatch ? chapterMatch[1] : 'Unknown';

  // Parse sections to identify amendments
  const sectionPattern = /<BillSection\s+type="([^"]+)"(?:\s+action="([^"]+)")?>[\s\S]*?<\/BillSection>/gi;
  let sectionMatch;
  let sectionNum = 0;

  while ((sectionMatch = sectionPattern.exec(content)) !== null) {
    sectionNum++;
    const sectionContent = sectionMatch[0];
    const sectionType = sectionMatch[1];
    const sectionAction = sectionMatch[2] || '';

    // Extract section number
    const secNumMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value>(\d+)<\/Value>/);
    const secNum = secNumMatch ? secNumMatch[1] : sectionNum.toString();

    const section = {
      number: secNum,
      type: sectionType,
      action: sectionAction,
      rcwReferences: [],
      wacReferences: [],
      sessionLawReferences: []
    };

    // Extract RCW from SectionCite (structured)
    const sectionCitePattern = /<SectionCite>[\s\S]*?<TitleNumber>(\d+)<\/TitleNumber>[\s\S]*?<ChapterNumber>(\d+)<\/ChapterNumber>[\s\S]*?<SectionNumber>(\d+(?:\.\d+)?)<\/SectionNumber>/i;
    const citeMatch = sectionContent.match(sectionCitePattern);

    if (citeMatch) {
      const rcwRef = `RCW ${citeMatch[1]}.${citeMatch[2]}.${citeMatch[3]}`;
      section.rcwReferences.push(rcwRef);

      // If this is an amendatory section, mark the statute as being amended
      if (sectionType === 'amendatory' || sectionAction === 'amend') {
        result.amendedStatutes.push({
          statute: rcwRef,
          section: secNum,
          action: sectionAction || 'amend'
        });
      }
    }

    // Extract all RCW references from section content
    extractRCWReferences(sectionContent, section.rcwReferences);
    extractWACReferences(sectionContent, section.wacReferences);
    extractSessionLawReferences(sectionContent, section.sessionLawReferences);

    result.sections.push(section);
  }

  // Extract RCW references from BillTitle (comprehensive list of amendments)
  const billTitleMatch = content.match(/<BillTitle>([\s\S]*?)<\/BillTitle>/);
  if (billTitleMatch) {
    const titleContent = billTitleMatch[1];

    // Extract "amending RCW ..." list
    const amendingMatch = titleContent.match(/amending RCW\s+([\d.,\s]+?)(?:;|$)/i);
    if (amendingMatch) {
      const rcwList = amendingMatch[1].split(/,\s*/);
      rcwList.forEach(rcw => {
        const cleaned = rcw.trim();
        if (cleaned && cleaned.match(/^\d+\.\d+\.\d+/)) {
          const statute = `RCW ${cleaned}`;
          result.amendedStatutes.push({
            statute: statute,
            section: 'title',
            action: 'amend'
          });
        }
      });
    }

    // Extract "reenacting and amending RCW ..." list
    const reenactMatch = titleContent.match(/reenacting and amending RCW\s+([\d.,\s]+?)(?:;|$)/i);
    if (reenactMatch) {
      const rcwList = reenactMatch[1].split(/,\s*/);
      rcwList.forEach(rcw => {
        const cleaned = rcw.trim();
        if (cleaned && cleaned.match(/^\d+\.\d+\.\d+/)) {
          const statute = `RCW ${cleaned}`;
          result.amendedStatutes.push({
            statute: statute,
            section: 'title',
            action: 'reenact-amend'
          });
        }
      });
    }

    // Extract chapter additions
    const addChapterMatch = titleContent.match(/adding (?:a )?new section(?:s)? to chapter\s+(\d+)\.(\d+)\s+RCW/gi);
    if (addChapterMatch) {
      addChapterMatch.forEach(match => {
        const chMatch = match.match(/chapter\s+(\d+)\.(\d+)\s+RCW/i);
        if (chMatch) {
          result.amendedStatutes.push({
            statute: `chapter ${chMatch[1]}.${chMatch[2]} RCW`,
            section: 'title',
            action: 'add-section'
          });
        }
      });
    }
  }

  // Consolidate all references
  result.sections.forEach(section => {
    section.rcwReferences.forEach(ref => {
      if (!result.rcwReferences.includes(ref)) {
        result.rcwReferences.push(ref);
      }
    });
    section.wacReferences.forEach(ref => {
      if (!result.wacReferences.includes(ref)) {
        result.wacReferences.push(ref);
      }
    });
    section.sessionLawReferences.forEach(ref => {
      if (!result.sessionLawReferences.includes(ref)) {
        result.sessionLawReferences.push(ref);
      }
    });
  });

  return result;
}

/**
 * Extract RCW references from text
 */
function extractRCWReferences(text, references) {
  // Standard RCW citations
  const matches = text.matchAll(/\bRCW\s+(\d+)\.(\d+)\.(\d+)(?:\((\d+)\)(?:\(([a-z])\))?)?/gi);
  for (const match of matches) {
    let ref = `RCW ${match[1]}.${match[2]}.${match[3]}`;
    if (match[4]) ref += `(${match[4]})`;
    if (match[5]) ref += `(${match[5]})`;
    if (!references.includes(ref)) {
      references.push(ref);
    }
  }

  // Chapter references
  const chapterMatches = text.matchAll(/\bchapter\s+(\d+)\.(\d+)\s+RCW\b/gi);
  for (const match of chapterMatches) {
    const ref = `chapter ${match[1]}.${match[2]} RCW`;
    if (!references.includes(ref)) {
      references.push(ref);
    }
  }

  // Title references
  const titleMatches = text.matchAll(/\bTitle\s+(\d+)\s+RCW\b/gi);
  for (const match of titleMatches) {
    const ref = `Title ${match[1]} RCW`;
    if (!references.includes(ref)) {
      references.push(ref);
    }
  }
}

/**
 * Extract WAC references from text
 */
function extractWACReferences(text, references) {
  const matches = text.matchAll(/\bWAC\s+(\d+)-(\d+)-(\d+)/gi);
  for (const match of matches) {
    const ref = `WAC ${match[1]}-${match[2]}-${match[3]}`;
    if (!references.includes(ref)) {
      references.push(ref);
    }
  }
}

/**
 * Extract session law references from text
 */
function extractSessionLawReferences(text, references) {
  // Standard format: 2018 c 68 s 1
  const matches = text.matchAll(/\b(\d{4})\s+c\s+(\d+)\s+(?:s|§)\s+(\d+)/gi);
  for (const match of matches) {
    const ref = `${match[1]} c ${match[2]} s ${match[3]}`;
    if (!references.includes(ref)) {
      references.push(ref);
    }
  }

  // Also check History tags
  const historyMatches = text.matchAll(/<History>(.*?)<\/History>/gi);
  for (const histMatch of historyMatches) {
    const histContent = histMatch[1];
    const sessionMatches = histContent.matchAll(/(\d{4})\s+c\s+(\d+)\s+(?:s|§)\s+(\d+)/gi);
    for (const match of sessionMatches) {
      const ref = `${match[1]} c ${match[2]} s ${match[3]}`;
      if (!references.includes(ref)) {
        references.push(ref);
      }
    }
  }
}

/**
 * Main processing function
 */
function main() {
  console.log('Parsing statutory references from Washington bills...\n');

  // Find all XML files
  const files = fs.readdirSync('.').filter(f => f.endsWith('.xml'));
  console.log(`Found ${files.length} XML bill files\n`);

  // Parse each file
  const allBills = [];
  files.forEach(file => {
    console.log(`Parsing ${file}...`);
    const result = parseBillFile(file);
    allBills.push(result);
  });

  console.log(`\nParsed ${allBills.length} bills successfully\n`);

  // Analyze references
  const analysis = analyzeReferences(allBills);

  // Generate outputs
  generateReferencesJSON(allBills, analysis);
  generateClustersJSON(allBills, analysis);
  generateVisualization(allBills, analysis);
  generatePatternReport(allBills, analysis);

  console.log('\nAll deliverables generated successfully!');
}

/**
 * Analyze all references to find patterns and clusters
 */
function analyzeReferences(allBills) {
  const analysis = {
    totalReferences: 0,
    rcwStats: {},
    wacStats: {},
    sessionLawStats: {},
    amendedStatutes: {},
    chapterClusters: {},
    titleClusters: {},
    billClusters: {}
  };

  // Count all references
  allBills.forEach(bill => {
    // RCW references
    bill.rcwReferences.forEach(ref => {
      if (!analysis.rcwStats[ref]) {
        analysis.rcwStats[ref] = { count: 0, bills: [], type: 'reference' };
      }
      analysis.rcwStats[ref].count++;
      analysis.rcwStats[ref].bills.push(bill.billId);
    });

    // WAC references
    bill.wacReferences.forEach(ref => {
      if (!analysis.wacStats[ref]) {
        analysis.wacStats[ref] = { count: 0, bills: [] };
      }
      analysis.wacStats[ref].count++;
      analysis.wacStats[ref].bills.push(bill.billId);
    });

    // Session law references
    bill.sessionLawReferences.forEach(ref => {
      if (!analysis.sessionLawStats[ref]) {
        analysis.sessionLawStats[ref] = { count: 0, bills: [] };
      }
      analysis.sessionLawStats[ref].count++;
      analysis.sessionLawStats[ref].bills.push(bill.billId);
    });

    // Amended statutes
    bill.amendedStatutes.forEach(item => {
      if (!analysis.amendedStatutes[item.statute]) {
        analysis.amendedStatutes[item.statute] = {
          count: 0,
          bills: [],
          actions: [],
          type: 'amendment'
        };
      }
      analysis.amendedStatutes[item.statute].count++;
      if (!analysis.amendedStatutes[item.statute].bills.includes(bill.billId)) {
        analysis.amendedStatutes[item.statute].bills.push(bill.billId);
      }
      if (!analysis.amendedStatutes[item.statute].actions.includes(item.action)) {
        analysis.amendedStatutes[item.statute].actions.push(item.action);
      }

      // Update RCW stats to mark as amended
      if (analysis.rcwStats[item.statute]) {
        analysis.rcwStats[item.statute].type = 'amendment';
      }
    });
  });

  // Create chapter clusters (bills that touch the same chapter)
  allBills.forEach(bill => {
    bill.rcwReferences.forEach(ref => {
      // Extract chapter from RCW X.Y.Z
      const match = ref.match(/RCW (\d+)\.(\d+)/);
      if (match) {
        const chapter = `chapter ${match[1]}.${match[2]} RCW`;
        if (!analysis.chapterClusters[chapter]) {
          analysis.chapterClusters[chapter] = { bills: [], statutes: [] };
        }
        if (!analysis.chapterClusters[chapter].bills.includes(bill.billId)) {
          analysis.chapterClusters[chapter].bills.push(bill.billId);
        }
        if (!analysis.chapterClusters[chapter].statutes.includes(ref)) {
          analysis.chapterClusters[chapter].statutes.push(ref);
        }
      }
    });

    // Also include amended statutes
    bill.amendedStatutes.forEach(item => {
      const match = item.statute.match(/RCW (\d+)\.(\d+)/);
      if (match) {
        const chapter = `chapter ${match[1]}.${match[2]} RCW`;
        if (!analysis.chapterClusters[chapter]) {
          analysis.chapterClusters[chapter] = { bills: [], statutes: [] };
        }
        if (!analysis.chapterClusters[chapter].bills.includes(bill.billId)) {
          analysis.chapterClusters[chapter].bills.push(bill.billId);
        }
        if (!analysis.chapterClusters[chapter].statutes.includes(item.statute)) {
          analysis.chapterClusters[chapter].statutes.push(item.statute);
        }
      }
    });
  });

  // Create title clusters
  allBills.forEach(bill => {
    bill.rcwReferences.forEach(ref => {
      const match = ref.match(/RCW (\d+)\./);
      if (match) {
        const title = `Title ${match[1]} RCW`;
        if (!analysis.titleClusters[title]) {
          analysis.titleClusters[title] = { bills: [], chapters: [] };
        }
        if (!analysis.titleClusters[title].bills.includes(bill.billId)) {
          analysis.titleClusters[title].bills.push(bill.billId);
        }
      }
    });
  });

  return analysis;
}

/**
 * Generate references.json
 */
function generateReferencesJSON(allBills, analysis) {
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      billCount: allBills.length,
      totalRCWReferences: Object.keys(analysis.rcwStats).length,
      totalWACReferences: Object.keys(analysis.wacStats).length,
      totalSessionLawReferences: Object.keys(analysis.sessionLawStats).length,
      totalAmendedStatutes: Object.keys(analysis.amendedStatutes).length
    },
    bills: allBills.map(bill => ({
      bill: bill.billId,
      fileName: bill.bill,
      year: bill.year,
      chapter: bill.chapter,
      session: bill.session,
      rcwReferences: bill.rcwReferences,
      wacReferences: bill.wacReferences,
      sessionLawReferences: bill.sessionLawReferences,
      amendedStatutes: bill.amendedStatutes,
      sections: bill.sections.map(s => ({
        number: s.number,
        type: s.type,
        action: s.action,
        rcwReferences: s.rcwReferences,
        wacReferences: s.wacReferences,
        sessionLawReferences: s.sessionLawReferences
      }))
    })),
    allReferences: {
      rcw: Object.entries(analysis.rcwStats).map(([ref, data]) => ({
        reference: ref,
        frequency: data.count,
        bills: data.bills,
        type: data.type
      })).sort((a, b) => b.frequency - a.frequency),

      wac: Object.entries(analysis.wacStats).map(([ref, data]) => ({
        reference: ref,
        frequency: data.count,
        bills: data.bills
      })).sort((a, b) => b.frequency - a.frequency),

      sessionLaw: Object.entries(analysis.sessionLawStats).map(([ref, data]) => ({
        reference: ref,
        frequency: data.count,
        bills: data.bills
      })).sort((a, b) => b.frequency - a.frequency)
    },
    amendedStatutes: Object.entries(analysis.amendedStatutes).map(([statute, data]) => ({
      statute: statute,
      frequency: data.count,
      bills: data.bills,
      actions: data.actions
    })).sort((a, b) => b.frequency - a.frequency)
  };

  fs.writeFileSync('references.json', JSON.stringify(output, null, 2));
  console.log('✓ Generated references.json');
}

/**
 * Generate reference-clusters.json
 */
function generateClustersJSON(allBills, analysis) {
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      billCount: allBills.length,
      chapterClusterCount: Object.keys(analysis.chapterClusters).length,
      titleClusterCount: Object.keys(analysis.titleClusters).length
    },
    chapterClusters: Object.entries(analysis.chapterClusters)
      .map(([chapter, data]) => ({
        chapter: chapter,
        billCount: data.bills.length,
        bills: data.bills,
        statutes: data.statutes,
        statuteCount: data.statutes.length
      }))
      .filter(c => c.billCount > 1) // Only clusters with multiple bills
      .sort((a, b) => b.billCount - a.billCount),

    titleClusters: Object.entries(analysis.titleClusters)
      .map(([title, data]) => ({
        title: title,
        billCount: data.bills.length,
        bills: data.bills
      }))
      .filter(c => c.billCount > 1)
      .sort((a, b) => b.billCount - a.billCount),

    hotSpots: Object.entries(analysis.amendedStatutes)
      .map(([statute, data]) => ({
        statute: statute,
        amendmentCount: data.count,
        bills: data.bills,
        actions: data.actions
      }))
      .filter(h => h.bills.length > 1) // Multiple bills touching same statute
      .sort((a, b) => b.bills.length - a.bills.length),

    billPairs: []
  };

  // Find bill pairs that share references (co-citation network)
  const billPairMap = {};
  allBills.forEach((bill1, i) => {
    allBills.slice(i + 1).forEach(bill2 => {
      const sharedRCW = bill1.rcwReferences.filter(ref =>
        bill2.rcwReferences.includes(ref)
      );
      const sharedAmended = bill1.amendedStatutes.filter(a1 =>
        bill2.amendedStatutes.some(a2 => a2.statute === a1.statute)
      ).map(a => a.statute);

      if (sharedRCW.length > 0 || sharedAmended.length > 0) {
        output.billPairs.push({
          bills: [bill1.billId, bill2.billId],
          sharedReferences: sharedRCW.length,
          sharedAmendments: sharedAmended.length,
          totalShared: sharedRCW.length + sharedAmended.length,
          references: [...new Set([...sharedRCW, ...sharedAmended])]
        });
      }
    });
  });

  output.billPairs.sort((a, b) => b.totalShared - a.totalShared);

  fs.writeFileSync('reference-clusters.json', JSON.stringify(output, null, 2));
  console.log('✓ Generated reference-clusters.json');
}

/**
 * Generate reference-viz.html
 */
function generateVisualization(allBills, analysis) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WA Bills Statutory Reference Network</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }

    h1 {
      text-align: center;
      color: #333;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .stat-box h3 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }

    .stat-box .value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }

    #network {
      width: 100%;
      height: 700px;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 30px;
    }

    .node {
      cursor: pointer;
    }

    .node circle {
      stroke: #fff;
      stroke-width: 2px;
    }

    .node.bill circle {
      fill: #4285f4;
    }

    .node.statute circle {
      fill: #ea4335;
    }

    .node.chapter circle {
      fill: #34a853;
    }

    .node text {
      font-size: 11px;
      pointer-events: none;
    }

    .link {
      stroke: #999;
      stroke-opacity: 0.3;
      stroke-width: 1px;
    }

    .link.amendment {
      stroke: #ea4335;
      stroke-opacity: 0.6;
      stroke-width: 2px;
    }

    .tables {
      margin-top: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      background: #e3f2fd;
      color: #1976d2;
      margin: 2px;
    }

    .badge.amendment {
      background: #ffebee;
      color: #c62828;
    }

    .tabs {
      display: flex;
      gap: 10px;
      border-bottom: 2px solid #ddd;
      margin-bottom: 20px;
    }

    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
    }

    .tab.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Washington Bills Statutory Reference Network</h1>

    <div class="stats">
      <div class="stat-box">
        <h3>Bills Analyzed</h3>
        <div class="value">${allBills.length}</div>
      </div>
      <div class="stat-box">
        <h3>RCW References</h3>
        <div class="value">${Object.keys(analysis.rcwStats).length}</div>
      </div>
      <div class="stat-box">
        <h3>Amended Statutes</h3>
        <div class="value">${Object.keys(analysis.amendedStatutes).length}</div>
      </div>
      <div class="stat-box">
        <h3>Chapter Clusters</h3>
        <div class="value">${Object.keys(analysis.chapterClusters).length}</div>
      </div>
      <div class="stat-box">
        <h3>WAC References</h3>
        <div class="value">${Object.keys(analysis.wacStats).length}</div>
      </div>
    </div>

    <h2>Citation Network Graph</h2>
    <div id="network"></div>

    <div class="tabs">
      <button class="tab active" onclick="showTab('hotspots')">Hot Spots</button>
      <button class="tab" onclick="showTab('chapters')">Chapter Clusters</button>
      <button class="tab" onclick="showTab('all-refs')">All References</button>
    </div>

    <div id="hotspots" class="tab-content active">
      <h2>Hot Spots - Most Amended Statutes</h2>
      <table id="hotspots-table">
        <thead>
          <tr>
            <th>Statute</th>
            <th>Bills Touching</th>
            <th>Bills</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div id="chapters" class="tab-content">
      <h2>Chapter Clusters - Bills Touching Same Chapters</h2>
      <table id="chapters-table">
        <thead>
          <tr>
            <th>Chapter</th>
            <th>Bills</th>
            <th>Statutes Touched</th>
            <th>Bill IDs</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div id="all-refs" class="tab-content">
      <h2>All RCW References by Frequency</h2>
      <table id="refs-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Frequency</th>
            <th>Type</th>
            <th>Bills</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

  <script>
    // Data from analysis
    const data = ${JSON.stringify({ allBills, analysis }, null, 2)};

    // Tab switching
    function showTab(tabName) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    }

    // Populate tables
    populateHotSpots();
    populateChapters();
    populateAllRefs();
    createNetwork();

    function populateHotSpots() {
      const tbody = document.querySelector('#hotspots-table tbody');
      const hotSpots = Object.entries(data.analysis.amendedStatutes)
        .map(([statute, info]) => ({ statute, ...info }))
        .sort((a, b) => b.bills.length - a.bills.length);

      hotSpots.forEach(spot => {
        const row = tbody.insertRow();
        row.innerHTML = \`
          <td><strong>\${spot.statute}</strong></td>
          <td><strong>\${spot.bills.length}</strong></td>
          <td>\${spot.bills.map(b => \`<span class="badge">\${b}</span>\`).join('')}</td>
          <td>\${spot.actions.map(a => \`<span class="badge amendment">\${a}</span>\`).join('')}</td>
        \`;
      });
    }

    function populateChapters() {
      const tbody = document.querySelector('#chapters-table tbody');
      const chapters = Object.entries(data.analysis.chapterClusters)
        .map(([chapter, info]) => ({ chapter, ...info }))
        .filter(c => c.bills.length > 1)
        .sort((a, b) => b.bills.length - a.bills.length);

      chapters.forEach(cluster => {
        const row = tbody.insertRow();
        row.innerHTML = \`
          <td><strong>\${cluster.chapter}</strong></td>
          <td><strong>\${cluster.bills.length}</strong></td>
          <td>\${cluster.statutes.length}</td>
          <td>\${cluster.bills.map(b => \`<span class="badge">\${b}</span>\`).join('')}</td>
        \`;
      });
    }

    function populateAllRefs() {
      const tbody = document.querySelector('#refs-table tbody');
      const refs = Object.entries(data.analysis.rcwStats)
        .map(([ref, info]) => ({ ref, ...info }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 100); // Top 100

      refs.forEach(ref => {
        const row = tbody.insertRow();
        row.innerHTML = \`
          <td><strong>\${ref.ref}</strong></td>
          <td>\${ref.count}</td>
          <td><span class="badge \${ref.type === 'amendment' ? 'amendment' : ''}">\${ref.type}</span></td>
          <td>\${ref.bills.slice(0, 3).map(b => \`<span class="badge">\${b}</span>\`).join('')}
              \${ref.bills.length > 3 ? \` +\${ref.bills.length - 3} more\` : ''}</td>
        \`;
      });
    }

    function createNetwork() {
      const width = document.getElementById('network').clientWidth;
      const height = 700;

      // Prepare network data
      const nodes = [];
      const links = [];

      // Add bill nodes
      data.allBills.forEach(bill => {
        nodes.push({
          id: bill.billId,
          type: 'bill',
          label: bill.billId,
          size: 8
        });
      });

      // Add top statute nodes (most frequently amended)
      const topStatutes = Object.entries(data.analysis.amendedStatutes)
        .map(([statute, info]) => ({ statute, ...info }))
        .sort((a, b) => b.bills.length - a.bills.length)
        .slice(0, 30);

      topStatutes.forEach(stat => {
        nodes.push({
          id: stat.statute,
          type: 'statute',
          label: stat.statute,
          size: 10 + stat.bills.length * 2
        });

        // Add links from bills to statutes
        stat.bills.forEach(billId => {
          links.push({
            source: billId,
            target: stat.statute,
            type: 'amendment'
          });
        });
      });

      // Create D3 force simulation
      const svg = d3.select('#network')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.size + 5));

      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', d => \`link \${d.type}\`);

      const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', d => \`node \${d.type}\`)
        .call(drag(simulation));

      node.append('circle')
        .attr('r', d => d.size);

      node.append('text')
        .attr('dx', d => d.size + 3)
        .attr('dy', 4)
        .text(d => d.label);

      node.append('title')
        .text(d => d.label);

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
      });

      function drag(simulation) {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync('reference-viz.html', html);
  console.log('✓ Generated reference-viz.html');
}

/**
 * Generate reference-patterns.md
 */
function generatePatternReport(allBills, analysis) {
  const topAmended = Object.entries(analysis.amendedStatutes)
    .map(([statute, info]) => ({ statute, ...info }))
    .sort((a, b) => b.bills.length - a.bills.length)
    .slice(0, 20);

  const topReferenced = Object.entries(analysis.rcwStats)
    .map(([ref, info]) => ({ ref, ...info }))
    .filter(r => r.type === 'reference')
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topChapters = Object.entries(analysis.chapterClusters)
    .map(([chapter, info]) => ({ chapter, ...info }))
    .sort((a, b) => b.bills.length - a.bills.length)
    .slice(0, 15);

  // Find formatting variations
  const allRCWs = Object.keys(analysis.rcwStats);
  const withSubsections = allRCWs.filter(r => r.includes('(')).length;
  const chapters = allRCWs.filter(r => r.startsWith('chapter')).length;
  const titles = allRCWs.filter(r => r.startsWith('Title')).length;
  const standard = allRCWs.length - withSubsections - chapters - titles;

  let report = `# Washington Bills Statutory Reference Analysis

## Overview

This report analyzes statutory cross-references across ${allBills.length} Washington State bills, identifying patterns in how bills reference and amend existing law.

### Summary Statistics

- **Bills Analyzed:** ${allBills.length}
- **Unique RCW References:** ${Object.keys(analysis.rcwStats).length}
- **Amended Statutes:** ${Object.keys(analysis.amendedStatutes).length}
- **WAC References:** ${Object.keys(analysis.wacStats).length}
- **Session Law References:** ${Object.keys(analysis.sessionLawStats).length}
- **Chapter Clusters:** ${Object.keys(analysis.chapterClusters).length}

## Hot Spots - Most Amended Statutes

These are the statutes that multiple bills are touching, indicating areas of active legislative focus:

| Statute | Bills | Bill IDs |
|---------|-------|----------|
`;

  topAmended.forEach(stat => {
    report += `| ${stat.statute} | ${stat.bills.length} | ${stat.bills.join(', ')} |\n`;
  });

  report += `\n## Most Referenced Statutes (Non-Amendments)

These statutes are frequently referenced but not necessarily amended:

| Reference | Frequency | Bills |
|-----------|-----------|-------|
`;

  topReferenced.forEach(ref => {
    report += `| ${ref.ref} | ${ref.count} | ${ref.bills.slice(0, 3).join(', ')}${ref.bills.length > 3 ? '...' : ''} |\n`;
  });

  report += `\n## Chapter Clusters

Groups of bills touching related statute areas (same RCW chapter):

| Chapter | Bill Count | Bills |
|---------|------------|-------|
`;

  topChapters.forEach(cluster => {
    if (cluster.bills.length > 1) {
      report += `| ${cluster.chapter} | ${cluster.bills.length} | ${cluster.bills.join(', ')} |\n`;
    }
  });

  report += `\n## Citation Formatting Patterns

### RCW Citation Types Found

- **Standard (RCW X.Y.Z):** ${standard} references
- **With Subsections (RCW X.Y.Z(n)):** ${withSubsections} references
- **Chapter References:** ${chapters} references
- **Title References:** ${titles} references

### Common RCW Titles Referenced

`;

  // Count references by title
  const titleCounts = {};
  allRCWs.forEach(ref => {
    const match = ref.match(/RCW (\d+)\./);
    if (match) {
      const title = match[1];
      titleCounts[title] = (titleCounts[title] || 0) + 1;
    }
  });

  Object.entries(titleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([title, count]) => {
      report += `- **Title ${title}:** ${count} references\n`;
    });

  report += `\n## WAC References

`;

  if (Object.keys(analysis.wacStats).length > 0) {
    report += `Found ${Object.keys(analysis.wacStats).length} WAC (Washington Administrative Code) references:\n\n`;
    report += `| WAC Reference | Frequency | Bills |\n`;
    report += `|---------------|-----------|-------|\n`;
    Object.entries(analysis.wacStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .forEach(([ref, info]) => {
        report += `| ${ref} | ${info.count} | ${info.bills.join(', ')} |\n`;
      });
  } else {
    report += `No WAC references found in analyzed bills.\n`;
  }

  report += `\n## Session Law References

Found ${Object.keys(analysis.sessionLawStats).length} session law references (prior legislation).\n\n`;

  if (Object.keys(analysis.sessionLawStats).length > 0) {
    report += `### Most Common Session Law References\n\n`;
    report += `| Session Law | Frequency | Bills |\n`;
    report += `|-------------|-----------|-------|\n`;
    Object.entries(analysis.sessionLawStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .forEach(([ref, info]) => {
        report += `| ${ref} | ${info.count} | ${info.bills.join(', ')} |\n`;
      });
  }

  report += `\n## Parsing Challenges & Edge Cases

### Challenges Identified

1. **Subsection Notation Variations**
   - Some citations use nested subsections: RCW X.Y.Z(1)(a)
   - Parenthetical notation can be complex

2. **Chapter vs. Section References**
   - Bills reference both specific sections and entire chapters
   - "Adding new section to chapter" requires different handling

3. **Multiple References in Single String**
   - Bill titles contain comma-separated lists of dozens of RCW sections
   - Requires careful parsing to separate individual citations

4. **Reenactment vs. Amendment**
   - Some sections are "reenacted and amended" vs. simply "amended"
   - Different legal meanings but similar citation patterns

5. **Session Law Format Variations**
   - Standard format: YYYY c XX s YY
   - Sometimes uses § instead of s
   - Historical references may use different formats

### Formatting Variations Found

`;

  // Sample some actual references to show variations
  const sampleRefs = allRCWs.slice(0, 10);
  report += `\nSample RCW reference formats:\n`;
  sampleRefs.forEach(ref => {
    report += `- ${ref}\n`;
  });

  report += `\n## Bill-to-Bill Citation Network

### Bills with Most Shared References

The following bill pairs share the most statutory references, indicating related policy areas:

| Bill Pair | Shared References |
|-----------|-------------------|
`;

  // Calculate bill pairs
  const pairs = [];
  allBills.forEach((bill1, i) => {
    allBills.slice(i + 1).forEach(bill2 => {
      const shared = bill1.rcwReferences.filter(ref =>
        bill2.rcwReferences.includes(ref)
      );
      if (shared.length > 0) {
        pairs.push({
          bills: [bill1.billId, bill2.billId],
          count: shared.length
        });
      }
    });
  });

  pairs.sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .forEach(pair => {
      report += `| ${pair.bills[0]} & ${pair.bills[1]} | ${pair.count} |\n`;
    });

  report += `\n## Key Findings

### Legislative Focus Areas

Based on the clustering analysis, the following RCW chapters show the highest legislative activity:

`;

  topChapters.slice(0, 5).forEach((cluster, i) => {
    report += `${i + 1}. **${cluster.chapter}** - ${cluster.bills.length} bills touching ${cluster.statutes.length} statutes\n`;
  });

  report += `\n### Cross-Cutting Bills

Bills that touch multiple distinct RCW titles (indicating broad policy scope):

| Bill | Distinct Titles Referenced |
|------|---------------------------|
`;

  allBills.forEach(bill => {
    const titles = new Set();
    bill.rcwReferences.forEach(ref => {
      const match = ref.match(/RCW (\d+)\./);
      if (match) titles.add(match[1]);
    });
    if (titles.size > 3) {
      report += `| ${bill.billId} | ${titles.size} titles |\n`;
    }
  });

  report += `\n## Recommendations

1. **Standardize Citation Formats**: Consider developing consistent patterns for how bills cite statutes
2. **Track Hotspots**: Monitor frequently-amended statutes for potential conflicts or coordination needs
3. **Cross-Reference Tool**: Build tooling to alert bill drafters when their amendments overlap with other bills
4. **Cluster Analysis**: Use chapter clusters to identify related policy initiatives that could be coordinated

## Data Files

- **references.json** - Complete citation database with all references and metadata
- **reference-clusters.json** - Cluster analysis showing bills touching related statute areas
- **reference-viz.html** - Interactive network visualization of bill-statute relationships

---

*Generated: ${new Date().toISOString()}*
`;

  fs.writeFileSync('reference-patterns.md', report);
  console.log('✓ Generated reference-patterns.md');
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { parseBillFile, analyzeReferences };
