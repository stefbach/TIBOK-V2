"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AboutSection() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section id="apropos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.aboutTitle}</h2>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg mb-6" dangerouslySetInnerHTML={{ __html: t.aboutIntro }} />
              <p className="mb-6" dangerouslySetInnerHTML={{ __html: t.aboutSupervision }} />
              <p className="mb-6" dangerouslySetInnerHTML={{ __html: t.aboutAvailability }} />
              <p dangerouslySetInnerHTML={{ __html: t.aboutAim }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
