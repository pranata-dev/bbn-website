import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

async function run() {
    try {
        const url = "http://localhost:3000/api/admin/questions?subject=FISMAT"
        console.log("Fetching:", url)
        // Since we are running the Next.js server on 3000 usually, wait, is it running?
        // We can't fetch if the dev server isn't running.
        // Instead, let's call the Supabase query directly exactly as the API route does:
        const { createClient } = require("@supabase/supabase-js")
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: questions, error } = await supabase
            .from("questions")
            .select("*")
            .eq("subject", "FISMAT")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("DB Error:", error)
        } else {
            console.log("Questions found:", questions?.length)
            if (questions && questions.length > 0) {
                console.log("First question example:", questions[0])
            }
        }
    } catch (e) {
        console.error(e)
    }
}
run()
