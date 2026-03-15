import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
import { DataImporter } from "../src/services/DataImporter"
import { QuestionCategory, Subject } from "../src/types"

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin tasks

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL or Service Role Key not found in .env.local")
    process.exit(1)
}

function printUsage() {
    console.log(`
Usage: npx ts-node scripts/import_data.ts [OPTIONS]
Options:
  --file <path>          Path to the raw text file containing questions
  --category <string>    Question category (e.g., WEEK_1, WEEK_2, dll)
  --subject <string>     Subject code (FISDAS2 or FISMAT)
  --tryout-title <str>   (Optional) Title of the tryout to create and link to
  --is-practice <bool>   (Optional) true/false if this is a practice tryout (default: true)
  --duration <number>    (Optional) Duration in minutes for the tryout (default: 60)
  --help                 Show this help message

Example:
  npx ts-node scripts/import_data.ts --file "./scripts/data/raw_week1.txt" --category "WEEK_1" --subject "FISDAS2" --tryout-title "Latihan Soal WEEK 1"
    `)
}

async function run() {
    const args = process.argv.slice(2)
    
    if (args.includes("--help") || args.length === 0) {
        printUsage()
        process.exit(0)
    }

    let filePath = ""
    let category = "" as QuestionCategory
    let subject = "" as Subject
    let tryoutTitle = ""
    let isPractice = true
    let duration = 60

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--file") filePath = args[++i]
        else if (args[i] === "--category") category = args[++i] as QuestionCategory
        else if (args[i] === "--subject") subject = args[++i] as Subject
        else if (args[i] === "--tryout-title") tryoutTitle = args[++i]
        else if (args[i] === "--is-practice") isPractice = args[++i] === "true"
        else if (args[i] === "--duration") duration = parseInt(args[++i], 10)
    }

    if (!filePath || !category || !subject) {
        console.error("❌ Missing required arguments: --file, --category, and --subject are required.")
        printUsage()
        process.exit(1)
    }

    const absolutePath = path.resolve(process.cwd(), filePath)
    if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found at path: ${absolutePath}`)
        process.exit(1)
    }

    console.log(`\n--- IMPORTING DATA ---`)
    console.log(`File: ${absolutePath}`)
    console.log(`Category: ${category}`)
    console.log(`Subject: ${subject}`)
    if (tryoutTitle) console.log(`Linking to Tryout: "${tryoutTitle}"`)
    console.log(`----------------------\n`)

    try {
        const rawContent = fs.readFileSync(absolutePath, "utf-8")
        console.log("Analyzing file...")
        
        const parsedQuestions = DataImporter.parseRawText(rawContent, category, subject)
        console.log(`Successfully parsed ${parsedQuestions.length} unique questions.`)

        if (parsedQuestions.length === 0) {
            console.log("No questions to import. Exiting.")
            process.exit(0)
        }

        console.log("Seeding data to Supabase...")
        const options = tryoutTitle ? {
            createTryoutTitle: tryoutTitle,
            isPractice: isPractice,
            durationMinutes: duration
        } : undefined

        const result = await DataImporter.seedData(
            supabaseUrl, 
            supabaseKey, 
            parsedQuestions,
            category,
            subject,
            options
        )

        console.log(`\n✅ IMPORT COMPLETE`)
        console.log(`- Inserted: ${result.inserted}`)
        console.log(`- Skipped (Duplicates): ${result.skipped}`)
        if (result.tryoutId) {
            console.log(`- Linked to Tryout ID: ${result.tryoutId}`)
        }

    } catch (error: any) {
        console.error(`❌ Fatal error during import: ${error.message}`)
        process.exit(1)
    }
}

run()
