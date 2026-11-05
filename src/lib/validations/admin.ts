import { z } from "zod"

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
export const questionSchema = z.preprocess((val: any) => {
    if (!val || typeof val !== "object") return val
    return {
        ...val,
        option_a: val.option_a ?? val.optionA,
        option_b: val.option_b ?? val.optionB,
        option_c: val.option_c ?? val.optionC,
        option_d: val.option_d ?? val.optionD,
        option_e: val.option_e ?? val.optionE,
        correct_answer: val.correct_answer ?? val.correctAnswer,
        type: val.type ?? "MULTIPLE_CHOICE",
    }
}, z.object({
    text: latexStringSchema,
    category: z.string().min(1, "Category is required"),
    subject: z.enum(["FISDAS2", "FISMAT"] as const).default("FISDAS2"),
    type: z.enum(["MULTIPLE_CHOICE", "ESSAY"] as const).default("MULTIPLE_CHOICE"),
    option_a: latexStringSchema,
    option_b: latexStringSchema,
    option_c: latexStringSchema,
    option_d: latexStringSchema,
    option_e: z.string().transform(v => v ? transformLatex(v) : undefined).optional().nullable(),
    correct_answer: z.string().min(1, "Correct answer is required"),
    explanation: z.string().transform(v => v ? transformLatex(v) : undefined).nullable().optional(),
    weight: z.coerce.number().min(0).default(1),
}))

export type QuestionInput = z.infer<typeof questionSchema>
