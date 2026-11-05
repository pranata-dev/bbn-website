"use client"

import { useState } from "react"
import Link from "next/link"
import { SUBSCRIPTION_PLANS, OFFLINE_TUTORING_PLANS, type SubscriptionPlanCode } from "@/config/plans"
import { BUSINESS_CONFIG } from "@/config/business"

const ELEARNING_CODES: SubscriptionPlanCode[] = ["FREE", "MONTHLY", "SEMESTER"]

export function PricingSection() {
  const [planType, setPlanType] = useState<"elearning" | "offline">("elearning")

  return (
    <section id="harga" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-[#FFEED6]/40">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#827148]/80 mb-2">
            Pilihan Paket & Biaya
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
            Investasi Kecil, Hasil Maksimal
          </h2>
          <p className="text-sm sm:text-base text-[#827148]/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Pilih paket yang sesuai dengan kebutuhan dan ritme belajarmu. Tingkatkan performa ujian sekarang juga.
          </p>
        </div>

        {/* Centered Toggle Switch */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="bg-[#FFEED6] p-1.5 rounded-full inline-flex border border-[#827148]/20 shadow-xs">
            <button
              type="button"
              onClick={() => setPlanType("elearning")}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                planType === "elearning"
                  ? "bg-[#A5AF79] text-white shadow-xs"
                  : "text-[#827148] hover:text-[#827148]/70"
              }`}
            >
              Paket E-Learning
            </button>
            <button
              type="button"
              onClick={() => setPlanType("offline")}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                planType === "offline"
                  ? "bg-[#A5AF79] text-white shadow-xs"
                  : "text-[#827148] hover:text-[#827148]/70"
              }`}
            >
              Paket Tutoring Offline
            </button>
          </div>
        </div>

        {/* E-Learning Cards */}
        {planType === "elearning" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {ELEARNING_CODES.map((code) => {
              const plan = SUBSCRIPTION_PLANS[code]
              const isPopular = !!plan.isPopular
              const formattedPrice = plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`
              const periodLabel = plan.durationDays === 0 ? "/ selamanya" : `/ ${plan.durationDays} hari`

              return (
                <div
                  key={plan.code}
                  className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-md ${
                    isPopular
                      ? "border-2 border-[#E8A07C] relative md:-translate-y-2 shadow-lg"
                      : "border border-[#FFEED6] hover:shadow-lg"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8A07C] text-white text-xs font-bold px-4 py-1 rounded-full shadow-xs tracking-wider uppercase">
                      Paling Populer
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#827148] mb-2">
                      {plan.label}
                    </h3>

                    {/* Price with optional strikethrough */}
                    <div className="my-3">
                      {plan.originalPrice && plan.originalPrice > plan.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-[#827148]/50 line-through">
                            Rp {plan.originalPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] font-bold bg-[#E8A07C] text-white px-2 py-0.5 rounded-md">
                            Hemat {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
                          {formattedPrice}
                        </span>
                        <span className="text-xs sm:text-sm text-[#827148]/70 font-medium">
                          {periodLabel}
                        </span>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#FFEED6] my-6" />

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center text-xs sm:text-sm text-[#827148]/90">
                          <span className="w-4 h-4 rounded-full bg-[#A5AF79] shrink-0 inline-block mr-3" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/register?plan=${plan.code.toLowerCase()}`}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-center block shadow-xs transition-colors cursor-pointer ${
                      isPopular
                        ? "bg-[#E8A07C] hover:bg-[#d8916e] text-white"
                        : "bg-[#A5AF79] hover:bg-[#949e6a] text-white"
                    }`}
                  >
                    {plan.price === 0 ? "Mulai Belajar Gratis" : `Pilih ${plan.label}`}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Offline Tutoring Cards */}
        {planType === "offline" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {OFFLINE_TUTORING_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-md ${
                  plan.isPopular
                    ? "border-2 border-[#E8A07C] relative md:-translate-y-2 shadow-lg"
                    : "border border-[#FFEED6] hover:shadow-lg"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8A07C] text-white text-xs font-bold px-4 py-1 rounded-full shadow-xs tracking-wider uppercase">
                    Pilihan Favorit
                  </div>
                )}

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#827148] mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs sm:text-sm text-[#827148]/70 font-medium">
                      {plan.period}
                    </span>
                  </div>

                  <div className="h-[1px] w-full bg-[#FFEED6] my-6" />

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center text-xs sm:text-sm text-[#827148]/90">
                        <span className="w-4 h-4 rounded-full bg-[#A5AF79] shrink-0 inline-block mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp}?text=${encodeURIComponent(plan.waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-center block shadow-xs transition-colors cursor-pointer ${
                    plan.isPopular
                      ? "bg-[#E8A07C] hover:bg-[#d8916e] text-white"
                      : "bg-[#A5AF79] hover:bg-[#949e6a] text-white"
                  }`}
                >
                  Konsultasi via WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
