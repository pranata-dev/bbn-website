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
    <footer className="w-full bg-surface-white border-t-2 border-[#171717] sticky bottom-0 z-40 select-none">
      {/* 1. TOP STRIP: SYSTEM MATRIX & LEGEND */}
      <div className="bg-canvas-paper border-b border-border-grid px-4 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Legend Summary */}
          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 flex-wrap">
            <span className="font-bold text-[#171717] uppercase">MATRIKS SOAL:</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-green-700 border border-[#171717] inline-block" />
              <span className="text-ink-muted">Terjawab: <strong className="text-[#171717]">{answeredCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-accent-canary border border-[#171717] inline-block" />
              <span className="text-ink-muted">Ragu-ragu: <strong className="text-[#171717]">{doubtfulCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 bg-surface-white border border-[#171717] inline-block" />
              <span className="text-ink-muted">Belum: <strong className="text-[#171717]">{unansweredCount}</strong></span>
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
                  className={`size-7 sm:size-8 shrink-0 font-mono text-xs font-bold transition-all flex items-center justify-center ${
                    isActive
                      ? "border-2 border-alert-rust bg-accent-canary text-[#171717] scale-110 font-black z-10 technical-shadow-sm"
                      : isFlagged
                      ? "bg-accent-canary text-[#171717] border-2 border-[#171717]"
                      : isAnswered
                      ? "bg-green-700 text-surface-white border border-[#171717]"
                      : "bg-surface-white text-ink-muted border border-border-grid hover:border-[#171717] hover:text-[#171717]"
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
            className="px-4 py-2.5 bg-surface-white border-2 border-[#171717] hover:bg-canvas-paper text-[#171717] font-mono text-xs font-bold flex items-center gap-2 technical-shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                ? "bg-accent-canary border-[#171717] text-[#171717] technical-shadow-sm"
                : "bg-canvas-paper border-[#171717] text-ink-muted hover:text-[#171717] hover:bg-[#FEF3C7]"
            }`}
          >
            <span
              className={`size-3.5 border border-[#171717] flex items-center justify-center ${
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
              className="px-5 py-2.5 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
              type="button"
            >
              <span>SIMPAN &amp; LANJUT</span>
              <span>&rarr;</span>
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#171717] hover:bg-alert-rust text-surface-white border-2 border-[#171717] technical-shadow font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
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

