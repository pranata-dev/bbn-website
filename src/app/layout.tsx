import type { Metadata } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/contexts/ThemeContext"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BBN Education — Platform Pembelajaran & Tryout Fisika",
  description:
    "Platform bimbingan belajar dan tryout interaktif untuk persiapan ujian Fisika Dasar. Pilihan program E-Learning mandiri dan Tutoring Offline.",
  keywords: ["fisika", "tutor", "tryout", "fisika dasar", "belajar fisika", "e-learning", "tutoring offline", "bbn education"],
  openGraph: {
    title: "BBN Education — Tutor Fisika Personal & E-Learning",
    description:
      "Belajar Fisika lebih terarah, lebih siap ujian bersama BBN Education. Platform tryout dan latihan soal Fisika Dasar.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${geist.variable} ${jetbrainsMono.variable}`}>
      <body className={`${geist.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground selection:bg-accent selection:text-foreground`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
