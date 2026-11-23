import fs from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { EXCELLENT_COURSES, type ExcellentCourseCode } from "../src/config/excellent"
import { toDirectDownloadUrl } from "../src/lib/download-url"
import type { QuestionCategory } from "../src/types"

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

interface SasMaterialSeedConfig {
    title: string
    slug: string
    summary: string
    pdfDriveUrl: string
    podcastDriveUrl: string
}

const MATERIAL_LINKS: Record<ExcellentCourseCode, SasMaterialSeedConfig> = {
    FISIKA_X: {
        title: "Materi Lengkap SAS Fisika Kelas X",
        slug: "materi-sas-fisika-kelas-x",
        summary: "Modul ringkasan materi PDF dan audio podcast persiapan SAS Fisika Kelas X (AI Generated).",
        pdfDriveUrl: "https://drive.google.com/file/d/169T3aXw8G5aBhV2vEt32HQkkXN6W76Ue/view?usp=drive_link",
        podcastDriveUrl: "https://drive.google.com/file/d/1hz1ivqmkCH5DkM7WMQ7COoOI1ZF769SP/view?usp=drive_link",
    },
    FISIKA_XI: {
        title: "Materi Lengkap SAS Fisika Kelas XI",
        slug: "materi-sas-fisika-kelas-xi",
        summary: "Modul ringkasan materi PDF dan audio podcast persiapan SAS Fisika Kelas XI (AI Generated).",
        pdfDriveUrl: "https://drive.google.com/file/d/1xpYtzWPv9xt_eDYlN5j8b-M4rMSQ2WJl/view?usp=drive_link",
        podcastDriveUrl: "https://drive.google.com/file/d/1RH2UcgEsCyy51UqTequR-6T2hHs0aaCB/view?usp=drive_link",
    },
    FISIKA_XII: {
        title: "Materi Lengkap SAS Fisika Kelas XII",
        slug: "materi-sas-fisika-kelas-xii",
        summary: "Modul ringkasan materi PDF dan audio podcast persiapan SAS Fisika Kelas XII (AI Generated).",
        pdfDriveUrl: "https://drive.google.com/file/d/1Wx8f1mdhblgd7l6GX4N0KpZaL9aSYR0G/view?usp=drive_link",
        podcastDriveUrl: "https://drive.google.com/file/d/1pVXvev_9f7xx_3pGRJeM1xAJspDWPeuR/view?usp=drive_link",
    },
}

interface PracticeFileConfig {
    filename: string
    subject: ExcellentCourseCode
    category: QuestionCategory
    practicePart: number
    title: string
    description: string
}

const PRACTICE_FILES: PracticeFileConfig[] = [
    {
        filename: "latihan_sas_fisika_kelas_x_paket_1.md",
        subject: "FISIKA_X",
        category: "WEEK_1",
        practicePart: 1,
        title: "Latihan SAS Fisika Kelas X - Paket 1",
        description: "Latihan soal persiapan SAS Fisika Kelas X Paket 1 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_x_paket_2.md",
        subject: "FISIKA_X",
        category: "WEEK_2",
        practicePart: 2,
        title: "Latihan SAS Fisika Kelas X - Paket 2",
        description: "Latihan soal persiapan SAS Fisika Kelas X Paket 2 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_x_paket_3.md",
        subject: "FISIKA_X",
        category: "WEEK_3",
        practicePart: 3,
        title: "Latihan SAS Fisika Kelas X - Paket 3",
        description: "Latihan soal persiapan SAS Fisika Kelas X Paket 3 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xi_paket_1.md",
        subject: "FISIKA_XI",
        category: "WEEK_1",
        practicePart: 1,
        title: "Latihan SAS Fisika Kelas XI - Paket 1",
        description: "Latihan soal persiapan SAS Fisika Kelas XI Paket 1 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xi_paket_2.md",
        subject: "FISIKA_XI",
        category: "WEEK_2",
        practicePart: 2,
        title: "Latihan SAS Fisika Kelas XI - Paket 2",
        description: "Latihan soal persiapan SAS Fisika Kelas XI Paket 2 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xi_paket_3.md",
        subject: "FISIKA_XI",
        category: "WEEK_3",
        practicePart: 3,
        title: "Latihan SAS Fisika Kelas XI - Paket 3",
        description: "Latihan soal persiapan SAS Fisika Kelas XI Paket 3 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xii_paket_1.md",
        subject: "FISIKA_XII",
        category: "WEEK_1",
        practicePart: 1,
        title: "Latihan SAS Fisika Kelas XII - Paket 1",
        description: "Latihan soal persiapan SAS Fisika Kelas XII Paket 1 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xii_paket_2.md",
        subject: "FISIKA_XII",
        category: "WEEK_2",
        practicePart: 2,
        title: "Latihan SAS Fisika Kelas XII - Paket 2",
        description: "Latihan soal persiapan SAS Fisika Kelas XII Paket 2 lengkap dengan pembahasan langkah demi langkah.",
    },
    {
        filename: "latihan_sas_fisika_kelas_xii_paket_3.md",
        subject: "FISIKA_XII",
        category: "WEEK_3",
        practicePart: 3,
        title: "Latihan SAS Fisika Kelas XII - Paket 3",
        description: "Latihan soal persiapan SAS Fisika Kelas XII Paket 3 lengkap dengan pembahasan langkah demi langkah.",
    },
]

interface ParsedSasQuestion {
    soalNumber: number
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    correct_answer: "A" | "B" | "C" | "D" | "E"
    explanation: string
}

function normalizeLatexAndMarkdown(raw: string): string {
    let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

    // Normalize display math \[ ... \] -> $$ ... $$
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner: string) => `$$${inner}$$`)

    // Normalize inline math \( ... \) -> $ ... $
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, inner: string) => `$${inner}$`)

    // Strip stray HTML <br> tags
    text = text.replace(/<br\s*\/?>/gi, "\n")

    // Fix unbraced numeric exponents like 10^-7 -> 10^{-7}
    text = text.replace(/(\d+)\^([+-]?\d+)/g, "$1^{$2}")
    text = text.replace(/([a-zA-Z])\^([+-]?\d+)/g, "$1^{$2}")

    return text
}

function parseSasMarkdownFile(filePath: string): ParsedSasQuestion[] {
    const filename = path.basename(filePath)
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
    }

    const rawContent = normalizeLatexAndMarkdown(fs.readFileSync(filePath, "utf8"))
    const headerRegex = /(?:^|\n)\*\*Soal\s+(\d+):\*\*/gi
    const matches = Array.from(rawContent.matchAll(headerRegex))

    if (matches.length === 0) {
        throw new Error(`[${filename}] No "**Soal X:**" blocks found.`)
    }

    const questions: ParsedSasQuestion[] = []
    const parseErrors: string[] = []

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const soalNumber = parseInt(match[1], 10)
        const blockStart = (match.index ?? 0) + match[0].length
        const blockEnd = i + 1 < matches.length ? (matches[i + 1].index ?? rawContent.length) : rawContent.length
        const section = rawContent.slice(blockStart, blockEnd).trim()

        // Split question+options from discussion at the first horizontal rule or "**Pembahasan:**"
        let soalPart = ""
        let rawPembahasan = ""

        const hrMatch = section.match(/\n---[ \t]*\n/)
        if (hrMatch && hrMatch.index !== undefined) {
            soalPart = section.slice(0, hrMatch.index).trim()
            rawPembahasan = section.slice(hrMatch.index + hrMatch[0].length).trim()
        } else {
            const pembIndex = section.search(/\*\*Pembahasan:\*\*/i)
            if (pembIndex === -1) {
                parseErrors.push(`[${filename}] Soal ${soalNumber}: Missing "---" or "**Pembahasan:**" separator.`)
                continue
            }
            soalPart = section.slice(0, pembIndex).trim()
            rawPembahasan = section.slice(pembIndex).trim()
        }

        // Remove trailing horizontal rules after **Jawaban: X**
        rawPembahasan = rawPembahasan.replace(/(?:\n---[ \t]*)+$/g, "").trim()

        // Extract options A-D and optional E (case-insensitive to handle typos like "d.")
        const optionsRegex =
            /(?:^|\n)A\.\s+([\s\S]*?)\nB\.\s+([\s\S]*?)\nC\.\s+([\s\S]*?)\nD\.\s+([\s\S]*?)(?:\nE\.\s+([\s\S]*))?$/i
        const optionsMatch = soalPart.match(optionsRegex)

        if (!optionsMatch || optionsMatch.index === undefined) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: Failed to parse options A-D/E.`)
            continue
        }

        const questionText = soalPart.slice(0, optionsMatch.index).trim()
        const optA = optionsMatch[1].trim()
        const optB = optionsMatch[2].trim()
        const optC = optionsMatch[3].trim()
        const optD = optionsMatch[4].trim()
        const optE = optionsMatch[5] ? optionsMatch[5].trim() : null

        // Extract answer key
        const ansMatch =
            rawPembahasan.match(/\*\*Jawaban:\s*([A-E])\.?\*\*/i) ||
            rawPembahasan.match(/\*\*Jawaban:\*\*\s*([A-E])\b/i) ||
            rawPembahasan.match(/\*\*Jawaban:\s*([A-E])\b/i)

        const correctAnswer = ansMatch ? (ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D" | "E") : null

        const cleanedPembahasanBody = rawPembahasan
            .replace(/^\*\*Pembahasan:\*\*\s*/i, "")
            .trim()

        // Strict validation
        if (!questionText) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: Empty question text.`)
            continue
        }
        if (!optA || !optB || !optC || !optD) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: One or more options A-D are empty.`)
            continue
        }
        if (!correctAnswer) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: Missing or invalid "**Jawaban: X**" key.`)
            continue
        }
        if (correctAnswer === "E" && !optE) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: Answer key is E, but option E is missing.`)
            continue
        }
        if (!cleanedPembahasanBody) {
            parseErrors.push(`[${filename}] Soal ${soalNumber}: Empty explanation body.`)
            continue
        }

        questions.push({
            soalNumber,
            text: questionText,
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            option_e: optE,
            correct_answer: correctAnswer,
            explanation: `**Pembahasan:**\n\n${cleanedPembahasanBody}`,
        })
    }

    if (parseErrors.length > 0) {
        throw new Error(`Parsing failed for ${filename}:\n${parseErrors.join("\n")}`)
    }

    return questions
}

async function ensureGradeCourses(): Promise<Record<ExcellentCourseCode, string>> {
    console.log("1. Upserting Excellent Beta Physics courses into public.courses...")

    const courseRows = EXCELLENT_COURSES.map((course) => ({
        slug: course.slug,
        code: course.code,
        title: course.title,
        track: "NON_PHYSICS" as const,
        is_active: true,
        sort_order: course.sortOrder,
    }))

    const { data, error } = await supabase
        .from("courses")
        .upsert(courseRows, { onConflict: "slug" })
        .select("id, code, slug, title")

    if (error || !data) {
        throw new Error(`Failed to upsert courses: ${error?.message || "Unknown error"}`)
    }

    const courseIdByCode = {} as Record<ExcellentCourseCode, string>
    for (const row of data) {
        const code = row.code as ExcellentCourseCode
        courseIdByCode[code] = row.id
        console.log(`   - [${row.code}] ${row.title} (${row.id})`)
    }

    for (const course of EXCELLENT_COURSES) {
        if (!courseIdByCode[course.code]) {
            throw new Error(`Missing course ID after upsert for ${course.code}`)
        }
    }

    return courseIdByCode
}

async function upsertSasMaterials(courseIdByCode: Record<ExcellentCourseCode, string>) {
    console.log("\n2. Upserting 3 downloadable SAS materials into public.materials...")

    const now = new Date().toISOString()

    for (const course of EXCELLENT_COURSES) {
        const cfg = MATERIAL_LINKS[course.code]
        const courseId = courseIdByCode[course.code]
        const pdfDownloadUrl = toDirectDownloadUrl(cfg.pdfDriveUrl)
        const podcastDownloadUrl = toDirectDownloadUrl(cfg.podcastDriveUrl)

        const payload = {
            course_id: courseId,
            slug: cfg.slug,
            title: cfg.title,
            summary: cfg.summary,
            content_md: null,
            drive_url: pdfDownloadUrl || "https://bebasbikinnyaman.com",
            podcast_url: podcastDownloadUrl,
            module_number: 1,
            sort_order: 1,
            is_free_preview: true,
            is_published: true,
            reading_time_minutes: null,
            updated_at: now,
        }

        const { data, error } = await supabase
            .from("materials")
            .upsert(payload, { onConflict: "slug" })
            .select("id, slug, title, drive_url, podcast_url")
            .single()

        if (error || !data) {
            throw new Error(`Failed to upsert material ${cfg.slug}: ${error?.message || "Unknown error"}`)
        }

        console.log(
            `   - [${course.code}] ${data.title} (slug: ${data.slug}, pdf: ${Boolean(toDirectDownloadUrl(data.drive_url))}, podcast: ${Boolean(toDirectDownloadUrl(data.podcast_url))})`
        )
    }
}

async function seedPracticeSets(courseIdByCode: Record<ExcellentCourseCode, string>) {
    console.log("\n3. Parsing and seeding all 9 SAS practice sets...")

    const dataDir = path.resolve(process.cwd(), "scripts/data/sas")

    // Parse and validate all 9 files first before touching DB rows
    const parsedSets = PRACTICE_FILES.map((cfg) => {
        const filePath = path.join(dataDir, cfg.filename)
        const questions = parseSasMarkdownFile(filePath)
        console.log(`   - Parsed ${cfg.filename}: ${questions.length} valid questions`)
        return { cfg, questions }
    })

    for (const { cfg, questions } of parsedSets) {
        const courseId = courseIdByCode[cfg.subject]
        const now = new Date().toISOString()

        // 3a. Upsert practice set in public.tryouts by (course_id, title)
        const { data: existingTryouts, error: findTryoutErr } = await supabase
            .from("tryouts")
            .select("id")
            .eq("course_id", courseId)
            .eq("title", cfg.title)
            .limit(1)

        if (findTryoutErr) {
            throw new Error(`Failed querying tryout "${cfg.title}": ${findTryoutErr.message}`)
        }

        let tryoutId: string
        if (existingTryouts && existingTryouts.length > 0) {
            tryoutId = existingTryouts[0].id
            const { error: updateTryoutErr } = await supabase
                .from("tryouts")
                .update({
                    description: cfg.description,
                    category: cfg.category,
                    practice_part: cfg.practicePart,
                    status: "ACTIVE",
                    is_active: true,
                    is_practice: true,
                    max_attempts: 999,
                    duration: 60,
                    is_free_sample: true,
                    updated_at: now,
                })
                .eq("id", tryoutId)

            if (updateTryoutErr) {
                throw new Error(`Failed updating tryout "${cfg.title}": ${updateTryoutErr.message}`)
            }
        } else {
            tryoutId = randomUUID()
            const { error: insertTryoutErr } = await supabase.from("tryouts").insert({
                id: tryoutId,
                course_id: courseId,
                title: cfg.title,
                description: cfg.description,
                category: cfg.category,
                practice_part: cfg.practicePart,
                status: "ACTIVE",
                is_active: true,
                is_practice: true,
                max_attempts: 999,
                duration: 60,
                is_free_sample: true,
                created_at: now,
                updated_at: now,
            })

            if (insertTryoutErr) {
                throw new Error(`Failed inserting tryout "${cfg.title}": ${insertTryoutErr.message}`)
            }
        }

        // 3b. Upsert/deduplicate questions by (course_id, text)
        const orderedQuestionIds: string[] = []
        let insertedQuestions = 0
        let updatedQuestions = 0

        for (const q of questions) {
            const { data: existingQ, error: findQErr } = await supabase
                .from("questions")
                .select("id")
                .eq("course_id", courseId)
                .eq("text", q.text)
                .limit(1)

            if (findQErr) {
                throw new Error(
                    `[${cfg.filename}] Soal ${q.soalNumber}: Failed checking question: ${findQErr.message}`
                )
            }

            if (existingQ && existingQ.length > 0) {
                const qId = existingQ[0].id
                const { error: updateQErr } = await supabase
                    .from("questions")
                    .update({
                        category: cfg.category,
                        type: "MULTIPLE_CHOICE",
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        option_e: q.option_e,
                        correct_answer: q.correct_answer,
                        explanation: q.explanation,
                        weight: 1,
                        updated_at: now,
                    })
                    .eq("id", qId)

                if (updateQErr) {
                    throw new Error(
                        `[${cfg.filename}] Soal ${q.soalNumber}: Failed updating question: ${updateQErr.message}`
                    )
                }
                updatedQuestions++
                orderedQuestionIds.push(qId)
            } else {
                const qId = randomUUID()
                const { error: insertQErr } = await supabase.from("questions").insert({
                    id: qId,
                    course_id: courseId,
                    category: cfg.category,
                    type: "MULTIPLE_CHOICE",
                    text: q.text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    option_e: q.option_e,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    weight: 1,
                    created_at: now,
                    updated_at: now,
                })

                if (insertQErr) {
                    throw new Error(
                        `[${cfg.filename}] Soal ${q.soalNumber}: Failed inserting question: ${insertQErr.message}`
                    )
                }
                insertedQuestions++
                orderedQuestionIds.push(qId)
            }
        }

        // 3c. Sync public.tryout_questions in exact 1..N order
        const { data: existingLinks, error: linksFetchErr } = await supabase
            .from("tryout_questions")
            .select("id, question_id, order")
            .eq("tryout_id", tryoutId)

        if (linksFetchErr) {
            throw new Error(`Failed reading tryout_questions for "${cfg.title}": ${linksFetchErr.message}`)
        }

        const expectedSet = new Set(orderedQuestionIds)
        const existingByQuestionId = new Map<string, { id: string; order: number }>()
        const staleLinkIds: string[] = []

        for (const link of existingLinks || []) {
            if (!expectedSet.has(link.question_id) || existingByQuestionId.has(link.question_id)) {
                staleLinkIds.push(link.id)
            } else {
                existingByQuestionId.set(link.question_id, { id: link.id, order: link.order })
            }
        }

        if (staleLinkIds.length > 0) {
            const { error: delErr } = await supabase
                .from("tryout_questions")
                .delete()
                .in("id", staleLinkIds)

            if (delErr) {
                throw new Error(`Failed deleting stale links for "${cfg.title}": ${delErr.message}`)
            }
        }

        for (let idx = 0; idx < orderedQuestionIds.length; idx++) {
            const questionId = orderedQuestionIds[idx]
            const desiredOrder = idx + 1
            const existingLink = existingByQuestionId.get(questionId)

            if (existingLink) {
                if (existingLink.order !== desiredOrder) {
                    const { error: updOrderErr } = await supabase
                        .from("tryout_questions")
                        .update({ order: desiredOrder })
                        .eq("id", existingLink.id)

                    if (updOrderErr) {
                        throw new Error(
                            `Failed updating link order for "${cfg.title}": ${updOrderErr.message}`
                        )
                    }
                }
            } else {
                const { error: insLinkErr } = await supabase.from("tryout_questions").insert({
                    id: randomUUID(),
                    tryout_id: tryoutId,
                    question_id: questionId,
                    order: desiredOrder,
                })

                if (insLinkErr) {
                    throw new Error(`Failed inserting link for "${cfg.title}": ${insLinkErr.message}`)
                }
            }
        }

        console.log(
            `   -> Synced "${cfg.title}" (inserted: ${insertedQuestions}, updated: ${updatedQuestions}, linked: ${orderedQuestionIds.length})`
        )
    }
}

async function printVerificationSummary(courseIdByCode: Record<ExcellentCourseCode, string>) {
    console.log("\n======================================================================")
    console.log("VERIFICATION SUMMARY (LIVE SUPABASE DATABASE)")
    console.log("======================================================================")

    for (const course of EXCELLENT_COURSES) {
        const courseId = courseIdByCode[course.code]

        const { data: materials } = await supabase
            .from("materials")
            .select("slug, title, drive_url, podcast_url, is_published")
            .eq("course_id", courseId)
            .eq("is_published", true)
            .order("sort_order", { ascending: true })

        const { data: tryouts } = await supabase
            .from("tryouts")
            .select("id, title, category, practice_part, status, is_practice, tryout_questions(count)")
            .eq("course_id", courseId)
            .eq("is_practice", true)
            .eq("status", "ACTIVE")
            .order("practice_part", { ascending: true })

        console.log(`\n[${course.code}] ${course.title}`)
        console.log(`  Published Materials: ${materials?.length ?? 0}`)
        for (const mat of materials || []) {
            const hasPdf = Boolean(toDirectDownloadUrl(mat.drive_url))
            const hasPodcast = Boolean(toDirectDownloadUrl(mat.podcast_url))
            console.log(
                `    - ${mat.title} (slug=${mat.slug}) | PDF=${hasPdf ? "OK" : "MISSING"} | Podcast=${hasPodcast ? "OK" : "MISSING"}`
            )
        }

        console.log(`  Active Practice Sets: ${tryouts?.length ?? 0}`)
        let gradeQuestionsTotal = 0
        for (const t of tryouts || []) {
            const countRows = t.tryout_questions as Array<{ count: number }> | null
            const linkedCount = countRows?.[0]?.count ?? 0
            gradeQuestionsTotal += linkedCount
            console.log(
                `    - Paket ${t.practice_part ?? "?"} (${t.category ?? "-"}): ${t.title} -> ${linkedCount} linked questions`
            )
        }
        console.log(`  Total Linked Questions (${course.code}): ${gradeQuestionsTotal}`)
    }

    console.log("\n======================================================================")
}

async function main() {
    const courseIdByCode = await ensureGradeCourses()
    await upsertSasMaterials(courseIdByCode)
    await seedPracticeSets(courseIdByCode)
    await printVerificationSummary(courseIdByCode)
    console.log("\nSAS content seeding completed successfully.")
}

main().catch((err) => {
    console.error("\nFATAL ERROR during SAS content seeding:")
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
})

