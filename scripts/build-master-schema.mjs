import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const header = `-- ============================================================
-- BASHTOLI E-COMMERCE MASTER DATABASE SCHEMA
-- ============================================================
-- This master script contains the complete, consolidated schema
-- for the Bashtoli e-commerce application. It is compiled from
-- the 6 modular migrations in supabase/migrations/:
--   1. 001_types_and_extensions.sql
--   2. 002_core_tables.sql
--   3. 003_indexes.sql
--   4. 004_functions_and_triggers.sql
--   5. 005_row_level_security.sql
--   6. 006_storage.sql
--
-- USAGE (Supabase Web Dashboard):
-- 1. Open your Supabase project dashboard.
-- 2. Navigate to SQL Editor -> New Query.
-- 3. Copy and paste the entire contents of this file.
-- 4. Click "Run" to provision the complete database in one execution.
-- 5. Afterward, run bootstrap-admin.sql to promote your admin user.
-- ============================================================`

const migrationFiles = [
  '001_types_and_extensions.sql',
  '002_core_tables.sql',
  '003_indexes.sql',
  '004_functions_and_triggers.sql',
  '005_row_level_security.sql',
  '006_storage.sql',
]

const migrationsDir = path.join(rootDir, 'supabase/migrations')
const targetFile = path.join(rootDir, 'supabase/scripts/master-schema.sql')

const fileContents = migrationFiles.map((filename) => {
  const filePath = path.join(migrationsDir, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file missing: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8').trimEnd()
})

const reconstructed = header + '\n\n' + fileContents.join('\n\n\n\n') + '\n'

// Check if content matches disk before/after write
const currentDisk = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : ''
const isIdentical = currentDisk === reconstructed

// Write directly to master-schema.sql
fs.writeFileSync(targetFile, reconstructed, 'utf8')
console.log(`Successfully rebuilt ${targetFile} from ${migrationFiles.length} migrations.`)
console.log(`In-sync with current disk before write: ${isIdentical}`)

// Verify diff against git HEAD
try {
  const diffOutput = execSync(`git diff --no-ext-diff ${targetFile}`, { encoding: 'utf8' })
  console.log(`Git diff against HEAD (${diffOutput.split('\n').length} lines changed):`)
  console.log(diffOutput ? diffOutput.slice(0, 400) + '... (truncated)' : 'No diff against HEAD.')
} catch (err) {
  console.error('Diff error:', err)
}
