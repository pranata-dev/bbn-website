import { z } from "zod"
import { QuestionCategory, Subject } from "@/types"

/**
 * Automatically applies LaTeX formatting fixes to text before ingestion.
 * This replaces the need for the legacy `fix_latex_formatting.ts` script.
 */
const transformLatex = (val: string): string => {
    let fixed = val

    // 1. Fix exponents: 10^-7 -> 10^{-7}, q^2 -> q^{2}, R^2 -> R^{2}
    // We look for patterns like [char]^[number/sign+number]
    fixed = fixed.replace(/(\d+)\^([+-]?\d+)/g, "$1^{$2}")
    fixed = fixed.replace(/([a-zA-Z])\^([+-]?\d+)/g, "$1^{$2}")

    // 2. Fix scientific notation: x 10 -> \times 10
    // Example: 1,6 x 10^{-19} -> 1,6 \times 10^{-19}
    fixed = fixed.replace(/(\d)\s*x\s*(10\^|10\{)/g, "$1 \\times $2")
    
    // 3. Ensure mu (micro) is \mu
    fixed = fixed.replace(/(\d)\s*uC/g, "$1 \\,\\mu\\text{C}")
    fixed = fixed.replace(/(\d)\s*µC/g, "$1 \\,\\mu\\text{C}")
               .replace(/(\d)\s*μC/g, "$1 \\,\\mu\\text{C}")

    return fixed
}

// Reusable custom Zod type that enforces non-empty strings and applies LaTeX fixes
export const latexStringSchema = z
    .string()
    .min(1, "Text is required")
    .transform(transformLatex)

// Base schema for validating incoming Question creation payloads
export const questionSchema = z.object({
    text: latexStringSchema,
    category: z.enum([
        "WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4", 
        "WEEK_5", "WEEK_6", "WEEK_7"
    ] as const),
    subject: z.enum(["FISDAS2", "FISMAT"] as const).default("FISDAS2"),
    option_a: latexStringSchema,
    option_b: latexStringSchema,
    option_c: latexStringSchema,
    option_d: latexStringSchema,
    option_e: z.string().transform(v => v ? transformLatex(v) : undefined).optional(),
    correct_answer: z.enum(["A", "B", "C", "D", "E"] as const),
    explanation: z.string().transform(v => v ? transformLatex(v) : undefined).nullable().optional(),
    weight: z.number().min(0).default(1),
})

export type QuestionInput = z.infer<typeof questionSchema>
