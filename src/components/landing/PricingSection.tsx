"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { SUBSCRIPTION_PLANS, OFFLINE_TUTORING_PLANS, type SubscriptionPlanCode } from "@/config/plans"

const ELEARNING_CODES: SubscriptionPlanCode[] = ["FREE", "MONTHLY", "SEMESTER"]

export function PricingSection() {
  const [planType, setPlanType] = useState<"elearning" | "offline">("elearning")

  return (
    <section id="harga" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper border-b border-[#171717]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header: Sharp, left-aligned layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-5 border-b border-[#171717] gap-4">
          <div>
            <div className="font-mono text-xs text-alert-rust font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-2">
              <span className="size-2 bg-alert-rust rounded-none" />
              <span>[SYS.06] // SUBSCRIPTION_TIERS</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
              Pilihan Paket Belajar
            </h2>
            <p className="font-sans text-sm sm:text-base text-ink-muted mt-2.5 max-w-2xl leading-relaxed">
              Mulai dari paket gratis terlebih dahulu. Informasi biaya paket berbayar akan segera diumumkan.
            </p>
          </div>

          {/* Mechanical Segmented Switch */}
          <div className="inline-flex border border-[#171717] bg-surface-white technical-shadow-sm p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setPlanType("elearning")}
              className={`px-4 py-2 font-bold uppercase transition-colors cursor-pointer ${
                planType === "elearning"
                  ? "bg-[#171717] text-surface-white"
                  : "text-[#171717] hover:bg-canvas-paper"
              }`}
            >
              Paket E-Learning
            </button>
            <button
              type="button"
              onClick={() => setPlanType("offline")}
              className={`px-4 py-2 font-bold uppercase transition-colors cursor-pointer ${
                planType === "offline"
                  ? "bg-[#171717] text-surface-white"
                  : "text-[#171717] hover:bg-canvas-paper"
              }`}
            >
              Tutoring Offline
            </button>
          </div>
        </div>

        {/* E-Learning Cards */}
        {planType === "elearning" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {ELEARNING_CODES.map((code) => {
              const plan = SUBSCRIPTION_PLANS[code]
              const isPopular = !!plan.isPopular
              const isFree = plan.code === "FREE"
              const displayPrice = isFree ? "Gratis" : "Coming Soon"
              const periodLabel = isFree ? "/ selamanya" : ""

              return (
                <div
                  key={plan.code}
                  className={`border-2 border-[#171717] p-6 sm:p-8 flex flex-col justify-between transition-all duration-150 relative ${
                    isPopular
                      ? "bg-accent-canary technical-shadow md:-translate-y-2"
                      : "bg-surface-white technical-shadow hover:-translate-y-1"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 right-6 bg-[#171717] text-accent-canary font-mono text-[10px] font-bold px-3 py-1 border border-[#171717] uppercase tracking-wider shadow-[2px_2px_0px_#FFFFFF]">
                      [REKOMENDASI DASAR]
                    </div>
                  )}

                  <div>
                    {/* Card Header Spec */}
                    <div className="flex items-center justify-between border-b border-[#171717] pb-3 mb-4">
                      <span className="font-mono text-xs font-bold text-[#171717]">
                        TIER // {plan.code}
                      </span>
                      <span className="size-2 bg-alert-rust rounded-none" />
                    </div>

                    <h3 className="font-sans text-2xl font-bold text-[#171717] mb-2 leading-tight">
                      {plan.label}
                    </h3>

                    {/* Price Display */}
                    <div className="my-4">
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
                          {displayPrice}
                        </span>
                        {periodLabel && (
                          <span className="text-xs text-ink-muted font-medium">
                            {periodLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#171717] my-5" />

                    {/* Feature Checklist */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#171717]">
                          <span className="size-4 shrink-0 bg-[#171717] text-surface-white flex items-center justify-center mt-0.5">
                            <Check className="size-3 text-accent-canary" />
                          </span>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  {isFree ? (
                    <Link
                      href="/register?plan=free"
                      className="w-full py-3.5 px-4 bg-[#171717] hover:bg-[#171717]/90 text-surface-white font-mono font-bold text-xs uppercase text-center block border border-[#171717] shadow-[2px_2px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                    >
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <span>Mulai Belajar Gratis</span>
                        <ArrowRight className="size-3.5 text-accent-canary" />
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 bg-[#171717]/75 text-surface-white font-mono font-bold text-xs uppercase text-center block border border-[#171717] opacity-80 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Offline Tutoring Cards */}
        {planType === "offline" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {OFFLINE_TUTORING_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`border-2 border-[#171717] p-6 sm:p-8 flex flex-col justify-between transition-all duration-150 relative ${
                  plan.isPopular
                    ? "bg-accent-canary technical-shadow md:-translate-y-2"
                    : "bg-surface-white technical-shadow hover:-translate-y-1"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 right-6 bg-[#171717] text-accent-canary font-mono text-[10px] font-bold px-3 py-1 border border-[#171717] uppercase tracking-wider shadow-[2px_2px_0px_#FFFFFF]">
                    [PILIHAN FAVORIT]
                  </div>
                )}

                <div>
                  {/* Card Header Spec */}
                  <div className="flex items-center justify-between border-b border-[#171717] pb-3 mb-4">
                    <span className="font-mono text-xs font-bold text-[#171717]">
                      OFFLINE // 0{idx + 1}
                    </span>
                    <span className="size-2 bg-alert-rust rounded-none" />
                  </div>

                  <h3 className="font-sans text-2xl font-bold text-[#171717] mb-2 leading-tight">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 my-4 font-mono">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
                      Coming Soon
                    </span>
                  </div>

                  <div className="h-px w-full bg-[#171717] my-5" />

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#171717]">
                        <span className="size-4 shrink-0 bg-[#171717] text-surface-white flex items-center justify-center mt-0.5">
                          <Check className="size-3 text-accent-canary" />
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disabled Coming Soon CTA */}
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 bg-[#171717]/75 text-surface-white font-mono font-bold text-xs uppercase text-center block border border-[#171717] opacity-80 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
