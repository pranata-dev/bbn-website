import * as dotenv from "dotenv"
import * as path from "path"
import { Client } from "pg"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

async function main() {
    const c = new Client({ connectionString: process.env.DATABASE_URL })
    await c.connect()
    await c.query("NOTIFY pgrst, 'reload schema'")
    console.log("✅ PostgREST schema cache reload notified")
    await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
