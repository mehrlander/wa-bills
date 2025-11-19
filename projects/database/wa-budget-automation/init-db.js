#!/usr/bin/env node
/**
 * Database Initialization Script
 * Creates SQLite database with schema for WA budget bill data
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

export function initDatabase(dbPath = './wa-budget.db') {
  console.log(`Initializing database at ${dbPath}...`);

  const db = new Database(dbPath);

  // Read schema file
  const schemaPath = join(ROOT_DIR, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema - split by statement since SQLite doesn't support multiple statements in exec
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const statement of statements) {
      if (statement) {
        db.exec(statement + ';');
      }
    }
    db.exec('COMMIT;');
    console.log('Database schema created successfully');
  } catch (error) {
    db.exec('ROLLBACK;');
    console.error('Error creating schema:', error);
    throw error;
  }

  return db;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = process.argv[2] || './wa-budget.db';
  initDatabase(dbPath);
  console.log('Database initialized successfully');
}
