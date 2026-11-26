export interface PaymentConfig {
    bankName: string
    accountNumber: string
    accountHolder: string
    gopayNumber: string
    gopayHolder: string
}

export const BUSINESS_CONFIG = {
    payment: {
        bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "",
        accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || "",
        accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || "",
        gopayNumber: process.env.NEXT_PUBLIC_GOPAY_NUMBER || "",
        gopayHolder: process.env.NEXT_PUBLIC_GOPAY_NAME || "",
    },
    contact: {
        adminWhatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "",
        emailSenderAddress: process.env.EMAIL_SENDER_ADDRESS || "contact@belajarbarengnata.com",
        emailSenderName: process.env.EMAIL_SENDER_NAME || "Belajar Bareng Nata",
    },
    zoom: {
        getLink: (subject: string): string => {
            try {
                if (process.env.ZOOM_LINKS_JSON) {
                    const parsed: unknown = JSON.parse(process.env.ZOOM_LINKS_JSON)
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        const record = parsed as Record<string, unknown>
                        const value = record[subject] ?? record.default
                        return typeof value === "string" ? value : ""
                    }
                }
            } catch {
                return ""
            }
            return ""
        },
        getSchedule: (subject: string): string => {
            try {
                if (process.env.ZOOM_SCHEDULES_JSON) {
                    const parsed: unknown = JSON.parse(process.env.ZOOM_SCHEDULES_JSON)
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        const record = parsed as Record<string, unknown>
                        const value = record[subject] ?? record.default
                        return typeof value === "string" ? value : ""
                    }
                }
            } catch {
                return ""
            }
            return ""
        },
    },
}

/**
 * Validates that required bank transfer payment settings are configured at runtime.
 * Kept out of module load so CI builds succeed without runtime payment secrets.
 */
export function getRequiredPaymentConfig(): PaymentConfig {
    const bankName = (process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || BUSINESS_CONFIG.payment.bankName).trim()
    const accountNumber = (
        process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || BUSINESS_CONFIG.payment.accountNumber
    ).trim()
    const accountHolder = (
        process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || BUSINESS_CONFIG.payment.accountHolder
    ).trim()
    const gopayNumber = (process.env.NEXT_PUBLIC_GOPAY_NUMBER || BUSINESS_CONFIG.payment.gopayNumber).trim()
    const gopayHolder = (process.env.NEXT_PUBLIC_GOPAY_NAME || BUSINESS_CONFIG.payment.gopayHolder).trim()

    if (!bankName || !accountNumber || !accountHolder) {
        throw new Error(
            "Konfigurasi pembayaran belum lengkap. Pastikan NEXT_PUBLIC_PAYMENT_BANK_NAME, NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER, dan NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER telah diatur."
        )
    }

    return {
        bankName,
        accountNumber,
        accountHolder,
        gopayNumber,
        gopayHolder,
    }
}
