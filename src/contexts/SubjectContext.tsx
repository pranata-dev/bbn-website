"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import {
    getExcellentCourseByGrade,
    type ExcellentCourseConfig,
    type ExcellentGrade,
} from "@/config/excellent"

export interface Course {
    id?: string
    slug: string
    code?: string
    title?: string
    name?: string
}

interface CourseContextType {
    selectedSubject: string
    setSelectedSubject: (subject: string) => void
    selectedCourse: string
    setSelectedCourse: (courseSlug: string) => void
    isExcellentBeta: boolean
    excellentGrade: ExcellentGrade | null
    excellentCourse: ExcellentCourseConfig | null
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function SubjectProvider({
    children,
    excellentGrade = null,
}: {
    children: ReactNode
    excellentGrade?: ExcellentGrade | null
}) {
    const excellentCourse = excellentGrade
        ? getExcellentCourseByGrade(excellentGrade) ?? null
        : null
    const isExcellentBeta = Boolean(excellentCourse)

    const [storedCourse, setStoredCourse] = useState<string>(() => {
        if (excellentCourse) return excellentCourse.slug
        if (typeof window === "undefined") return "fisdas2"
        try {
            const saved =
                localStorage.getItem("bbn_selected_course") ||
                localStorage.getItem("bbn_selected_subject")
            return saved ? saved.toLowerCase() : "fisdas2"
        } catch {
            return "fisdas2"
        }
    })

    // Keep localStorage synced when locked to an Excellent Beta grade
    useEffect(() => {
        if (!excellentCourse) return
        try {
            localStorage.setItem("bbn_selected_course", excellentCourse.slug)
            localStorage.setItem("bbn_selected_subject", excellentCourse.slug)
        } catch {
            // ignore storage errors
        }
    }, [excellentCourse])

    const selectedCourse = excellentCourse ? excellentCourse.slug : storedCourse

    const setSelectedCourse = useCallback(
        (slug: string) => {
            // In Excellent Beta mode, keep course strictly locked to the student's unlocked grade
            if (excellentCourse) {
                return
            }
            const normalized = slug.toLowerCase()
            setStoredCourse(normalized)
            try {
                localStorage.setItem("bbn_selected_course", normalized)
                localStorage.setItem("bbn_selected_subject", normalized)
            } catch {
                // ignore
            }
        },
        [excellentCourse]
    )

    return (
        <CourseContext.Provider
            value={{
                selectedSubject: selectedCourse,
                setSelectedSubject: setSelectedCourse,
                selectedCourse,
                setSelectedCourse,
                isExcellentBeta,
                excellentGrade: excellentCourse ? excellentCourse.grade : null,
                excellentCourse,
            }}
        >
            {children}
        </CourseContext.Provider>
    )
}

export function useSubject() {
    const context = useContext(CourseContext)
    if (context === undefined) {
        throw new Error("useSubject must be used within a SubjectProvider")
    }
    return context
}

export const useCourse = useSubject
