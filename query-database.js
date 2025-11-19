#!/usr/bin/env node

/**
 * Query tool for Washington State Operating Budget Bills Database
 * Provides various ways to query and explore the budget bills data
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'wa-budget-bills.db');

function openDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}

function queryDatabase(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function listAllBills(db) {
    console.log('\n=== All Budget Bills (2000-2025) ===\n');
    const bills = await queryDatabase(db, `
        SELECT bill_number, session_year, biennium, bill_type, chamber, enacted_date
        FROM budget_bills
        ORDER BY session_year DESC, bill_number
    `);

    console.table(bills);
    return bills;
}

async function getBillsByBiennium(db, biennium) {
    console.log(`\n=== Budget Bills for ${biennium} Biennium ===\n`);
    const bills = await queryDatabase(db, `
        SELECT bill_number, session_year, bill_type, chamber, title, enacted_date
        FROM budget_bills
        WHERE biennium = ?
        ORDER BY session_year, bill_type
    `, [biennium]);

    console.table(bills);
    return bills;
}

async function getBillsByType(db, billType) {
    console.log(`\n=== ${billType.charAt(0).toUpperCase() + billType.slice(1)} Budget Bills ===\n`);
    const bills = await queryDatabase(db, `
        SELECT bill_number, session_year, biennium, chamber, title, enacted_date
        FROM budget_bills
        WHERE bill_type = ?
        ORDER BY session_year DESC
    `, [billType]);

    console.table(bills);
    return bills;
}

async function getCompanionBills(db) {
    console.log('\n=== Bills with Companions ===\n');
    const companions = await queryDatabase(db, `
        SELECT
            b1.bill_number as primary_bill,
            b1.session_year,
            b1.biennium,
            b2.bill_number as companion_bill,
            cb.relationship
        FROM companion_bills cb
        JOIN budget_bills b1 ON cb.primary_bill_id = b1.id
        JOIN budget_bills b2 ON cb.companion_bill_id = b2.id
        ORDER BY b1.session_year DESC
    `);

    console.table(companions);
    return companions;
}

async function getBienniumSummary(db) {
    console.log('\n=== Summary by Biennium ===\n');
    const summary = await queryDatabase(db, `
        SELECT
            biennium,
            COUNT(*) as total_bills,
            SUM(CASE WHEN bill_type = 'biennial' THEN 1 ELSE 0 END) as biennial_bills,
            SUM(CASE WHEN bill_type = 'supplemental' THEN 1 ELSE 0 END) as supplemental_bills,
            SUM(CASE WHEN bill_type = 'special_session' THEN 1 ELSE 0 END) as special_session_bills,
            SUM(CASE WHEN partial_veto = 1 THEN 1 ELSE 0 END) as partial_vetoes
        FROM budget_bills
        GROUP BY biennium
        ORDER BY biennium DESC
    `);

    console.table(summary);
    return summary;
}

async function searchBills(db, searchTerm) {
    console.log(`\n=== Search Results for "${searchTerm}" ===\n`);
    const results = await queryDatabase(db, `
        SELECT bill_number, session_year, biennium, bill_type, chamber, title, notes
        FROM budget_bills
        WHERE
            bill_number LIKE ? OR
            title LIKE ? OR
            notes LIKE ?
        ORDER BY session_year DESC
    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

    if (results.length === 0) {
        console.log('No results found.');
    } else {
        console.table(results);
    }
    return results;
}

async function getBillDetails(db, billNumber, year) {
    console.log(`\n=== Details for ${billNumber} (${year}) ===\n`);
    const bill = await queryDatabase(db, `
        SELECT * FROM budget_bills
        WHERE bill_number = ? AND session_year = ?
    `, [billNumber, year]);

    if (bill.length === 0) {
        console.log('Bill not found.');
        return null;
    }

    // Get companion bills
    const companions = await queryDatabase(db, `
        SELECT
            b.bill_number,
            cb.relationship
        FROM companion_bills cb
        JOIN budget_bills b ON cb.companion_bill_id = b.id
        WHERE cb.primary_bill_id = ?
        UNION
        SELECT
            b.bill_number,
            'is companion to' as relationship
        FROM companion_bills cb
        JOIN budget_bills b ON cb.primary_bill_id = b.id
        WHERE cb.companion_bill_id = ?
    `, [bill[0].id, bill[0].id]);

    console.log('Bill Information:');
    console.log(bill[0]);

    if (companions.length > 0) {
        console.log('\nRelated Bills:');
        console.table(companions);
    }

    return bill[0];
}

async function getStatistics(db) {
    console.log('\n=== Database Statistics ===\n');

    const stats = {};

    // Total bills
    const totalResult = await queryDatabase(db, 'SELECT COUNT(*) as count FROM budget_bills');
    stats.total_bills = totalResult[0].count;

    // Bills by chamber
    const chamberResult = await queryDatabase(db, `
        SELECT chamber, COUNT(*) as count
        FROM budget_bills
        GROUP BY chamber
    `);
    stats.by_chamber = chamberResult;

    // Bills by type
    const typeResult = await queryDatabase(db, `
        SELECT bill_type, COUNT(*) as count
        FROM budget_bills
        GROUP BY bill_type
    `);
    stats.by_type = typeResult;

    // Bienniums covered
    const bienniumResult = await queryDatabase(db, `
        SELECT COUNT(DISTINCT biennium) as count
        FROM budget_bills
    `);
    stats.bienniums_covered = bienniumResult[0].count;

    // Years covered
    const yearResult = await queryDatabase(db, `
        SELECT MIN(session_year) as first_year, MAX(session_year) as last_year
        FROM budget_bills
    `);
    stats.year_range = yearResult[0];

    console.log('Total Bills:', stats.total_bills);
    console.log('Bienniums Covered:', stats.bienniums_covered);
    console.log('Year Range:', `${stats.year_range.first_year} - ${stats.year_range.last_year}`);
    console.log('\nBills by Chamber:');
    console.table(stats.by_chamber);
    console.log('Bills by Type:');
    console.table(stats.by_type);

    return stats;
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        const db = await openDatabase();

        switch (command) {
            case 'list':
            case 'all':
                await listAllBills(db);
                break;

            case 'biennium':
                if (!args[1]) {
                    console.error('Usage: node query-database.js biennium <biennium>');
                    console.error('Example: node query-database.js biennium 2023-25');
                    process.exit(1);
                }
                await getBillsByBiennium(db, args[1]);
                break;

            case 'type':
                if (!args[1]) {
                    console.error('Usage: node query-database.js type <type>');
                    console.error('Types: biennial, supplemental, special_session');
                    process.exit(1);
                }
                await getBillsByType(db, args[1]);
                break;

            case 'companions':
                await getCompanionBills(db);
                break;

            case 'summary':
                await getBienniumSummary(db);
                break;

            case 'search':
                if (!args[1]) {
                    console.error('Usage: node query-database.js search <term>');
                    process.exit(1);
                }
                await searchBills(db, args[1]);
                break;

            case 'bill':
                if (!args[1] || !args[2]) {
                    console.error('Usage: node query-database.js bill <bill_number> <year>');
                    console.error('Example: node query-database.js bill "ESSB 5167" 2025');
                    process.exit(1);
                }
                await getBillDetails(db, args[1], parseInt(args[2]));
                break;

            case 'stats':
                await getStatistics(db);
                break;

            default:
                console.log('WA Budget Bills Database Query Tool\n');
                console.log('Usage: node query-database.js <command> [options]\n');
                console.log('Commands:');
                console.log('  list, all                    - List all budget bills');
                console.log('  biennium <biennium>          - Get bills for a specific biennium (e.g., 2023-25)');
                console.log('  type <type>                  - Get bills by type (biennial, supplemental, special_session)');
                console.log('  companions                   - Show bills with companions');
                console.log('  summary                      - Show summary by biennium');
                console.log('  search <term>                - Search bills by text');
                console.log('  bill <bill_number> <year>    - Get details for a specific bill');
                console.log('  stats                        - Show database statistics');
                console.log('\nExamples:');
                console.log('  node query-database.js list');
                console.log('  node query-database.js biennium 2023-25');
                console.log('  node query-database.js type supplemental');
                console.log('  node query-database.js search "operating appropriations"');
                console.log('  node query-database.js bill "ESSB 5167" 2025');
                break;
        }

        db.close();

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = {
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
};
