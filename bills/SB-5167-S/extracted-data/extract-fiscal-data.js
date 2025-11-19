#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Utility to parse XML (simple regex-based for specific patterns)
function extractTextContent(xmlString, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(xmlString)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function cleanText(text) {
  // Remove XML tags and clean up whitespace
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/—/g, '-')
    .trim();
}

function parseAmount(amountStr) {
  // Extract numeric value from dollar amount string
  const cleaned = amountStr.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractAppropriation(appropXml, billId, sectionNum) {
  const accountNames = extractTextContent(appropXml, 'AccountName');
  const dollarAmounts = extractTextContent(appropXml, 'DollarAmount');
  const totals = extractTextContent(appropXml, 'AppropriationTotal');

  const result = [];

  // Extract individual appropriations
  for (let i = 0; i < Math.min(accountNames.length, dollarAmounts.length); i++) {
    const accountName = cleanText(accountNames[i]);
    const amount = cleanText(dollarAmounts[i]);

    // Parse fiscal year from account name
    const fyMatch = accountName.match(/FY\s*(\d{4})/i);
    const fiscalYear = fyMatch ? fyMatch[1] : null;

    // Parse biennium
    const bienniumMatch = accountName.match(/(\d{4})-(\d{4})/);
    let biennium = null;
    if (bienniumMatch) {
      biennium = `${bienniumMatch[1]}-${bienniumMatch[2]}`;
    } else if (fiscalYear) {
      // Infer biennium from fiscal year (WA uses odd-year start)
      const fy = parseInt(fiscalYear);
      const startYear = fy % 2 === 0 ? fy - 1 : fy;
      biennium = `${startYear}-${startYear + 2}`;
    }

    // Parse fund source
    let fundSource = accountName.replace(/\(FY\s*\d{4}\)/gi, '').trim();
    fundSource = fundSource.replace(/—\s*State\s+Appropriation/i, '').trim();

    result.push({
      bill: billId,
      section: sectionNum,
      accountName: accountName,
      fundSource: fundSource || accountName,
      amountText: amount,
      amount: parseAmount(amount),
      fiscalYear: fiscalYear,
      biennium: biennium,
      type: 'appropriation'
    });
  }

  // Extract total if present
  if (totals.length > 0) {
    const totalText = cleanText(totals[0]);
    const totalMatch = totalText.match(/\$[\d,]+/);
    if (totalMatch) {
      result.push({
        bill: billId,
        section: sectionNum,
        accountName: 'TOTAL',
        fundSource: 'TOTAL',
        amountText: totalMatch[0],
        amount: parseAmount(totalMatch[0]),
        fiscalYear: null,
        biennium: null,
        type: 'total'
      });
    }
  }

  return result;
}

function extractAgencyInfo(sectionXml) {
  // Try to find agency name in section header or caption
  const captions = extractTextContent(sectionXml, 'Caption');
  const billSectionHeaders = extractTextContent(sectionXml, 'BillSectionHeader');

  let agencyName = null;
  if (captions.length > 0) {
    agencyName = cleanText(captions[0]);
  } else if (billSectionHeaders.length > 0) {
    agencyName = cleanText(billSectionHeaders[0]);
  }

  return agencyName;
}

function extractConditionsAndLimitations(sectionXml) {
  // Look for proviso language and conditions
  const provisos = [];

  // Find paragraphs with specific appropriation conditions
  const paragraphs = extractTextContent(sectionXml, 'P');
  for (const p of paragraphs) {
    const text = cleanText(p);

    // Look for specific dollar amounts with context
    const amountPattern = /\$[\d,]+(?:\s+(?:of|for|to|from))?/gi;
    const amounts = text.match(amountPattern);

    if (amounts && amounts.length > 0) {
      // Check if this looks like a proviso (has conditions like "provided solely", "is for", etc.)
      if (text.match(/provided solely|is (?:provided )?for|shall|must be used/i)) {
        provisos.push({
          text: text,
          amounts: amounts.map(a => parseAmount(a))
        });
      }
    }
  }

  return provisos;
}

function extractFiscalDataFromBill(xmlFilePath) {
  console.log(`Processing ${path.basename(xmlFilePath)}...`);

  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');
  const billId = path.basename(xmlFilePath, '.xml');

  // Get bill description
  const briefDescs = extractTextContent(xmlContent, 'BriefDescription');
  const briefDescription = briefDescs.length > 0 ? cleanText(briefDescs[0]) : '';

  const fiscalData = [];
  const uncertainties = [];

  // Extract all Appropriations sections with their opening tags
  const appropRegex = /<Appropriations[^>]*>[\s\S]*?<\/Appropriations>/gi;
  const appropriationsSections = [];
  let match;
  while ((match = appropRegex.exec(xmlContent)) !== null) {
    appropriationsSections.push(match[0]);
  }

  for (let i = 0; i < appropriationsSections.length; i++) {
    const appropSection = appropriationsSections[i];

    // Get agency code from attribute
    const agencyMatch = appropSection.match(/agency="([^"]+)"/i);
    const agencyCode = agencyMatch ? agencyMatch[1] : `unknown_${i}`;

    // Extract appropriations
    const appropriations = extractAppropriation(appropSection, billId, agencyCode);

    // Find the full section context for this agency
    const agencyPattern = new RegExp(`<Appropriations[^>]*agency="${agencyCode}"[^>]*>[\\s\\S]*?</Appropriations>`, 'i');
    const fullSectionMatch = xmlContent.match(agencyPattern);
    let agencyName = agencyCode;
    let provisos = [];

    if (fullSectionMatch) {
      // Look for agency name in nearby context
      const sectionStart = xmlContent.indexOf(fullSectionMatch[0]);
      const contextBefore = xmlContent.substring(Math.max(0, sectionStart - 2000), sectionStart);
      const contextAfter = xmlContent.substring(sectionStart, Math.min(xmlContent.length, sectionStart + fullSectionMatch[0].length + 5000));

      const fullContext = contextBefore + fullSectionMatch[0] + contextAfter;

      // Try to find agency name from Department/DeptName
      const deptNames = extractTextContent(fullContext, 'DeptName');
      if (deptNames.length > 0) {
        const name = cleanText(deptNames[deptNames.length - 1]);
        if (name && name.length < 200) {
          agencyName = name.replace(/^FOR THE\s+/i, '');
        }
      }

      // Try to find section title if no department name
      if (agencyName === agencyCode) {
        const sectionTitles = extractTextContent(fullContext, 'SectionTitle');
        if (sectionTitles.length > 0) {
          const title = cleanText(sectionTitles[sectionTitles.length - 1]);
          if (title && title.length < 200) {
            agencyName = title;
          }
        }
      }

      // Try to find from Index tag
      if (agencyName === agencyCode) {
        const indexes = extractTextContent(fullContext, 'Index');
        if (indexes.length > 0) {
          const idx = cleanText(indexes[indexes.length - 1]);
          if (idx && idx.length < 200) {
            agencyName = idx;
          }
        }
      }

      // Extract provisos
      provisos = extractConditionsAndLimitations(fullContext);
    }

    // Add context to each appropriation
    for (const approp of appropriations) {
      approp.agency = agencyName;
      approp.agencyCode = agencyCode;
      approp.provisos = provisos.length;

      // Flag uncertainties
      if (approp.amount === 0 && approp.amountText) {
        uncertainties.push({
          bill: billId,
          section: agencyCode,
          issue: 'Amount parsed as zero',
          text: approp.amountText
        });
      }

      if (!approp.fiscalYear && !approp.biennium) {
        uncertainties.push({
          bill: billId,
          section: agencyCode,
          issue: 'No fiscal year or biennium identified',
          account: approp.accountName
        });
      }

      fiscalData.push(approp);
    }

    // Add provisos as separate entries
    for (const proviso of provisos) {
      for (const amount of proviso.amounts) {
        if (amount > 0) {
          fiscalData.push({
            bill: billId,
            section: agencyCode,
            agency: agencyName,
            agencyCode: agencyCode,
            type: 'proviso',
            amount: amount,
            amountText: `$${amount.toLocaleString()}`,
            purpose: proviso.text.substring(0, 200),
            fullText: proviso.text
          });
        }
      }
    }
  }

  return {
    billId,
    briefDescription,
    fiscalData,
    uncertainties
  };
}

function main() {
  const billsDir = __dirname;
  const xmlFiles = fs.readdirSync(billsDir).filter(f => f.endsWith('.xml'));

  console.log(`Found ${xmlFiles.length} XML files\n`);

  const allFiscalData = [];
  const allUncertainties = [];
  const billSummaries = [];

  for (const xmlFile of xmlFiles) {
    const xmlPath = path.join(billsDir, xmlFile);
    const result = extractFiscalDataFromBill(xmlPath);

    allFiscalData.push(...result.fiscalData);
    allUncertainties.push(...result.uncertainties);

    const totalAmount = result.fiscalData
      .filter(d => d.type !== 'total')
      .reduce((sum, d) => sum + d.amount, 0);

    billSummaries.push({
      bill: result.billId,
      description: result.briefDescription,
      totalItems: result.fiscalData.length,
      totalAmount: totalAmount,
      uncertainties: result.uncertainties.length
    });
  }

  // Save detailed fiscal data
  fs.writeFileSync(
    path.join(billsDir, 'fiscal-data.json'),
    JSON.stringify(allFiscalData, null, 2)
  );
  console.log(`\nWrote ${allFiscalData.length} fiscal items to fiscal-data.json`);

  // Generate summary
  const summary = {
    bills: billSummaries,
    totalAmount: allFiscalData
      .filter(d => d.type !== 'total' && d.type !== 'proviso')
      .reduce((sum, d) => sum + d.amount, 0),
    totalItems: allFiscalData.length,
    uncertainties: allUncertainties
  };

  // Aggregate by agency
  const byAgency = {};
  for (const item of allFiscalData.filter(d => d.type === 'appropriation')) {
    const agency = item.agency || item.agencyCode || 'Unknown';
    if (!byAgency[agency]) {
      byAgency[agency] = {
        agency,
        totalAmount: 0,
        items: 0,
        fundSources: new Set()
      };
    }
    byAgency[agency].totalAmount += item.amount;
    byAgency[agency].items += 1;
    if (item.fundSource) {
      byAgency[agency].fundSources.add(item.fundSource);
    }
  }

  // Convert sets to arrays
  summary.byAgency = Object.values(byAgency).map(a => ({
    ...a,
    fundSources: Array.from(a.fundSources)
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  // Aggregate by fund type
  const byFund = {};
  for (const item of allFiscalData.filter(d => d.type === 'appropriation')) {
    const fund = item.fundSource || 'Unknown';
    if (!byFund[fund]) {
      byFund[fund] = { fundSource: fund, totalAmount: 0, items: 0 };
    }
    byFund[fund].totalAmount += item.amount;
    byFund[fund].items += 1;
  }
  summary.byFundSource = Object.values(byFund).sort((a, b) => b.totalAmount - a.totalAmount);

  // Aggregate by fiscal year
  const byFY = {};
  for (const item of allFiscalData.filter(d => d.fiscalYear)) {
    const fy = item.fiscalYear;
    if (!byFY[fy]) {
      byFY[fy] = { fiscalYear: fy, totalAmount: 0, items: 0 };
    }
    byFY[fy].totalAmount += item.amount;
    byFY[fy].items += 1;
  }
  summary.byFiscalYear = Object.values(byFY).sort((a, b) => a.fiscalYear - b.fiscalYear);

  // Aggregate by biennium
  const byBiennium = {};
  for (const item of allFiscalData.filter(d => d.biennium)) {
    const b = item.biennium;
    if (!byBiennium[b]) {
      byBiennium[b] = { biennium: b, totalAmount: 0, items: 0 };
    }
    byBiennium[b].totalAmount += item.amount;
    byBiennium[b].items += 1;
  }
  summary.byBiennium = Object.values(byBiennium).sort((a, b) => a.biennium.localeCompare(b.biennium));

  fs.writeFileSync(
    path.join(billsDir, 'fiscal-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log(`Wrote summary to fiscal-summary.json`);

  // Print summary to console
  console.log('\n=== FISCAL DATA SUMMARY ===\n');
  console.log(`Total appropriations: $${summary.totalAmount.toLocaleString()}`);
  console.log(`Total fiscal items: ${summary.totalItems}`);
  console.log(`Total uncertainties: ${summary.uncertainties.length}\n`);

  console.log('Bills by fiscal impact:');
  billSummaries.sort((a, b) => b.totalAmount - a.totalAmount);
  for (const bill of billSummaries) {
    console.log(`  ${bill.bill}: $${bill.totalAmount.toLocaleString()} (${bill.totalItems} items)`);
    if (bill.description) {
      console.log(`    ${bill.description.substring(0, 80)}${bill.description.length > 80 ? '...' : ''}`);
    }
  }

  console.log('\nTop 10 agencies by appropriation:');
  for (const agency of summary.byAgency.slice(0, 10)) {
    console.log(`  ${agency.agency}: $${agency.totalAmount.toLocaleString()} (${agency.items} items)`);
  }

  console.log('\nTop 10 fund sources:');
  for (const fund of summary.byFundSource.slice(0, 10)) {
    console.log(`  ${fund.fundSource}: $${fund.totalAmount.toLocaleString()} (${fund.items} items)`);
  }

  if (summary.uncertainties.length > 0) {
    console.log(`\nUncertainties (${summary.uncertainties.length} total):`);
    for (const u of summary.uncertainties.slice(0, 10)) {
      console.log(`  ${u.bill} ${u.section}: ${u.issue}`);
      if (u.text) console.log(`    "${u.text}"`);
    }
    if (summary.uncertainties.length > 10) {
      console.log(`  ... and ${summary.uncertainties.length - 10} more`);
    }
  }
}

main();
