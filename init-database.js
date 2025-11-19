#!/usr/bin/env node

/**
 * Initialize SQLite database for Washington State Operating Budget Bills
 * Populates with historical budget bill data from 2000-2025
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'wa-budget-bills.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

// Historical budget bills data compiled from research
const budgetBills = [
    // 2025-27 Biennium
    {
        bill_number: 'ESSB 5167',
        session_year: 2025,
        biennium: '2025-27',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2025-2027 fiscal biennium operating appropriations',
        enacted_date: '2025-05-20',
        notes: 'Passed legislature on 2025-04-27'
    },

    // 2023-25 Biennium
    {
        bill_number: 'ESSB 5187',
        session_year: 2023,
        biennium: '2023-25',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2023-2025 fiscal biennium operating appropriations'
    },
    {
        bill_number: 'ESSB 5950',
        session_year: 2024,
        biennium: '2023-25',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2024 supplemental operating appropriations'
    },

    // 2021-23 Biennium
    {
        bill_number: 'SB 5092',
        session_year: 2021,
        biennium: '2021-23',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2021-2023 fiscal biennium operating appropriations'
    },

    // 2019-21 Biennium
    {
        bill_number: 'HB 1109',
        session_year: 2019,
        biennium: '2019-21',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2019-21 biennial operating appropriations',
        chapter_number: '415',
        chapter_year: 2019,
        enacted_date: '2019-05-21',
        effective_date: '2019-05-21',
        partial_veto: 1,
        notes: 'Passed legislature on 2019-04-28, partially vetoed by Governor'
    },
    {
        bill_number: 'ESSB 5153',
        session_year: 2019,
        biennium: '2019-21',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2019-21 biennial operating appropriations (companion to HB 1109)',
        notes: 'Companion bill to HB 1109'
    },

    // 2017-19 Biennium
    {
        bill_number: 'ESSB 5096',
        session_year: 2017,
        biennium: '2017-19',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2017-19 biennial operating appropriations',
        enacted_date: '2017-05-16'
    },
    {
        bill_number: 'ESSB 6032',
        session_year: 2018,
        biennium: '2017-19',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2018 supplemental operating appropriations',
        enacted_date: '2018-03-27'
    },

    // 2015-17 Biennium
    {
        bill_number: 'ESSB 6052',
        session_year: 2015,
        biennium: '2015-17',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2015-17 biennial operating appropriations',
        enacted_date: '2015-06-29'
    },

    // 2013-15 Biennium
    {
        bill_number: 'ESHB 1057',
        session_year: 2013,
        biennium: '2013-15',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2013-15 biennial operating appropriations'
    },
    {
        bill_number: 'ESSB 5034',
        session_year: 2013,
        biennium: '2013-15',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2013-15 biennial operating appropriations (companion to ESHB 1057)',
        notes: 'Companion bill to ESHB 1057'
    },

    // 2011-13 Biennium
    {
        bill_number: 'ESHB 1087',
        session_year: 2011,
        biennium: '2011-13',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2011-13 biennial operating appropriations'
    },
    {
        bill_number: 'ESSB 5034',
        session_year: 2011,
        biennium: '2011-13',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2011-13 supplemental operating appropriations'
    },

    // 2009-11 Biennium
    {
        bill_number: 'HB 1244',
        session_year: 2009,
        biennium: '2009-11',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2009-11 biennial operating appropriations',
        chapter_number: '564',
        chapter_year: 2009,
        notes: 'Enacted as 2009 c 564'
    },
    {
        bill_number: 'ESSB 6444',
        session_year: 2010,
        biennium: '2009-11',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2010 supplemental operating appropriations',
        notes: 'Amended sections of 2009 c 564'
    },
    {
        bill_number: 'HB 3225',
        session_year: 2010,
        biennium: '2009-11',
        bill_type: 'special_session',
        chamber: 'House',
        title: 'Making 2009-2011 supplemental operating appropriations',
        chapter_number: '1',
        chapter_year: 2010,
        effective_date: '2010-12-11',
        notes: '2010 2nd Special Session - implemented reductions across state agencies'
    },

    // 2007-09 Biennium
    {
        bill_number: 'ESHB 1128',
        session_year: 2007,
        biennium: '2007-09',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2007-09 biennial operating appropriations',
        chapter_number: '522',
        chapter_year: 2007,
        notes: 'Enacted as 2007 c 522'
    },
    {
        bill_number: 'ESHB 2687',
        session_year: 2008,
        biennium: '2007-09',
        bill_type: 'supplemental',
        chamber: 'House',
        title: 'Making 2008 supplemental operating appropriations',
        notes: 'Amended sections of 2007 c 522'
    },

    // 2005-07 Biennium
    {
        bill_number: 'ESSB 6090',
        session_year: 2005,
        biennium: '2005-07',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2005-07 biennial operating appropriations'
    },
    {
        bill_number: 'ESSB 6386',
        session_year: 2006,
        biennium: '2005-07',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2006 supplemental operating appropriations'
    },

    // 2003-05 Biennium
    {
        bill_number: 'ESHB 2459',
        session_year: 2004,
        biennium: '2003-05',
        bill_type: 'supplemental',
        chamber: 'House',
        title: 'Making 2004 supplemental operating appropriations'
    },
    {
        bill_number: 'ESSB 5404',
        session_year: 2003,
        biennium: '2003-05',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2003-05 biennial operating appropriations'
    },
    {
        bill_number: 'SSB 5403',
        session_year: 2003,
        biennium: '2003-05',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2003-05 biennial operating appropriations (companion)',
        notes: 'Related to ESSB 5404'
    },

    // 2001-03 Biennium
    {
        bill_number: 'ESSB 6153',
        session_year: 2001,
        biennium: '2001-03',
        bill_type: 'biennial',
        chamber: 'Senate',
        title: 'Making 2001-03 biennial operating appropriations'
    },
    {
        bill_number: 'SHB 1314',
        session_year: 2001,
        biennium: '2001-03',
        bill_type: 'biennial',
        chamber: 'House',
        title: 'Making 2001-03 biennial operating appropriations (companion)',
        notes: 'Companion bill to ESSB 6153'
    },
    {
        bill_number: 'ESSB 6387',
        session_year: 2002,
        biennium: '2001-03',
        bill_type: 'supplemental',
        chamber: 'Senate',
        title: 'Making 2002 supplemental operating appropriations'
    },

    // 1999-01 Biennium (includes 2000)
    {
        bill_number: 'EHB 2487',
        session_year: 2000,
        biennium: '1999-01',
        bill_type: 'supplemental',
        chamber: 'House',
        title: 'Making 2000 supplemental operating appropriations'
    }
];

// Companion relationships to establish
const companionRelationships = [
    { primary: 'HB 1109', companion: 'ESSB 5153', year: 2019, relationship: 'companion' },
    { primary: 'ESHB 1057', companion: 'ESSB 5034', year: 2013, relationship: 'companion' },
    { primary: 'ESSB 6153', companion: 'SHB 1314', year: 2001, relationship: 'companion' },
    { primary: 'ESSB 5404', companion: 'SSB 5403', year: 2003, relationship: 'companion' },
    { primary: 'ESHB 1128', companion: 'ESHB 2687', year: 2007, relationship: 'amended_by' },
    { primary: 'HB 1244', companion: 'ESSB 6444', year: 2009, relationship: 'amended_by' }
];

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Remove existing database if it exists
        if (fs.existsSync(DB_FILE)) {
            console.log('Removing existing database...');
            fs.unlinkSync(DB_FILE);
        }

        const db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Database created successfully.');
            resolve(db);
        });
    });
}

function createSchema(db) {
    return new Promise((resolve, reject) => {
        const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');

        db.exec(schema, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Schema created successfully.');
            resolve();
        });
    });
}

function insertBills(db) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO budget_bills (
                bill_number, session_year, biennium, bill_type, chamber,
                title, chapter_number, chapter_year, enacted_date, effective_date,
                vetoed, partial_veto, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let completed = 0;
        budgetBills.forEach((bill) => {
            stmt.run(
                bill.bill_number,
                bill.session_year,
                bill.biennium,
                bill.bill_type,
                bill.chamber,
                bill.title || null,
                bill.chapter_number || null,
                bill.chapter_year || null,
                bill.enacted_date || null,
                bill.effective_date || null,
                bill.vetoed || 0,
                bill.partial_veto || 0,
                bill.notes || null,
                (err) => {
                    if (err) {
                        console.error(`Error inserting ${bill.bill_number}:`, err.message);
                    } else {
                        completed++;
                        if (completed === budgetBills.length) {
                            stmt.finalize();
                            console.log(`Inserted ${completed} budget bills.`);
                            resolve();
                        }
                    }
                }
            );
        });
    });
}

function insertCompanionRelationships(db) {
    return new Promise((resolve, reject) => {
        // First, get bill IDs
        const getBillId = (billNumber, year) => {
            return new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM budget_bills WHERE bill_number = ? AND session_year = ?',
                    [billNumber, year],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row ? row.id : null);
                    }
                );
            });
        };

        const stmt = db.prepare(`
            INSERT INTO companion_bills (primary_bill_id, companion_bill_id, relationship, notes)
            VALUES (?, ?, ?, ?)
        `);

        Promise.all(
            companionRelationships.map(async (rel) => {
                const primaryId = await getBillId(rel.primary, rel.year);
                const companionId = await getBillId(rel.companion, rel.year);

                if (primaryId && companionId) {
                    return new Promise((resolve, reject) => {
                        stmt.run(primaryId, companionId, rel.relationship, null, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            })
        ).then(() => {
            stmt.finalize();
            console.log(`Inserted ${companionRelationships.length} companion relationships.`);
            resolve();
        }).catch(reject);
    });
}

async function main() {
    try {
        console.log('Initializing Washington State Operating Budget Bills Database...\n');

        const db = await initializeDatabase();
        await createSchema(db);
        await insertBills(db);
        await insertCompanionRelationships(db);

        // Display summary
        db.get('SELECT COUNT(*) as count FROM budget_bills', (err, row) => {
            if (err) {
                console.error('Error getting count:', err);
            } else {
                console.log(`\nDatabase initialized successfully!`);
                console.log(`Total bills in database: ${row.count}`);
            }

            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('\nDatabase file: ' + DB_FILE);
                }
            });
        });

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { initializeDatabase, createSchema, insertBills };
