"use client"

import { useState } from "react"
import Link from "next/link"

const ELEARNING_PLANS = [
  {
    name: "1 Bulan",
    price: "Rp 49.000",
    period: "/ bulan",
    isPopular: false,
    features: [
      "Akses penuh ke semua bank soal",
      "Simulasi tryout dengan timer",
      "Pembahasan detail setiap soal",
      "Laporan statistik performa dasar",
    ],
    buttonText: "Pilih Paket 1 Bulan",
  },
  {
    name: "3 Bulan",
    price: "Rp 129.000",
    period: "/ 3 bulan",
    isPopular: true,
    features: [
      "Semua fitur Paket 1 Bulan",
      "Akses tryout berkala tanpa batas",
      "Analisis mendalam kelemahan topik",
      "Konsultasi grup via komunitas",
    ],
    buttonText: "Pilih Paket 3 Bulan",
  },
  {
    name: "1 Semester",
    price: "Rp 229.000",
    period: "/ 6 bulan",
    isPopular: false,
    features: [
      "Akses seluruh materi Fisika Dasar",
      "Bank soal komprehensif UTS & UAS",
      "Prioritas update bank soal terbaru",
      "Sertifikat pencapaian tryout",
    ],
    buttonText: "Pilih Paket 1 Semester",
  },
]

const OFFLINE_PLANS = [
  {
    name: "1 Pertemuan",
    price: "Rp 55.000",
    period: "/ sesi (1.5 jam)",
    isPopular: false,
    features: [
      "1 sesi bimbingan tatap muka",
      "Fokus pada 1 bab materi spesifik",
      "Bedah soal & latihan intensif",
      "Modul rangkuman materi cetak",
    ],
    buttonText: "Pilih 1 Pertemuan",
  },
  {
    name: "4 Pertemuan",
    price: "Rp 205.000",
    period: "/ 4 sesi bimbingan",
    isPopular: true,
    features: [
      "4 sesi bimbingan tatap muka",
      "Pendampingan persiapan UTS/UAS",
      "Latihan soal berbobot tinggi",
      "Konsultasi tanya soal via WhatsApp",
    ],
    buttonText: "Pilih 4 Pertemuan",
  },
  {
    name: "8 Pertemuan",
    price: "Rp 380.000",
    period: "/ paket intensif",
    isPopular: false,
    features: [
      "8 sesi bimbingan tatap muka",
      "Kurikulum lengkap dari awal bab",
      "Simulasi ujian privat 1-on-1",
      "Evaluasi & target nilai personal",
    ],
    buttonText: "Pilih 8 Pertemuan",
  },
]

export function PricingSection() {
  const [planType, setPlanType] = useState<"elearning" | "offline">("elearning")
  const currentPlans = planType === "elearning" ? ELEARNING_PLANS : OFFLINE_PLANS

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

        {/* 3-Column Pricing Cards Layout on Desktop, 1-Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {currentPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-md ${
                plan.isPopular
                  ? "border-2 border-[#E8A07C] relative md:-translate-y-2 shadow-lg"
                  : "border border-[#FFEED6] hover:shadow-lg"
              }`}
            >
              {/* Highlight Badge for Middle/Popular Card */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8A07C] text-white text-xs font-bold px-4 py-1 rounded-full shadow-xs tracking-wider uppercase">
                  Populer
                </div>
              )}

              <div>
                {/* Package Name */}
                <h3 className="text-lg sm:text-xl font-bold text-[#827148] mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs sm:text-sm text-[#827148]/70 font-medium">
                    {plan.period}
                  </span>
                </div>

                {/* Thin Horizontal Divider */}
                <div className="h-[1px] w-full bg-[#FFEED6] my-6" />

                {/* Features List */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-xs sm:text-sm text-[#827148]/90">
                      {/* Empty circular placeholder instead of checkmark icon */}
                      <span className="w-4 h-4 rounded-full bg-[#A5AF79] shrink-0 inline-block mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                href="/register"
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-center block shadow-xs transition-colors cursor-pointer ${
                  plan.isPopular
                    ? "bg-[#E8A07C] hover:bg-[#d8916e] text-white"
                    : "bg-[#A5AF79] hover:bg-[#949e6a] text-white"
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
