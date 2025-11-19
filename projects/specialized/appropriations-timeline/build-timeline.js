#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load raw appropriations data
const rawData = JSON.parse(fs.readFileSync('appropriations-raw.json', 'utf8'));

console.log(`Loaded ${rawData.length} appropriations\n`);

// Normalize and aggregate data by agency/account/biennium
function buildNormalizedTimeline(data) {
  const timeline = {};
  const agencyTotals = {};

  for (const item of data) {
    const key = `${item.agencyCode}|${item.agencyName}`;

    if (!timeline[key]) {
      timeline[key] = {
        agencyCode: item.agencyCode,
        agencyName: item.agencyName,
        biennia: {},
        accounts: {}
      };
    }

    const agency = timeline[key];

    // Aggregate by biennium
    if (!agency.biennia[item.biennium]) {
      agency.biennia[item.biennium] = {
        biennium: item.biennium,
        budgetType: item.budgetType,
        totalAmount: 0,
        accounts: []
      };
    }

    agency.biennia[item.biennium].totalAmount += item.amount;

    // Track accounts
    const accountKey = `${item.accountName}|${item.fiscalYear || 'unknown'}`;
    if (!agency.accounts[accountKey]) {
      agency.accounts[accountKey] = {
        accountName: item.accountName,
        biennia: {}
      };
    }

    if (!agency.accounts[accountKey].biennia[item.biennium]) {
      agency.accounts[accountKey].biennia[item.biennium] = 0;
    }

    agency.accounts[accountKey].biennia[item.biennium] += item.amount;

    // Track agency totals across all biennia
    if (!agencyTotals[key]) {
      agencyTotals[key] = {
        agencyCode: item.agencyCode,
        agencyName: item.agencyName,
        total: 0,
        byBiennium: {}
      };
    }

    agencyTotals[key].total += item.amount;
    agencyTotals[key].byBiennium[item.biennium] =
      (agencyTotals[key].byBiennium[item.biennium] || 0) + item.amount;
  }

  return { timeline, agencyTotals };
}

// Analyze funding changes
function analyzeFundingChanges(timeline) {
  const changes = {
    growth: [],
    cuts: [],
    newPrograms: [],
    discontinued: [],
    stable: []
  };

  const bienniaOrder = ['2021-2023', '2023-2025', '2025-2027'];

  for (const key in timeline) {
    const agency = timeline[key];
    const bienniaData = agency.biennia;

    // Compare consecutive biennia
    for (let i = 0; i < bienniaOrder.length - 1; i++) {
      const currentBiennium = bienniaOrder[i];
      const nextBiennium = bienniaOrder[i + 1];

      const currentAmount = bienniaData[currentBiennium]?.totalAmount || 0;
      const nextAmount = bienniaData[nextBiennium]?.totalAmount || 0;

      if (currentAmount === 0 && nextAmount > 0) {
        // New program
        changes.newPrograms.push({
          agencyCode: agency.agencyCode,
          agencyName: agency.agencyName,
          biennium: nextBiennium,
          amount: nextAmount,
          previousBiennium: currentBiennium,
          budgetType: bienniaData[nextBiennium]?.budgetType
        });
      } else if (currentAmount > 0 && nextAmount === 0) {
        // Discontinued
        changes.discontinued.push({
          agencyCode: agency.agencyCode,
          agencyName: agency.agencyName,
          biennium: currentBiennium,
          amount: currentAmount,
          nextBiennium: nextBiennium,
          budgetType: bienniaData[currentBiennium]?.budgetType
        });
      } else if (currentAmount > 0 && nextAmount > 0) {
        const change = nextAmount - currentAmount;
        const percentChange = (change / currentAmount) * 100;

        const changeRecord = {
          agencyCode: agency.agencyCode,
          agencyName: agency.agencyName,
          fromBiennium: currentBiennium,
          toBiennium: nextBiennium,
          fromAmount: currentAmount,
          toAmount: nextAmount,
          change: change,
          percentChange: percentChange,
          budgetType: bienniaData[nextBiennium]?.budgetType
        };

        if (percentChange > 5) {
          changes.growth.push(changeRecord);
        } else if (percentChange < -5) {
          changes.cuts.push(changeRecord);
        } else {
          changes.stable.push(changeRecord);
        }
      }
    }
  }

  // Sort by magnitude of change
  changes.growth.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  changes.cuts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  changes.newPrograms.sort((a, b) => b.amount - a.amount);
  changes.discontinued.sort((a, b) => b.amount - a.amount);

  return changes;
}

// Calculate summary statistics
function calculateSummaryStats(data, timeline) {
  const stats = {
    totalAppropriations: data.length,
    totalAmount: 0,
    byBiennium: {},
    byBudgetType: {},
    byAgency: {},
    topAgenciesBySpending: []
  };

  // Calculate totals
  for (const item of data) {
    stats.totalAmount += item.amount;

    if (!stats.byBiennium[item.biennium]) {
      stats.byBiennium[item.biennium] = { count: 0, total: 0 };
    }
    stats.byBiennium[item.biennium].count++;
    stats.byBiennium[item.biennium].total += item.amount;

    if (!stats.byBudgetType[item.budgetType]) {
      stats.byBudgetType[item.budgetType] = { count: 0, total: 0 };
    }
    stats.byBudgetType[item.budgetType].count++;
    stats.byBudgetType[item.budgetType].total += item.amount;

    const agencyKey = `${item.agencyCode}|${item.agencyName}`;
    if (!stats.byAgency[agencyKey]) {
      stats.byAgency[agencyKey] = {
        agencyCode: item.agencyCode,
        agencyName: item.agencyName,
        total: 0,
        count: 0
      };
    }
    stats.byAgency[agencyKey].total += item.amount;
    stats.byAgency[agencyKey].count++;
  }

  // Get top agencies
  stats.topAgenciesBySpending = Object.values(stats.byAgency)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  stats.totalAgencies = Object.keys(stats.byAgency).length;

  return stats;
}

// Main execution
function main() {
  console.log('Building normalized timeline...');
  const { timeline, agencyTotals } = buildNormalizedTimeline(rawData);
  console.log(`  Normalized ${Object.keys(timeline).length} agencies`);

  console.log('\nAnalyzing funding changes...');
  const changes = analyzeFundingChanges(timeline);
  console.log(`  Growth: ${changes.growth.length}`);
  console.log(`  Cuts: ${changes.cuts.length}`);
  console.log(`  New: ${changes.newPrograms.length}`);
  console.log(`  Discontinued: ${changes.discontinued.length}`);
  console.log(`  Stable: ${changes.stable.length}`);

  console.log('\nCalculating summary statistics...');
  const stats = calculateSummaryStats(rawData, timeline);
  console.log(`  Total: $${(stats.totalAmount / 1e9).toFixed(2)}B`);
  console.log(`  Agencies: ${stats.totalAgencies}`);

  // Convert timeline object to array for JSON output
  const timelineArray = Object.values(timeline).map(agency => ({
    ...agency,
    accounts: Object.values(agency.accounts)
  }));

  // Build final output structure
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      source: 'WA State Budget Bills',
      biennia: ['2021-2023', '2023-2025', '2025-2027'],
      totalAppropriations: rawData.length,
      totalAgencies: stats.totalAgencies
    },
    summary: stats,
    agencies: timelineArray,
    changes: changes,
    topAgencies: stats.topAgenciesBySpending.map(a => ({
      agencyCode: a.agencyCode,
      agencyName: a.agencyName,
      totalAmount: a.total,
      timeline: timeline[`${a.agencyCode}|${a.agencyName}`]?.biennia || {}
    }))
  };

  // Save normalized timeline
  const outputPath = 'appropriations-timeline.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved timeline to: ${outputPath}`);

  return output;
}

if (require.main === module) {
  main();
}

module.exports = { buildNormalizedTimeline, analyzeFundingChanges, calculateSummaryStats };
