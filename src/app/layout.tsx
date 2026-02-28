import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Belajar Bareng Nata — Tutor Fisika Personal",
  description:
    "Platform tutor fisika personal untuk mahasiswa Fisika semester 2. Tryout, latihan soal, dan analisis performa untuk persiapan ujian Fisika Dasar 2.",
  keywords: ["fisika", "tutor", "tryout", "fisika dasar 2", "belajar fisika", "mahasiswa"],
  openGraph: {
    title: "Belajar Bareng Nata — Tutor Fisika Personal",
    description:
      "Belajar Fisika lebih terarah, lebih siap ujian. Platform tryout dan latihan soal Fisika Dasar 2.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
