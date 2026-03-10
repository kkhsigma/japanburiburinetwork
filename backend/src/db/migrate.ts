import 'dotenv/config';
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const { Client } = pg;

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jbn',
  });

  await client.connect();
  console.log('Connected to database');

  const migrationsDir = join(process.cwd(), 'src', 'db', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    await client.query(sql);
    console.log(`Applied migration: ${file}`);
  }

  console.log('Migration complete');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
