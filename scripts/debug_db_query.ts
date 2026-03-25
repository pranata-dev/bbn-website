import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function run() {
    const { count: qCount } = await supabase.from("questions").select("*", { count: "exact", head: true }).eq("subject", "FISDAS2")
    const { count: tCount } = await supabase.from("tryouts").select("*", { count: "exact", head: true }).eq("subject", "FISDAS2")
    console.log("FISDAS2 questions:", qCount)
    console.log("FISDAS2 tryouts:", tCount)

    const { data: tryouts } = await supabase.from("tryouts").select("*").eq("subject", "FISDAS2").limit(20)
    console.log("Sample tryouts:", tryouts?.map(t => ({ id: t.id, is_practice: t.is_practice, title: t.title, subject: t.subject, status: t.status })))

    const { data: questions } = await supabase.from("questions").select("*").eq("subject", "FISDAS2").limit(2)
    console.log("Sample questions:", questions)
}
run()
