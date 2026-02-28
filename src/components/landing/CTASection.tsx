import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FadeInUp, HoverScale } from "@/components/animations"

export function CTASection() {
    return (
        <section className="section-padding">
            <div className="container-narrow mx-auto">
                <div className="relative rounded-3xl bg-dark-brown overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-soft-brown/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-earthy-gold/15 rounded-full blur-3xl" />
                    </div>

                    <FadeInUp className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-cream mb-4 text-balance">
                            Siap Tingkatkan Nilai Fisikamu?
                        </h2>
                        <p className="text-cream/70 max-w-xl mx-auto mb-8 text-balance">
                            Bergabung sekarang dan mulai latihan soal Fisika dengan cara yang lebih
                            terstruktur dan menyenangkan.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <HoverScale>
                                <Button
                                    size="lg"
                                    asChild
                                    className="bg-cream text-dark-brown hover:bg-warm-beige px-8 h-12 text-base"
                                >
                                    <Link href="/register">
                                        Daftar Sekarang
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </HoverScale>
                            <HoverScale>
                                <Button
                                    size="lg"
                                    asChild
                                    className="bg-transparent shadow-none border-2 border-cream/50 text-cream hover:bg-cream hover:text-dark-brown px-8 h-12 text-base"
                                >
                                    <a href="#cara-kerja">Pelajari Lebih Lanjut</a>
                                </Button>
                            </HoverScale>
                        </div>
                    </FadeInUp>
                </div>
            </div>
        </section>
    )
}
