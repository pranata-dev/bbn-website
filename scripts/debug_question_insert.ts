import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"
import { v4 } from "uuid"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

async function run() {
    console.log("Testing question insert...")
    const { data, error } = await supabase.from("questions").insert({
        id: v4(),
        text: "Test Question",
        category: "SERIES_POWER",
        subject: "FISMAT",
        type: "ESSAY",
        option_a: "-",
        option_b: "-",
        option_c: "-",
        option_d: "-",
        correct_answer: "Test Answer",
        explanation: "Test explanation",
        weight: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
    if (error) {
        console.error("INSERT QUESTION ERROR:", error)
    } else {
        console.log("INSERT QUESTION SUCCESS:", data)
    }
}
run()
