"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import Link from "next/link"

export default function HeroSection() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section id="accueil" className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">{t.heroTitle}</h1>
          <p className="text-xl text-gray-600 mb-8">{t.heroSubtitle}</p>
          <Link href="/start-consultation">
            <Button
              size="lg"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              {t.startConsultationButton}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
