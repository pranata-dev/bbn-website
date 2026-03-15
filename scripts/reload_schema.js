import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function reloadSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    // The command to tell PostgREST to reload its schema cache
    await client.query('NOTIFY pgrst, reload_schema;');
    console.log('Schema cache reload notification sent to PostgREST.');
  } catch (err) {
    console.error('Error reloading schema:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

reloadSchema();
