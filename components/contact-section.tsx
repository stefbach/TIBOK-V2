"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function ContactSection() {
  const { language } = useLanguage()
  const t = translations[language]

  const contactInfo = [
    { icon: <Phone className="text-blue-600 mr-4" />, text: "+230 XXX-XXXX" },
    { icon: <Mail className="text-blue-600 mr-4" />, text: "contact@tibok.mu" },
    { icon: <MapPin className="text-blue-600 mr-4" />, textKey: "contactInfoAddress" as const },
    { icon: <Clock className="text-blue-600 mr-4" />, textKey: "contactInfoHours" as const },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission logic here
    alert("Form submitted (simulation)")
  }

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.contactTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{t.contactInfoTitle}</h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center">
                  {item.icon}
                  <span className="text-gray-700">{item.textKey ? t[item.textKey] : item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{t.contactFormTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input type="text" placeholder={t.contactFormNamePlaceholder} required className="py-3" />
              </div>
              <div>
                <Input type="email" placeholder={t.contactFormEmailPlaceholder} required className="py-3" />
              </div>
              <div>
                <Textarea rows={4} placeholder={t.contactFormMessagePlaceholder} required className="py-3" />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t.contactFormSendButton}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
