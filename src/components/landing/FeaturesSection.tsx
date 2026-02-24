import {
    FileText,
    BarChart3,
    Trophy,
    Clock,
    ShieldCheck,
    Layers,
} from "lucide-react"

const features = [
    {
        icon: FileText,
        title: "Bank Soal Lengkap",
        description:
            "Ratusan soal Fisika Dasar 2 yang dikategorikan berdasarkan materi, dari Listrik hingga Optika.",
    },
    {
        icon: Clock,
        title: "Tryout dengan Timer",
        description:
            "Simulasi ujian sungguhan dengan countdown timer, auto-submit, dan validasi waktu server.",
    },
    {
        icon: BarChart3,
        title: "Analisis Performa",
        description:
            "Lihat performa per materi secara detail. Ketahui kelemahanmu dan fokus belajar lebih efektif.",
    },
    {
        icon: Trophy,
        title: "Leaderboard & Ranking",
        description:
            "Bandingkan skormu dengan peserta lain. Motivasi diri untuk terus meningkatkan performa.",
    },
    {
        icon: ShieldCheck,
        title: "Anti-Cheating System",
        description:
            "Urutan soal diacak, deteksi pergantian tab, dan proteksi terhadap manipulasi skor.",
    },
    {
        icon: Layers,
        title: "Scoring Berbobot",
        description:
            "Sistem penilaian dengan bobot per soal. Nilai mencerminkan pemahaman, bukan hanya kuantitas jawaban.",
    },
]

export function FeaturesSection() {
    return (
        <section id="fitur" className="section-padding bg-warm-beige/40">
            <div className="container-narrow mx-auto">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-sm font-semibold text-soft-brown uppercase tracking-wider mb-3">
                        Fitur Unggulan
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                        Semua yang Kamu Butuhkan untuk Siap Ujian
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        Dirancang khusus untuk mahasiswa Fisika semester 2 yang ingin mempersiapkan diri
                        dengan lebih terstruktur dan efisien.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="group p-6 rounded-2xl bg-white border border-warm-gray/60 hover:border-soft-brown/30 hover:shadow-lg hover:shadow-soft-brown/5 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-warm-beige flex items-center justify-center mb-4 group-hover:bg-dark-brown/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-dark-brown" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
