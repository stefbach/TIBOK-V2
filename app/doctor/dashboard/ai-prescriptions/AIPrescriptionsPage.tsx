"use client"

import { useState } from "react"
import { useLanguage, type Language } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, FileText, AlertTriangle, CheckCircle } from "lucide-react"

const getTranslation = (lang: Language, key: TranslationKey) => {
  return translations[lang]?.[key] || translations["en"]?.[key] || String(key)
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface Props {
  initialPrescription?: Medication[]
}

export default function AIPrescriptionsPage({ initialPrescription = [] }: Props) {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("")
  const [currentPrescription, setCurrentPrescription] = useState<Medication[]>(initialPrescription)
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")

  const handleAddMedication = () => {
    if (medicationName && dosage && frequency && duration) {
      setCurrentPrescription([...currentPrescription, { name: medicationName, dosage, frequency, duration }])
      setMedicationName("")
      setDosage("")
      setDuration("")
    }
  }

  const diagnosisOptions = [
    { value: "headache", labelKey: "doctorAIPrescriptionDiagnosisHeadache" },
    { value: "hypertension", labelKey: "doctorAIPrescriptionDiagnosisHypertension" },
    { value: "infection", labelKey: "doctorAIPrescriptionDiagnosisInfection" },
    { value: "diabetes", labelKey: "doctorAIPrescriptionDiagnosisDiabetes" },
  ]

  const frequencyOptions = [
    { value: "1/day", labelKey: "doctorAIPrescriptionFrequencyOnceDaily" },
    { value: "2/day", labelKey: "doctorAIPrescriptionFrequencyTwiceDaily" },
    { value: "3/day", labelKey: "doctorAIPrescriptionFrequencyThriceDaily" },
    { value: "asneeded", labelKey: "doctorAIPrescriptionFrequencyAsNeeded" },
  ]

  const getAISuggestions = () => {
    if (selectedDiagnosis === "headache") {
      return language === "fr"
        ? t("doctorAIPrescriptionSuggestionHeadacheFR")
        : t("doctorAIPrescriptionSuggestionHeadacheEN")
    }
    if (selectedDiagnosis === "hypertension") {
      return language === "fr"
        ? t("doctorAIPrescriptionSuggestionHypertensionFR")
        : t("doctorAIPrescriptionSuggestionHypertensionEN")
    }
    return `<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">${t("doctorAIPrescriptionAISuggestionsDefaultText")}</div>`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t("doctorAIPrescriptionTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t("doctorAIPrescriptionSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t("doctorAIPrescriptionNewPrescriptionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="diagnosis-select">{t("doctorAIPrescriptionDiagnosisLabel")}</Label>
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger id="diagnosis-select">
                  <SelectValue placeholder={t("doctorAIPrescriptionSelectDiagnosis")} />
                </SelectTrigger>
                <SelectContent>
                  {diagnosisOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medication-search">{t("doctorAIPrescriptionSearchMedicationLabel")}</Label>
              <Input
                id="medication-search"
                placeholder={t("doctorAIPrescriptionSearchMedicationPlaceholder")}
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">{t("doctorAIPrescriptionDosageLabel")}</Label>
                <Input
                  id="dosage"
                  placeholder={t("doctorAIPrescriptionDosagePlaceholder")}
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="frequency-select">{t("doctorAIPrescriptionFrequencyLabel")}</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency-select">
                    <SelectValue placeholder={t("doctorAIPrescriptionFrequencyLabel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">{t("doctorAIPrescriptionDurationLabel")}</Label>
              <Input
                id="duration"
                placeholder={t("doctorAIPrescriptionDurationPlaceholder")}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleAddMedication}>
              <PlusCircle className="h-5 w-5 mr-2" />
              {t("doctorAIPrescriptionAddMedicationButton")}
            </Button>
          </CardContent>
        </Card>

        {/* AI Suggestions & Verifications */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorAIPrescriptionAISuggestionsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: getAISuggestions() }} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorAIPrescriptionAIVerificationsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {t("doctorAIPrescriptionAIVerifNoInteractions")}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {t("doctorAIPrescriptionAIVerifDosageAppropriate")}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t("doctorAIPrescriptionAIVerifCheckAllergy")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("doctorAIPrescriptionCurrentPrescriptionTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentPrescription.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("doctorAIPrescriptionNoMedicationsAdded")}
                </p>
              ) : (
                currentPrescription.map((med, index) => (
                  <div key={index} className="p-2 border dark:border-gray-700 rounded-md text-sm">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {med.dosage}, {med.frequency}, {med.duration}
                    </p>
                  </div>
                ))
              )}
              <Button className="w-full mt-4">
                <FileText className="h-5 w-5 mr-2" />
                {t("doctorAIPrescriptionGenerateButton")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
