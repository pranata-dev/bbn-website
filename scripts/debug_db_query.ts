import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function run() {
    const { count: qCount } = await supabase.from("questions").select("*", { count: "exact", head: true }).eq("subject", "FISMAT")
    const { count: tCount } = await supabase.from("tryouts").select("*", { count: "exact", head: true }).eq("subject", "FISMAT")
    console.log("FISMAT questions:", qCount)
    console.log("FISMAT tryouts:", tCount)

    const { data: tryouts } = await supabase.from("tryouts").select("*").eq("subject", "FISMAT").limit(2)
    console.log("Sample tryouts:", tryouts)

    const { data: questions } = await supabase.from("questions").select("*").eq("subject", "FISMAT").limit(2)
    console.log("Sample questions:", questions)
}
run()
