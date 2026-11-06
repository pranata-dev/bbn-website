"use client"

import React from "react"
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import "katex/dist/katex.min.css"

type PluggableList = NonNullable<ReactMarkdownOptions["rehypePlugins"]>

/**
 * Sanitization schema: GitHub-style defaults, extended so the math nodes that
 * `remark-math` v6 emits (`<code class="language-math math-inline|math-display">`)
 * survive until `rehype-katex` renders them.
 */
export const markdownSanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [
            ...(defaultSchema.attributes?.code || []),
            ["className", /^language-./, "math-inline", "math-display"],
        ],
    },
}

/**
 * ORDER MATTERS: sanitize runs BEFORE KaTeX, so any raw HTML / script / event-handler
 * injection is stripped from author content, while KaTeX's own generated markup
 * (spans, classes, inline styles, MathML) is produced afterwards and left intact.
 */
export const markdownRehypePlugins: PluggableList = [
    [rehypeSanitize, markdownSanitizeSchema],
    rehypeKatex,
]

interface MarkdownLatexProps {
    children: string
    className?: string
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
}

function getNodeText(node: any): string {
    if (!node) return ""
    if (typeof node === "string") return node
    if (Array.isArray(node)) return node.map(getNodeText).join("")
    if (node.props && node.props.children) return getNodeText(node.props.children)
    return ""
}

/**
 * Renders content with Markdown formatting (tables, lists, blockquotes),
 * LaTeX equations (inline $...$ and block $$...$$), and anchor IDs for TOC.
 */
export default function MarkdownLatex({ children, className }: MarkdownLatexProps) {
    if (!children) return null

    return (
        <div className={`prose dark:prose-invert max-w-none ${className || ""}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={markdownRehypePlugins}
                components={{
                    h1: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h1 id={id} className="scroll-mt-20 font-bold text-2xl tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2" {...props}>
                                {children}
                            </h1>
                        )
                    },
                    h2: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h2 id={id} className="scroll-mt-20 font-bold text-xl tracking-tight text-foreground mt-7 mb-3" {...props}>
                                {children}
                            </h2>
                        )
                    },
                    h3: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h3 id={id} className="scroll-mt-20 font-semibold text-lg text-foreground mt-6 mb-2" {...props}>
                                {children}
                            </h3>
                        )
                    },
                    p: ({ children, ...props }) => (
                        <p className="leading-relaxed text-foreground/90 my-3 text-sm md:text-base" {...props}>
                            {children}
                        </p>
                    ),
                    ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside space-y-1 my-3 text-foreground/90 pl-2 text-sm md:text-base" {...props}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside space-y-1 my-3 text-foreground/90 pl-2 text-sm md:text-base" {...props}>
                            {children}
                        </ol>
                    ),
                    blockquote: ({ children, ...props }) => (
                        <blockquote className="border-l-4 border-olive/50 bg-olive/5 px-4 py-2.5 rounded-r-lg my-4 italic text-foreground/80 text-sm md:text-base" {...props}>
                            {children}
                        </blockquote>
                    ),
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto my-5 rounded-lg border border-border">
                            <table className="w-full text-left text-sm" {...props}>
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children, ...props }) => (
                        <th className="border-b border-border bg-muted/50 px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wider" {...props}>
                            {children}
                        </th>
                    ),
                    td: ({ children, ...props }) => (
                        <td className="border-b border-border/50 px-4 py-2.5 text-foreground/90" {...props}>
                            {children}
                        </td>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                        if (inline) {
                            return (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-medium text-foreground" {...props}>
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <pre className="bg-muted/80 border border-border p-4 rounded-xl overflow-x-auto my-4 text-xs font-mono">
                                <code {...props}>{children}</code>
                            </pre>
                        )
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}
