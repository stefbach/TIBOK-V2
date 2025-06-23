"use client"

import React, { createContext, useState, useContext, type ReactNode, type Dispatch, type SetStateAction } from "react"
import { translations } from "@/lib/translations"

export type Language = "fr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: Dispatch<SetStateAction<Language>>
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("fr")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export { translations }
