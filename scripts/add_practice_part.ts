import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

let envPath;
if (typeof __dirname !== 'undefined') {
    envPath = path.resolve(__dirname, "../.env.local");
} else {
    // ES module fallback
    envPath = path.resolve(process.cwd(), ".env.local");
}
dotenv.config({ path: envPath });

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing");
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    console.log("Connected to PostgreSQL. Adding practice_part column...");
    
    await client.query('ALTER TABLE tryouts ADD COLUMN IF NOT EXISTS practice_part INTEGER;');
    
    console.log("Column practice_part added successfully to tryouts table!");
    
    await client.end();
}

main().catch(console.error);
