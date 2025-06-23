"use client"

import { useContext } from "react"
import { LanguageContext } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

const DashboardSection = () => {
  const { language } = useContext(LanguageContext)
  const t = translations[language]

  return (
    <section className="p-4">
      <h2 className="text-2xl font-semibold mb-4">{t.dashboard}</h2>
      {/* Add your dashboard content here */}
      <p>{t.welcomeMessage}</p>
    </section>
  )
}

export default DashboardSection
