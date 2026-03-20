import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
    console.log("Fetching all FISMAT tryouts...")
    const { data: tryouts, error } = await supabase
        .from("tryouts")
        .select("id, title, category, is_practice")
        .eq("subject", "FISMAT")
        .eq("is_practice", true)
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error:", error)
        return
    }

    console.log(`Total tryouts: ${tryouts?.length}`)
    tryouts?.forEach(t => console.log(`${t.title} | ${t.category}`))
}
run()
