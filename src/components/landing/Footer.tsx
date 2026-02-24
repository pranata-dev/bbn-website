import Link from "next/link"
import { BookOpen, Mail } from "lucide-react"
import { APP_NAME } from "@/constants"

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
        <footer className="bg-dark-brown text-cream">
            <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-cream/15 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-cream" />
                            </div>
                            <span className="font-semibold text-lg">{APP_NAME}</span>
                        </div>
                        <p className="text-cream/60 text-sm leading-relaxed mb-4">
                            Platform tutor fisika personal untuk mahasiswa semester 2.
                            Belajar fisika lebih terarah, lebih siap ujian.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-cream/60">
                            <Mail className="w-4 h-4" />
                            <span>support@belajarbarengnata.com</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-cream/80 mb-4">Platform</h4>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-cream/60 hover:text-cream transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-cream/80 mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-cream/60 hover:text-cream transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-cream/40">
                        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                    </p>
                    <p className="text-sm text-cream/40">
                        Dibuat dengan ❤️ untuk mahasiswa Fisika Indonesia
                    </p>
                </div>
            </div>
        </footer>
    )
}
