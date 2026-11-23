"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface RegularClassFormProps {
  paymentFile?: File | null
  paymentPreview?: string | null
  onPaymentChange?: (file: File | null, preview: string | null) => void
  onSubmit?: (e: React.FormEvent) => void
  isLoading?: boolean
}

export interface RegularClassFormState {
  name: string
  whatsapp: string
  isPkuStudent: "Iya" | "Bukan"
  subject: string
  location: "Offline" | "Online"
  groupMembers?: string
  peopleCount: number
  weeks: number
}

const PKU_COURSES = [
  "Fisika Dasar 1",
  "Fisika Dasar 2",
  "Statistika dan Analisis Data",
  "Fisika ST",
  "Matematika 1",
]

const NON_PKU_COURSES = [
  "Mekanika Newton",
  "Elektrostatika",
  "Gelombang",
  "Fisika Matematik Lanjut",
  "Termodinamika",
  "Fisika Komputasi",
]

export function RegularClassForm(_props: RegularClassFormProps) {
  void _props
  // Left Column States
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isPkuStudent, setIsPkuStudent] = useState<"Iya" | "Bukan">("Iya")
  const [selectedCourse, setSelectedCourse] = useState(PKU_COURSES[0])
  const [location, setLocation] = useState<"Offline" | "Online">("Offline")
  const [groupMembers, setGroupMembers] = useState("")

  // Right Column States (Calculator Steppers)
  const [peopleCount, setPeopleCount] = useState<number>(1)
  const [weekCount, setWeekCount] = useState<number>(1)

  const getTierLabel = (count: number): string => {
    if (count === 1) return "1 Orang (Privat)"
    if (count >= 2 && count <= 4) return "2-4 Orang"
    if (count >= 5 && count <= 6) return "5-6 Orang"
    if (count >= 7 && count <= 8) return "7-8 Orang"
    if (count >= 9 && count <= 12) return "9-12 Orang"
    return "> 12 Orang"
  }

  const pricing = useMemo(() => {
    const clampedWeeks = Math.max(1, Math.min(7, weekCount))
    return {
      tierLabel: getTierLabel(peopleCount),
      weeks: clampedWeeks,
    }
  }, [peopleCount, weekCount])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info("Pendaftaran Kelas Reguler belum dibuka (Coming Soon).")
  }

  const activeCourseOptions = isPkuStudent === "Iya" ? PKU_COURSES : NON_PKU_COURSES

  return (
    <div className="w-full font-sans">
      <form onSubmit={handleFormSubmit}>
        {/* 2-Column Grid Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ======================================================== */}
          {/* LEFT COLUMN (Form & Conditional Logic) - col-span-7     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#FFEED6] space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#827148] tracking-tight">
                Lengkapi Data Dirimu
              </h2>
              <p className="text-xs sm:text-sm text-[#827148]/70 mt-1 font-medium">
                Isi data diri dan preferensi belajar untuk menjadwalkan kelas regulermu.
              </p>
            </div>

            {/* 1. Full Name */}
            <div>
              <label htmlFor="reg-fullname" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                Nama Lengkap
              </label>
              <input
                id="reg-fullname"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                required
              />
            </div>

            {/* 1b. Email Address */}
            <div>
              <label htmlFor="reg-email" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                Alamat Email Aktif
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                required
              />
            </div>

            {/* 2. WhatsApp Number */}
            <div>
              <label htmlFor="reg-whatsapp" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                Nomor WhatsApp
              </label>
              <input
                id="reg-whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                required
              />
              <p className="text-[11px] text-[#827148]/70 mt-1 font-medium">
                Format: 08xx, 62xx, atau +62xx
              </p>
            </div>

            {/* 3. PKU Status (Radio Group) */}
            <div>
              <label className="text-sm font-semibold text-[#827148] mb-2 block">
                Status Mahasiswa PKU
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPkuStudent("Iya")
                    setSelectedCourse(PKU_COURSES[0])
                  }}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${isPkuStudent === "Iya"
                      ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                      : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${isPkuStudent === "Iya" ? "bg-white" : "bg-[#827148]/30"}`} />
                  <span>Iya (Mahasiswa PKU)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPkuStudent("Bukan")
                    setSelectedCourse(NON_PKU_COURSES[0])
                  }}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${isPkuStudent === "Bukan"
                      ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                      : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${isPkuStudent === "Bukan" ? "bg-white" : "bg-[#827148]/30"}`} />
                  <span>Bukan PKU</span>
                </button>
              </div>
            </div>

            {/* 4. Course Selection (Conditional) */}
            <div>
              <label className="text-sm font-semibold text-[#827148] mb-1.5 block">
                Pilihan Mata Kuliah
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full py-3 px-4 h-auto rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] focus:ring-2 focus:ring-[#A5AF79] shadow-2xs font-medium">
                  <SelectValue placeholder="Pilih mata kuliah" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#FFEED6] rounded-xl shadow-md text-sm text-[#827148]">
                  {activeCourseOptions.map((course) => (
                    <SelectItem
                      key={course}
                      value={course}
                      className="text-sm text-[#827148] hover:bg-[#FFEED6]/40 cursor-pointer font-medium"
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[#827148]/70 mt-1 font-medium">
                Pilihan kurikulum otomatis disesuaikan untuk kategori ({isPkuStudent === "Iya" ? "Tingkat PKU" : "Tingkat Lanjut / Non-PKU"}).
              </p>
            </div>

            {/* 5. Location (Radio Group) */}
            <div>
              <label className="text-sm font-semibold text-[#827148] mb-2 block">
                Metode / Lokasi Belajar
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocation("Offline")}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${location === "Offline"
                      ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                      : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${location === "Offline" ? "bg-white" : "bg-[#827148]/30"}`} />
                  <span>Offline (Tatap Muka)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocation("Online")}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${location === "Online"
                      ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                      : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${location === "Online" ? "bg-white" : "bg-[#827148]/30"}`} />
                  <span>Online (Zoom / GMeet)</span>
                </button>
              </div>
            </div>

            {/* 6. Group Members (Conditional: IF peopleCount > 1) */}
            {peopleCount > 1 && (
              <div className="pt-2">
                <label htmlFor="reg-group-members" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                  Nama Anggota Grup ({peopleCount - 1} Teman Lainnya)
                </label>
                <textarea
                  id="reg-group-members"
                  placeholder="Tuliskan nama lengkap dan kontak/NIM teman satu grupmu (misal: 1. Budi - 0812..., 2. Ani - 0813...)"
                  value={groupMembers}
                  onChange={(e) => setGroupMembers(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs min-h-[90px] resize-none"
                  required={peopleCount > 1}
                />
                <p className="text-[11px] text-[#827148]/70 mt-1 font-medium">
                  Informasi ini digunakan untuk mengundang teman grup ke sesi belajar bersama.
                </p>
              </div>
            )}

            {/* Payment Notice */}
            <div className="pt-2 border-t border-[#FFEED6]">
              <div className="p-4 border-2 border-[#171717] bg-canvas-paper flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">
                  Pendaftaran dan pembayaran Kelas Reguler sedang disiapkan.
                </p>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717] shrink-0">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (Calculator, Summary & Payment) - col-span-5 */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col space-y-6">

            {/* 1. Calculator Inputs (Steppers: [ - ] value [ + ]) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Stepper 1: Jumlah Orang (Min: 1) */}
              <div className="bg-white rounded-2xl border border-[#FFEED6] p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#827148]">
                    Jumlah Orang
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEED6] text-[#827148]">
                    {peopleCount === 1 ? "Privat" : "Grup"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#FFEED6]/30 border border-[#FFEED6] rounded-xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                    disabled={peopleCount <= 1}
                    className="w-9 h-9 rounded-lg bg-white text-[#827148] font-extrabold text-base hover:bg-[#FFEED6] active:scale-95 shadow-2xs flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Kurangi jumlah orang"
                  >
                    –
                  </button>

                  <div className="text-center px-2">
                    <span className="font-extrabold text-base text-[#827148] block leading-tight">
                      {peopleCount}
                    </span>
                    <span className="text-[10px] text-[#827148]/60 font-semibold block">
                      Orang
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPeopleCount(peopleCount + 1)}
                    className="w-9 h-9 rounded-lg bg-[#A5AF79] text-white font-extrabold text-base hover:bg-[#949e6a] active:scale-95 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Tambah jumlah orang"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper 2: Jumlah Minggu (Min: 1, Max: 7) */}
              <div className="bg-white rounded-2xl border border-[#FFEED6] p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#827148]">
                    Jumlah Minggu
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEED6] text-[#827148]">
                    Maks. 7
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#FFEED6]/30 border border-[#FFEED6] rounded-xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekCount(Math.max(1, weekCount - 1))}
                    disabled={weekCount <= 1}
                    className="w-9 h-9 rounded-lg bg-white text-[#827148] font-extrabold text-base hover:bg-[#FFEED6] active:scale-95 shadow-2xs flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Kurangi jumlah minggu"
                  >
                    –
                  </button>

                  <div className="text-center px-2">
                    <span className="font-extrabold text-base text-[#827148] block leading-tight">
                      {weekCount}
                    </span>
                    <span className="text-[10px] text-[#827148]/60 font-semibold block">
                      Minggu
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWeekCount(Math.min(7, weekCount + 1))}
                    disabled={weekCount >= 7}
                    className="w-9 h-9 rounded-lg bg-[#A5AF79] text-white font-extrabold text-base hover:bg-[#949e6a] active:scale-95 shadow-2xs flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Tambah jumlah minggu"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* 2. Summary Card */}
            <div className="bg-white rounded-3xl border border-[#FFEED6] p-6 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-1.5 h-5 bg-[#E8A07C] rounded-full mr-2 inline-block" />
                  <h3 className="text-base font-bold text-[#827148]">
                    Rincian Biaya
                  </h3>
                </div>
                <span className="bg-[#FFEED6] text-[#827148] px-3 py-1 rounded-full text-xs font-bold">
                  {pricing.tierLabel}
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3 text-sm text-[#827148]/80 font-medium">
                <div className="flex justify-between items-center">
                  <span>Kategori Kurikulum</span>
                  <span className="font-bold text-[#827148]">
                    {isPkuStudent === "Iya" ? "Mahasiswa PKU" : "Non-PKU"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Harga per orang ({weekCount} minggu)</span>
                  <span className="font-mono font-bold text-[#171717]">
                    Coming Soon
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Jumlah orang</span>
                  <span className="font-bold text-[#827148]">
                    {peopleCount} Orang
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Jumlah minggu</span>
                  <span className="font-bold text-[#827148]">
                    {pricing.weeks} Minggu
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b-2 border-dashed border-[#FFEED6] my-4" />

              {/* Total Section */}
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs text-[#827148]/70 uppercase tracking-wider font-semibold">
                    Total Biaya
                  </p>
                  <p className="text-xs text-[#827148]/60 mt-0.5">
                    {peopleCount > 1 ? `(Untuk ${peopleCount} orang)` : "(Tarif per orang)"}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono text-2xl font-extrabold text-[#171717] tracking-tight">
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-[#827148]/60 leading-relaxed font-medium pt-3 border-t border-[#FFEED6]/60">
                Informasi tarif dan jadwal pembukaan kelas reguler akan segera diumumkan.
              </p>
            </div>

            {/* 3. Payment Notice */}
            <div className="bg-canvas-paper border-2 border-[#171717] p-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-[#171717]">
                  Pembayaran Kelas Reguler
                </h4>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717]">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Informasi rekening pembayaran dan pendaftaran kelas reguler belum tersedia saat ini.
              </p>
            </div>

            {/* 4. Disabled Submit Button */}
            <button
              type="submit"
              disabled
              className="w-full bg-canvas-paper text-ink-muted font-mono font-bold uppercase border-2 border-[#171717] py-4 text-center text-xs sm:text-sm opacity-80 cursor-not-allowed"
            >
              Coming Soon
            </button>

          </div>
        </div>
      </form>
    </div>
  )
}
