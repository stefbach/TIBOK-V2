"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Headset, Percent, Zap, CircleDot, Loader2, MailWarning } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { translations } from "@/lib/translations"

interface PharmacyRegistrationSuccessPageProps {
  onGoToDashboard: () => void
}

interface Stat {
  icon: React.ElementType
  titleKey: "pharmacyRegStatSupport" | "pharmacyRegStatFees" | "pharmacyRegStatProcessing"
  valueKey: string // Not used for now, but could be for dynamic values
}

interface NextStep {
  titleKey: "pharmacyRegStep1Verify" | "pharmacyRegStep2Profile" | "pharmacyRegStep3Training"
  statusKey: "pharmacyRegStep1Status" | "pharmacyRegStep2Status" | "pharmacyRegStep3Status"
  statusType: "pending" | "inProgress" | "completed" | "actionRequired"
}

export function PharmacyRegistrationSuccessPage({ onGoToDashboard }: PharmacyRegistrationSuccessPageProps) {
  const { language } = useLanguage()
  const t = translations[language]
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats: Stat[] = [
    { icon: Headset, titleKey: "pharmacyRegStatSupport", valueKey: "" },
    { icon: Percent, titleKey: "pharmacyRegStatFees", valueKey: "" },
    { icon: Zap, titleKey: "pharmacyRegStatProcessing", valueKey: "" },
  ]

  const nextSteps: NextStep[] = [
    { titleKey: "pharmacyRegStep1Verify", statusKey: "pharmacyRegStep1Status", statusType: "inProgress" },
    { titleKey: "pharmacyRegStep2Profile", statusKey: "pharmacyRegStep2Status", statusType: "actionRequired" },
    { titleKey: "pharmacyRegStep3Training", statusKey: "pharmacyRegStep3Status", statusType: "pending" },
  ]

  const getStatusIcon = (statusType: NextStep["statusType"]) => {
    switch (statusType) {
      case "pending":
        return <CircleDot className="h-5 w-5 text-gray-500" />
      case "inProgress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "actionRequired":
        return <MailWarning className="h-5 w-5 text-yellow-500" /> // Or AlertTriangle
      default:
        return <CircleDot className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (statusType: NextStep["statusType"]) => {
    switch (statusType) {
      case "pending":
        return "text-gray-600 dark:text-gray-400"
      case "inProgress":
        return "text-blue-600 dark:text-blue-400"
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "actionRequired":
        return "text-yellow-600 dark:text-yellow-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div
      className={cn(
        "container mx-auto px-4 py-12 max-w-2xl transition-all duration-700 ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
    >
      <div className="flex flex-col items-center text-center mb-12">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">{t.pharmacyRegSuccessTitle}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{t.pharmacyRegWelcomeMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <Card key={stat.titleKey} className="shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{t[stat.titleKey]}</CardTitle>
              <stat.icon className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              {/* Placeholder for potential dynamic values if needed later */}
              {/* <div className="text-2xl font-bold">{stat.valueKey ? getTranslation(stat.valueKey) : ''}</div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-center mb-12 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">{t.pharmacyRegNextStepsTitle}</h2>
        <Button
          onClick={onGoToDashboard}
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          {t.pharmacyRegCtaButton}
        </Button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t.pharmacyRegNextStepsTitle}</h3>
        <ul className="space-y-4">
          {nextSteps.map((step) => (
            <li key={step.titleKey} className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
              {getStatusIcon(step.statusType)}
              <div className="ml-4 flex-grow">
                <p className="font-medium text-gray-800 dark:text-gray-100">{t[step.titleKey]}</p>
                <p className={cn("text-sm", getStatusColor(step.statusType))}>{t[step.statusKey]}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
