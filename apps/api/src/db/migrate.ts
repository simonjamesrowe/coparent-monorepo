/**
 * Database migration runner (Task 1.7)
 * Executes all SQL migrations from /migrations directory in order
 */

import * as fs from 'fs';
import * as path from 'path';
import { query } from './connection';
import logger from '../utils/logger';

interface MigrationRecord {
  id: string;
  name: string;
  executed_at: Date;
}

/**
 * Initialize migrations table if it doesn't exist
 */
async function initializeMigrationsTable(): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await query(createTableSQL);
    logger.info('Migrations table ready');
  } catch (error) {
    logger.error('Failed to create migrations table', error);
    throw error;
  }
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations(): Promise<MigrationRecord[]> {
  try {
    const result = await query('SELECT id, name, executed_at FROM _migrations ORDER BY id ASC');
    return result.rows;
  } catch (error) {
    logger.error('Failed to fetch executed migrations', error);
    return [];
  }
}

/**
 * Get list of migration files from /migrations directory
 */
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('Migrations directory not found', { path: migrationsDir });
    return [];
  }

  return fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

/**
 * Execute a single migration file
 */
async function executeMigration(filename: string): Promise<void> {
  const filepath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  try {
    await query(sql);
    await query(
      'INSERT INTO _migrations (name) VALUES ($1)',
      [filename]
    );
    logger.info(`Migration executed: ${filename}`);
  } catch (error) {
    logger.error(`Failed to execute migration: ${filename}`, error);
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    await initializeMigrationsTable();
    const executed = await getExecutedMigrations();
    const executedNames = new Set(executed.map((m) => m.name));
    const files = getMigrationFiles();

    const pending = files.filter((f) => !executedNames.has(f));

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Found ${pending.length} pending migration(s)`, { files: pending });

    for (const filename of pending) {
      await executeMigration(filename);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration process failed', error);
    process.exit(1);
  }
}

// Run migrations if executed directly
if (require.main === module) {
  runMigrations().then(() => {
    process.exit(0);
  });
}

export { runMigrations };
