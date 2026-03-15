const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function reloadSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('Schema cache reload notification sent to PostgREST.');
  } catch (err) {
    console.error('Error reloading schema:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

reloadSchema();
