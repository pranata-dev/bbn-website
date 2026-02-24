import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

const plans = [
    {
        name: "Basic",
        price: "Gratis",
        period: "",
        description: "Akses dasar untuk memulai latihan fisika.",
        features: [
            "Akses tryout terbatas",
            "Lihat skor dan jawaban benar",
            "Riwayat tryout",
            "Ranking leaderboard",
        ],
        cta: "Daftar Gratis",
        href: "/register",
        highlighted: false,
    },
    {
        name: "Premium",
        price: "Rp 49.000",
        period: "/semester",
        description: "Akses penuh semua fitur dan materi.",
        features: [
            "Semua fitur Basic",
            "Akses semua tryout",
            "Analisis performa per materi",
            "Pembahasan soal lengkap",
            "Soal premium eksklusif",
            "Prioritas support",
        ],
        cta: "Daftar Premium",
        href: "/register?plan=premium",
        highlighted: true,
    },
]

export function PricingSection() {
    return (
        <section id="harga" className="section-padding">
            <div className="container-narrow mx-auto">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-sm font-semibold text-soft-brown uppercase tracking-wider mb-3">
                        Harga
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                        Investasi Kecil, Hasil Maksimal
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        Pilih paket yang sesuai dengan kebutuhanmu. Upgrade kapan saja.
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 rounded-2xl border transition-all duration-300 ${plan.highlighted
                                    ? "bg-dark-brown text-cream border-dark-brown shadow-xl shadow-dark-brown/20"
                                    : "bg-white border-warm-gray/60 hover:border-soft-brown/30 hover:shadow-lg"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-earthy-gold text-dark-brown text-xs font-bold uppercase tracking-wider">
                                    Populer
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-lg font-semibold mb-2 ${plan.highlighted ? "text-cream" : "text-foreground"}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-bold ${plan.highlighted ? "text-cream" : "text-foreground"}`}>
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className={`text-sm ${plan.highlighted ? "text-cream/70" : "text-muted-foreground"}`}>
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm mt-2 ${plan.highlighted ? "text-cream/70" : "text-muted-foreground"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-earthy-gold" : "text-earthy-green"}`} />
                                        <span className={`text-sm ${plan.highlighted ? "text-cream/90" : "text-foreground/80"}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className={`w-full h-11 ${plan.highlighted
                                        ? "bg-cream text-dark-brown hover:bg-warm-beige"
                                        : "bg-dark-brown text-cream hover:bg-soft-brown"
                                    }`}
                            >
                                <Link href={plan.href}>
                                    {plan.cta}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
