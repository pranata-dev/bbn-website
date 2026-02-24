import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Rafi Ananda",
        role: "Mahasiswa Fisika, Semester 2",
        content:
            "Platform ini benar-benar membantu saya memahami konsep-konsep Fisika Dasar 2. Fitur tryout-nya bikin saya lebih percaya diri saat ujian!",
        rating: 5,
        avatar: "RA",
    },
    {
        name: "Dina Maharani",
        role: "Mahasiswa Fisika, Semester 2",
        content:
            "Analisis performa per materi sangat berguna. Saya jadi tahu harus fokus belajar di bagian mana. Skor saya naik signifikan setelah latihan rutin di sini.",
        rating: 5,
        avatar: "DM",
    },
    {
        name: "Ahmad Fauzan",
        role: "Mahasiswa Fisika, Semester 4",
        content:
            "Waktu semester 2 dulu, saya struggle di mata kuliah Fisika Dasar 2. Andai platform ini sudah ada saat itu, pasti nilai saya lebih bagus!",
        rating: 5,
        avatar: "AF",
    },
]

export function TestimonialsSection() {
    return (
        <section id="testimoni" className="section-padding bg-warm-beige/40">
            <div className="container-narrow mx-auto">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-sm font-semibold text-soft-brown uppercase tracking-wider mb-3">
                        Testimoni
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                        Apa Kata Mereka?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        Dengarkan pengalaman mahasiswa yang sudah menggunakan Belajar Bareng Nata.
                    </p>
                </div>

                {/* Testimonial cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.name}
                            className="p-6 rounded-2xl bg-white border border-warm-gray/60 hover:shadow-lg hover:shadow-soft-brown/5 transition-all duration-300"
                        >
                            {/* Quote icon */}
                            <Quote className="w-8 h-8 text-warm-gray/80 mb-4" />

                            {/* Content */}
                            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-earthy-gold text-earthy-gold" />
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-dark-brown flex items-center justify-center text-cream text-sm font-semibold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
