import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
    const { data: questions, error } = await supabase
        .from("questions")
        .select("category")
        .eq("subject", "FISMAT")

    if (error) {
        console.error("Error:", error)
        return
    }

    console.log(`\n--- FISMAT Question Analysis ---`)
    console.log(`Total questions found: ${questions?.length}`)
    
    const counts: Record<string, number> = {}
    questions?.forEach(q => {
        counts[q.category] = (counts[q.category] || 0) + 1
    })

    console.log("Counts by Category:")
    for (const [cat, count] of Object.entries(counts)) {
        console.log(` - ${cat}: ${count}`)
    }
    
    const total = questions?.length || 0
    console.log(`\nPotential 10-question parts: ${Math.floor(total / 10)}`)
    if (total % 10 > 0) console.log(` plus one part with ${total % 10} questions`)
    console.log(`--------------------------------\n`)
}
run()
