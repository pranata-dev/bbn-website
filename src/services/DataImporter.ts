import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { QuestionCategory, Subject } from "@/types"
import { questionSchema } from "@/lib/validations/admin"

export interface ParsedQuestion {
    text: string
    category: QuestionCategory
    subject: Subject
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e?: string
    correct_answer: string
    explanation?: string | null
    weight: number
}

export interface SeedOptions {
    createTryoutTitle?: string
    isPractice?: boolean
    durationMinutes?: number
}

export class DataImporter {
    /**
     * Parses raw text content into standardized Question objects.
     */
    static parseRawText(
        rawText: string,
        category: QuestionCategory,
        subject: Subject
    ): ParsedQuestion[] {
        // Splitting by "**Soal X:**"
        const sections = rawText.split(/\*\*Soal\s+\d+:\*\*/i).map(s => s.trim()).filter(s => s.length > 0)
        
        const questions: ParsedQuestion[] = []
        
        for (const section of sections) {
            try {
                // Split by "---" to separate question part and explanation
                const parts = section.split("---")
                if (parts.length < 2) continue
                
                const soalPart = parts[0].trim()
                const pembahasanPart = parts.slice(1).join("---").replace(/\*\*Pembahasan:\*\*/i, "").trim()
                
                // Extract options
                const optionsRegex = /(?:^|\n)A\.\s([\s\S]*?)\nB\.\s([\s\S]*?)\nC\.\s([\s\S]*?)\nD\.\s([\s\S]*?)(?:\nE\.\s([\s\S]*?))?(?:\n|$)/i
                const optionsMatch = soalPart.match(optionsRegex)
                
                let text = soalPart
                let optA = "", optB = "", optC = "", optD = "", optE = ""
                
                if (optionsMatch) {
                    text = soalPart.substring(0, optionsMatch.index).trim()
                    optA = optionsMatch[1].trim()
                    optB = optionsMatch[2].trim()
                    optC = optionsMatch[3].trim()
                    optD = optionsMatch[4].trim()
                    if (optionsMatch[5]) {
                        optE = optionsMatch[5].trim()
                    }
                }

                // Extract answer
                let correctAnswer = ""
                const ansMatch = pembahasanPart.match(/\*\*Jawaban:\s*([A-E])\.?/i) || pembahasanPart.match(/\*\*Jawaban:\s*([A-E])\*\*/i)
                
                if (ansMatch) {
                    correctAnswer = ansMatch[1].toUpperCase()
                }
                
                if (text && optA && correctAnswer) {
                    // Validate and auto-format using Zod
                    const parsed = questionSchema.safeParse({
                        text: text,
                        category: category,
                        subject: subject,
                        option_a: optA,
                        option_b: optB,
                        option_c: optC,
                        option_d: optD,
                        option_e: optE || undefined,
                        correct_answer: correctAnswer,
                        explanation: "**Pembahasan:**\n\n" + pembahasanPart,
                        weight: 1
                    })

                    if (parsed.success) {
                        questions.push(parsed.data)
                    } else {
                        console.error(`Validation failed for question: "${text.substring(0, 30)}..."`, parsed.error.format())
                    }
                }
            } catch(e) {
                console.error("Error parsing a section", e)
            }
        }

        // Dedup based on text
        const uniqueQuestions: ParsedQuestion[] = []
        const seenTexts = new Set<string>()

        for (const q of questions) {
            const cleanText = q.text.trim()
            if (!seenTexts.has(cleanText)) {
                uniqueQuestions.push(q)
                seenTexts.add(cleanText)
            }
        }

        return uniqueQuestions
    }

    /**
     * Seeds parsed questions into the database and optionally creates/links a Tryout.
     */
    static async seedData(
        supabaseUrl: string,
        supabaseKey: string,
        questions: ParsedQuestion[],
        category: QuestionCategory,
        subject: Subject,
        options?: SeedOptions
    ) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        let inserted = 0
        let skipped = 0
        const questionIds: string[] = []

        for (const q of questions) {
            const text = q.text.trim()
            const { data: existing, error: checkErr } = await supabase
                .from("questions")
                .select("id")
                .eq("text", text)
                .limit(1)

            if (checkErr) {
                console.error(`Error checking question: ${checkErr.message}`)
                continue
            }

            if (existing && existing.length > 0) {
                skipped++
                questionIds.push(existing[0].id)
                continue
            }

            const id = uuidv4()
            const now = new Date().toISOString()

            const payload = {
                id: id,
                text: text,
                category: category,
                subject: subject,
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: q.option_c.trim(),
                option_d: q.option_d.trim(),
                option_e: q.option_e?.trim() || null,
                correct_answer: q.correct_answer.trim().toUpperCase(),
                explanation: q.explanation?.trim() || null,
                weight: q.weight || 1,
                created_at: now,
                updated_at: now,
            }

            const { error: insertErr } = await supabase
                .from("questions")
                .insert(payload)

            if (insertErr) {
                console.error(`Error inserting question: ${insertErr.message}`)
            } else {
                inserted++
                questionIds.push(id)
            }
        }

        let tryoutId: string | undefined

        // Setup Tryout if option provided
        if (options?.createTryoutTitle) {
            const title = options.createTryoutTitle
            const isPractice = options.isPractice ?? true
            
            const { data: tryouts, error: trErr } = await supabase
                .from("tryouts")
                .select("id")
                .eq("title", title)
                .eq("category", category)
                .eq("subject", subject)
                .eq("is_practice", isPractice)
                .limit(1)

            if (tryouts && tryouts.length > 0) {
                tryoutId = tryouts[0].id
                console.log(`Tryout exists: ${tryoutId}`)
            } else {
                tryoutId = uuidv4()
                const now = new Date().toISOString()
                const { error: trInsertErr } = await supabase
                    .from("tryouts")
                    .insert({
                        id: tryoutId,
                        title: title,
                        category: category,
                        subject: subject,
                        is_practice: isPractice,
                        status: "ACTIVE",
                        duration: options.durationMinutes || 60,
                        max_attempts: 999,
                        created_at: now,
                        updated_at: now
                    })
                    
                if (trInsertErr) {
                    console.error(`Error creating tryout: ${trInsertErr.message}`)
                } else {
                    console.log(`Created Tryout: ${tryoutId}`)
                }
            }

            // Link Questions
            if (tryoutId && questionIds.length > 0) {
                for (let i = 0; i < questionIds.length; i++) {
                    const qid = questionIds[i]
                    
                    const { data: linkedCheck } = await supabase
                        .from("tryout_questions")
                        .select("id")
                        .eq("tryout_id", tryoutId)
                        .eq("question_id", qid)
                        .limit(1)
                        
                    if (!linkedCheck || linkedCheck.length === 0) {
                        await supabase.from("tryout_questions").insert({
                            id: uuidv4(),
                            tryout_id: tryoutId,
                            question_id: qid,
                            order: i
                        })
                    }
                }
            }
        }

        return { inserted, skipped, tryoutId }
    }
}
