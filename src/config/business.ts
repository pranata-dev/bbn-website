export const BUSINESS_CONFIG = {
    payment: {
        bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "SeaBank",
        accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || "901790900641",
        accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || "Najwa Aaliyah Priyatna",
        gopayNumber: process.env.NEXT_PUBLIC_GOPAY_NUMBER || "081234567890",
        gopayHolder: process.env.NEXT_PUBLIC_GOPAY_NAME || "Belajar Bareng Nata",
    },
    contact: {
        adminWhatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890",
        emailSenderAddress: process.env.EMAIL_SENDER_ADDRESS || "contact@belajarbarengnata.com",
        emailSenderName: process.env.EMAIL_SENDER_NAME || "Belajar Bareng Nata",
    },
    zoom: {
        getLink: (subject: string): string => {
            try {
                if (process.env.ZOOM_LINKS_JSON) {
                    const parsed = JSON.parse(process.env.ZOOM_LINKS_JSON) as Record<string, string>
                    return parsed[subject] || parsed.default || ""
                }
            } catch {
                // fall through
            }
            return ""
        },
    },
}

