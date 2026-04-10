import Link from "next/link"
import { BookOpen, Mail, MessageCircle } from "lucide-react"

const footerLinks = {
    platform: [
        { label: "Fitur", href: "#fitur" },
        { label: "Cara Kerja", href: "#cara-kerja" },
        { label: "Harga", href: "#harga" },
        { label: "FAQ", href: "#faq" },
    ],
    legal: [
        { label: "Kebijakan Privasi", href: "#" },
        { label: "Syarat & Ketentuan", href: "#" },
    ],
}

export function Footer() {
    return (
        <footer className="bg-[#2b1b11] text-[#FEFCF3] font-mono border-t-[12px] border-[#1a100a]">
            <div className="container mx-auto px-6 lg:px-12 py-16 text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1 flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-6 bg-[#FEFCF3] text-[#2b1b11] px-4 py-2 rounded-xl border-4 border-[#1a100a] shadow-[4px_4px_0px_#1a100a] select-none">
                            <BookOpen className="w-5 h-5 stroke-[3]" />
                            <span className="font-bold text-sm tracking-tight uppercase">Belajar Bareng Nata</span>
                        </div>
                        <p className="text-[#a5c2b0] text-sm leading-relaxed mb-6 font-semibold md:max-w-[280px]">
                            Platform tutor fisika personal untuk mahasiswa. Belajar fisika lebih terarah, santai, dan siap ujian!
                        </p>
                        <div className="flex flex-col gap-3 text-sm text-[#e87a5d] font-bold">
                            <a href="mailto:dzulfikaryudha@gmail.com" className="flex items-center gap-2 hover:underline w-fit">
                                <Mail className="w-5 h-5" />
                                <span>dzulfikaryudha@gmail.com</span>
                            </a>
                            <a href="https://wa.me/6285159922661" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline w-fit">
                                <MessageCircle className="w-5 h-5" />
                                <span>Hubungi via WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="font-bold text-base uppercase tracking-widest text-[#bed3c6] mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {footerLinks.platform.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm font-bold text-[#FEFCF3] hover:text-[#e87a5d] hover:pl-2 transition-all before:content-['>'] before:opacity-0 hover:before:opacity-100 before:mr-2"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="font-bold text-base uppercase tracking-widest text-[#bed3c6] mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm font-bold text-[#FEFCF3] hover:text-[#e87a5d] hover:pl-2 transition-all before:content-['>'] before:opacity-0 hover:before:opacity-100 before:mr-2"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t-4 border-[#1a100a] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-[#a5c2b0] uppercase tracking-widest">
                        © {new Date().getFullYear()} Belajar Bareng Nata
                    </p>
                    <p className="text-xs font-bold text-[#bed3c6] flex items-center gap-2">
                        MADE WITH LOVE
                        BY LUMORALABS
                    </p>
                </div>
            </div>
        </footer>
    )
}
