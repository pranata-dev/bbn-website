import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import { EXCELLENT_COURSES } from "../src/config/excellent"

function loadEnvFile(filePath: string) {
    if (!fs.existsSync(filePath)) return
    const content = fs.readFileSync(filePath, "utf8")
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith("#")) continue
        const eqIdx = line.indexOf("=")
        if (eqIdx <= 0) continue
        const key = line.slice(0, eqIdx).trim()
        let value = line.slice(eqIdx + 1).trim()
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1)
        }
        if (process.env[key] === undefined) {
            process.env[key] = value
        }
    }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"))
loadEnvFile(path.resolve(process.cwd(), ".env"))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
})

async function main() {
    console.log("Seeding Excellent Beta courses into public.courses...")

    const rows = EXCELLENT_COURSES.map((course) => ({
        slug: course.slug,
        code: course.code,
        title: course.title,
        track: "NON_PHYSICS" as const,
        is_active: true,
        sort_order: course.sortOrder,
    }))

    const { data, error } = await supabase
        .from("courses")
        .upsert(rows, { onConflict: "slug" })
        .select("id, slug, code, title, track, sort_order")

    if (error) {
        console.error("Failed to seed Excellent Beta courses:", error.message)
        process.exit(1)
    }

    console.log(`Upserted ${data?.length ?? 0} Excellent Beta courses:`)
    for (const row of data ?? []) {
        console.log(`- [${row.code}] ${row.title} (slug: ${row.slug}, track: ${row.track})`)
    }
}

main().catch((err) => {
    console.error("Unexpected error while seeding Excellent Beta courses:", err)
    process.exit(1)
})

