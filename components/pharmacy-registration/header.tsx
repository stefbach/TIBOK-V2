"use client"

import { HeartPulse } from "lucide-react"
import { useLanguage } from "@/contexts/language-context" // Assuming this path is correct
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Assuming this path is correct

export function PharmacyRegistrationHeader() {
  const { language, setLanguage, getTranslation } = useLanguage()

  const handleSetLanguage = (lang: "fr" | "en") => {
    setLanguage(lang)
  }

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <HeartPulse className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TIBOK</h1>
              <p className="text-blue-100">{translations[language].pharmacyPlatformTitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetLanguage("fr")}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium",
                language === "fr"
                  ? "bg-white text-blue-600 hover:bg-white/90"
                  : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white",
              )}
            >
              FR
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetLanguage("en")}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium",
                language === "en"
                  ? "bg-white text-blue-600 hover:bg-white/90"
                  : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white",
              )}
            >
              EN
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
