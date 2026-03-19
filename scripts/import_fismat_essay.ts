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

const SOURCE_FILE = "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL 2.txt"
const SUBJECT = "FISMAT"
const CATEGORY = "SERIES_POWER"

function removeBold(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, "$1")
}

async function run() {
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`❌ Source file not found: ${SOURCE_FILE}`)
        process.exit(1)
    }

    console.log("📥 Importing NEW questions from batch 2 (appending to existing)...")

    // Step 2: Parse the source file
    const content = fs.readFileSync(SOURCE_FILE, "utf-8")

    // Split by "## Soal X"
    const sections = content.split(/## Soal \d+/i).map(s => s.trim()).filter(s => s.length > 0)
    console.log(`\n📋 Found ${sections.length} sections to parse`)

    let inserted = 0
    let skipped = 0

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]

        try {
            // Document format is:
            //   **Soal:**
            //   question text...
            //   **Pembahasan:**
            //   **Jawaban: $answer$**
            //   discussion text...

            // 1. Extract question: between **Soal:** and **Pembahasan:**
            const soalMatch = section.match(/\*\*Soal:\*\*([\s\S]*?)\*\*Pembahasan:\*\*/i)
            let questionText = ""
            if (soalMatch) {
                questionText = soalMatch[1].trim()
            } else {
                // Fallback: everything before **Pembahasan:**
                const altMatch = section.match(/^([\s\S]*?)\*\*Pembahasan:\*\*/i)
                if (!altMatch) {
                    console.warn(`⚠️  Soal ${i + 1}: No Pembahasan marker found, skipping`)
                    skipped++
                    continue
                }
                questionText = altMatch[1].replace(/\*\*Soal:\*\*/gi, "").trim()
            }

            // 2. Extract answer: **Jawaban: answer** (answer is on same line, possibly wrapped in $..$ or **)
            let correctAnswer = "-"
            const jawabanLineMatch = section.match(/\*\*Jawaban:\s*([^\r\n]*)\*\*/i)
            if (jawabanLineMatch) {
                correctAnswer = jawabanLineMatch[1].trim()
            }

            // 3. Extract discussion: everything AFTER the **Jawaban: ...** line
            let discussionText = ""
            const jawabanFullMatch = section.match(/\*\*Jawaban:[^\r\n]*\*\*\r?\n([\s\S]*)$/i)
            if (jawabanFullMatch) {
                discussionText = jawabanFullMatch[1].trim()
            } else {
                // Fallback: everything after **Pembahasan:**
                const pemMatch = section.match(/\*\*Pembahasan:\*\*([\s\S]*)$/i)
                if (pemMatch) {
                    discussionText = pemMatch[1].trim()
                    // Remove the jawaban line from discussion if present
                    discussionText = discussionText.replace(/\*\*Jawaban:[^\r\n]*\*\*/i, "").trim()
                }
            }

            // Remove bold formatting as requested
            questionText = removeBold(questionText)
            discussionText = removeBold(discussionText)
            correctAnswer = removeBold(correctAnswer)

            if (!questionText || questionText.length < 5) {
                console.warn(`⚠️  Soal ${i + 1}: Question text too short ("${questionText}"), skipping`)
                skipped++
                continue
            }

            const payload = {
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
            }

            const { error } = await supabase.from("questions").insert(payload)

            if (error) {
                console.error(`❌ Soal ${i + 1}: ${error.message}`)
            } else {
                inserted++
            }
        } catch (e: any) {
            console.error(`❌ Soal ${i + 1}: ${e.message}`)
            skipped++
        }
    }

    console.log(`\n✅ IMPORT COMPLETE`)
    console.log(`  Inserted: ${inserted}`)
    console.log(`  Skipped: ${skipped}`)

    // Quick verification: print first question
    const { data: sample } = await supabase
        .from("questions")
        .select("text, explanation, correct_answer")
        .eq("category", CATEGORY)
        .order("created_at")
        .limit(1)

    if (sample && sample[0]) {
        console.log(`\n📝 Sample Q1:`)
        console.log(`  Text (first 100): ${sample[0].text.substring(0, 100)}`)
        console.log(`  Explanation (first 100): ${(sample[0].explanation || "").substring(0, 100)}`)
        console.log(`  Answer: ${sample[0].correct_answer}`)
    }
}

run()
