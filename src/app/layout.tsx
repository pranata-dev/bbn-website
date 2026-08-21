import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/contexts/ThemeContext"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Belajar Bareng Nata — Tutor Fisika Personal & E-Learning",
  description:
    "Platform bimbingan belajar dan tryout interaktif untuk persiapan ujian Fisika Dasar. Pilihan program E-Learning mandiri dan Tutoring Offline.",
  keywords: ["fisika", "tutor", "tryout", "fisika dasar", "belajar fisika", "e-learning", "tutoring offline"],
  openGraph: {
    title: "Belajar Bareng Nata — Tutor Fisika Personal & E-Learning",
    description:
      "Belajar Fisika lebih terarah, lebih siap ujian. Platform tryout dan latihan soal Fisika Dasar.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${montserrat.variable} ${montserrat.className} font-sans antialiased text-[#827148]`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
