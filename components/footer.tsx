"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

export default function Footer() {
  const { language } = useLanguage()
  const t = translations[language]

  const quickLinks: { href: string; labelKey: TranslationKey }[] = [
    { href: "#services", labelKey: "navServices" },
    { href: "#tarifs", labelKey: "navPricing" },
    { href: "#apropos", labelKey: "navAbout" },
    { href: "#contact", labelKey: "navContact" },
  ]

  const legalLinks: { href: string; labelKey: TranslationKey }[] = [
    { href: "#", labelKey: "footerTerms" },
    { href: "#", labelKey: "footerPrivacy" },
    { href: "#", labelKey: "footerLegalNotice" },
  ]

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold">TIBOK</h3>
              <span className="text-xs ml-1">®</span>
            </div>
            <p className="text-gray-300 mb-4">{t.footerDescription}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t.footerQuickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {t[link.labelKey]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t.footerLegal}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link href={link.href} className="text-gray-300 hover:text-white">
                    {t[link.labelKey]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} TIBOK. {t.footerRights}
          </p>
        </div>
      </div>
    </footer>
  )
}
