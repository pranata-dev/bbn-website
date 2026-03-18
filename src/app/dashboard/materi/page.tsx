"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, BookOpen, FileText } from "lucide-react"
import { useSubject } from "@/contexts/SubjectContext"
import { Subject } from "@/types"

interface Material {
    title: string
    link: string
    icon: React.ReactNode
}

const MATERIALS_DATA: Record<Subject, Material[]> = {
    FISDAS2: [
        {
            title: "BASIC PHYSICS 2 WEEK 1 - COULOMB'S LAW AND ELECTRIC FIELD",
            link: "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 2 - GAUSS LAW",
            link: "https://drive.google.com/uc?export=download&id=1UYV9xYq9BNRpVThSkN1sr57F9s8xq9mh",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 3 - ELECTRIC POTENTIAL AND CAPACITANCE",
            link: "https://drive.google.com/uc?export=download&id=1ows4NXU-_xrMrQeL9ap4oOm-Ihf5RVhO",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 4 - CURRENT, RESISTANCE, AND CIRCUIT",
            link: "https://drive.google.com/uc?export=download&id=1Rpid7KYmMce3p9wt62ZXMsLs6K1yB1fU",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 5 - MAGNETIC FIELDS & MAGNETIC FIELDS DUE TO CURRENT",
            link: "https://drive.google.com/uc?export=download&id=1vYSiKUZhJZRU2w1C5RXrNkvEjsGroBoG",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 6 - INDUCTION & INDUCTANCE",
            link: "https://drive.google.com/uc?export=download&id=1hA8yDh1OMG-Zmhe8P435BFWuTruIaTjF",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 7 - ELECTROMAGNETIC OSCILLATIONS AND ALTERNATING CURRENT",
            link: "https://drive.google.com/uc?export=download&id=17d5CVzPSePU-MBnFtNljPHzDh5lhbE0T",
            icon: <BookOpen className="w-5 h-5 text-earthy-gold" />,
        },
    ],
    FISMAT: [],
}

export default function MateriPage() {
    const { selectedSubject } = useSubject()
    const materials = MATERIALS_DATA[selectedSubject] ?? []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-6 h-6 text-dark-brown" /> 
                    Materi Belajar
                </h1>
                <p className="text-muted-foreground mt-2">
                    Unduh materi belajar yang telah dirangkum khusus untuk persiapan ujianmu di bawah ini.
                </p>
            </div>

            {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((materi, idx) => (
                        <Card key={idx} className="border-warm-gray/60 hover:border-earthy-gold/50 hover:shadow-md transition-all group flex flex-col h-full">
                            <CardContent className="p-6 flex flex-col flex-grow items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-earthy-gold/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    {materi.icon}
                                </div>
                                
                                <h3 className="text-sm font-bold text-foreground leading-snug mb-6 flex-grow">
                                    {materi.title}
                                </h3>

                                <Button 
                                    asChild 
                                    className="w-full bg-dark-brown text-cream hover:bg-soft-brown shadow-sm group-hover:shadow transition-all"
                                >
                                    <a 
                                        href={materi.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Unduh Materi
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-warm-gray/60 bg-warm-gray/5">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-gray/20 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">Belum Ada Materi</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Materi belajar akan diunggah pada halaman ini saat sudah tersedia. Silakan cek kembali nanti.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
