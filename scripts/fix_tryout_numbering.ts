import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
    console.log("Fetching all FISMAT SERIES_POWER tryouts...")
    const { data: tryouts, error } = await supabase
        .from("tryouts")
        .select("id, title, created_at")
        .eq("subject", "FISMAT")
        .eq("category", "SERIES_POWER")
        .eq("is_practice", true)
        .order("created_at", { ascending: true })

    if (error || !tryouts) {
        console.error("Error:", error)
        return
    }

    console.log(`Found ${tryouts.length} tryouts. Updating titles...`)
    
    for (let i = 0; i < tryouts.length; i++) {
        const tryout = tryouts[i]
        const newPartNum = i + 1
        const newTitle = `Latihan Soal Deret Tak Hingga dan Deret Pangkat Part ${newPartNum}`
        
        await supabase
            .from("tryouts")
            .update({ title: newTitle })
            // Also explicitly try to update practice_part just in case Prisma push worked
            .eq("id", tryout.id)
            
        console.log(`Updated ${tryout.title} -> ${newTitle}`)
    }
    
    console.log("DONE renaming Tryouts.")
}
run()
