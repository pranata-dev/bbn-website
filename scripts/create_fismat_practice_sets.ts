import * as dotenv from "dotenv"
import * as path from "path"
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

const CATEGORY = "SERIES_POWER"
const SUBJECT = "FISMAT"
const QUESTIONS_PER_PART = 10

async function run() {
    console.log("--- Creating FISMAT Practice Sets ---\n")

    // 1. Delete existing practice tryouts for SERIES_POWER
    const { data: oldTryouts } = await supabase
        .from("tryouts")
        .select("id")
        .eq("category", CATEGORY)
        .eq("is_practice", true)

    if (oldTryouts && oldTryouts.length > 0) {
        const tIds = oldTryouts.map(t => t.id)
        await supabase.from("tryout_questions").delete().in("tryout_id", tIds)
        await supabase.from("tryouts").delete().in("id", tIds)
        console.log(`🗑️  Deleted ${oldTryouts.length} old practice tryouts`)
    }

    // 2. Fetch all SERIES_POWER questions
    const { data: questions, error: qErr } = await supabase
        .from("questions")
        .select("id")
        .eq("category", CATEGORY)
        .eq("subject", SUBJECT)
        .order("created_at")

    if (qErr || !questions || questions.length === 0) {
        console.error("❌ No questions found:", qErr?.message)
        process.exit(1)
    }

    console.log(`📋 Found ${questions.length} questions`)

    // 3. Split into parts of QUESTIONS_PER_PART each
    const numParts = Math.ceil(questions.length / QUESTIONS_PER_PART)

    for (let i = 0; i < numParts; i++) {
        const partNum = i + 1
        const startIdx = i * QUESTIONS_PER_PART
        const partQuestions = questions.slice(startIdx, startIdx + QUESTIONS_PER_PART)

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
            duration: 60,
            max_attempts: 999,
            created_at: now,
            updated_at: now
        })

        if (tErr) {
            console.error(`  ❌ Error creating tryout: ${tErr.message}`)
            continue
        }

        // Link questions
        for (let j = 0; j < partQuestions.length; j++) {
            await supabase.from("tryout_questions").insert({
                id: uuidv4(),
                tryout_id: tryoutId,
                question_id: partQuestions[j].id,
                order: j
            })
        }
    }

    // Verify
    const { count } = await supabase
        .from("tryouts")
        .select("*", { count: "exact", head: true })
        .eq("category", CATEGORY)
        .eq("is_practice", true)

    console.log(`\n✅ Created ${count} practice sets for FISMAT`)
}

run().catch(console.error)
