"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

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
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function SubjectProvider({ children }: { children: ReactNode }) {
    const [selectedCourse, setSelectedCourseState] = useState<string>(() => {
        if (typeof window === "undefined") return "fisdas2"
        try {
            const saved = localStorage.getItem("bbn_selected_course") || localStorage.getItem("bbn_selected_subject")
            return saved ? saved.toLowerCase() : "fisdas2"
        } catch {
            return "fisdas2"
        }
    })

    const setSelectedCourse = (slug: string) => {
        const normalized = slug.toLowerCase()
        setSelectedCourseState(normalized)
        try {
            localStorage.setItem("bbn_selected_course", normalized)
            localStorage.setItem("bbn_selected_subject", normalized)
        } catch {
            // ignore
        }
    }

    return (
        <CourseContext.Provider
            value={{
                selectedSubject: selectedCourse,
                setSelectedSubject: setSelectedCourse,
                selectedCourse,
                setSelectedCourse,
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
