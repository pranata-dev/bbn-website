"use client"

import React from "react"

interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<string, { answer: string | null; isDoubtful: boolean }>
  questions: Array<{ id: string }>
  onSelectQuestion: (index: number) => void
  isDoubtful: boolean
  onToggleDoubtful: () => void
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isFirst: boolean
  isLast: boolean
  submitting?: boolean
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  questions,
  onSelectQuestion,
  isDoubtful,
  onToggleDoubtful,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  submitting = false,
}: QuestionNavigatorProps) {
  const answeredCount = Object.values(answers).filter((a) => a?.answer !== null).length
  const doubtfulCount = Object.values(answers).filter((a) => a?.isDoubtful).length
  const unansweredCount = totalQuestions - answeredCount

  return (
    <footer className="w-full bg-surface-white border-t-2 border-[#171717] dark:border-[#3F3F46] sticky bottom-0 z-40 select-none">
      {/* 1. TOP STRIP: SYSTEM MATRIX & LEGEND */}
      <div className="bg-canvas-paper border-b border-border-grid px-4 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Legend Summary */}
          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 flex-wrap">
            <span className="font-bold text-[#171717] dark:text-[#F5F4EE] uppercase">MATRIKS SOAL:</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-green-700 dark:bg-emerald-500 border border-[#171717] dark:border-[#3F3F46] inline-block" />
              <span className="text-ink-muted">Terjawab: <strong className="text-[#171717] dark:text-[#F5F4EE]">{answeredCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-accent-canary border border-[#171717] inline-block" />
              <span className="text-ink-muted">Ragu-ragu: <strong className="text-[#171717] dark:text-[#F5F4EE]">{doubtfulCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-surface-white border border-[#171717] dark:border-[#3F3F46] inline-block" />
              <span className="text-ink-muted">Belum: <strong className="text-[#171717] dark:text-[#F5F4EE]">{unansweredCount}</strong></span>
            </div>
          </div>

          {/* Matrix Mini Buttons (Scrollable horizontally) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 custom-scrollbar">
            {questions.map((q, idx) => {
              const state = answers[q.id]
              const isAnswered = state?.answer !== null && state?.answer !== undefined
              const isFlagged = Boolean(state?.isDoubtful)
              const isActive = idx === currentIndex

              return (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(idx)}
                  className={`size-7 sm:size-8 shrink-0 font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? "border-2 border-alert-rust bg-accent-canary text-[#171717] scale-110 font-black z-10 technical-shadow-sm"
                      : isFlagged
                      ? "bg-accent-canary text-[#171717] border-2 border-[#171717] dark:border-[#FDE047]"
                      : isAnswered
                      ? "bg-green-700 dark:bg-emerald-600 text-white border border-[#171717] dark:border-emerald-400"
                      : "bg-surface-white dark:bg-[#22252E] text-ink-muted border border-border-grid dark:border-[#3F3F46] hover:border-[#171717] dark:hover:border-[#FDE047] hover:text-[#171717] dark:hover:text-[#F5F4EE]"
                  }`}
                  title={`Ke Soal No. ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM MAIN ACTION BAR */}
      <div className="max-w-[1720px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Previous Question Button */}
        <div>
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="px-4 py-2.5 bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] hover:bg-canvas-paper dark:hover:bg-[#22252E] dark:hover:border-[#FDE047] text-[#171717] dark:text-[#F5F4EE] font-mono text-xs font-bold flex items-center gap-2 technical-shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            type="button"
          >
            <span>&larr;</span>
            <span>SOAL SEBELUMNYA</span>
          </button>
        </div>

        {/* Center: Ragu-ragu (Flagged) Checkbox / Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDoubtful}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 border-2 transition-all font-mono text-xs font-bold uppercase cursor-pointer ${
              isDoubtful
                ? "bg-accent-canary border-[#171717] dark:border-[#FDE047] text-[#171717] technical-shadow-sm"
                : "bg-canvas-paper border-[#171717] dark:border-[#3F3F46] text-ink-muted hover:text-[#171717] dark:hover:text-[#171717] hover:bg-[#FEF3C7] dark:hover:bg-accent-canary"
            }`}
          >
            <span
              className={`size-3.5 border border-[#171717] dark:border-[#3F3F46] flex items-center justify-center ${
                isDoubtful ? "bg-[#171717] text-accent-canary" : "bg-surface-white"
              }`}
            >
              {isDoubtful && "✓"}
            </span>
            <span>TANDAI RAGU-RAGU (NO. {currentIndex + 1})</span>
          </button>
        </div>

        {/* Next & Submit Exam Buttons */}
        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              onClick={onNext}
              className="px-5 py-2.5 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] dark:border-[#FDE047] technical-shadow font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              type="button"
            >
              <span>SIMPAN &amp; LANJUT</span>
              <span>&rarr;</span>
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#171717] dark:bg-alert-rust hover:bg-alert-rust dark:hover:bg-[#c8561c] text-white border-2 border-[#171717] dark:border-[#FDE047] technical-shadow font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            type="button"
            title="Kumpulkan dan Akhiri Ujian"
          >
            <span>KUMPULKAN UJIAN</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </footer>
  )
}

