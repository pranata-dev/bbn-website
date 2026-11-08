"use client"

import React from "react"
import { formatTimer } from "@/lib/utils"

interface ExamTimerProps {
  timeLeft: number
  currentIndex: number
  totalQuestions: number
  answeredCount: number
  subject?: string
  tokenId?: string
  isPractice?: boolean
}

export function ExamTimer({
  timeLeft,
  currentIndex,
  totalQuestions,
  answeredCount,
  subject = "FISIKA",
  tokenId = "TO-992-ALPHA",
  isPractice = false,
}: ExamTimerProps) {
  const isCritical = !isPractice && timeLeft > 0 && timeLeft <= 60
  const isWarning = !isPractice && timeLeft > 60 && timeLeft <= 300

  return (
    <div className="w-full sticky top-0 z-50 select-none">
      {/* 1. TOP DOCKED TELEMETRY BAR */}
      <header className="w-full bg-surface-white border-b-2 border-[#171717] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-none">
        {/* Left: Integrity Protocol Status & Token */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-alert-rust px-2.5 py-1">
            <span className="inline-block size-2 bg-alert-rust animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs text-alert-rust font-bold tracking-wider uppercase">
              {isPractice ? "LATIHAN MANDIRI // ACTIVE" : "CBT LOCKDOWN ACTIVE // INTEGRITY PROTOCOL"}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-border-grid pl-3 font-mono text-xs">
            <span className="text-ink-muted">
              TOKEN: <strong className="text-[#171717]">#{tokenId.toUpperCase()}</strong>
            </span>
            <span className="text-border-grid">|</span>
            <span className="text-ink-muted">
              SESI: <strong className="text-[#171717]">{subject.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {/* Center: Clock & Question Counter */}
        <div className="flex items-center gap-3 bg-canvas-paper px-3 py-1 border-2 border-[#171717] technical-shadow-sm">
          {!isPractice && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-muted font-bold uppercase hidden sm:inline">
                  SISA WAKTU:
                </span>
                <span
                  className={`font-mono text-sm sm:text-base font-black tracking-wider px-2.5 py-0.5 border ${
                    isCritical
                      ? "bg-alert-rust text-surface-white border-[#171717] animate-pulse"
                      : isWarning
                      ? "bg-amber-100 text-amber-800 border-amber-600"
                      : "bg-surface-white text-[#171717] border-[#171717]"
                  }`}
                >
                  {formatTimer(timeLeft)}
                </span>
              </div>
              <span className="text-border-grid">|</span>
            </>
          )}

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#171717]">
            <span>SOAL {currentIndex + 1} DARI {totalQuestions}</span>
            <span className="text-ink-muted font-normal text-[11px] hidden md:inline">
              ({answeredCount} DIJAWAB)
            </span>
          </div>
        </div>

        {/* Right: Telemetry Auto-save Sync Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-white border border-[#171717] font-mono text-[10px] font-bold text-green-800">
            <span className="size-2 bg-green-700 inline-block" />
            <span className="hidden sm:inline">TELEMETRY SYNC:</span>
            <span>AUTO-SAVED</span>
          </div>
        </div>
      </header>

      {/* 2. SUB-BAR LOCKDOWN NOTICE */}
      {!isPractice && (
        <div className="w-full bg-[#171717] text-surface-white px-4 py-1 text-center flex items-center justify-between font-mono text-[10px] tracking-tight border-b border-[#171717]">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="text-accent-canary font-bold tracking-widest">[BBN_EDU CBT // PROTOCOL]</span>
            <span className="truncate text-border-grid hidden sm:inline">
              Menekan Esc, berpindah tab, atau devtools akan memicu catatan integritas. Lembar jawaban terenkripsi (AES-256).
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-border-grid">
            <span>HASH: 9F8A-BBN-EDU</span>
            <span className="hidden md:inline">SECURITY: L4 STRICT</span>
          </div>
        </div>
      )}
    </div>
  )
}

