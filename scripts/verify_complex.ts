import * as dotenv from "dotenv"
import * as path from "path"
import { Client } from "pg"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

async function main() {
    const c = new Client({ connectionString: process.env.DATABASE_URL })
    await c.connect()
    const qCount = await c.query("SELECT COUNT(*) FROM questions WHERE category = 'COMPLEX_NUMBERS'")
    const tCount = await c.query("SELECT COUNT(*) FROM tryouts WHERE category = 'COMPLEX_NUMBERS'")
    const tqCount = await c.query("SELECT COUNT(*) FROM tryout_questions tq JOIN tryouts t ON tq.tryout_id = t.id WHERE t.category = 'COMPLEX_NUMBERS'")
    console.log(`Questions: ${qCount.rows[0].count}`)
    console.log(`Tryouts: ${tCount.rows[0].count}`)
    console.log(`Tryout-Question Links: ${tqCount.rows[0].count}`)
    await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
