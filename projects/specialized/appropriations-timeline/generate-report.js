#!/usr/bin/env node

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('appropriations-timeline.json', 'utf8'));

function formatCurrency(value) {
  if (value >= 1e9) {
    return '$' + (value / 1e9).toFixed(2) + 'B';
  } else if (value >= 1e6) {
    return '$' + (value / 1e6).toFixed(1) + 'M';
  } else {
    return '$' + (value / 1e3).toFixed(0) + 'K';
  }
}

function generateReport() {
  const lines = [];

  // Header
  lines.push('# Washington State Budget Appropriations Analysis');
  lines.push('');
  lines.push('**Analysis Period:** 2021-2023 through 2025-2027 Biennia');
  lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`This analysis examines appropriations across ${data.metadata.totalAgencies} state agencies over three biennia, covering both operating and capital budgets. Total appropriations analyzed: **${formatCurrency(data.summary.totalAmount)}**.`);
  lines.push('');

  // Key Findings
  lines.push('### Key Findings');
  lines.push('');
  lines.push(`- **${data.changes.growth.length}** agencies experienced budget growth (>5%)`);
  lines.push(`- **${data.changes.cuts.length}** agencies had budget cuts (>5%)`);
  lines.push(`- **${data.changes.newPrograms.length}** new programs or agencies funded`);
  lines.push(`- **${data.changes.discontinued.length}** programs or agencies discontinued`);
  lines.push(`- **${data.changes.stable.length}** agencies remained relatively stable (±5%)`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Budget Overview by Biennium
  lines.push('## Budget Overview by Biennium');
  lines.push('');
  lines.push('| Biennium | Total Appropriations | Line Items | Change from Previous |');
  lines.push('|----------|---------------------|------------|---------------------|');

  const biennia = data.metadata.biennia;
  let prevAmount = 0;
  for (const biennium of biennia) {
    const bienniumData = data.summary.byBiennium[biennium];
    const amount = bienniumData?.total || 0;
    const count = bienniumData?.count || 0;
    const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount * 100).toFixed(1) + '%' : 'N/A';
    lines.push(`| ${biennium} | ${formatCurrency(amount)} | ${count.toLocaleString()} | ${change} |`);
    prevAmount = amount;
  }
  lines.push('');

  // Operating vs Capital
  lines.push('### Operating vs Capital Budget Breakdown');
  lines.push('');
  lines.push('| Budget Type | Total Amount | Percentage | Line Items |');
  lines.push('|-------------|--------------|------------|------------|');
  const totalAmount = data.summary.totalAmount;
  for (const [type, typeData] of Object.entries(data.summary.byBudgetType)) {
    const percent = ((typeData.total / totalAmount) * 100).toFixed(1);
    lines.push(`| ${type.charAt(0).toUpperCase() + type.slice(1)} | ${formatCurrency(typeData.total)} | ${percent}% | ${typeData.count.toLocaleString()} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Top Agencies
  lines.push('## Top 20 Agencies by Total Spending');
  lines.push('');
  lines.push('| Rank | Agency | Total Spending | 2021-23 | 2023-25 | 2025-27 |');
  lines.push('|------|--------|----------------|---------|---------|---------|');

  data.topAgencies.slice(0, 20).forEach((agency, idx) => {
    const timeline = agency.timeline || {};
    const b2123 = formatCurrency(timeline['2021-2023']?.totalAmount || 0);
    const b2325 = formatCurrency(timeline['2023-2025']?.totalAmount || 0);
    const b2527 = formatCurrency(timeline['2025-2027']?.totalAmount || 0);
    lines.push(`| ${idx + 1} | ${agency.agencyName} | ${formatCurrency(agency.totalAmount)} | ${b2123} | ${b2325} | ${b2527} |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // Major Budget Increases
  lines.push('## Major Budget Increases');
  lines.push('');
  lines.push('### Top 15 Largest Dollar Increases');
  lines.push('');
  lines.push('| Rank | Agency | Period | From | To | Increase | % Change |');
  lines.push('|------|--------|--------|------|----|-----------| ---------|');

  data.changes.growth.slice(0, 15).forEach((item, idx) => {
    lines.push(`| ${idx + 1} | ${item.agencyName} | ${item.fromBiennium} → ${item.toBiennium} | ${formatCurrency(item.fromAmount)} | ${formatCurrency(item.toAmount)} | ${formatCurrency(item.change)} | +${item.percentChange.toFixed(1)}% |`);
  });
  lines.push('');

  // Major Budget Cuts
  lines.push('## Major Budget Cuts');
  lines.push('');
  lines.push('### Top 15 Largest Dollar Decreases');
  lines.push('');
  lines.push('| Rank | Agency | Period | From | To | Decrease | % Change |');
  lines.push('|------|--------|--------|------|----|-----------| ---------|');

  data.changes.cuts.slice(0, 15).forEach((item, idx) => {
    lines.push(`| ${idx + 1} | ${item.agencyName} | ${item.fromBiennium} → ${item.toBiennium} | ${formatCurrency(item.fromAmount)} | ${formatCurrency(item.toAmount)} | ${formatCurrency(item.change)} | ${item.percentChange.toFixed(1)}% |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // New Programs
  lines.push('## New Programs and Funding');
  lines.push('');
  lines.push(`Total new programs or agencies: **${data.changes.newPrograms.length}**`);
  lines.push('');
  lines.push('### Top 15 Largest New Appropriations');
  lines.push('');
  lines.push('| Rank | Agency | Biennium | Amount | Budget Type |');
  lines.push('|------|--------|----------|--------|-------------|');

  data.changes.newPrograms.slice(0, 15).forEach((item, idx) => {
    lines.push(`| ${idx + 1} | ${item.agencyName} | ${item.biennium} | ${formatCurrency(item.amount)} | ${item.budgetType} |`);
  });
  lines.push('');

  // Discontinued Programs
  lines.push('## Discontinued Programs and Funding');
  lines.push('');
  lines.push(`Total discontinued programs or agencies: **${data.changes.discontinued.length}**`);
  lines.push('');
  lines.push('### Top 15 Largest Discontinued Appropriations');
  lines.push('');
  lines.push('| Rank | Agency | Last Funded | Amount | Budget Type |');
  lines.push('|------|--------|-------------|--------|-------------|');

  data.changes.discontinued.slice(0, 15).forEach((item, idx) => {
    lines.push(`| ${idx + 1} | ${item.agencyName} | ${item.biennium} | ${formatCurrency(item.amount)} | ${item.budgetType} |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // Trends and Insights
  lines.push('## Trends and Insights');
  lines.push('');

  // Calculate growth trends
  const totalGrowthAmount = data.changes.growth.reduce((sum, item) => sum + item.change, 0);
  const totalCutsAmount = data.changes.cuts.reduce((sum, item) => sum + Math.abs(item.change), 0);
  const netChange = totalGrowthAmount - totalCutsAmount;

  lines.push('### Overall Budget Trends');
  lines.push('');
  lines.push(`- **Total Growth Amount:** ${formatCurrency(totalGrowthAmount)} across ${data.changes.growth.length} agencies`);
  lines.push(`- **Total Cuts Amount:** ${formatCurrency(totalCutsAmount)} across ${data.changes.cuts.length} agencies`);
  lines.push(`- **Net Change:** ${formatCurrency(netChange)} (${netChange > 0 ? 'growth' : 'decline'})`);
  lines.push('');

  // Budget type analysis
  const growthByType = {};
  const cutsByType = {};

  data.changes.growth.forEach(item => {
    growthByType[item.budgetType] = (growthByType[item.budgetType] || 0) + 1;
  });

  data.changes.cuts.forEach(item => {
    cutsByType[item.budgetType] = (cutsByType[item.budgetType] || 0) + 1;
  });

  lines.push('### Growth and Cuts by Budget Type');
  lines.push('');
  lines.push('| Budget Type | Growth Count | Cuts Count |');
  lines.push('|-------------|--------------|------------|');
  const budgetTypes = new Set([...Object.keys(growthByType), ...Object.keys(cutsByType)]);
  for (const type of budgetTypes) {
    lines.push(`| ${type.charAt(0).toUpperCase() + type.slice(1)} | ${growthByType[type] || 0} | ${cutsByType[type] || 0} |`);
  }
  lines.push('');

  // Volatility analysis
  const volatileAgencies = data.changes.growth
    .concat(data.changes.cuts)
    .filter(item => Math.abs(item.percentChange) > 50)
    .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
    .slice(0, 10);

  if (volatileAgencies.length > 0) {
    lines.push('### Most Volatile Budgets (>50% change)');
    lines.push('');
    lines.push('| Agency | Period | Change | % Change |');
    lines.push('|--------|--------|--------|----------|');
    volatileAgencies.forEach(item => {
      const changeStr = item.percentChange > 0 ? '+' + item.percentChange.toFixed(1) : item.percentChange.toFixed(1);
      lines.push(`| ${item.agencyName} | ${item.fromBiennium} → ${item.toBiennium} | ${formatCurrency(item.change)} | ${changeStr}% |`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Methodology
  lines.push('## Methodology');
  lines.push('');
  lines.push('This analysis was generated by parsing XML files of enacted Washington State budget bills:');
  lines.push('');
  lines.push('- **Operating Budgets:** ESSB 5693 (2021-23 Supp), ESSB 5187 (2023-25), ESSB 5950 (2023-25 Supp), ESSB 5167 (2025-27)');
  lines.push('- **Capital Budgets:** ESSB 5200 (2023-25), ESSB 5195 (2025-27)');
  lines.push('');
  lines.push('**Definitions:**');
  lines.push('- **Growth:** Agencies with >5% budget increase between consecutive biennia');
  lines.push('- **Cuts:** Agencies with >5% budget decrease between consecutive biennia');
  lines.push('- **Stable:** Agencies with changes within ±5%');
  lines.push('- **New Programs:** Agencies/programs receiving funding in a biennium that had no funding in the previous biennium');
  lines.push('- **Discontinued:** Agencies/programs that had funding in one biennium but none in the next');
  lines.push('');
  lines.push('**Note:** Supplemental budgets adjust the base budget. Changes shown reflect enacted appropriations at the time of bill passage.');
  lines.push('');

  return lines.join('\n');
}

const report = generateReport();
fs.writeFileSync('funding-changes.md', report);
console.log('Generated funding-changes.md');
console.log(`Report length: ${report.split('\n').length} lines`);
