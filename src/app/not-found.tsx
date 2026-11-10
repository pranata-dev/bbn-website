import Link from "next/link"
import { Compass, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_0px_#18181B] p-8 text-center space-y-5">
                <div className="w-12 h-12 bg-[#FFD02F] border-2 border-[#18181B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#18181B]">
                    <Compass className="w-6 h-6 text-[#18181B]" />
                </div>
                <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                        ROUTE NOT FOUND // 404
                    </span>
                    <h1 className="text-2xl font-black text-[#18181B]">
                        Halaman Tidak Ditemukan
                    </h1>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                        Tautan atau modul yang Anda cari tidak tersedia atau telah dipindahkan.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/"
                        className="w-full py-2.5 px-4 bg-[#FFD02F] text-[#18181B] border-2 border-[#18181B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#18181B] hover:translate-y-0.5 hover:shadow-none transition-all inline-flex items-center justify-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        KEMBALI KE BERANDA
                    </Link>
                </div>
            </div>
        </div>
    )
}

