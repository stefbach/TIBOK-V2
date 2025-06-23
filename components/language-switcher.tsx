"use client"

import { Button } from "@/components/ui/button"
import { useLanguage, type Language } from "@/contexts/language-context"

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage()

  const handleSwitch = (lang: Language) => {
    setLanguage(lang)
  }

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={language === "fr" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleSwitch("fr")}
        className={`px-3 py-1 rounded text-sm font-medium ${
          language === "fr" ? "bg-blue-600 text-white hover:bg-blue-600/90" : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        FR
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleSwitch("en")}
        className={`px-3 py-1 rounded text-sm font-medium ${
          language === "en" ? "bg-blue-600 text-white hover:bg-blue-600/90" : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        EN
      </Button>
    </div>
  )
}

export { LanguageSwitcher }
export default LanguageSwitcher
