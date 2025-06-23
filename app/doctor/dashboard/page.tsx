"use client"
import { useLanguage, type Language } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Star, Activity, Video, FileText, MessageSquare, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const getTranslation = (lang: Language, key: TranslationKey) => {
  return translations[lang]?.[key] || translations["en"]?.[key] || String(key)
}

// Mock data - replace with actual data fetching
const dashboardStats = [
  {
    id: "consultationsToday",
    value: "12",
    labelKey: "doctorDashboardStatsConsultationsToday",
    icon: CalendarDays,
    color: "text-blue-600",
  },
  {
    id: "waitingPatients",
    value: "3",
    labelKey: "doctorDashboardStatsWaitingPatients",
    icon: Clock,
    color: "text-green-600",
  },
  {
    id: "satisfactionRating",
    value: "4.8",
    labelKey: "doctorDashboardStatsSatisfactionRating",
    icon: Star,
    color: "text-purple-600",
  },
  {
    id: "averageTime",
    value: "18min",
    labelKey: "doctorDashboardStatsAverageTime",
    icon: Activity,
    color: "text-orange-600",
  },
]

const quickActions = [
  {
    id: "startConsultation",
    labelKey: "doctorDashboardActionStartConsultation",
    icon: Video,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "newPrescription",
    labelKey: "doctorDashboardActionNewPrescription",
    icon: FileText,
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "patientMessages",
    labelKey: "doctorDashboardActionPatientMessages",
    icon: MessageSquare,
    color: "bg-purple-600 hover:bg-purple-700",
  },
]

const recentPatients = [
  {
    id: "1",
    nameKey: "doctorDashboardPatientNamePlaceholder",
    avatarText: "JD",
    infoKey: "doctorDashboardPatientInfoPlaceholder",
    avatarBg: "bg-green-500",
  },
  {
    id: "2",
    nameKey: "doctorDashboardPatientNamePlaceholder",
    avatarText: "ML",
    infoKey: "doctorDashboardPatientInfoPlaceholder",
    avatarBg: "bg-red-500",
  }, // Using same placeholder for example
]

export default function DoctorDashboardPage() {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t("doctorDashboardWelcomeTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t("doctorDashboardWelcomeSubtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.id} className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(stat.labelKey)}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t("doctorDashboardQuickActionsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.id} className={`w-full ${action.color} text-white`}>
                <action.icon className="h-5 w-5 mr-2" />
                {t(action.labelKey)}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t("doctorDashboardRecentPatientsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?width=40&height=40&text=${patient.avatarText}&bg=${patient.avatarBg.substring(3)}`}
                    />
                    <AvatarFallback className={patient.avatarBg + " text-white"}>{patient.avatarText}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t(patient.nameKey)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(patient.infoKey)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Eye className="h-5 w-5" />
                  <span className="sr-only">{t("doctorDashboardViewPatient")}</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
