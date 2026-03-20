import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SUBJECT = "FISMAT"
const CATEGORY = "SERIES_POWER"
const QUESTIONS_PER_PART = 10
const START_PART = 16

const NEW_FILES = [
    "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL 3.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL 4.txt"
]

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// Clean bold formatting and any potential problematic trailing characters
function cleanText(text: string): string {
    let t = text.replace(/\*\*/g, "").trim()
    t = t.replace(/---+$/, "").trim()
    return t
}

async function run() {
    console.log("--- Starting FISMAT Practice Sets 2.0 Rebuild ---")

    // 1. Parse new questions
    const newQuestions: any[] = []
    
    for (const sourceFile of NEW_FILES) {
        if (!fs.existsSync(sourceFile)) {
            console.error(`❌ Source file not found: ${sourceFile}`)
            continue
        }

        console.log(`\n📥 Parsing: ${path.basename(sourceFile)}`)
        const content = fs.readFileSync(sourceFile, "utf-8")

        // Split by Soal \d+ or ## Soal \d+
        const sections = content.split(/^(?:##\s*)?Soal\s+\d+(?:\([a-z]\))?/im).map(s => s.trim()).filter(s => s.length > 0)

        let parsedCount = 0
        let skippedCount = 0

        for (const sec of sections) {
            let cleanSec = cleanText(sec)
            
            // Look for Pembahasan: marker
            const pemIdx = cleanSec.search(/Pembahasan:/i)
            
            if (pemIdx !== -1) {
                let questionText = cleanSec.substring(0, pemIdx).replace(/^Soal:\s*/i, "").trim()
                let discussionText = cleanSec.substring(pemIdx + "Pembahasan:".length).trim()
                let correctAnswer = "-"

                // Try to extract Jawaban from discussion
                const jawMatch = discussionText.match(/Jawaban:\s*([^\n\r]+)/i)
                if (jawMatch) {
                    correctAnswer = jawMatch[1].trim()
                }

                if (questionText.length > 5) {
                    newQuestions.push({
                        id: uuidv4(),
                        text: questionText,
                        category: CATEGORY,
                        subject: SUBJECT,
                        option_a: "-",
                        option_b: "-",
                        option_c: "-",
                        option_d: "-",
                        correct_answer: correctAnswer,
                        explanation: discussionText,
                        weight: 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    parsedCount++
                } else {
                    skippedCount++
                }
            } else {
                skippedCount++
            }
        }
        console.log(`✅ Parsed ${parsedCount} questions (Skipped ${skippedCount}) from ${path.basename(sourceFile)}`)
    }

    if (newQuestions.length > 0) {
        console.log(`\n💾 Inserting ${newQuestions.length} new questions into DB...`)
        
        // Chunk inserts
        const chunkSize = 50
        for (let i = 0; i < newQuestions.length; i += chunkSize) {
            const chunk = newQuestions.slice(i, i + chunkSize)
            const { error } = await supabase.from("questions").insert(chunk)
            if (error) {
                console.error(`❌ Error inserting subset:`, error.message)
            }
        }
        console.log(`✅ ${newQuestions.length} new questions inserted successfully.`)
    }

    // 2. Fetch ALL questions for this category (old + new)
    console.log(`\n🔍 Fetching all existing ${CATEGORY} questions...`)
    const { data: allQuestions, error: qErr } = await supabase
        .from("questions")
        .select("id")
        .eq("category", CATEGORY)
        .eq("subject", SUBJECT)

    if (qErr || !allQuestions || allQuestions.length === 0) {
        console.error("❌ Error fetching questions:", qErr?.message)
        process.exit(1)
    }

    console.log(`📋 Total ${CATEGORY} questions available for Tryouts: ${allQuestions.length}`)

    // 3. Delete old Tryouts for this category
    console.log(`\n🗑️  Deleting old practice tryouts for ${CATEGORY}...`)
    const { data: oldTryouts } = await supabase
        .from("tryouts")
        .select("id")
        .eq("category", CATEGORY)
        .eq("is_practice", true)

    if (oldTryouts && oldTryouts.length > 0) {
        const tIds = oldTryouts.map(t => t.id)
        
        // Also delete submissions to avoid FK issues
        const { data: oldSubmissions } = await supabase
            .from("submissions")
            .select("id")
            .in("tryout_id", tIds)
            
        if (oldSubmissions && oldSubmissions.length > 0) {
            const subIds = oldSubmissions.map(s => s.id)
            await supabase.from("answers").delete().in("submission_id", subIds)
            await supabase.from("submissions").delete().in("id", subIds)
            console.log(`  Deleted ${oldSubmissions.length} old submissions & answers`)
        }

        await supabase.from("tryout_questions").delete().in("tryout_id", tIds)
        await supabase.from("tryouts").delete().in("id", tIds)
        console.log(`  Deleted ${oldTryouts.length} old practice tryouts`)
    }

    // 4. Randomize and Create New Tryouts
    console.log(`\n🔀 Randomizing all questions...`)
    const shuffled = shuffle(allQuestions)
    
    const numParts = Math.ceil(shuffled.length / QUESTIONS_PER_PART)
    console.log(`📦 Creating ${numParts} practice parts (10 questions each), starting from Part ${START_PART}...`)

    let totalCreated = 0

    for (let i = 0; i < numParts; i++) {
        const partNum = START_PART + i
        const startIdx = i * QUESTIONS_PER_PART
        const partQuestions = shuffled.slice(startIdx, startIdx + QUESTIONS_PER_PART)

        const tryoutId = uuidv4()
        const now = new Date().toISOString()
        const title = `Latihan Soal Deret Tak Hingga dan Deret Pangkat Part ${partNum}`

        console.log(`  Creating: "${title}" (${partQuestions.length} soal)`)

        const { error: tErr } = await supabase.from("tryouts").insert({
            id: tryoutId,
            title,
            category: CATEGORY,
            subject: SUBJECT,
            is_practice: true,
            status: "ACTIVE",
            duration: 60, // 60 minutes
            max_attempts: 999,
            created_at: now,
            updated_at: now
        })

        if (tErr) {
            console.error(`  ❌ Error creating tryout: ${tErr.message}`)
            continue
        }

        // Link questions
        const tqPayload = partQuestions.map((q, j) => ({
            id: uuidv4(),
            tryout_id: tryoutId,
            question_id: q.id,
            order: j
        }))
        
        const { error: tqErr } = await supabase.from("tryout_questions").insert(tqPayload)
        
        if (tqErr) {
            console.error(`  ❌ Error linking questions to tryout: ${tqErr.message}`)
        } else {
            totalCreated++
        }
    }

    // Verify
    const { count } = await supabase
        .from("tryouts")
        .select("*", { count: "exact", head: true })
        .eq("category", CATEGORY)
        .eq("is_practice", true)

    console.log(`\n🎉 DONE! Verified ${count} practice sets for FISMAT ${CATEGORY} in DB.`)
}

run().catch(console.error)
