import * as dotenv from "dotenv"
import * as path from "path"
import { Client } from "pg"
import { v4 as uuidv4 } from "uuid"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error("❌ Missing DATABASE_URL env var")
    process.exit(1)
}

const SUBJECT = "FISMAT"
const CATEGORY = "COMPLEX_NUMBERS"
const QUESTIONS_PER_PART = 20

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

async function run() {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()
    console.log("🔌 Connected to database")

    try {
        await client.query("BEGIN")

        // Step 1: Delete existing Bilangan Kompleks practice tryouts
        console.log("\n🗑️  Step 1: Deleting existing COMPLEX_NUMBERS practice tryouts...")

        const { rows: existingTryouts } = await client.query(
            "SELECT id, title FROM tryouts WHERE subject = $1 AND category = $2 AND is_practice = true",
            [SUBJECT, CATEGORY]
        )
        console.log(`  Found ${existingTryouts.length} existing practice tryouts to delete`)

        if (existingTryouts.length > 0) {
            const tIds = existingTryouts.map((t: any) => t.id)

            const { rowCount: linksDeleted } = await client.query(
                "DELETE FROM tryout_questions WHERE tryout_id = ANY($1)", [tIds]
            )
            console.log(`  Deleted ${linksDeleted} tryout-question links`)

            const { rowCount: tryoutsDeleted } = await client.query(
                "DELETE FROM tryouts WHERE id = ANY($1)", [tIds]
            )
            console.log(`  Deleted ${tryoutsDeleted} tryouts`)
        }

        // Step 2: Fetch all COMPLEX_NUMBERS questions
        console.log("\n📥 Step 2: Fetching all COMPLEX_NUMBERS questions...")

        const { rows: questions } = await client.query(
            "SELECT id FROM questions WHERE subject = $1 AND category = $2",
            [SUBJECT, CATEGORY]
        )
        console.log(`  Found ${questions.length} questions for Bilangan Kompleks`)

        if (questions.length === 0) {
            console.log("⚠️  No questions found. Aborting.")
            await client.query("ROLLBACK")
            await client.end()
            return
        }

        // Step 3: Shuffle
        console.log("\n🔀 Step 3: Shuffling questions (Fisher-Yates)...")
        const shuffledIds = shuffleArray(questions.map((q: any) => q.id))
        console.log(`  Shuffled ${shuffledIds.length} questions`)

        // Step 4: Create practice tryouts with 20 questions each
        const totalParts = Math.ceil(shuffledIds.length / QUESTIONS_PER_PART)
        console.log(`\n📦 Step 4: Creating ${totalParts} practice tryouts (${QUESTIONS_PER_PART} questions each)...`)

        for (let part = 1; part <= totalParts; part++) {
            const start = (part - 1) * QUESTIONS_PER_PART
            const chunk = shuffledIds.slice(start, start + QUESTIONS_PER_PART)

            const tryoutId = uuidv4()
            const now = new Date().toISOString()

            await client.query(
                `INSERT INTO tryouts (id, title, description, category, subject, duration, status, max_attempts, is_practice, practice_part, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    tryoutId,
                    `Latihan Soal Bilangan Kompleks - Part ${part}`,
                    `Latihan soal esai Fisika Matematika materi Bilangan Kompleks bagian ${part}`,
                    CATEGORY, SUBJECT, 60, "ACTIVE", 999, true, part, now, now
                ]
            )

            for (let idx = 0; idx < chunk.length; idx++) {
                await client.query(
                    `INSERT INTO tryout_questions (id, tryout_id, question_id, "order")
                     VALUES ($1, $2, $3, $4)`,
                    [uuidv4(), tryoutId, chunk[idx], idx + 1]
                )
            }

            console.log(`  ✅ Created Part ${part}: ${chunk.length} questions`)
        }

        await client.query("COMMIT")
        console.log(`\n🎉 ALL DONE! ${shuffledIds.length} questions → ${totalParts} practice tryouts (${QUESTIONS_PER_PART}/part)`)

    } catch (err: any) {
        await client.query("ROLLBACK")
        console.error("❌ Transaction rolled back:", err.message)
    } finally {
        await client.end()
    }
}

run().catch(console.error)
