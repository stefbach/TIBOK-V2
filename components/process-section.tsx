"use client"

import type React from "react"

import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

interface ProcessStepProps {
  stepNumber: number
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  isLast?: boolean
}

const ProcessStep: React.FC<ProcessStepProps> = ({ stepNumber, titleKey, descriptionKey, isLast }) => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className={`text-center max-w-xs relative ${!isLast ? "md:process-step" : ""}`}>
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {stepNumber}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{t[titleKey]}</h3>
      <p className="text-gray-600">{t[descriptionKey]}</p>
    </div>
  )
}

export default function ProcessSection() {
  const { language } = useLanguage()
  const t = translations[language]

  const steps: Omit<ProcessStepProps, "stepNumber" | "isLast">[] = [
    { titleKey: "processStep1Title", descriptionKey: "processStep1Desc" },
    { titleKey: "processStep2Title", descriptionKey: "processStep2Desc" },
    { titleKey: "processStep3Title", descriptionKey: "processStep3Desc" },
    { titleKey: "processStep4Title", descriptionKey: "processStep4Desc" },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.processTitle}</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-start md:space-x-8 space-y-8 md:space-y-0">
          {steps.map((step, index) => (
            <ProcessStep
              key={index}
              stepNumber={index + 1}
              titleKey={step.titleKey}
              descriptionKey={step.descriptionKey}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
