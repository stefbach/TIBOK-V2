"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "./language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

export default function Header() {
  const { language } = useLanguage()
  const t = translations[language]

  const navLinks: { href: string; labelKey: TranslationKey }[] = [
    { href: "#accueil", labelKey: "navHome" },
    { href: "#services", labelKey: "navServices" },
    { href: "#tarifs", labelKey: "navPricing" },
    { href: "#apropos", labelKey: "navAbout" },
    { href: "#contact", labelKey: "navContact" },
  ]

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">TIBOK</h1>
              <span className="text-xs text-gray-500 ml-1">®</span>
            </Link>
            <div className="hidden md:block">
              <p className="text-sm text-gray-600">{t.medicalExcellence}</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-700 hover:text-blue-600 font-medium">
                {t[link.labelKey]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/start-consultation">
              <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                {t.consultationButton}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
