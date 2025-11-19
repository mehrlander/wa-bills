#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseString } = require('xml2js');

// Proviso categorization patterns
const categories = {
  'FTE restrictions': [
    /\bFTE\b/i,
    /full.time.equivalent/i,
    /staffing/i,
    /positions/i,
    /staff(?:ing)?\s+limit/i
  ],
  'Reporting requirements': [
    /\breport(?:s|ing)?\b/i,
    /submit.*to.*legislature/i,
    /\bsubmit.*by\b/i,
    /shall provide.*information/i,
    /due.*\d{4}/i,
    /quarterly report/i,
    /annual report/i
  ],
  'IT constraints': [
    /information technology/i,
    /\bIT\b/i,
    /software/i,
    /hardware/i,
    /computer/i,
    /system(?:s)?\s+(?:upgrade|replacement|development)/i,
    /data\s+(?:management|system)/i
  ],
  'Pilots': [
    /\bpilot\b/i,
    /demonstration project/i,
    /pilot program/i,
    /test\s+(?:program|project)/i
  ],
  'Transfers': [
    /transfer/i,
    /may.*transfer.*fund/i,
    /reappropriat/i
  ],
  'Conditional appropriations': [
    /if.*bill.*not enacted/i,
    /if.*bill.*is enacted/i,
    /shall lapse/i,
    /provided solely/i,
    /contingent/i
  ],
  'Study requirements': [
    /\bstudy\b/i,
    /analysis/i,
    /evaluation/i,
    /assess(?:ment)?/i,
    /examine/i,
    /review.*and.*report/i
  ],
  'Grant programs': [
    /\bgrant(?:s)?\b/i,
    /award(?:s)?\b/i,
    /distribute.*to/i,
    /allocation.*to/i
  ]
};

function categorizeProviso(text) {
  const matchedCategories = [];

  for (const [category, patterns] of Object.entries(categories)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchedCategories.push(category);
        break;
      }
    }
  }

  return matchedCategories.length > 0 ? matchedCategories : ['General'];
}

function extractText(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(extractText).join(' ');

  // Handle underscore property (common in xml2js)
  if (obj._) {
    const text = extractText(obj._);
    // Also extract any nested TextRun elements
    if (obj.TextRun) {
      return text + ' ' + extractText(obj.TextRun);
    }
    return text;
  }

  if (obj.$t) return obj.$t;

  let text = '';
  for (const key in obj) {
    if (key !== '$' && key !== 'attributes' && key !== 'prePadding' && key !== 'indent' &&
        key !== 'indentStyle' && key !== 'fontFamily' && key !== 'fontWeight' &&
        key !== 'fontStyle' && key !== 'textAlign' && key !== 'lineVeto') {
      text += ' ' + extractText(obj[key]);
    }
  }
  return text.trim();
}

function extractDollarAmount(str) {
  if (!str) return null;
  const match = str.match(/\$[\d,]+/);
  return match ? match[0] : null;
}

function parseBillXML(filename) {
  return new Promise((resolve, reject) => {
    const xmlData = fs.readFileSync(filename, 'utf8');

    parseString(xmlData, { explicitArray: false, mergeAttrs: true }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const bill = result.CertifiedBill?.Bill;
        if (!bill) {
          resolve({ provisos: [], appropriations: [] });
          return;
        }

        const billHeading = bill.BillHeading;
        const billNumber = extractText(billHeading?.ShortBillId) || path.basename(filename, '.xml');
        const legislature = extractText(billHeading?.Legislature) || '';
        const session = extractText(billHeading?.Session) || '';
        const description = extractText(billHeading?.BriefDescription) || '';

        // Determine biennium from description or session
        let biennium = '';
        const bienniumMatch = description.match(/(\d{4})-(\d{4})/);
        if (bienniumMatch) {
          biennium = `${bienniumMatch[1]}-${bienniumMatch[2]}`;
        }

        const billBody = bill.BillBody;
        if (!billBody) {
          resolve({ provisos: [], appropriations: [] });
          return;
        }

        const provisos = [];
        const appropriations = [];

        // Navigate through Parts to find BillSections
        const parts = billBody.Part;
        const partArray = Array.isArray(parts) ? parts : (parts ? [parts] : []);

        partArray.forEach(part => {
          if (!part.BillSection) return;

          const sections = Array.isArray(part.BillSection) ? part.BillSection : [part.BillSection];

          sections.forEach(section => {
            const header = section.BillSectionHeader;
            if (!header) return;

            const sectionNumber = extractText(header.BillSectionNumber?.Value) ||
                                  extractText(header.BillSectionNumber);
            const department = header.Department;

            if (!department) return;

            const agencyName = extractText(department.DeptName);
            const agencyIndex = department.Index;

            // Extract appropriations
            const appropriationsData = section.Appropriations;
            if (appropriationsData) {
              const agencyCode = appropriationsData.agency || '';
              const appropItems = appropriationsData.Appropriation;

              if (appropItems) {
                const items = Array.isArray(appropItems) ? appropItems : [appropItems];
                items.forEach(item => {
                  const accountName = extractText(item.AccountName);
                  const amount = extractText(item.DollarAmount);

                  appropriations.push({
                    billNumber,
                    biennium,
                    section: sectionNumber,
                    agency: agencyName,
                    agencyCode,
                    accountName,
                    amount
                  });
                });
              }

              // Extract total
              const total = appropriationsData.AppropriationTotal;
              if (total) {
                const amount = extractText(total.DollarAmount);
                appropriations.push({
                  billNumber,
                  biennium,
                  section: sectionNumber,
                  agency: agencyName,
                  agencyCode,
                  accountName: 'TOTAL APPROPRIATION',
                  amount
                });
              }
            }

            // Extract provisos (conditions and limitations)
            const paragraphs = section.P;
            if (!paragraphs) return;

            const paras = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

            let inProvisosSection = false;
            let currentProvisoNumber = null;
            let currentProvisoText = '';

            paras.forEach((para, idx) => {
              const paraText = extractText(para);

              // Check if we're entering the provisos section
              if (paraText.includes('subject to the following conditions and limitations')) {
                inProvisosSection = true;
                return;
              }

              if (!inProvisosSection) return;

              // Check for numbered proviso (1), (2), etc.
              const numberMatch = paraText.match(/^\s*\((\d+)\)/);

              if (numberMatch) {
                // Save previous proviso if exists
                if (currentProvisoNumber && currentProvisoText) {
                  const cats = categorizeProviso(currentProvisoText);
                  provisos.push({
                    billNumber,
                    biennium,
                    section: sectionNumber,
                    agency: agencyName,
                    agencyCode: appropriationsData?.agency || '',
                    provisoNumber: currentProvisoNumber,
                    text: currentProvisoText.trim(),
                    categories: cats,
                    amount: extractDollarAmount(currentProvisoText)
                  });
                }

                // Start new proviso
                currentProvisoNumber = numberMatch[1];
                currentProvisoText = paraText;
              } else if (currentProvisoNumber) {
                // Continue current proviso (sub-paragraphs like (a), (b), etc.)
                currentProvisoText += ' ' + paraText;
              }
            });

            // Save last proviso
            if (currentProvisoNumber && currentProvisoText) {
              const cats = categorizeProviso(currentProvisoText);
              provisos.push({
                billNumber,
                biennium,
                section: sectionNumber,
                agency: agencyName,
                agencyCode: appropriationsData?.agency || '',
                provisoNumber: currentProvisoNumber,
                text: currentProvisoText.trim(),
                categories: cats,
                amount: extractDollarAmount(currentProvisoText)
              });
            }
          });
        });

        resolve({
          billNumber,
          biennium,
          legislature,
          session,
          provisos,
          appropriations
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function main() {
  console.log('Extracting provisos from Washington State budget bills...\n');

  // Find all XML files
  const files = fs.readdirSync('.')
    .filter(f => f.endsWith('.xml') && f.match(/^\d{4}/));

  console.log(`Found ${files.length} bill files\n`);

  let allProvisos = [];
  let allAppropriations = [];
  const billsData = [];

  for (const file of files) {
    console.log(`Processing ${file}...`);
    try {
      const result = await parseBillXML(file);
      billsData.push({
        billNumber: result.billNumber,
        biennium: result.biennium,
        legislature: result.legislature,
        session: result.session,
        provisoCount: result.provisos.length,
        appropriationCount: result.appropriations.length
      });

      allProvisos = allProvisos.concat(result.provisos);
      allAppropriations = allAppropriations.concat(result.appropriations);

      console.log(`  - Found ${result.provisos.length} provisos`);
      console.log(`  - Found ${result.appropriations.length} appropriations`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nTotal provisos extracted: ${allProvisos.length}`);
  console.log(`Total appropriations extracted: ${allAppropriations.length}`);

  // Create appropriations with linked provisos
  const appropriationsWithProvisos = allAppropriations.map(approp => {
    const linkedProvisos = allProvisos.filter(p =>
      p.section === approp.section &&
      p.agency === approp.agency &&
      p.billNumber === approp.billNumber
    );

    return {
      ...approp,
      provisos: linkedProvisos.map(p => ({
        provisoNumber: p.provisoNumber,
        text: p.text,
        categories: p.categories,
        amount: p.amount
      }))
    };
  });

  // Generate statistics
  const categoryStats = {};
  allProvisos.forEach(p => {
    p.categories.forEach(cat => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });

  const agencyStats = {};
  allProvisos.forEach(p => {
    agencyStats[p.agency] = (agencyStats[p.agency] || 0) + 1;
  });

  const bienniumStats = {};
  allProvisos.forEach(p => {
    if (p.biennium) {
      bienniumStats[p.biennium] = (bienniumStats[p.biennium] || 0) + 1;
    }
  });

  // Write output files
  fs.writeFileSync('provisos.json', JSON.stringify(allProvisos, null, 2));
  console.log('\n✓ Created provisos.json');

  fs.writeFileSync('appropriations-with-provisos.json',
    JSON.stringify(appropriationsWithProvisos, null, 2));
  console.log('✓ Created appropriations-with-provisos.json');

  // Generate patterns report
  const report = {
    summary: {
      totalProvisos: allProvisos.length,
      totalAppropriations: allAppropriations.length,
      billsProcessed: billsData.length
    },
    bills: billsData,
    categoryBreakdown: Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / allProvisos.length) * 100).toFixed(1) + '%'
      })),
    topAgencies: Object.entries(agencyStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([agency, count]) => ({ agency, provisoCount: count })),
    bienniumBreakdown: Object.entries(bienniumStats)
      .sort()
      .map(([biennium, count]) => ({ biennium, count }))
  };

  fs.writeFileSync('patterns-report.json', JSON.stringify(report, null, 2));
  console.log('✓ Created patterns-report.json');

  // Generate human-readable report
  let reportText = '# Washington State Budget Provisos - Patterns Report\n\n';
  reportText += `Generated: ${new Date().toISOString()}\n\n`;
  reportText += `## Summary\n\n`;
  reportText += `- Total Provisos: ${report.summary.totalProvisos}\n`;
  reportText += `- Total Appropriations: ${report.summary.totalAppropriations}\n`;
  reportText += `- Bills Processed: ${report.summary.billsProcessed}\n\n`;

  reportText += `## Bills Processed\n\n`;
  billsData.forEach(bill => {
    reportText += `- **${bill.billNumber}** (${bill.biennium || 'Unknown biennium'})\n`;
    reportText += `  - ${bill.legislature} - ${bill.session}\n`;
    reportText += `  - Provisos: ${bill.provisoCount}\n`;
    reportText += `  - Appropriations: ${bill.appropriationCount}\n\n`;
  });

  reportText += `## Proviso Categories\n\n`;
  report.categoryBreakdown.forEach(cat => {
    reportText += `- ${cat.category}: ${cat.count} (${cat.percentage})\n`;
  });

  reportText += `\n## Top 20 Agencies by Proviso Count\n\n`;
  report.topAgencies.forEach((agency, idx) => {
    reportText += `${idx + 1}. ${agency.agency}: ${agency.provisoCount} provisos\n`;
  });

  reportText += `\n## Biennium Breakdown\n\n`;
  report.bienniumBreakdown.forEach(b => {
    reportText += `- ${b.biennium}: ${b.count} provisos\n`;
  });

  fs.writeFileSync('patterns-report.md', reportText);
  console.log('✓ Created patterns-report.md');

  console.log('\n✅ Extraction complete!');
  console.log('\nNext: Run this to create the search interface:');
  console.log('  node create-search-html.js');
}

main().catch(console.error);
