"use client"
import { useLanguage, type Language } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Mic, PhoneOff, ScreenShare, Info, AlertTriangle, ListChecks, Save } from "lucide-react"

const getTranslation = (lang: Language, key: TranslationKey) => {
  return translations[lang]?.[key] || translations["en"]?.[key] || String(key)
}

export default function VideoConsultationPage() {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t("doctorVideoConsultationTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t("doctorVideoConsultationSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardContent className="p-4 aspect-[16/9] bg-gray-900 dark:bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="mb-4">{t("doctorVideoConsultationRoomPlaceholder")}</p>
                <Button variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">
                  {t("doctorVideoConsultationJoinButton")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Controls */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full">
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button variant="destructive" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full">
                  <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full">
                  <ScreenShare className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Info & AI Assistant */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorVideoConsultationCurrentPatientTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg?width=50&height=50&text=PM" />
                  <AvatarFallback>PM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {t("doctorVideoConsultationPatientNameExample")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("doctorVideoConsultationPatientInfoExample")}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">
                    {t("doctorVideoConsultationReasonLabel")}
                  </strong>{" "}
                  <span className="text-gray-600 dark:text-gray-400">{t("doctorVideoConsultationReasonExample")}</span>
                </p>
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">
                    {t("doctorVideoConsultationHistoryLabel")}
                  </strong>{" "}
                  <span className="text-gray-600 dark:text-gray-400">{t("doctorVideoConsultationHistoryExample")}</span>
                </p>
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">
                    {t("doctorVideoConsultationAllergiesLabel")}
                  </strong>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("doctorVideoConsultationAllergiesExample")}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorVideoConsultationAIAssistantTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("doctorVideoConsultationAISuggestionExample")}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t("doctorVideoConsultationAIAlertExample")}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-start space-x-2">
                <ListChecks className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("doctorVideoConsultationAIDiagnosisExample")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorVideoConsultationQuickNotesTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t("doctorVideoConsultationQuickNotesPlaceholder")}
                className="resize-none"
                rows={4}
              />
              <Button className="mt-3 w-full">
                <Save className="h-4 w-4 mr-2" />
                {t("doctorVideoConsultationSaveButton")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
