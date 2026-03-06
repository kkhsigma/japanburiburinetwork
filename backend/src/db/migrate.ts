import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const { Client } = pg;

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jbn',
  });

  await client.connect();
  console.log('Connected to database');

  // When run with tsx, __dirname is available
  const migrationPath = join(process.cwd(), 'src', 'db', 'migrations', '001_initial.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  await client.query(sql);

  console.log('Migration complete');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
