"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

interface MarkdownLatexProps {
    children: string
    className?: string
}

/**
 * Renders content with both Markdown formatting (bold, italic, lists, etc.)
 * and LaTeX math (inline $...$ and block $$...$$).
 */
export default function MarkdownLatex({ children, className }: MarkdownLatexProps) {
    if (!children) return null

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}
