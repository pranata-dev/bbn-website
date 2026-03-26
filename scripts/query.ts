import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run() {
    await client.connect()
    const { rows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='questions'")
    console.log(rows.map(r => r.column_name))
    await client.end()
}

run().catch(console.error)
