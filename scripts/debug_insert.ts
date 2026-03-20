import * as dotenv from "dotenv"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"
import { v4 } from "uuid"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

async function run() {
    console.log("Testing tryout insert...")
    const { data, error } = await supabase.from("tryouts").insert({
        id: v4(),
        title: "Test Tryout",
        category: "SERIES_POWER",
        subject: "FISMAT",
        is_practice: true,
        status: "ACTIVE",
        duration: 60,
        max_attempts: 999,
        practice_part: 16,
        description: "Test description",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
    if (error) {
        console.error("INSERT ERROR:", error)
    } else {
        console.log("INSERT SUCCESS:", data)
    }
}
run()
