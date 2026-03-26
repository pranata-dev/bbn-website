import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Known LaTeX commands ──────────────────────────────────────────────
const LATEX_COMMANDS = [
    // Trig / Hyp
    "sin", "cos", "tan", "sec", "csc", "cot",
    "arcsin", "arccos", "arctan",
    "sinh", "cosh", "tanh",
    // Math functions
    "ln", "log", "exp", "sqrt", "cbrt",
    "sum", "prod", "int", "iint", "iiint", "oint",
    "frac", "dfrac", "tfrac", "binom",
    "lim", "limsup", "liminf", "sup", "inf", "min", "max",
    "det", "dim", "ker", "hom", "arg", "deg", "gcd",
    "Re", "Im",
    // Formatting
    "text", "mathrm", "mathbf", "mathbb", "mathcal", "mathit",
    "operatorname", "displaystyle", "textstyle",
    "overline", "underline", "overbrace", "underbrace",
    "hat", "bar", "dot", "ddot", "tilde", "vec",
    // Greek
    "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon",
    "zeta", "eta", "theta", "vartheta", "iota", "kappa",
    "lambda", "mu", "nu", "xi", "pi", "rho", "sigma",
    "tau", "upsilon", "phi", "varphi", "chi", "psi", "omega",
    "Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi",
    "Sigma", "Phi", "Psi", "Omega",
    // Operators / Relations
    "pm", "mp", "cdot", "cdots", "ldots", "dots", "times", "div",
    "infty", "partial", "nabla", "forall", "exists",
    "le", "leq", "ge", "geq", "ne", "neq",
    "approx", "equiv", "propto", "sim", "simeq", "cong",
    "subset", "supset", "subseteq", "supseteq", "in", "notin",
    "cap", "cup", "emptyset", "neg",
    "to", "rightarrow", "leftarrow", "Rightarrow", "Leftarrow",
    "iff", "implies", "mapsto",
    // Delimiters
    "left", "right", "big", "Big", "bigg", "Bigg",
    // Spacing
    "quad", "qquad", "hspace", "vspace",
    // Misc
    "pmod", "mod",
]

const LATEX_CMD_PATTERN = new RegExp(
    `\\\\(?:${LATEX_COMMANDS.join("|")})(?![a-zA-Z])`,
)

const ANY_BACKSLASH_CMD = /\\[a-zA-Z]{2,}/

// ── Helpers ───────────────────────────────────────────────────────────

function classifyToken(token: string): "math" | "text" | "ambiguous" {
    const t = token.trim()
    if (!t) return "ambiguous"
    if (/\\[a-zA-Z]/.test(t)) return "math"
    if (/[{}^_]/.test(t)) return "math"
    if (/^[=+\-*/|<>≤≥≠≈]+$/.test(t)) return "math"
    if (/^\(.*\\/.test(t) || /^\[.*\\/.test(t)) return "math"
    const cleaned = t.replace(/[()[\].,;:!?"']/g, "")
    if (cleaned.length >= 2 && /^[a-zA-Z\u00C0-\u024F]+$/.test(cleaned)) {
        const mathWords = new Set(["Re", "Im", "Ln", "ln", "di", "ke"])
        if (mathWords.has(cleaned)) return "ambiguous"
        return "text"
    }
    if (cleaned.length <= 1) return "ambiguous"
    if (/^\d+[.,]?\d*$/.test(cleaned)) return "ambiguous"
    return "ambiguous"
}

function wrapMathSegments(text: string): string {
    const parts = text.split(/(\s+)/)
    const classified = parts.map((p) => ({
        token: p,
        isSpace: /^\s+$/.test(p),
        cls: /^\s+$/.test(p) ? ("space" as const) : classifyToken(p),
    }))

    let changed = true
    while (changed) {
        changed = false
        for (let i = 0; i < classified.length; i++) {
            if (classified[i].cls !== "ambiguous") continue
            let leftMath = false
            for (let j = i - 1; j >= 0; j--) {
                if (classified[j].isSpace) continue
                leftMath = classified[j].cls === "math"
                break
            }
            let rightMath = false
            for (let j = i + 1; j < classified.length; j++) {
                if (classified[j].isSpace) continue
                rightMath = classified[j].cls === "math"
                break
            }
            if (leftMath || rightMath) {
                classified[i].cls = "math"
                changed = true
            }
        }
    }

    for (const c of classified) {
        if (c.cls === "ambiguous") c.cls = "text"
    }

    let result = ""
    let mathBuffer = ""
    let inMath = false

    const flushMath = () => {
        if (!mathBuffer.trim()) {
            result += mathBuffer
            mathBuffer = ""
            return
        }
        const leadingSpaceMatch = mathBuffer.match(/^(\s*)/)
        const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : ""
        const trailingSpaceMatch = mathBuffer.match(/(\s*)$/)
        const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[1] : ""
        
        let math = mathBuffer.trim()
        let trailingPunct = ""
        const punctMatch = math.match(/([.,;:!?]+)$/)
        if (punctMatch) {
            trailingPunct = punctMatch[1]
            math = math.slice(0, -trailingPunct.length).trim()
        }
        
        if (math) {
            result += leadingSpace + "$" + math + "$" + trailingPunct + trailingSpace
        } else {
            result += mathBuffer
        }
        mathBuffer = ""
    }

    for (let i = 0; i < classified.length; i++) {
        const { token, isSpace, cls } = classified[i]
        if (isSpace) {
            if (inMath) {
                mathBuffer += token
            } else {
                result += token
            }
            continue
        }
        if (cls === "math") {
            if (!inMath) inMath = true
            mathBuffer += token
        } else {
            if (inMath) {
                flushMath()
                inMath = false
            }
            result += token
        }
    }
    if (inMath) flushMath()
    return result
}

function processLine(line: string): string {
    const trimmed = line.trim()
    if (!trimmed) return line
    if (trimmed.startsWith("$")) return line
    if (trimmed.includes("__LATEXBLK_")) return line

    const checkText = trimmed
        .replace(/\$\$[\s\S]*?\$\$/g, "")
        .replace(/\$[^$\n]*?\$/g, "")

    const hasLatex = LATEX_CMD_PATTERN.test(checkText) || ANY_BACKSLASH_CMD.test(checkText)
    if (!hasLatex) return line

    const leadingWS = line.match(/^(\s*)/)?.[1] || ""

    if (/^\\[a-zA-Z]/.test(trimmed)) {
        let math = trimmed
        let trailing = ""
        if (math.endsWith(".") && !math.endsWith("...")) {
            math = math.slice(0, -1)
            trailing = "."
        }
        return leadingWS + "$$" + math + "$$" + trailing
    }

    if (/^[a-zA-Z0-9(|]/.test(trimmed) && /[\\^_{}]/.test(trimmed)) {
        const tokens = trimmed.split(/\s+/)
        const textTokens = tokens.filter(t => classifyToken(t) === "text")
        if (textTokens.length === 0) {
            let math = trimmed
            let trailing = ""
            if (math.endsWith(".") && !math.endsWith("...")) {
                math = math.slice(0, -1)
                trailing = "."
            }
            return leadingWS + "$$" + math + "$$" + trailing
        }
    }

    const labelMatch = trimmed.match(/^([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s()]*:\s*)(.+)$/)
    if (labelMatch) {
        const [, label, expr] = labelMatch
        const exprCheck = expr.replace(/\$\$[\s\S]*?\$\$/g, "").replace(/\$[^$\n]*?\$/g, "")
        if (LATEX_CMD_PATTERN.test(exprCheck) || ANY_BACKSLASH_CMD.test(exprCheck)) {
            const exprTokens = expr.split(/\s+/)
            const textTokensInExpr = exprTokens.filter(t => classifyToken(t) === "text")
            if (textTokensInExpr.length === 0) {
                let math = expr.trim()
                let trailing = ""
                if (math.endsWith(".") && !math.endsWith("...")) {
                    math = math.slice(0, -1)
                    trailing = "."
                }
                return leadingWS + label + "$" + math + "$" + trailing
            } else {
                return leadingWS + label + wrapMathSegments(expr)
            }
        }
    }

    return leadingWS + wrapMathSegments(trimmed)
}

function fixLatexDelimiters(text: string): string {
    if (!text) return text
    const blocks: string[] = []
    let protectedText = text

    protectedText = protectedText.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
        blocks.push(match)
        return `__LATEXBLK_${blocks.length - 1}__`
    })

    protectedText = protectedText.replace(/\$[^$\n]+?\$/g, (match) => {
        blocks.push(match)
        return `__LATEXBLK_${blocks.length - 1}__`
    })

    const lines = protectedText.split("\n")
    const fixedLines = lines.map((line) => processLine(line))
    let result = fixedLines.join("\n")

    for (let i = 0; i < blocks.length; i++) {
        result = result.replace(`__LATEXBLK_${i}__`, blocks[i])
    }
    return result
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    let currentIndex = arr.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
    return arr;
}

import { Client } from 'pg'

// ── Main Execution ────────────────────────────────────────────────────────

async function run() {
    try {
        console.log("🚀 Starting FISMAT Mega-Import, Validation & Reorganization");

        try {
            const pgClient = new Client({ connectionString: process.env.DATABASE_URL })
            await pgClient.connect()
            try {
                await pgClient.query(`ALTER TYPE "QuestionCategory" ADD VALUE IF NOT EXISTS 'LINEAR_ALGEBRA'`);
                console.log("✅ Ensured 'LINEAR_ALGEBRA' in DB QuestionCategory enum.");
            } catch(e: any) {
                // Ignore if it already exists
            } finally {
                await pgClient.end()
            }
        } catch(e: any) {
            console.error("⚠️ Could not execute pg query for enum:", e.message);
        }

        // 1. File parsing
        const filePaths = Array.from({length: 7}, (_, i) => 
            `C:/Users/p/OneDrive/Dokumen/FISMAT - ALJABAR LINEAR SOAL ${i+1}.txt`
        );
        
        const newQuestions: any[] = [];
        
        for (const file of filePaths) {
            console.log(`📥 Parsing ${path.basename(file)}...`);
            if (!fs.existsSync(file)) {
                 console.error(`❌ File not found: ${file}`);
                 continue;
            }
            const content = fs.readFileSync(file, 'utf-8');
            
            const sections = content.split(/Soal\s+\d+/i).map(s => s.trim()).filter(s => s.length > 0);
            
            for (let i = 0; i < sections.length; i++) {
                let section = sections[i];
                let soalIdx = section.indexOf("Soal:");
                let pemIdx = section.indexOf("Pembahasan:");
                let jawIdx = section.indexOf("Jawaban:");
                
                if (soalIdx === -1 || pemIdx === -1) continue;
                
                let textRaw = section.substring(soalIdx + 5, pemIdx).trim();
                let endExplanation = jawIdx !== -1 ? jawIdx : section.length;
                let explanationRaw = section.substring(pemIdx + 11, endExplanation).trim();
                explanationRaw = explanationRaw.replace(/--+$/, "").trim();
                
                let answerRaw = "";
                if (jawIdx !== -1) {
                    let endIdx = section.indexOf("---", jawIdx);
                    if (endIdx === -1) endIdx = section.length;
                    answerRaw = section.substring(jawIdx + 8, endIdx).trim();
                }
                
                if (!textRaw || textRaw.length < 5) continue;
                
                const q = {
                    id: uuidv4(),
                    text: fixLatexDelimiters(textRaw),
                    explanation: fixLatexDelimiters(explanationRaw),
                    correct_answer: fixLatexDelimiters(answerRaw) || "-",
                    option_a: "-",
                    option_b: "-",
                    option_c: "-",
                    option_d: "-",
                    option_e: null,
                    category: "LINEAR_ALGEBRA",
                    subject: "FISMAT",
                    weight: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                newQuestions.push(q);
            }
        }
        
        console.log(`\n✅ Parsed ${newQuestions.length} Linear Algebra questions, safely delimited LaTeX.`);
        
        console.log(`\n⏳ Beginning Database Modifications via Supabase...`);
        
        // Step 1: Delete all old FISMAT tryouts
        console.log("🗑️  Fetching old FISMAT tryouts to delete...");
        let { data: oldTryouts } = await supabase.from('tryouts').select('id').eq('subject', 'FISMAT');
        if (oldTryouts && oldTryouts.length > 0) {
            const tIds = oldTryouts.map((t: any) => t.id);
            // Delete relations first manually just in case
            await supabase.from('tryout_questions').delete().in('tryout_id', tIds);
            const { error: delErr } = await supabase.from('tryouts').delete().in('id', tIds);
            if (delErr) throw new Error("Could not delete old tryouts: " + delErr.message);
            console.log(`✅ Deleted ${tIds.length} old tryouts & their relations.`);
        } else {
            console.log(`✅ No old tryouts found.`);
        }

        // Step 2: Insert the newly parsed questions
        console.log("💾 Inserting new Linear Algebra questions...");
        // Supabase allows bulk insert
        const { error: insErr } = await supabase.from('questions').insert(newQuestions);
        if (insErr) throw new Error("Could not insert questions: " + insErr.message);
        console.log(`✅ Inserted ${newQuestions.length} questions.`);

        // Step 3: Fetch all total FISMAT questions
        console.log("🔄 Fetching all FISMAT questions...");
        const { data: allQuestionsData, error: fetchErr } = await supabase
            .from('questions')
            .select('id, category')
            .eq('subject', 'FISMAT');
        
        if (fetchErr) throw new Error("Could not fetch questions: " + fetchErr.message);
        console.log(`   Found ${allQuestionsData.length} total FISMAT questions.`);
        
        const shuffled = shuffle(allQuestionsData);
        const masterQuestions = shuffled.slice(0, 100);
        const remainingQuestions = shuffled.slice(100);

        // Array to hold all tryout_questions insertions
        const tqPayloads: any[] = [];
        
        console.log(`\n🏗️  Building Master Tryouts (Total: 10 parts, 10 questions each)...`);
        for (let i = 0; i < 10; i++) {
            const partQs = masterQuestions.slice(i * 10, (i + 1) * 10);
            if (partQs.length === 0) continue;
            
            const trId = uuidv4();
            const tryoutPayload = {
                id: trId,
                title: `Physics-Mathematics Tryout Part ${i + 1}`,
                is_practice: false,
                status: "ACTIVE",
                subject: "FISMAT",
                category: null,
                max_attempts: 1,
                duration: 120, // minutes
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { error: mErr } = await supabase.from('tryouts').insert(tryoutPayload);
            if (mErr) throw new Error("Could not create master tryout: " + mErr.message);
            
            partQs.forEach((q: any, idx: number) => {
                tqPayloads.push({
                    id: uuidv4(),
                    tryout_id: trId,
                    question_id: q.id,
                    order: idx + 1
                });
            });
        }
        console.log(`✅ Created Master Tryouts.`);

        console.log(`\n🏗️  Building Practice Tryouts from ${remainingQuestions.length} remaining questions...`);
        const grouped = remainingQuestions.reduce((acc: any, q: any) => {
            if (!acc[q.category]) acc[q.category] = [];
            acc[q.category].push(q);
            return acc;
        }, {});
        
        let totalPracticeCreated = 0;
        for (const [cat, qs] of Object.entries(grouped)) {
            const catArray = qs as any[];
            const catShuffled = shuffle(catArray);
            const chunks = Math.ceil(catShuffled.length / 10);
            
            for (let i = 0; i < chunks; i++) {
                const partQs = catShuffled.slice(i * 10, (i + 1) * 10);
                if (partQs.length === 0) continue;
                
                const trId = uuidv4();
                const tryoutPayload = {
                    id: trId,
                    title: `Latihan Soal ${cat} Part ${i + 1}`,
                    is_practice: true,
                    status: "ACTIVE",
                    subject: "FISMAT",
                    category: cat,
                    max_attempts: 999,
                    duration: 0,
                    practice_part: i + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const { error: pErr } = await supabase.from('tryouts').insert(tryoutPayload);
                if (pErr) throw new Error("Could not create practice tryout: " + pErr.message);
                
                partQs.forEach((q: any, idx: number) => {
                    tqPayloads.push({
                        id: uuidv4(),
                        tryout_id: trId,
                        question_id: q.id,
                        order: idx + 1
                    });
                });
                
                totalPracticeCreated++;
            }
            console.log(`   🔸 Created ${chunks} practice parts for ${cat}.`);
        }
        
        // Finally, insert all tryout questions relationship mappings at once
        console.log(`💾 Inserting ${tqPayloads.length} Tryout-Question relationship linkages...`);
        // We chunk them in sets of 500 to not overload the DB bulk insert size
        for (let idx = 0; idx < tqPayloads.length; idx += 500) {
            const chunk = tqPayloads.slice(idx, idx + 500);
            const { error: tqErr } = await supabase.from('tryout_questions').insert(chunk);
            if (tqErr) throw new Error("Could not insert relations: " + tqErr.message);
        }
        
        console.log(`✅ All ${totalPracticeCreated} practice Tryout parts logic registered into database.`);
        console.log("\n🎉 FISMAT UPDATE OPERATION COMPLETE.");
    } catch(e) {
        console.error("❌ Fatal Error: ", e);
    }
}

run().catch(console.error);
