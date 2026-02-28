import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-earthy-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-soft-brown/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warm-beige/60 rounded-full blur-3xl" />
            </div>

            <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-beige border border-warm-gray text-sm font-medium text-soft-brown mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4" />
                    <span>Platform Tutor Fisika Personal</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6 animate-fade-up text-balance">
                    Belajar Fisika
                    <br />
                    <span className="text-soft-brown">Lebih Terarah,</span>
                    <br />
                    <span className="text-dark-brown">Lebih Siap Ujian.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up text-balance" style={{ animationDelay: "0.1s" }}>
                    Platform tryout dan latihan soal mata kuliah Fisika yang dirancang untuk membantumu
                    memahami konsep, mengukur kemampuan, dan pastinya siap menghadapi ujian!
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    <Button size="lg" asChild className="bg-dark-brown hover:bg-soft-brown text-cream px-8 h-12 text-base shadow-lg shadow-dark-brown/20 transition-all hover:shadow-xl hover:shadow-dark-brown/25">
                        <Link href="/register">
                            Mulai Belajar Sekarang
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                    <Button size="lg" asChild className="px-8 h-12 text-base border-2 border-dark-brown bg-transparent text-dark-brown hover:bg-dark-brown hover:text-cream font-medium shadow-none transition-all">
                        <a href="#fitur">Pelajari Lebih Lanjut</a>
                    </Button>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-dark-brown">500+</div>
                        <div className="text-sm text-muted-foreground">Soal Latihan</div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-dark-brown">8</div>
                        <div className="text-sm text-muted-foreground">Kategori Materi</div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-dark-brown">100%</div>
                        <div className="text-sm text-muted-foreground">Auto Scoring</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
