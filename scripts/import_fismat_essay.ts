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

const FILES = [
    "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL.txt",
    "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL 2.txt"
]

function removeBold(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, "$1")
}

async function run() {
    // Step 1: Delete ALL existing SERIES_POWER questions and their tryout links
    console.log("🗑️  Deleting all existing SERIES_POWER data for a clean slate...")

    const { data: existingTryouts } = await supabase
        .from("tryouts")
        .select("id")
        .eq("category", CATEGORY)

    if (existingTryouts && existingTryouts.length > 0) {
        const tIds = existingTryouts.map(t => t.id)
        await supabase.from("tryout_questions").delete().in("tryout_id", tIds)
        await supabase.from("tryouts").delete().in("id", tIds)
        console.log(`  Deleted ${existingTryouts.length} tryouts`)
    }

    await supabase.from("questions").delete().eq("category", CATEGORY)
    console.log("  Deleted all existing questions")

    let totalInserted = 0

    // Step 2: Loop through both files and parse
    for (const sourceFile of FILES) {
        if (!fs.existsSync(sourceFile)) {
            console.error(`❌ Source file not found: ${sourceFile}`)
            continue
        }

        console.log(`\n📥 Importing from: ${path.basename(sourceFile)}`)
        const content = fs.readFileSync(sourceFile, "utf-8")

        // Split by "## Soal X"
        const sections = content.split(/## Soal \d+/i).map(s => s.trim()).filter(s => s.length > 0)
        console.log(`📋 Found ${sections.length} sections`)

        let inserted = 0
        let skipped = 0

        for (let i = 0; i < sections.length; i++) {
            let section = sections[i]

            // Find indexes for reliable structural parsing
            const soalIdx = section.indexOf("**Soal:**")
            const pemIdx = section.indexOf("**Pembahasan:**")
            const jawIdx = section.indexOf("**Jawaban:")

            // 1. Extract Question Text
            let questionText = ""
            if (soalIdx !== -1 && pemIdx !== -1) {
                // Between Soal and Pembahasan
                questionText = section.substring(soalIdx + 9, pemIdx).trim()
            } else if (pemIdx !== -1) {
                // Fallback: start to Pembahasan
                questionText = section.substring(0, pemIdx).replace(/\*\*Soal:\*\*/gi, "").trim()
            } else {
                console.warn(`⚠️  Section ${i + 1} skipped (no Pembahasan marker)`)
                skipped++
                continue
            }

            // 2. Extract Answer and Discussion
            let discussionText = ""
            let correctAnswer = "-"

            if (jawIdx !== -1) {
                // There is a Jawaban line. Find where it ends (newline).
                const jawEndIdx = section.indexOf("\n", jawIdx)
                const lineEnd = jawEndIdx !== -1 ? jawEndIdx : section.length
                
                const jawabanLine = section.substring(jawIdx, lineEnd)
                
                // Try to extract answer from: **Jawaban: Konvergen (C)** -> Konvergen (C)
                const ansMatch = jawabanLine.match(/\*\*Jawaban:\s*([^\r\n\*]+)\*\*/i)
                if (ansMatch) {
                    correctAnswer = ansMatch[1].trim()
                } else {
                    // Fallback
                    correctAnswer = jawabanLine.replace(/\*\*Jawaban:\s*/i, "").replace(/\*\*/g, "").trim()
                }

                // Discussion Text: Combine everything between Pembahasan and Jawaban AND everything after Jawaban.
                // This gracefully handles both Jawaban-first (Batch 1) and Jawaban-last (Batch 2).
                const textBeforeJawaban = jawIdx > pemIdx ? section.substring(pemIdx + 15, jawIdx).trim() : ""
                const textAfterJawaban = jawEndIdx !== -1 ? section.substring(jawEndIdx).trim() : ""
                
                discussionText = `${textBeforeJawaban}\n\n${textAfterJawaban}`.trim()
            } else {
                // No Jawaban line, everything after Pembahasan is discussion
                discussionText = section.substring(pemIdx + 15).trim()
            }

            // Clean trailing "---" separators from discussion if they leaked in from the split
            discussionText = discussionText.replace(/--+$/, "").trim()

            // Remove bold formatting
            questionText = removeBold(questionText)
            discussionText = removeBold(discussionText)
            correctAnswer = removeBold(correctAnswer)

            if (!questionText || questionText.length < 5) {
                console.warn(`⚠️  Section ${i + 1} skipped (text too short)`)
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
                console.error(`❌ Section ${i + 1} insertion failed: ${error.message}`)
                skipped++
            } else {
                inserted++
                totalInserted++
            }
        }

        console.log(`✅ File complete: ${inserted} inserted, ${skipped} skipped.`)
    }

    console.log(`\n🎉 ALL IMPORTS COMPLETE. Total questions inserted: ${totalInserted}`)
}

run().catch(console.error)
