import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || ''

declare global {
  // eslint-disable-next-line no-var
  var sql: postgres.Sql | undefined
}

const sql = globalThis.sql || postgres(connectionString, {
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.sql = sql
}

let initialized = false

export async function initDb() {
  if (initialized) return
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY DEFAULT 1,
      names JSONB NOT NULL DEFAULT '[]'
    );
  `
  await sql`
    INSERT INTO players (id, names) VALUES (1, '[]') ON CONFLICT DO NOTHING;
  `
  initialized = true
}

export default sql
