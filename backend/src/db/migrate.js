/**
 * Lightweight migration runner.
 * Usage: node src/db/migrate.js [up|down|status]
 *
 * Migrations live in src/db/migrations/*.sql
 * Named: NNN_description.sql (e.g. 001_create_schema_foundation.sql)
 * Each file contains an -- UP -- section and an optional -- DOWN -- section.
 *
 * The schema_migrations table tracks applied migrations.
 * Migrations are additive-only. No destructive migrations are authorized.
 */

import { readdir, readFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool, closePool } from './index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = resolve(__dirname, 'migrations')

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getApplied(client) {
  const { rows } = await client.query('SELECT name FROM schema_migrations ORDER BY name')
  return new Set(rows.map(r => r.name))
}

async function getMigrationFiles() {
  const files = await readdir(MIGRATIONS_DIR)
  return files
    .filter(f => f.endsWith('.sql'))
    .sort()
}

function parseSections(content) {
  const upMatch = content.match(/--\s*UP\s*--\n([\s\S]*?)(?:--\s*DOWN\s*--|$)/i)
  const downMatch = content.match(/--\s*DOWN\s*--\n([\s\S]*)/i)
  return {
    up: upMatch ? upMatch[1].trim() : content.trim(),
    down: downMatch ? downMatch[1].trim() : null,
  }
}

export async function migrateUp() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await ensureMigrationsTable(client)
    const applied = await getApplied(client)
    const files = await getMigrationFiles()
    const pending = files.filter(f => !applied.has(f))

    if (pending.length === 0) {
      console.log('[migrate] Already up to date.')
      await client.query('COMMIT')
      return
    }

    for (const file of pending) {
      const content = await readFile(resolve(MIGRATIONS_DIR, file), 'utf8')
      const { up } = parseSections(content)
      console.log(`[migrate] Applying: ${file}`)
      await client.query(up)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
    }

    await client.query('COMMIT')
    console.log(`[migrate] Applied ${pending.length} migration(s).`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[migrate] Migration failed — rolled back:', err.message)
    throw err
  } finally {
    client.release()
  }
}

export async function migrateDown() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await ensureMigrationsTable(client)
    const applied = [...(await getApplied(client))].sort().reverse()
    if (applied.length === 0) {
      console.log('[migrate] Nothing to roll back.')
      await client.query('COMMIT')
      return
    }

    const last = applied[0]
    const content = await readFile(resolve(MIGRATIONS_DIR, last), 'utf8')
    const { down } = parseSections(content)
    if (!down) {
      throw new Error(`Migration ${last} has no DOWN section — cannot rollback.`)
    }

    console.log(`[migrate] Rolling back: ${last}`)
    await client.query(down)
    await client.query('DELETE FROM schema_migrations WHERE name = $1', [last])
    await client.query('COMMIT')
    console.log('[migrate] Rollback complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[migrate] Rollback failed:', err.message)
    throw err
  } finally {
    client.release()
  }
}

export async function migrateStatus() {
  const client = await pool.connect()
  try {
    await ensureMigrationsTable(client)
    const applied = await getApplied(client)
    const files = await getMigrationFiles()
    console.log('\n[migrate] Status:')
    for (const f of files) {
      console.log(`  ${applied.has(f) ? '✓' : '○'} ${f}`)
    }
    console.log()
  } finally {
    client.release()
  }
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'up'
  const actions = { up: migrateUp, down: migrateDown, status: migrateStatus }
  const fn = actions[command]
  if (!fn) {
    console.error(`Unknown command: ${command}. Use: up | down | status`)
    process.exit(1)
  }
  fn()
    .then(() => closePool())
    .catch(err => { console.error(err); process.exit(1) })
}
