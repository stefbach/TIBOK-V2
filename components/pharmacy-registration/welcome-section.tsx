"use client"

import { Store, LogIn, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface PharmacyWelcomeSectionProps {
  onRegisterClick: () => void
  onLoginClick: () => void
}

export function PharmacyWelcomeSection({ onRegisterClick, onLoginClick }: PharmacyWelcomeSectionProps) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.joinTibokNetworkTitle}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{t.joinTibokNetworkSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="items-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-blue-600 dark:text-blue-400 text-3xl" />
            </div>
            <CardTitle>{t.newPharmacyCardTitle}</CardTitle>
            <CardDescription>{t.newPharmacyCardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button onClick={onRegisterClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> {t.registerButtonText}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-green-600 dark:text-green-400 text-3xl" />
            </div>
            <CardTitle>{t.existingPharmacyCardTitle}</CardTitle>
            <CardDescription>{t.existingPharmacyCardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button onClick={onLoginClick} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <LogIn className="mr-2 h-4 w-4" /> {t.loginButtonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
