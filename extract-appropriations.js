#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

// Bill metadata
const BILLS = [
  { file: '5693-S.xml', biennium: '2021-2023', type: 'operating', session: 'supplemental', year: 2022 },
  { file: '5187-S.xml', biennium: '2023-2025', type: 'operating', session: 'regular', year: 2023 },
  { file: '5950-S.xml', biennium: '2023-2025', type: 'operating', session: 'supplemental', year: 2024 },
  { file: '5167-S.xml', biennium: '2025-2027', type: 'operating', session: 'regular', year: 2025 },
  { file: '5200-S.xml', biennium: '2023-2025', type: 'capital', session: 'regular', year: 2023 },
  { file: '5195-S.xml', biennium: '2025-2027', type: 'capital', session: 'regular', year: 2025 },
];

// Extract text content from XML node
function getText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) {
    return node.map(getText).join(' ').trim();
  }
  if (node._) return node._;
  if (node.TextRun) return getText(node.TextRun);
  if (node.P) return getText(node.P);
  if (node.BudgetP) return getText(node.BudgetP);
  return '';
}

// Parse dollar amount from text
function parseDollarAmount(text) {
  const cleaned = text.replace(/[$,\s]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
}

// Extract agency name from section
function extractAgencyName(section) {
  const header = section?.BillSectionHeader;
  if (!header || !header[0]) return null;

  const dept = header[0]?.Department;
  if (!dept || !dept[0]) return null;

  const deptName = dept[0]?.DeptName;
  if (!deptName || !deptName[0]) return null;

  return getText(deptName[0]).replace(/^FOR THE\s+/i, '').trim();
}

// Extract appropriations from a bill section
function extractAppropriationsFromSection(section, billMetadata) {
  const appropriations = [];

  const agencyName = extractAgencyName(section);
  if (!agencyName) return appropriations;

  const appropElements = section?.Appropriations;
  if (!appropElements) return appropriations;

  for (const appropSet of appropElements) {
    const agencyCode = appropSet.$?.agency || 'unknown';
    const projectCode = appropSet.$?.project || null;

    const appropItems = appropSet?.Appropriation || [];

    for (const item of appropItems) {
      const accountName = getText(item.AccountName);
      const dollarAmount = getText(item.DollarAmount);
      const amount = parseDollarAmount(dollarAmount);

      // Extract fiscal year from account name (e.g., "FY 2024", "FY 2026")
      const fyMatch = accountName.match(/FY\s*(\d{4})/i);
      const fiscalYear = fyMatch ? fyMatch[1] : null;

      appropriations.push({
        biennium: billMetadata.biennium,
        budgetType: billMetadata.type,
        session: billMetadata.session,
        billYear: billMetadata.year,
        billFile: billMetadata.file,
        agencyCode,
        agencyName,
        projectCode,
        accountName: accountName.replace(/\u2014/g, '-').trim(),
        fiscalYear,
        amount,
        rawAmount: dollarAmount
      });
    }
  }

  return appropriations;
}

// Extract project name from capital budget section
function extractProjectName(section) {
  const projectName = section?.CapitalProjectName;
  if (!projectName || !projectName[0]) return null;
  return getText(projectName[0]).trim();
}

// Main extraction function
async function extractBillData(billMetadata) {
  const xmlPath = path.join(__dirname, billMetadata.file);
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');

  console.log(`Processing ${billMetadata.file} (${billMetadata.biennium} ${billMetadata.type})...`);

  const parsed = await parseStringPromise(xmlContent);
  const bill = parsed?.CertifiedBill?.Bill?.[0];
  if (!bill) {
    console.log(`  No bill data found`);
    return [];
  }

  const body = bill.BillBody?.[0];
  if (!body) {
    console.log(`  No bill body found`);
    return [];
  }

  // Extract sections from Parts
  const allAppropriations = [];
  const parts = body.Part || [];
  const topLevelSections = body.BillSection || [];

  console.log(`  Found ${parts.length} parts and ${topLevelSections.length} top-level sections`);

  // Collect all sections from parts
  const allSections = [...topLevelSections];
  for (const part of parts) {
    const partSections = part.BillSection || [];
    allSections.push(...partSections);
  }

  console.log(`  Total sections to process: ${allSections.length}`);

  for (const section of allSections) {
    const sectionAppropriations = extractAppropriationsFromSection(section, billMetadata);

    // For capital budgets, add project name
    if (billMetadata.type === 'capital' && sectionAppropriations.length > 0) {
      const projectName = extractProjectName(section);
      for (const approp of sectionAppropriations) {
        approp.projectName = projectName;
      }
    }

    allAppropriations.push(...sectionAppropriations);
  }

  console.log(`  Extracted ${allAppropriations.length} appropriations`);
  return allAppropriations;
}

// Main execution
async function main() {
  console.log('Extracting appropriations from WA budget bills...\n');

  const allData = [];

  for (const bill of BILLS) {
    try {
      const data = await extractBillData(bill);
      allData.push(...data);
    } catch (error) {
      console.error(`Error processing ${bill.file}:`, error.message);
    }
  }

  console.log(`\nTotal appropriations extracted: ${allData.length}`);

  // Save raw extraction
  const outputPath = path.join(__dirname, 'appropriations-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
  console.log(`\nRaw data saved to: ${outputPath}`);

  // Generate summary statistics
  const stats = {
    totalAppropriations: allData.length,
    byBiennium: {},
    byBudgetType: {},
    byAgency: {},
    totalAmount: 0
  };

  for (const item of allData) {
    stats.byBiennium[item.biennium] = (stats.byBiennium[item.biennium] || 0) + 1;
    stats.byBudgetType[item.budgetType] = (stats.byBudgetType[item.budgetType] || 0) + 1;
    stats.byAgency[item.agencyName] = (stats.byAgency[item.agencyName] || 0) + 1;
    stats.totalAmount += item.amount;
  }

  console.log('\nSummary Statistics:');
  console.log('  By Biennium:', stats.byBiennium);
  console.log('  By Budget Type:', stats.byBudgetType);
  console.log('  Total Amount:', `$${(stats.totalAmount / 1e9).toFixed(2)}B`);
  console.log('  Unique Agencies:', Object.keys(stats.byAgency).length);

  return allData;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, extractBillData, BILLS };
