import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
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

const FILES = [
    "C:/Users/p/OneDrive/Dokumen/FISMAT - BILANGAN KOMPLEKS SOAL.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - BILANGAN KOMPLEKS SOAL 2.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - BILANGAN KOMPLEKS SOAL 3.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - BILANGAN KOMPLEKS SOAL 4.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - BILANGAN KOMPLEKS SOAL 5.txt",
]

function removeBold(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, "$1")
}

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
    console.log("🔌 Connected to database directly via pg")

    // Step 1: Clean up any existing COMPLEX_NUMBERS data
    console.log("🗑️  Cleaning existing COMPLEX_NUMBERS data...")

    const { rows: existingTryouts } = await client.query(
        "SELECT id FROM tryouts WHERE category = $1", [CATEGORY]
    )

    if (existingTryouts.length > 0) {
        const tIds = existingTryouts.map((t: any) => t.id)
        await client.query(
            "DELETE FROM tryout_questions WHERE tryout_id = ANY($1)", [tIds]
        )
        await client.query(
            "DELETE FROM tryouts WHERE id = ANY($1)", [tIds]
        )
        console.log(`  Deleted ${existingTryouts.length} existing tryouts`)
    }

    const delResult = await client.query(
        "DELETE FROM questions WHERE category = $1", [CATEGORY]
    )
    console.log(`  Deleted ${delResult.rowCount} existing COMPLEX_NUMBERS questions`)

    // Step 2: Parse all files
    const allQuestionIds: string[] = []
    let totalInserted = 0

    for (const sourceFile of FILES) {
        if (!fs.existsSync(sourceFile)) {
            console.error(`❌ Source file not found: ${sourceFile}`)
            continue
        }

        console.log(`\n📥 Importing from: ${path.basename(sourceFile)}`)
        const content = fs.readFileSync(sourceFile, "utf-8")

        // Split by "---" separator
        const rawSections = content.split(/\n---\s*\n/).map(s => s.trim()).filter(s => s.length > 0)

        // Further split each raw section by "Soal X" headers at start of lines
        const sections: string[] = []
        for (const raw of rawSections) {
            const subSections = raw.split(/^(?=Soal \d+\s*\r?\n)/m).map(s => s.trim()).filter(s => s.length > 0)
            sections.push(...subSections)
        }

        console.log(`📋 Found ${sections.length} question sections`)

        let inserted = 0
        let skipped = 0

        for (let i = 0; i < sections.length; i++) {
            let section = sections[i]

            // Remove the "Soal X" header line
            section = section.replace(/^Soal \d+\s*\r?\n/, "").trim()

            // Find markers (plain text format)
            const soalMatch = section.match(/^Soal:\s*/m)
            const pemMatch = section.match(/^Pembahasan:\s*/m)
            const jawMatch = section.match(/^Jawaban:\s*/m)

            // Extract Question Text
            let questionText = ""
            if (soalMatch && pemMatch) {
                const soalStart = soalMatch.index! + soalMatch[0].length
                const pemStart = pemMatch.index!
                questionText = section.substring(soalStart, pemStart).trim()
            } else if (pemMatch) {
                questionText = section.substring(0, pemMatch.index!).replace(/^Soal:\s*/m, "").trim()
            } else {
                skipped++
                continue
            }

            // Extract Discussion and Answer
            let discussionText = ""
            let correctAnswer = "-"

            if (jawMatch && pemMatch) {
                const pemStart = pemMatch.index! + pemMatch[0].length
                const jawStart = jawMatch.index!

                if (jawStart > pemStart) {
                    discussionText = section.substring(pemStart, jawStart).trim()
                    correctAnswer = section.substring(jawStart + jawMatch[0].length).trim()
                } else {
                    correctAnswer = section.substring(jawStart + jawMatch[0].length, pemStart).trim()
                    discussionText = section.substring(pemStart).trim()
                }
            } else if (pemMatch) {
                discussionText = section.substring(pemMatch.index! + pemMatch[0].length).trim()
            }

            // Clean up
            discussionText = discussionText.replace(/--+$/, "").trim()
            questionText = removeBold(questionText)
            discussionText = removeBold(discussionText)
            correctAnswer = removeBold(correctAnswer)
            correctAnswer = correctAnswer.replace(/\r?\n---\s*$/, "").trim()

            if (!questionText || questionText.length < 5) {
                skipped++
                continue
            }

            const qId = uuidv4()
            const now = new Date().toISOString()

            try {
                await client.query(
                    `INSERT INTO questions (id, text, category, subject, option_a, option_b, option_c, option_d, correct_answer, explanation, weight, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                    [qId, questionText, CATEGORY, SUBJECT, "-", "-", "-", "-", correctAnswer, discussionText, 1, now, now]
                )
                inserted++
                totalInserted++
                allQuestionIds.push(qId)
            } catch (err: any) {
                console.error(`❌ Section ${i + 1} failed: ${err.message}`)
                skipped++
            }
        }

        console.log(`✅ File complete: ${inserted} inserted, ${skipped} skipped.`)
    }

    console.log(`\n📊 Total questions inserted: ${totalInserted}`)

    // Step 3: Create Practice Tryouts (10 questions per part)
    console.log("\n📦 Creating practice tryouts...")

    const shuffled = shuffleArray(allQuestionIds)
    const QUESTIONS_PER_PART = 10
    const totalParts = Math.ceil(shuffled.length / QUESTIONS_PER_PART)

    for (let part = 1; part <= totalParts; part++) {
        const start = (part - 1) * QUESTIONS_PER_PART
        const chunk = shuffled.slice(start, start + QUESTIONS_PER_PART)

        const tryoutId = uuidv4()
        const now = new Date().toISOString()

        try {
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

            console.log(`  ✅ Part ${part}: ${chunk.length} questions`)
        } catch (err: any) {
            console.error(`❌ Tryout Part ${part} failed: ${err.message}`)
        }
    }

    await client.end()
    console.log(`\n🎉 ALL DONE! ${totalInserted} questions → ${totalParts} practice tryouts`)
}

run().catch(console.error)
