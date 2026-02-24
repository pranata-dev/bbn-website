import { z } from "zod"

export const baseRegistrationSchema = z.object({
    name: z
        .string()
        .min(3, "Nama minimal 3 karakter")
        .max(100, "Nama maksimal 100 karakter"),
    nim: z
        .string()
        .min(5, "NIM minimal 5 karakter")
        .max(20, "NIM maksimal 20 karakter"),
    subject: z
        .string()
        .min(1, "Pilih mata kuliah"),
    whatsapp: z
        .string()
        .regex(/^(\+62|62|08)\d{8,13}$/, "Format nomor WhatsApp tidak valid"),
})

export const regularClassSchema = baseRegistrationSchema.extend({
    type: z.literal("REGULAR"),
    groupSize: z
        .number()
        .min(1, "Minimal 1 orang")
        .max(20, "Maksimal 20 orang"),
    sessionCount: z
        .number()
        .min(1, "Minimal 1 pertemuan")
        .max(30, "Maksimal 30 pertemuan"),
    scheduledDate: z
        .string()
        .min(1, "Pilih tanggal kelas"),
    scheduledTime: z
        .string()
        .min(1, "Pilih waktu kelas"),
    notes: z
        .string()
        .max(500, "Catatan maksimal 500 karakter")
        .optional()
        .default(""),
})

export const utsPackageSchema = baseRegistrationSchema.extend({
    type: z.literal("UTS"),
    packageType: z
        .string()
        .min(1, "Pilih tipe paket"),
})

export type RegularClassFormData = z.infer<typeof regularClassSchema>
export type UTSPackageFormData = z.infer<typeof utsPackageSchema>
export type RegistrationType = "REGULAR" | "UTS"
