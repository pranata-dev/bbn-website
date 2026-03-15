"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { Subject } from "@/types"

interface SubjectContextType {
    selectedSubject: Subject
    setSelectedSubject: (subject: Subject) => void
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined)

export function SubjectProvider({ children }: { children: ReactNode }) {
    const [selectedSubject, setSelectedSubject] = useState<Subject>("FISDAS2")

    return (
        <SubjectContext.Provider value={{ selectedSubject, setSelectedSubject }}>
            {children}
        </SubjectContext.Provider>
    )
}

export function useSubject() {
    const context = useContext(SubjectContext)
    if (context === undefined) {
        throw new Error("useSubject must be used within a SubjectProvider")
    }
    return context
}
