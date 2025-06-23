"use client"

import { useContext } from "react"
import { Map } from "lucide-react"
import { LanguageContext, translations } from "@/contexts/language-context"

export default function RealtimeActivityMapPlaceholder() {
  const { language } = useContext(LanguageContext)
  const t = translations[language].adminDashboard

  return (
    <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-6 text-center">
      <Map className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{t.mapPlaceholderTitle}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t.mapPlaceholderDesc}</p>
      <div className="mt-4 flex space-x-4">
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
          <span className="h-3 w-3 bg-yellow-400 rounded-full mr-1.5"></span>
          {t.mapLegendPreparing}
        </div>
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
          <span className="h-3 w-3 bg-blue-500 rounded-full mr-1.5"></span>
          {t.mapLegendInProgress}
        </div>
      </div>
    </div>
  )
}
