"use client"

import type React from "react"

import { Video, Truck, Stethoscope, Bot } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

interface ServiceCardProps {
  icon: React.ReactNode
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  iconBgClass: string
  iconColorClass: string
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, titleKey, descriptionKey, iconBgClass, iconColorClass }) => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="text-center p-6 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out hover:translate-y-[-5px] bg-white">
      <div className={`w-16 h-16 ${iconBgClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className={iconColorClass}>{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{t[titleKey]}</h3>
      <p className="text-gray-600">{t[descriptionKey]}</p>
    </div>
  )
}

export default function ServicesSection() {
  const { language } = useLanguage()
  const t = translations[language]

  const services: ServiceCardProps[] = [
    {
      icon: <Video size={28} />,
      titleKey: "service1Title",
      descriptionKey: "service1Desc",
      iconBgClass: "bg-blue-100",
      iconColorClass: "text-blue-600",
    },
    {
      icon: <Truck size={28} />,
      titleKey: "service2Title",
      descriptionKey: "service2Desc",
      iconBgClass: "bg-green-100",
      iconColorClass: "text-green-600",
    },
    {
      icon: <Stethoscope size={28} />,
      titleKey: "service3Title",
      descriptionKey: "service3Desc",
      iconBgClass: "bg-purple-100",
      iconColorClass: "text-purple-600",
    },
    {
      icon: <Bot size={28} />,
      titleKey: "service4Title",
      descriptionKey: "service4Desc",
      iconBgClass: "bg-orange-100",
      iconColorClass: "text-orange-600",
    },
  ]

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.servicesTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}
