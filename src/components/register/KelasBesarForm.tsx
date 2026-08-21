"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentUpload } from "./PaymentUpload"
import { GoPayInfo } from "./GoPayInfo"

export interface KelasBesarFormState {
  name: string
  email: string
  password: string
  nim: string
  subject: string
  whatsapp: string
}

interface KelasBesarFormProps {
  formData: KelasBesarFormState
  onChange: (data: KelasBesarFormState) => void
  paymentFile: File | null
  paymentPreview: string | null
  onPaymentChange: (file: File | null, preview: string | null) => void
}

const KELAS_BESAR_SUBJECTS = [
  { value: "FISMAT", label: "Fisika-Matematika: Minggu, 5 April 2026 pukul 19:00 - Selesai" },
  { value: "FISDAS2", label: "Fisika Dasar 2: Senin, 6 April 2026 pukul 19:00 - Selesai" },
]

export function KelasBesarForm({
  formData,
  onChange,
  paymentFile,
  paymentPreview,
  onPaymentChange,
}: KelasBesarFormProps) {
  const update = (field: keyof KelasBesarFormState, value: string) => {
    onChange({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-5 font-sans">
      {/* Name */}
      <div>
        <label htmlFor="kb-name" className="text-sm font-semibold text-[#827148] mb-1.5 block">
          Nama Lengkap
        </label>
        <input
          id="kb-name"
          placeholder="Masukkan nama lengkap"
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="kb-email" className="text-sm font-semibold text-[#827148] mb-1.5 block">
          Email
        </label>
        <input
          id="kb-email"
          type="email"
          placeholder="Masukkan alamat email"
          value={formData.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="kb-password" className="text-sm font-semibold text-[#827148] mb-1.5 block">
          Password Baru
        </label>
        <input
          id="kb-password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={formData.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
          required
          minLength={6}
        />
      </div>

      {/* NIM */}
      <div>
        <label htmlFor="kb-nim" className="text-sm font-semibold text-[#827148] mb-1.5 block">
          NIM
        </label>
        <input
          id="kb-nim"
          placeholder="Masukkan NIM"
          value={formData.nim}
          onChange={(e) => update("nim", e.target.value)}
          className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
          required
        />
      </div>

      {/* Subject */}
      <div>
        <label className="text-sm font-semibold text-[#827148] mb-1.5 block">
          Mata Kuliah & Jadwal
        </label>
        <Select
          value={formData.subject}
          onValueChange={(v) => update("subject", v)}
        >
          <SelectTrigger className="w-full py-3 px-4 h-auto rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] focus:ring-2 focus:ring-[#A5AF79] shadow-2xs">
            <SelectValue placeholder="Pilih mata kuliah dan jadwal" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#FFEED6] rounded-xl shadow-md text-sm text-[#827148]">
            {KELAS_BESAR_SUBJECTS.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-sm text-[#827148] hover:bg-[#FFEED6]/40 cursor-pointer">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="kb-wa" className="text-sm font-semibold text-[#827148] mb-1.5 block">
          Nomor WhatsApp
        </label>
        <input
          id="kb-wa"
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={formData.whatsapp}
          onChange={(e) => update("whatsapp", e.target.value)}
          className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
          required
        />
        <p className="text-[11px] text-[#827148]/70 mt-1 font-medium">
          Format: 08xx, 62xx, atau +62xx
        </p>
      </div>

      {/* Price Info Box */}
      <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-[#827148] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#E8A07C] rounded-full" />
          Investasi Belajar
        </h4>
        <div className="flex justify-between items-end mb-4 pb-3 border-b border-[#FFEED6]">
          <span className="text-sm text-[#827148]/80 font-bold mb-1">Biaya Kelas</span>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center text-[10px] font-bold bg-[#E8A07C] text-white px-2 py-0.5 rounded-md">
                Hemat 33%
              </span>
              <span className="line-through text-[#827148]/50 text-xs">
                Rp 45.000
              </span>
            </div>
            <span className="text-lg font-extrabold text-[#827148]">Rp 30.000</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          {[
            "Akses zoom recording masterclass H-1",
            "Bahas soal-soal tahun lalu",
            "Tips pengerjaan cepat & santai",
            "Prediksi soal ujian",
            "Akses materi rangkuman",
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#827148] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A5AF79]" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GoPay Payment Info */}
      <GoPayInfo />

      {/* Payment Upload */}
      <PaymentUpload
        file={paymentFile}
        previewUrl={paymentPreview}
        onFileChange={onPaymentChange}
      />
    </div>
  )
}
