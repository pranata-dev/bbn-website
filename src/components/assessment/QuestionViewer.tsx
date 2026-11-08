"use client"

import React from "react"
import MarkdownLatex from "@/components/ui/markdown-latex"

export interface QuestionOption {
  key: string
  text: string
}

interface QuestionViewerProps {
  questionNumber: number
  questionText: string
  imageUrl?: string | null
  category?: string | null
  weight?: number
  options: QuestionOption[]
  selectedAnswer: string | null
  onSelectAnswer: (key: string) => void
  isShortAnswer?: boolean
  shortAnswerValue?: string
  onShortAnswerChange?: (val: string) => void
}

export function QuestionViewer({
  questionNumber,
  questionText,
  imageUrl,
  category,
  weight = 1,
  options,
  selectedAnswer,
  onSelectAnswer,
  isShortAnswer = false,
  shortAnswerValue = "",
  onShortAnswerChange,
}: QuestionViewerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT / MAIN COLUMN: Question Formulation & Diagram */}
      <section className="lg:col-span-7 bg-surface-white border-2 border-[#171717] technical-shadow p-5 sm:p-7 relative tick-corner">
        {/* Header Question Spec Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#171717] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="bg-[#171717] text-accent-canary font-mono text-xs px-2.5 py-1 tracking-wider font-bold">
              NO. {String(questionNumber).padStart(2, "0")}
            </span>
            <span className="bg-canvas-paper border border-[#171717] font-mono text-[10px] sm:text-xs px-2 py-0.5 font-bold text-alert-rust uppercase">
              BOBOT: {weight} [IRT_WEIGHT]
            </span>
          </div>
          {category && (
            <div className="font-mono text-[11px] text-ink-muted">
              TOPIK: <span className="font-bold text-[#171717] uppercase">{category}</span>
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <div className="prose-olive font-sans text-sm sm:text-base font-normal text-[#171717] leading-relaxed select-text">
            <MarkdownLatex>{questionText}</MarkdownLatex>
          </div>

          {/* Diagram Schematic Vector/Raster Image */}
          {imageUrl && (
            <div className="mt-5 border-2 border-[#171717] bg-canvas-paper bg-grid-blueprint p-3 sm:p-4 text-center relative tick-corner">
              <div className="flex items-center justify-between border-b border-border-grid pb-2 mb-3 font-mono text-[10px] text-ink-muted uppercase">
                <span>SKEMA SISTEM // ILUSTRASI SOAL</span>
                <span>FIG-{String(questionNumber).padStart(2, "0")}</span>
              </div>
              <img
                src={imageUrl}
                alt={`Ilustrasi Soal No ${questionNumber}`}
                className="max-h-80 mx-auto object-contain border border-[#171717] bg-surface-white"
              />
            </div>
          )}
        </div>

        {/* Cryptographic Hash Watermark */}
        <div className="pt-4 mt-6 border-t border-border-grid flex items-center justify-between text-ink-muted font-mono text-[10px]">
          <span>SECURITY ENCRYPTED // BBN_EDU_CORE</span>
          <span>ITEM_ID: #Q_{String(questionNumber).padStart(3, "0")}</span>
        </div>
      </section>

      {/* RIGHT COLUMN: Answer Options / Interactive Input */}
      <section className="lg:col-span-5 bg-surface-white border-2 border-[#171717] technical-shadow p-5 sm:p-6 relative tick-corner">
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
            <span className="size-2 bg-accent-canary border border-[#171717]" />
            PILIHAN JAWABAN:
          </h2>
          <span className="font-mono text-[10px] font-bold text-ink-muted">
            {isShortAnswer ? "JAWABAN SINGKAT" : "PILIH SATU OPSI"}
          </span>
        </div>

        {isShortAnswer ? (
          <div className="space-y-3">
            <label className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider block">
              INPUT NILAI / EKSPRESI:
            </label>
            <textarea
              value={shortAnswerValue}
              onChange={(e) => onShortAnswerChange?.(e.target.value)}
              placeholder="Tuliskan jawaban atau formula komputasi Anda di sini..."
              rows={5}
              className="w-full p-3.5 border-2 border-[#171717] bg-canvas-paper font-mono text-sm font-bold text-[#171717] focus:ring-0 focus:outline-none focus:bg-surface-white rounded-none resize-none"
            />
            <p className="font-mono text-[10px] text-ink-muted">
              Jawaban tersimpan otomatis secara real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((opt) => {
              const isSelected = selectedAnswer === opt.key

              return (
                <div
                  key={opt.key}
                  onClick={() => onSelectAnswer(opt.key)}
                  className={`group flex items-start gap-3.5 p-3.5 border-2 cursor-pointer transition-all relative ${
                    isSelected
                      ? "bg-accent-canary border-[#171717] technical-shadow"
                      : "bg-surface-white border-[#171717] hover:bg-canvas-paper"
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onSelectAnswer(opt.key)
                    }
                  }}
                >
                  {/* Option Letter Indicator */}
                  <div
                    className={`size-7 shrink-0 flex items-center justify-center font-mono text-xs font-black border transition-colors ${
                      isSelected
                        ? "bg-[#171717] text-accent-canary border-[#171717]"
                        : "bg-canvas-paper text-[#171717] border-[#171717] group-hover:bg-[#171717] group-hover:text-surface-white"
                    }`}
                  >
                    {opt.key}
                  </div>

                  {/* Option Content with LaTeX */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-ink-muted uppercase">
                        OPSI // {opt.key}
                      </span>
                      {isSelected && (
                        <span className="bg-[#171717] text-surface-white font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                          TERPILIH
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-xs sm:text-sm text-[#171717] font-medium leading-relaxed">
                      <MarkdownLatex>{opt.text}</MarkdownLatex>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

