#!/usr/bin/env node

/**
 * Example usage of the WA Budget Bills Database
 * Demonstrates how to programmatically query the database
 */

const {
    openDatabase,
    queryDatabase,
    listAllBills,
    getBillsByBiennium,
    getBillsByType,
    getCompanionBills,
    getBienniumSummary,
    searchBills,
    getBillDetails,
    getStatistics
} = require('./query-database.js');

async function exampleUsage() {
    console.log('='.repeat(60));
    console.log('WA Budget Bills Database - Example Usage');
    console.log('='.repeat(60));

    try {
        // Open database connection
        const db = await openDatabase();
        console.log('\n✓ Database opened successfully\n');

        // Example 1: Get database statistics
        console.log('EXAMPLE 1: Database Statistics');
        console.log('-'.repeat(60));
        await getStatistics(db);

        // Example 2: Get bills for a specific biennium
        console.log('\n\nEXAMPLE 2: Bills for 2023-25 Biennium');
        console.log('-'.repeat(60));
        const bills2023 = await getBillsByBiennium(db, '2023-25');

        // Example 3: Get all supplemental budgets
        console.log('\n\nEXAMPLE 3: All Supplemental Budgets');
        console.log('-'.repeat(60));
        const supplementals = await getBillsByType(db, 'supplemental');

        // Example 4: Get companion bills
        console.log('\n\nEXAMPLE 4: Companion Bills');
        console.log('-'.repeat(60));
        await getCompanionBills(db);

        // Example 5: Search for bills
        console.log('\n\nEXAMPLE 5: Search for "2019"');
        console.log('-'.repeat(60));
        await searchBills(db, '2019');

        // Example 6: Get details for a specific bill
        console.log('\n\nEXAMPLE 6: Details for ESSB 5167 (2025)');
        console.log('-'.repeat(60));
        await getBillDetails(db, 'ESSB 5167', 2025);

        // Example 7: Custom query
        console.log('\n\nEXAMPLE 7: Custom Query - Bills with Partial Vetoes');
        console.log('-'.repeat(60));
        const partialVetoes = await queryDatabase(db, `
            SELECT bill_number, session_year, biennium, title
            FROM budget_bills
            WHERE partial_veto = 1
        `);
        if (partialVetoes.length > 0) {
            console.table(partialVetoes);
        } else {
            console.log('No bills with partial vetoes found.');
        }

        // Example 8: Bills by decade
        console.log('\n\nEXAMPLE 8: Count of Bills by Decade');
        console.log('-'.repeat(60));
        const byDecade = await queryDatabase(db, `
            SELECT
                CASE
                    WHEN session_year BETWEEN 2000 AND 2009 THEN '2000s'
                    WHEN session_year BETWEEN 2010 AND 2019 THEN '2010s'
                    WHEN session_year BETWEEN 2020 AND 2029 THEN '2020s'
                END as decade,
                COUNT(*) as bill_count
            FROM budget_bills
            WHERE session_year >= 2000
            GROUP BY decade
            ORDER BY decade
        `);
        console.table(byDecade);

        // Example 9: Most recent biennial budget
        console.log('\n\nEXAMPLE 9: Most Recent Biennial Budget');
        console.log('-'.repeat(60));
        const mostRecent = await queryDatabase(db, `
            SELECT *
            FROM budget_bills
            WHERE bill_type = 'biennial'
            ORDER BY session_year DESC
            LIMIT 1
        `);
        console.log(mostRecent[0]);

        // Example 10: Bills per biennium over time
        console.log('\n\nEXAMPLE 10: Number of Bills per Biennium (Chart)');
        console.log('-'.repeat(60));
        const billsPerBiennium = await queryDatabase(db, `
            SELECT biennium, COUNT(*) as count
            FROM budget_bills
            GROUP BY biennium
            ORDER BY biennium
        `);

        billsPerBiennium.forEach(row => {
            const bar = '█'.repeat(row.count);
            console.log(`${row.biennium.padEnd(10)} ${bar} (${row.count})`);
        });

        // Close database connection
        db.close();
        console.log('\n✓ Database closed\n');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run examples
if (require.main === module) {
    exampleUsage();
}

module.exports = { exampleUsage };
