import * as path from "path"
import * as dotenv from "dotenv"
import { Client } from "pg"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error("❌ Missing DATABASE_URL env var")
    process.exit(1)
}

// ── Config ────────────────────────────────────────────────────────────
const DRY_RUN = !process.argv.includes("--apply")
const SUBJECT_FILTER = process.argv.includes("--all")
    ? null
    : process.argv.includes("--fisdas2")
        ? "FISDAS2"
        : "FISMAT" // default: FISMAT only

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

// Broader pattern: any \word sequence (catches commands we may not have listed)
const ANY_BACKSLASH_CMD = /\\[a-zA-Z]{2,}/

// ── Helpers ───────────────────────────────────────────────────────────

function hasUndelimitedLatex(text: string): boolean {
    if (!text) return false
    // Strip existing $...$ and $$...$$ blocks
    let stripped = text
    stripped = stripped.replace(/\$\$[\s\S]*?\$\$/g, "")
    stripped = stripped.replace(/\$[^$\n]*?\$/g, "")
    return LATEX_CMD_PATTERN.test(stripped) || ANY_BACKSLASH_CMD.test(stripped)
}

/**
 * Classify a whitespace-separated token as math or text.
 * Returns: "math" | "text" | "ambiguous"
 */
function classifyToken(token: string): "math" | "text" | "ambiguous" {
    const t = token.trim()
    if (!t) return "ambiguous"

    // Contains a LaTeX command → definitely math
    if (/\\[a-zA-Z]/.test(t)) return "math"

    // Contains braces, superscript, subscript → math
    if (/[{}^_]/.test(t)) return "math"

    // Pure math operator
    if (/^[=+\-*/|<>≤≥≠≈]+$/.test(t)) return "math"

    // Parenthesized expression with math inside
    if (/^\(.*\\/.test(t) || /^\[.*\\/.test(t)) return "math"

    // Multi-character word (2+ letters, no backslash, no math symbols) → text
    const cleaned = t.replace(/[()[\].,;:!?"']/g, "")
    if (cleaned.length >= 2 && /^[a-zA-Z\u00C0-\u024F]+$/.test(cleaned)) {
        // Exception: known math-like short words
        const mathWords = new Set(["Re", "Im", "Ln", "ln", "di", "ke"])
        if (mathWords.has(cleaned)) return "ambiguous"
        return "text"
    }

    // Single character → ambiguous (resolved by context)
    if (cleaned.length <= 1) return "ambiguous"

    // Numbers → ambiguous
    if (/^\d+[.,]?\d*$/.test(cleaned)) return "ambiguous"

    return "ambiguous"
}

/**
 * Find and wrap math segments within a mixed text+math line.
 */
function wrapMathSegments(text: string): string {
    // Tokenize preserving whitespace
    const parts = text.split(/(\s+)/)

    // Classify each token
    const classified = parts.map((p) => ({
        token: p,
        isSpace: /^\s+$/.test(p),
        cls: /^\s+$/.test(p) ? ("space" as const) : classifyToken(p),
    }))

    // Resolve ambiguous tokens: if adjacent (skipping spaces) to a "math" token, treat as math
    let changed = true
    while (changed) {
        changed = false
        for (let i = 0; i < classified.length; i++) {
            if (classified[i].cls !== "ambiguous") continue

            // Look left (skip spaces)
            let leftMath = false
            for (let j = i - 1; j >= 0; j--) {
                if (classified[j].isSpace) continue
                leftMath = classified[j].cls === "math"
                break
            }

            // Look right (skip spaces)
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

    // Remaining ambiguous tokens → treat as text
    for (const c of classified) {
        if (c.cls === "ambiguous") c.cls = "text"
    }

    // Build result: group consecutive math tokens and wrap them
    let result = ""
    let mathBuffer = ""
    let inMath = false

    const flushMath = () => {
        if (!mathBuffer.trim()) {
            result += mathBuffer
            mathBuffer = ""
            return
        }
        
        // Extract leading whitespace
        const leadingSpaceMatch = mathBuffer.match(/^(\s*)/)
        const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : ""
        
        // Extract trailing whitespace
        const trailingSpaceMatch = mathBuffer.match(/(\s*)$/)
        const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[1] : ""
        
        // Extract the actual math content
        let math = mathBuffer.trim()
        
        let trailingPunct = ""
        // Strip trailing sentence punctuation from math
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

    // Flush remaining
    if (inMath) flushMath()

    return result
}

/**
 * Process a single line, wrapping un-delimited LaTeX.
 */
function processLine(line: string): string {
    const trimmed = line.trim()
    if (!trimmed) return line

    // Already starts with $ → skip
    if (trimmed.startsWith("$")) return line

    // Check if line contains PLACEHOLDER markers (protected blocks) - skip those
    if (trimmed.includes("__LATEXBLK_")) return line

    // Strip already-delimited blocks for detection
    const checkText = trimmed
        .replace(/\$\$[\s\S]*?\$\$/g, "")
        .replace(/\$[^$\n]*?\$/g, "")

    const hasLatex = LATEX_CMD_PATTERN.test(checkText) || ANY_BACKSLASH_CMD.test(checkText)
    if (!hasLatex) return line

    // Preserve leading whitespace
    const leadingWS = line.match(/^(\s*)/)?.[1] || ""

    // ── Case 1: Line starts with a LaTeX command → standalone math → $$...$$
    if (/^\\[a-zA-Z]/.test(trimmed)) {
        let math = trimmed
        let trailing = ""
        if (math.endsWith(".") && !math.endsWith("...")) {
            math = math.slice(0, -1)
            trailing = "."
        }
        return leadingWS + "$$" + math + "$$" + trailing
    }

    // ── Case 2: Line starts with a math expression (e.g., e^{...}, u^2, (e^x)^n, 2\cos...)
    if (/^[a-zA-Z0-9(|]/.test(trimmed) && /[\\^_{}]/.test(trimmed)) {
        // Check if the line is mostly math (no multi-char text words, or very few)
        const tokens = trimmed.split(/\s+/)
        const textTokens = tokens.filter(t => classifyToken(t) === "text")
        const mathTokens = tokens.filter(t => classifyToken(t) === "math" || classifyToken(t) === "ambiguous")

        if (textTokens.length === 0) {
            // Pure math line
            let math = trimmed
            let trailing = ""
            if (math.endsWith(".") && !math.endsWith("...")) {
                math = math.slice(0, -1)
                trailing = "."
            }
            return leadingWS + "$$" + math + "$$" + trailing
        }
    }

    // ── Case 3: "Label: math expression" pattern
    // Match Indonesian label patterns like "Bagian riil:", "Nilai mutlak:", "Jawaban:", etc.
    const labelMatch = trimmed.match(/^([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s()]*:\s*)(.+)$/)
    if (labelMatch) {
        const [, label, expr] = labelMatch
        const exprCheck = expr.replace(/\$\$[\s\S]*?\$\$/g, "").replace(/\$[^$\n]*?\$/g, "")
        if (LATEX_CMD_PATTERN.test(exprCheck) || ANY_BACKSLASH_CMD.test(exprCheck)) {
            // Check if the expression part is pure math or mixed
            const exprTokens = expr.split(/\s+/)
            const textTokensInExpr = exprTokens.filter(t => classifyToken(t) === "text")

            if (textTokensInExpr.length === 0) {
                // Pure math after label
                let math = expr.trim()
                let trailing = ""
                if (math.endsWith(".") && !math.endsWith("...")) {
                    math = math.slice(0, -1)
                    trailing = "."
                }
                return leadingWS + label + "$" + math + "$" + trailing
            } else {
                // Mixed - wrap segments
                return leadingWS + label + wrapMathSegments(expr)
            }
        }
    }

    // ── Case 4: Mixed text and math → find and wrap math segments
    return leadingWS + wrapMathSegments(trimmed)
}

/**
 * Main function: fix all un-delimited LaTeX in a text field.
 */
function fixLatexDelimiters(text: string): string {
    if (!text) return text

    // Step 1: Protect existing $$...$$ and $...$ blocks
    const blocks: string[] = []

    let protectedText = text

    // Protect $$...$$ (can span lines)
    protectedText = protectedText.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
        blocks.push(match)
        return `__LATEXBLK_${blocks.length - 1}__`
    })

    // Protect $...$ (single line)
    protectedText = protectedText.replace(/\$[^$\n]+?\$/g, (match) => {
        blocks.push(match)
        return `__LATEXBLK_${blocks.length - 1}__`
    })

    // Step 2: Process line by line
    const lines = protectedText.split("\n")
    const fixedLines = lines.map((line) => processLine(line))
    let result = fixedLines.join("\n")

    // Step 3: Restore protected blocks
    for (let i = 0; i < blocks.length; i++) {
        result = result.replace(`__LATEXBLK_${i}__`, blocks[i])
    }

    return result
}

// ── Main ──────────────────────────────────────────────────────────────

async function run() {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()
    console.log("🔌 Connected to database")
    console.log(`📋 Mode: ${DRY_RUN ? "DRY RUN (use --apply to write)" : "APPLY"}`)
    console.log(`📋 Subject filter: ${SUBJECT_FILTER || "ALL"}`)
    console.log("")

    // Fetch questions
    let query = "SELECT id, text, explanation, correct_answer, category, subject FROM questions"
    const params: string[] = []
    if (SUBJECT_FILTER) {
        query += " WHERE subject = $1"
        params.push(SUBJECT_FILTER)
    }
    query += " ORDER BY category, created_at"

    const { rows: questions } = await client.query(query, params)
    console.log(`📊 Total questions to scan: ${questions.length}`)

    let totalAffected = 0
    let totalFieldsFixed = 0
    const affectedByCategory: Record<string, number> = {}

    for (const q of questions) {
        const fixes: { field: string; original: string; fixed: string }[] = []

        // Check each text field
        for (const field of ["text", "explanation", "correct_answer"] as const) {
            const original = q[field]
            if (!original || !hasUndelimitedLatex(original)) continue

            const fixed = fixLatexDelimiters(original)
            if (fixed !== original) {
                fixes.push({ field, original, fixed })
            }
        }

        if (fixes.length === 0) continue

        totalAffected++
        totalFieldsFixed += fixes.length
        affectedByCategory[q.category] = (affectedByCategory[q.category] || 0) + 1

        // Log the changes
        console.log(`\n${"─".repeat(80)}`)
        console.log(`📝 Question ID: ${q.id}`)
        console.log(`   Category: ${q.category} | Subject: ${q.subject}`)

        for (const fix of fixes) {
            console.log(`\n   🔧 Field: ${fix.field}`)

            // Show first 200 chars of original vs fixed
            const origPreview = fix.original.substring(0, 200).replace(/\n/g, "\\n")
            const fixedPreview = fix.fixed.substring(0, 200).replace(/\n/g, "\\n")
            console.log(`   BEFORE: ${origPreview}${fix.original.length > 200 ? "..." : ""}`)
            console.log(`   AFTER:  ${fixedPreview}${fix.fixed.length > 200 ? "..." : ""}`)
        }

        // Apply changes if not dry run
        if (!DRY_RUN) {
            for (const fix of fixes) {
                await client.query(
                    `UPDATE questions SET ${fix.field} = $1, updated_at = NOW() WHERE id = $2`,
                    [fix.fixed, q.id],
                )
            }
            console.log(`   ✅ Applied`)
        }
    }

    // Summary
    console.log(`\n${"═".repeat(80)}`)
    console.log(`📊 SUMMARY`)
    console.log(`   Questions scanned:  ${questions.length}`)
    console.log(`   Questions affected: ${totalAffected}`)
    console.log(`   Fields fixed:       ${totalFieldsFixed}`)
    console.log(`\n   By category:`)
    for (const [cat, count] of Object.entries(affectedByCategory).sort()) {
        console.log(`     ${cat}: ${count}`)
    }

    if (DRY_RUN && totalAffected > 0) {
        console.log(`\n💡 This was a DRY RUN. Run with --apply to write changes to the database.`)
    }

    await client.end()
    console.log(`\n🏁 Done.`)
}

run().catch(console.error)
