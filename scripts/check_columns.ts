import * as dotenv from "dotenv"
import * as path from "path"
import { Client } from "pg"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

async function main() {
    const c = new Client({ connectionString: process.env.DATABASE_URL })
    await c.connect()
    const r = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='questions' ORDER BY ordinal_position")
    console.log("questions columns:", r.rows.map((r: any) => r.column_name).join(", "))
    const r2 = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='tryout_questions' ORDER BY ordinal_position")
    console.log("tryout_questions columns:", r2.rows.map((r: any) => r.column_name).join(", "))
    await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
