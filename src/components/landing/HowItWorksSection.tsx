import { UserPlus, CreditCard, CheckCircle, BookOpen } from "lucide-react"

const steps = [
    {
        icon: UserPlus,
        step: "01",
        title: "Daftar Akun",
        description: "Isi data diri dan unggah bukti pembayaran untuk mendaftar.",
    },
    {
        icon: CreditCard,
        step: "02",
        title: "Verifikasi Pembayaran",
        description: "Admin akan memverifikasi pembayaranmu dan mengaktifkan akun.",
    },
    {
        icon: CheckCircle,
        step: "03",
        title: "Aktivasi Akun",
        description: "Kamu akan menerima email aktivasi. Set password dan login.",
    },
    {
        icon: BookOpen,
        step: "04",
        title: "Mulai Belajar",
        description: "Akses tryout, kerjakan soal, lihat skor, dan pantau progresmu.",
    },
]

export function HowItWorksSection() {
    return (
        <section id="cara-kerja" className="section-padding">
            <div className="container-narrow mx-auto">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-sm font-semibold text-soft-brown uppercase tracking-wider mb-3">
                        Cara Kerja
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                        4 Langkah Mudah untuk Memulai
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        Proses pendaftaran yang simpel. Fokusmu hanya satu: belajar fisika.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.step} className="relative text-center group">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-warm-gray to-warm-gray/30" />
                            )}

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl bg-warm-beige border border-warm-gray/60 flex items-center justify-center mb-4 group-hover:bg-white group-hover:border-soft-brown/30 group-hover:shadow-md transition-all duration-300">
                                    <step.icon className="w-8 h-8 text-dark-brown" />
                                </div>
                                <span className="text-xs font-bold text-soft-brown uppercase tracking-widest mb-2">
                                    Langkah {step.step}
                                </span>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
