"use client"

import React from "react"
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import "katex/dist/katex.min.css"
import { slugify } from "@/components/dashboard/TableOfContents"
import { cn } from "@/lib/utils"
import { Sparkles, Info, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react"

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

function getNodeText(node: any): string {
    if (!node) return ""
    if (typeof node === "string") return node
    if (Array.isArray(node)) return node.map(getNodeText).join("")
    if (node.props && node.props.children) return getNodeText(node.props.children)
    return ""
}

type CalloutType = "NOTE" | "WARNING" | "FORMULA" | "TIP" | "IMPORTANT" | "CAUTION" | "INFO"

interface CalloutConfig {
    title: string
    prefix: string
    icon: React.ComponentType<{ className?: string }>
    headerClass: string
    textClass: string
}

const CALLOUT_CONFIGS: Record<CalloutType, CalloutConfig> = {
    FORMULA: {
        title: "RUMUS & FORMULASI KUNCI",
        prefix: "[!] FORMULA",
        icon: Sparkles,
        headerClass: "bg-accent-canary text-[#171717]",
        textClass: "text-[#171717]",
    },
    NOTE: {
        title: "CATATAN PEMBELAJARAN",
        prefix: "[i] NOTE",
        icon: Info,
        headerClass: "bg-canvas-paper text-[#171717]",
        textClass: "text-[#171717]",
    },
    INFO: {
        title: "INFORMASI TEKNIS",
        prefix: "[i] INFO",
        icon: Info,
        headerClass: "bg-canvas-paper text-[#171717]",
        textClass: "text-[#171717]",
    },
    WARNING: {
        title: "PERINGATAN KONSEP",
        prefix: "[!] WARNING",
        icon: AlertTriangle,
        headerClass: "bg-alert-rust text-white",
        textClass: "text-[#171717]",
    },
    CAUTION: {
        title: "PERHATIAN KHUSUS",
        prefix: "[!] CAUTION",
        icon: AlertTriangle,
        headerClass: "bg-alert-rust text-white",
        textClass: "text-[#171717]",
    },
    TIP: {
        title: "TIPS UJIAN & PRAKTIS",
        prefix: "[*] TIP",
        icon: Lightbulb,
        headerClass: "bg-[#e2e8d8] text-[#171717]",
        textClass: "text-[#171717]",
    },
    IMPORTANT: {
        title: "PENTING DIINGAT",
        prefix: "[#] IMPORTANT",
        icon: AlertCircle,
        headerClass: "bg-[#171717] text-white",
        textClass: "text-[#171717]",
    },
}

function CalloutBox({
    type,
    customTitle,
    children,
}: {
    type: CalloutType
    customTitle?: string
    children: React.ReactNode
}) {
    const config = CALLOUT_CONFIGS[type] || CALLOUT_CONFIGS.NOTE
    const IconComponent = config.icon

    return (
        <div
            className="my-5 border border-[#171717] bg-surface-white technical-shadow-sm overflow-hidden"
            role="alert"
        >
            {/* Rigid Callout Header */}
            <div className={cn("px-3.5 py-1.5 border-b border-[#171717] flex items-center justify-between text-xs font-mono font-bold uppercase", config.headerClass)}>
                <div className="flex items-center gap-2">
                    <IconComponent className="size-3.5 shrink-0" />
                    <span>{config.prefix} // {customTitle || config.title}</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">BBN_EDU</span>
            </div>

            {/* Callout Body */}
            <div className="p-3.5 sm:p-4 text-sm leading-relaxed text-[#171717] space-y-2 [&>p]:my-1.5 [&>.katex-display]:my-2 font-sans">
                {children}
            </div>
        </div>
    )
}

function extractCallout(children: React.ReactNode): {
    isCallout: boolean
    type?: CalloutType
    customTitle?: string
    cleanedChildren?: React.ReactNode
} {
    const childArray = React.Children.toArray(children)
    if (childArray.length === 0) return { isCallout: false }

    const first = childArray[0]

    // Case 1: Plain string first child
    if (typeof first === "string") {
        const match = first.match(/^\[!([A-Za-z]+)\](?:\s*([^\n\r]*))?[\r\n]*([\s\S]*)$/)
        if (match) {
            const rawType = match[1].toUpperCase() as CalloutType
            if (CALLOUT_CONFIGS[rawType]) {
                const customTitle = match[2]?.trim() || undefined
                const remaining = match[3]
                const newChildren = [remaining, ...childArray.slice(1)].filter(Boolean)
                return { isCallout: true, type: rawType, customTitle, cleanedChildren: newChildren }
            }
        }
    }

    // Case 2: React element (like <p>) first child
    if (React.isValidElement(first)) {
        const pProps: any = first.props
        const pChildren = React.Children.toArray(pProps?.children)
        if (pChildren.length > 0 && typeof pChildren[0] === "string") {
            const text = pChildren[0]
            const match = text.match(/^\[!([A-Za-z]+)\](?:\s*([^\n\r]*))?[\r\n]*([\s\S]*)$/)
            if (match) {
                const rawType = match[1].toUpperCase() as CalloutType
                if (CALLOUT_CONFIGS[rawType]) {
                    const customTitle = match[2]?.trim() || undefined
                    const remainingFirstText = match[3]

                    const newPChildren = [
                        remainingFirstText,
                        ...pChildren.slice(1),
                    ].filter((c) => c !== "" && c !== null && c !== undefined)

                    const newFirstElement = newPChildren.length > 0
                        ? React.cloneElement(first, {}, ...newPChildren)
                        : null

                    const newChildren = [
                        newFirstElement,
                        ...childArray.slice(1),
                    ].filter(Boolean)

                    return {
                        isCallout: true,
                        type: rawType,
                        customTitle,
                        cleanedChildren: newChildren,
                    }
                }
            }
        }
    }

    return { isCallout: false }
}

/**
 * BBN Education Technical Markdown & Math Renderer.
 * Uses .prose-olive typography styling.
 * Wrap block equations in blueprint containers.
 * Callouts styled as technical annotations.
 */
export default function MarkdownLatex({ children, className }: MarkdownLatexProps) {
    if (!children) return null

    return (
        <div className={cn("prose prose-olive max-w-none text-[#171717]", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={markdownRehypePlugins}
                components={{
                    h1: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h1
                                id={id}
                                className="group relative scroll-mt-24 text-2xl md:text-3xl font-extrabold tracking-tight text-[#171717] mt-8 mb-4 border-b-2 border-[#171717] pb-3 flex items-center justify-between font-sans"
                                {...props}
                            >
                                <span>{children}</span>
                                <a
                                    href={`#${id}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-alert-rust text-sm pl-2 font-mono"
                                    aria-label="Direct link to heading"
                                >
                                    [#]
                                </a>
                            </h1>
                        )
                    },
                    h2: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h2
                                id={id}
                                className="group relative scroll-mt-24 text-xl md:text-2xl font-bold tracking-tight text-[#171717] mt-7 mb-3 border-b border-[#171717] pb-2 flex items-center justify-between font-sans"
                                {...props}
                            >
                                <span>{children}</span>
                                <a
                                    href={`#${id}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-alert-rust text-xs pl-2 font-mono"
                                    aria-label="Direct link to heading"
                                >
                                    [#]
                                </a>
                            </h2>
                        )
                    },
                    h3: ({ children, ...props }) => {
                        const id = slugify(getNodeText(children))
                        return (
                            <h3
                                id={id}
                                className="group relative scroll-mt-24 text-lg md:text-xl font-bold tracking-tight text-[#171717] mt-6 mb-2 flex items-center justify-between font-sans"
                                {...props}
                            >
                                <span>{children}</span>
                                <a
                                    href={`#${id}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-alert-rust text-xs pl-2 font-mono"
                                    aria-label="Direct link to heading"
                                >
                                    [#]
                                </a>
                            </h3>
                        )
                    },
                    p: ({ children, ...props }) => (
                        <p className="leading-relaxed text-[#171717] my-3 text-sm md:text-base font-sans" {...props}>
                            {children}
                        </p>
                    ),
                    ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside space-y-1.5 my-3 text-[#171717] pl-2 text-sm md:text-base marker:text-alert-rust font-sans" {...props}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside space-y-1.5 my-3 text-[#171717] pl-2 text-sm md:text-base marker:text-[#171717] font-sans marker:font-mono marker:font-bold" {...props}>
                            {children}
                        </ol>
                    ),
                    blockquote: ({ children, ...props }) => {
                        const callout = extractCallout(children)
                        if (callout.isCallout && callout.type) {
                            return (
                                <CalloutBox
                                    type={callout.type}
                                    customTitle={callout.customTitle}
                                >
                                    {callout.cleanedChildren}
                                </CalloutBox>
                            )
                        }
                        return (
                            <blockquote
                                className="my-5 border-l-4 border-alert-rust bg-canvas-paper border-y border-r border-[#171717] p-3.5 italic text-[#171717] text-sm md:text-base leading-relaxed"
                                {...props}
                            >
                                {children}
                            </blockquote>
                        )
                    },
                    table: ({ children, ...props }) => (
                        <div className="my-5 w-full overflow-x-auto border border-[#171717] bg-surface-white technical-shadow-sm">
                            <table className="w-full border-collapse text-left text-sm" {...props}>
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children, ...props }) => (
                        <thead className="bg-canvas-paper border-b border-[#171717]" {...props}>
                            {children}
                        </thead>
                    ),
                    th: ({ children, ...props }) => (
                        <th className="px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#171717] border-r border-[#171717] last:border-r-0" {...props}>
                            {children}
                        </th>
                    ),
                    tr: ({ children, ...props }) => (
                        <tr className="border-b border-[#171717]/30 last:border-b-0 hover:bg-canvas-paper/50 transition-colors even:bg-canvas-paper/20" {...props}>
                            {children}
                        </tr>
                    ),
                    td: ({ children, ...props }) => (
                        <td className="px-4 py-2.5 text-[#171717] border-r border-[#171717]/30 last:border-r-0 align-top text-xs sm:text-sm font-sans" {...props}>
                            {children}
                        </td>
                    ),
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            className="font-medium text-[#171717] underline decoration-alert-rust decoration-2 underline-offset-4 hover:bg-accent-canary transition-colors"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                        if (inline) {
                            return (
                                <code
                                    className="bg-canvas-paper px-1.5 py-0.5 font-mono text-xs font-bold text-[#171717] border border-[#171717]"
                                    {...props}
                                >
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <div className="relative my-5 border border-[#171717] bg-[#121212] text-[#f5f4ee] technical-shadow-sm overflow-hidden">
                                <div className="bg-[#171717] border-b border-[#333333] px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-white/80">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 bg-alert-rust" />
                                        <span className="size-2 bg-accent-canary" />
                                        <span className="size-2 bg-emerald-500" />
                                        <span className="ml-1.5 uppercase font-bold text-white tracking-wider">
                                            TERMINAL_OUTPUT // BBN_CODE_EXEC
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-white/40">READ_ONLY</span>
                                </div>
                                <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-[#F5F4EE]">
                                    <code {...props}>{children}</code>
                                </pre>
                            </div>
                        )
                    },
                    hr: () => <hr className="my-8 border-t-2 border-[#171717]" />
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}
