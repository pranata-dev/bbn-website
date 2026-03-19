import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL or Service Role Key not found in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SOURCE_FILE = "C:/Users/p/OneDrive/Dokumen/FISMAT - DERET SOAL.txt"
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

    const content = fs.readFileSync(SOURCE_FILE, "utf-8")
    
    // Split by "## Soal X"
    const sections = content.split(/## Soal \d+/i).map(s => s.trim()).filter(s => s.length > 0)
    
    console.log(`Analyzing ${sections.length} questions...`)
    if (sections.length === 0) {
        console.log("First 100 characters of content:", content.substring(0, 100))
    }
    
    let inserted = 0
    let skipped = 0

    for (const section of sections) {
        try {
            // Simplest separator: just "---"
            const parts = section.split("---")
            if (parts.length < 2) {
                console.warn(`Skipping section starting with: "${section.substring(0, 50).replace(/\r?\n/g, " ")}..." - missing separator (---)`)
                continue
            }

            let questionText = parts[0].replace(/\*\*Soal:\*\*/i, "").trim()
            let discussionPart = parts.slice(1).join("---").replace(/\*\*Pembahasan:\*\*/i, "").trim()

            // Extract Answer from Discussion
            const jawahanMatch = discussionPart.match(/\*\*Jawaban:\s*([\s\S]*?)$|Jawaban:\s*([\s\S]*?)$/i)
            let correctAnswer = "-"
            if (jawahanMatch) {
                correctAnswer = (jawahanMatch[1] || jawahanMatch[2]).trim()
                // Remove the "Jawaban: ..." part from discussion
                discussionPart = discussionPart.replace(jawahanMatch[0], "").trim()
            }

            // Cleanup bold text as requested
            questionText = removeBold(questionText)
            discussionPart = removeBold(discussionPart)
            correctAnswer = removeBold(correctAnswer)

            // Prepare Payload
            const payload = {
                id: uuidv4(),
                text: questionText,
                category: CATEGORY,
                subject: SUBJECT,
                type: "ESSAY", // We'll try to insert this even if the column is pending
                option_a: "-",
                option_b: "-",
                option_c: "-",
                option_d: "-",
                correct_answer: correctAnswer,
                explanation: discussionPart,
                weight: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            // Check for duplicates
            const { data: existing } = await supabase
                .from("questions")
                .select("id")
                .eq("text", questionText)
                .is("option_a", "-") // To distinguish from MCQs with same text if any
                .limit(1)

            if (existing && existing.length > 0) {
                skipped++
                continue
            }

            const { error } = await supabase.from("questions").insert(payload)

            if (error) {
                console.error(`❌ Error inserting: ${error.message}\nFull error: ${JSON.stringify(error, null, 2)}`)
                // FALLBACK: If "type" column doesn't exist yet, retry without it
                if (error.message.toLowerCase().includes("type")) {
                    console.log("Column 'type' not found in cache, retrying without it...")
                    const { type, ...fallbackPayload } = payload as any
                    const { error: fallbackError } = await supabase.from("questions").insert(fallbackPayload)
                    if (fallbackError) {
                        console.error(`❌ Error inserting (fallback): ${fallbackError.message}`)
                    } else {
                        inserted++
                    }
                } else if (error.message.includes('invalid input value for enum "QuestionCategory"')) {
                     console.error(`❌ Category "${CATEGORY}" not yet in DB. Please run prisma db push first.`)
                     process.exit(1)
                } else {
                    console.error(`❌ Error inserting: ${error.message}`)
                }
            } else {
                inserted++
            }

        } catch (e: any) {
            console.error(`Error processing section: ${e.message}`)
        }
    }

    console.log(`\n✅ IMPORT COMPLETE`)
    console.log(`- Inserted: ${inserted}`)
    console.log(`- Skipped: ${skipped}`)
}

run()
