"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSubject } from "@/contexts/SubjectContext"
import { Subject } from "@/types"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"

interface Material {
  title: string
  link: string
  podcastLink?: string
}

const MATERIALS_DATA: Record<string, Material[]> = {
  FISDAS2: [
    {
      title: "Basic Physics 2 Week 1 - Coulomb's Law and Electric Field",
      link: "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm",
      podcastLink: "https://drive.google.com/uc?export=download&id=1d3VdZspBokYYZj8amEWI3ihd6hlF8ieT",
    },
    {
      title: "Basic Physics 2 Week 2 - Gauss's Law",
      link: "https://drive.google.com/uc?export=download&id=1UYV9xYq9BNRpVThSkN1sr57F9s8xq9mh",
      podcastLink: "https://drive.google.com/uc?export=download&id=1LDj-L3h9s6ZJTBTJnTZnB-QrPg2tT9Ik",
    },
    {
      title: "Basic Physics 2 Week 3 - Electric Potential and Capacitance",
      link: "https://drive.google.com/uc?export=download&id=1ows4NXU-_xrMrQeL9ap4oOm-Ihf5RVhO",
      podcastLink: "https://drive.google.com/uc?export=download&id=1C_wSu7OcJexlLp0EHE2xa2uqy7RiCIck",
    },
    {
      title: "Basic Physics 2 Week 4 - Current, Resistance, and DC Circuits",
      link: "https://drive.google.com/uc?export=download&id=1Rpid7KYmMce3p9wt62ZXMsLs6K1yB1fU",
      podcastLink: "https://drive.google.com/uc?export=download&id=1L_H2JT5QRm7ngpd7vfokNF_ZDVC_PzXv",
    },
    {
      title: "Basic Physics 2 Week 5 - Magnetic Fields & Sources of Magnetic Field",
      link: "https://drive.google.com/uc?export=download&id=1vYSiKUZhJZRU2w1C5RXrNkvEjsGroBoG",
      podcastLink: "https://drive.google.com/uc?export=download&id=1joT4j5rSuiPgihQmDI5RLKs7s3OIyAZj",
    },
    {
      title: "Basic Physics 2 Week 6 - Induction and Inductance",
      link: "https://drive.google.com/uc?export=download&id=1hA8yDh1OMG-Zmhe8P435BFWuTruIaTjF",
      podcastLink: "https://drive.google.com/uc?export=download&id=1dw8EuYSaM8lsOUhWX-9ngoFyLQLeG11K",
    },
    {
      title: "Basic Physics 2 Week 7 - Electromagnetic Oscillations and AC",
      link: "https://drive.google.com/uc?export=download&id=17d5CVzPSePU-MBnFtNljPHzDh5lhbE0T",
      podcastLink: "https://drive.google.com/uc?export=download&id=1hj0oJCJBEA5TE-MZrQ5On6XPfmpNv0Rb",
    },
  ],
  FISMAT: [
    {
      title: "Fismat Week 1 - Bilangan Kompleks",
      link: "https://drive.google.com/uc?export=download&id=1D9DJXMUaVexRqWDTpz20egIm5rlAxBmA",
      podcastLink: "https://drive.google.com/uc?export=download&id=17I6oVcUdQ_f2fxnu1YotnPt5ZbPxt7JK",
    },
    {
      title: "Fismat Week 2 - Aljabar Linear",
      link: "https://drive.google.com/uc?export=download&id=1IiC84g0ryUq13MrYnyHW0VvIJ9Zh5eCN",
      podcastLink: "https://drive.google.com/uc?export=download&id=1MVtoBGhjiHn8kFzKM2utzOYoG3b0wOgo",
    },
    {
      title: "Fismat Week 3 - Deret Tak Hingga dan Deret Pangkat",
      link: "https://drive.google.com/uc?export=download&id=1bkj9HAmLtR6IqmfM1dHoPeSa89s_uMZQ",
      podcastLink: "https://drive.google.com/uc?export=download&id=1Y7nlDQrwng2tqsh9afchZjy0JI7DaUSz",
    },
  ],
}

function MateriContent() {
  const searchParams = useSearchParams()
  const courseParam = searchParams.get("course")
  const { selectedSubject } = useSubject()

  const activeKey = courseParam || selectedSubject || "FISDAS2"
  const materials = MATERIALS_DATA[activeKey] ?? MATERIALS_DATA["FISDAS2"] ?? []

  const formattedCourseTitle = courseParam
    ? courseParam
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Mata Kuliah Pilihan"

  return (
    <div className="space-y-6 font-sans">
      {/* 2. Reusable Page Header */}
      <PageHeader
        title={`Materi Belajar: ${formattedCourseTitle}`}
        subtitle="Unduh materi belajar yang telah dirangkum khusus untuk persiapan ujianmu di bawah ini."
      />

      {/* 4. Grid Layout: 3 columns of material cards */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {materials.map((materi, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-xs border border-[#FFEED6] flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                {/* Top: Icon placeholder */}
                <div className="w-12 h-12 bg-[#FFEED6] rounded-xl mb-4 flex items-center justify-center border border-[#827148]/10">
                  <div className="w-5 h-5 rounded-md bg-[#A5AF79]/40 border border-[#827148]/20" />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#827148] leading-snug mb-6">
                  {materi.title}
                </h3>
              </div>

              {/* Actions (Bottom pinned): Two buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-[#FFEED6]/60 mt-auto">
                {materi.link && (
                  <a
                    href={materi.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="w-full bg-[#A5AF79] hover:bg-[#949e6a] text-white rounded-xl py-2.5 px-4 font-semibold text-xs text-center shadow-2xs transition-colors block cursor-pointer"
                  >
                    Unduh Materi
                  </a>
                )}

                {materi.podcastLink && (
                  <a
                    href={materi.podcastLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-[#A5AF79] text-[#A5AF79] hover:bg-[#A5AF79]/10 rounded-xl py-2.5 px-4 font-semibold text-xs text-center transition-colors block cursor-pointer"
                  >
                    Unduh Podcast
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Materi"
          description="Materi belajar akan diunggah pada halaman ini saat sudah tersedia. Silakan cek kembali nanti!"
        />
      )}
    </div>
  )
}

export default function MateriPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#827148]/60 text-sm font-semibold">
          Memuat modul materi...
        </div>
      }
    >
      <MateriContent />
    </Suspense>
  )
}
