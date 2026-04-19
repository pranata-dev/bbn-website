"use client"

import { Button } from "@/components/ui/button"
import { Download, BookOpen, FileText, Headphones } from "lucide-react"
import { useSubject } from "@/contexts/SubjectContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Subject } from "@/types"

interface Material {
    title: string
    link: string
    podcastLink?: string
    icon: React.ReactNode
}

const MATERIALS_DATA: Record<Subject, Material[]> = {
    FISDAS2: [
        {
            title: "BASIC PHYSICS 2 WEEK 1 - COULOMB'S LAW AND ELECTRIC FIELD",
            link: "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm",
            podcastLink: "https://drive.google.com/uc?export=download&id=1d3VdZspBokYYZj8amEWI3ihd6hlF8ieT",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 2 - GAUSS LAW",
            link: "https://drive.google.com/uc?export=download&id=1UYV9xYq9BNRpVThSkN1sr57F9s8xq9mh",
            podcastLink: "https://drive.google.com/uc?export=download&id=1LDj-L3h9s6ZJTBTJnTZnB-QrPg2tT9Ik",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 3 - ELECTRIC POTENTIAL AND CAPACITANCE",
            link: "https://drive.google.com/uc?export=download&id=1ows4NXU-_xrMrQeL9ap4oOm-Ihf5RVhO",
            podcastLink: "https://drive.google.com/uc?export=download&id=1C_wSu7OcJexlLp0EHE2xa2uqy7RiCIck",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 4 - CURRENT, RESISTANCE, AND CIRCUIT",
            link: "https://drive.google.com/uc?export=download&id=1Rpid7KYmMce3p9wt62ZXMsLs6K1yB1fU",
            podcastLink: "https://drive.google.com/uc?export=download&id=1L_H2JT5QRm7ngpd7vfokNF_ZDVC_PzXv",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 5 - MAGNETIC FIELDS & MAGNETIC FIELDS DUE TO CURRENT",
            link: "https://drive.google.com/uc?export=download&id=1vYSiKUZhJZRU2w1C5RXrNkvEjsGroBoG",
            podcastLink: "https://drive.google.com/uc?export=download&id=1joT4j5rSuiPgihQmDI5RLKs7s3OIyAZj",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 6 - INDUCTION & INDUCTANCE",
            link: "https://drive.google.com/uc?export=download&id=1hA8yDh1OMG-Zmhe8P435BFWuTruIaTjF",
            podcastLink: "https://drive.google.com/uc?export=download&id=1dw8EuYSaM8lsOUhWX-9ngoFyLQLeG11K",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "BASIC PHYSICS 2 WEEK 7 - ELECTROMAGNETIC OSCILLATIONS AND ALTERNATING CURRENT",
            link: "https://drive.google.com/uc?export=download&id=17d5CVzPSePU-MBnFtNljPHzDh5lhbE0T",
            podcastLink: "https://drive.google.com/uc?export=download&id=1hj0oJCJBEA5TE-MZrQ5On6XPfmpNv0Rb",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
    ],
    FISMAT: [
        {
            title: "FISMAT - BILANGAN KOMPLEKS",
            link: "https://drive.google.com/uc?export=download&id=1D9DJXMUaVexRqWDTpz20egIm5rlAxBmA",
            podcastLink: "https://drive.google.com/uc?export=download&id=17I6oVcUdQ_f2fxnu1YotnPt5ZbPxt7JK",
            icon: <BookOpen className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "FISMAT - ALJABAR LINEAR",
            link: "https://drive.google.com/uc?export=download&id=1IiC84g0ryUq13MrYnyHW0VvIJ9Zh5eCN",
            podcastLink: "https://drive.google.com/uc?export=download&id=1MVtoBGhjiHn8kFzKM2utzOYoG3b0wOgo",
            icon: <FileText className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
        {
            title: "FISMAT - DERET TAK HINGGA DAN DERET PANGKAT",
            link: "https://drive.google.com/uc?export=download&id=1bkj9HAmLtR6IqmfM1dHoPeSa89s_uMZQ",
            podcastLink: "https://drive.google.com/uc?export=download&id=1Y7nlDQrwng2tqsh9afchZjy0JI7DaUSz",
            icon: <FileText className="w-5 h-5 text-[#2b1b11] stroke-[2]" />,
        },
    ],
}

export default function MateriPage() {
    const { selectedSubject } = useSubject()
    const { isDark } = useTheme()
    const materials = MATERIALS_DATA[selectedSubject] ?? []

    return (
        <div className="relative -m-6 sm:-m-8 min-h-screen">
            {/* No pixel art background to match admin style */}

            <div className="relative z-10 p-6 sm:p-8 space-y-8 font-mono">
                {/* Header */}
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-6 shadow-[6px_6px_0px_#2b1b11]">
                    <h1
                        className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1 flex items-center gap-3"
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        <FileText className="w-6 h-6 text-[#e87a5d] stroke-[2]" />
                        Materi Belajar
                    </h1>
                    <p className="text-sm text-[#3c5443] font-bold">
                        Unduh materi belajar yang telah dirangkum khusus untuk persiapan ujianmu di bawah ini.
                    </p>
                </div>

                {materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((materi, idx) => (
                            <div key={idx} className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11] transition-all flex flex-col h-full group">
                                <div className="p-5 flex flex-col flex-grow items-center text-center">
                                    <div className="w-12 h-12 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4 group-hover:scale-110 transition-transform">
                                        {materi.icon}
                                    </div>

                                    <h3 className="text-xs font-bold text-[#2b1b11] leading-snug mb-5 flex-grow">
                                        {materi.title}
                                    </h3>

                                    <div className="flex flex-col gap-2 mt-auto w-full">
                                        {materi.link && materi.link !== "#" && (
                                            <Button
                                                asChild
                                                className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] rounded-none font-bold text-xs h-9"
                                            >
                                                <a
                                                    href={materi.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                >
                                                    <Download className="w-4 h-4 mr-2 stroke-[2]" />
                                                    Unduh Materi
                                                </a>
                                            </Button>
                                        )}

                                        {materi.podcastLink && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full border-2 border-[#2b1b11] text-[#2b1b11] hover:bg-[#bed3c6] shadow-[2px_2px_0px_#2b1b11] rounded-none font-bold text-xs h-9 bg-[#FEFCF3]"
                                            >
                                                <a
                                                    href={materi.podcastLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Headphones className="w-4 h-4 mr-2 stroke-[2]" />
                                                    Unduh Podcast (AI)
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                                <BookOpen className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <h3 className="text-sm font-extrabold text-[#2b1b11] mb-1" style={{ fontFamily: "var(--font-press-start)" }}>
                                Belum Ada Materi
                            </h3>
                            <p className="text-xs text-[#3c5443] font-bold max-w-sm">
                                Materi belajar akan diunggah pada halaman ini saat sudah tersedia. Silakan cek kembali nanti.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
