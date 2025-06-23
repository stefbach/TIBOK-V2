"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage, type Language } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Heart, UploadCloud, ArrowRight, ArrowLeft, CheckCircle2, Info, Check } from "lucide-react"
import Link from "next/link" // Import Link for internal navigation
import { useRouter } from "next/navigation" // Import useRouter for redirection

// Helper to get translations
const getTranslation = (lang: Language, key: TranslationKey) => {
  return translations[lang][key] || translations["en"][key] || key
}

// Doctor Page Header Component
const DoctorPageHeader = () => {
  const { language, setLanguage } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TIBOK</h1>
              <p className="text-sm text-gray-600">{t("doctorAccessPageBaseline")}</p>
            </div>
          </Link>

          <div className="flex space-x-2">
            <Button
              variant={language === "fr" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("fr")}
              className={language === "fr" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              FR
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className={language === "en" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              EN
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Login Form Component
const LoginForm = () => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login
    console.log("Attempting login...")
    setTimeout(() => {
      alert(t("doctorLoginButton") + " successful! Redirecting to dashboard...") // Simple alert for now
      router.push("/doctor/dashboard") // Redirect to a placeholder dashboard
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t("doctorLoginTitle")}</CardTitle>
        <CardDescription>{t("doctorAccessSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorLoginProfessionalEmail")}
            </label>
            <Input type="email" id="email-login" placeholder="dr.nom@exemple.com" required />
          </div>
          <div>
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorLoginPassword")}
            </label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} id="password-login" required />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox id="remember-me" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                {t("doctorLoginRememberMe")}
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
              {t("doctorLoginForgotPassword")}
            </a>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {t("doctorLoginButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Registration Form Components
const RegistrationStep1 = ({ onNext }: { onNext: () => void }) => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t("doctorRegisterPersonalInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            onNext()
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                {t("doctorRegisterFirstName")}
              </label>
              <Input id="firstName" required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                {t("doctorRegisterLastName")}
              </label>
              <Input id="lastName" required />
            </div>
          </div>
          <div>
            <label htmlFor="profEmail" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterProfessionalEmail")}
            </label>
            <Input type="email" id="profEmail" required />
          </div>
          <div>
            <label htmlFor="phoneReg" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterPhone")}
            </label>
            <Input type="tel" id="phoneReg" placeholder="+230 XXXX XXXX" required />
          </div>
          <div>
            <label htmlFor="mcmNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterMedicalCouncilNumber")}
            </label>
            <Input id="mcmNumber" placeholder={t("doctorRegisterMedicalCouncilNumberPlaceholder")} required />
            <p className="text-xs text-gray-500 mt-1">{t("doctorRegisterMedicalCouncilNumberHelp")}</p>
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterMainSpecialty")}
            </label>
            <Select required>
              <SelectTrigger id="specialty">
                <SelectValue placeholder={t("doctorRegisterSelectSpecialty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">{t("doctorRegisterSpecialtyGeneral")}</SelectItem>
                <SelectItem value="cardiology">{t("doctorRegisterSpecialtyCardiology")}</SelectItem>
                <SelectItem value="dermatology">{t("doctorRegisterSpecialtyDermatology")}</SelectItem>
                <SelectItem value="pediatrics">{t("doctorRegisterSpecialtyPediatrics")}</SelectItem>
                <SelectItem value="psychiatry">{t("doctorRegisterSpecialtyPsychiatry")}</SelectItem>
                <SelectItem value="other">{t("doctorRegisterSpecialtyOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterYearsExperience")}
            </label>
            <Select required>
              <SelectTrigger id="experience">
                <SelectValue placeholder={t("doctorRegisterSelectExperience")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">{t("doctorRegisterExperience02")}</SelectItem>
                <SelectItem value="3-5">{t("doctorRegisterExperience35")}</SelectItem>
                <SelectItem value="6-10">{t("doctorRegisterExperience610")}</SelectItem>
                <SelectItem value="10+">{t("doctorRegisterExperience10plus")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("doctorRegisterLanguagesSpoken")}</label>
            <div className="space-y-2">
              {[
                { id: "langFr", labelKey: "doctorRegisterLanguageFrench", defaultChecked: true },
                { id: "langEn", labelKey: "doctorRegisterLanguageEnglish", defaultChecked: true },
                { id: "langCr", labelKey: "doctorRegisterLanguageCreole" },
                { id: "langHi", labelKey: "doctorRegisterLanguageHindi" },
              ].map((lang) => (
                <div key={lang.id} className="flex items-center">
                  <Checkbox id={lang.id} defaultChecked={lang.defaultChecked} />
                  <label htmlFor={lang.id} className="ml-2 text-sm text-gray-700">
                    {t(lang.labelKey as TranslationKey)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {t("doctorRegisterNextButton")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const FileUploadZone = ({ label, helpText, id }: { label: string; helpText: string; id: string }) => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>{t("doctorRegisterChooseFile")}</span>
              <input id={id} name={id} type="file" className="sr-only" />
            </label>
            <p className="pl-1">{t("doctorRegisterDragDropDegree").split("ou")[0]} ou...</p>{" "}
            {/* Simplified drag/drop text */}
          </div>
          <p className="text-xs text-gray-500">{helpText}</p>
        </div>
      </div>
    </div>
  )
}

const RegistrationStep2 = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t("doctorRegisterRequiredDocsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            onNext()
          }}
        >
          <FileUploadZone
            id="medicalDegree"
            label={t("doctorRegisterMedicalDegree")}
            helpText={t("doctorRegisterFileFormats")}
          />
          <FileUploadZone
            id="mcmCert"
            label={t("doctorRegisterMedicalCouncilCert")}
            helpText={t("doctorRegisterFileFormats")}
          />
          <FileUploadZone
            id="specialtyCerts"
            label={t("doctorRegisterSpecialtyCerts")}
            helpText={t("doctorRegisterMultipleFilesAccepted")}
          />
          <FileUploadZone
            id="profilePhoto"
            label={t("doctorRegisterProfilePhoto")}
            helpText={t("doctorRegisterPhotoFormats")}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("doctorRegisterPreviousButton")}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {t("doctorRegisterNextButton")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const RegistrationStep3 = ({ onPrev, onSubmit }: { onPrev: () => void; onSubmit: () => void }) => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t("doctorRegisterValidationFinalizationTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">{t("doctorRegisterTermsOfUseTitle")}</h4>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
              <p>{t("doctorRegisterTermsPreamble")}</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t("doctorRegisterTerm1")}</li>
                <li>{t("doctorRegisterTerm2")}</li>
                <li>{t("doctorRegisterTerm3")}</li>
                <li>{t("doctorRegisterTerm4")}</li>
                <li>{t("doctorRegisterTerm5")}</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: "acceptTerms", labelKey: "doctorRegisterAcceptTerms" },
              { id: "certifyInfo", labelKey: "doctorRegisterCertifyInfo" },
              { id: "authorizeVerification", labelKey: "doctorRegisterAuthorizeVerification" },
            ].map((item) => (
              <div key={item.id} className="flex items-start">
                <Checkbox id={item.id} required className="mt-0.5" />
                <label htmlFor={item.id} className="ml-3 text-sm text-gray-700">
                  {t(item.labelKey as TranslationKey)}
                </label>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="createPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterCreatePassword")}
            </label>
            <Input type="password" id="createPassword" minLength={8} required />
            <p className="text-xs text-gray-500 mt-1">{t("doctorRegisterPasswordHelp")}</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctorRegisterConfirmPassword")}
            </label>
            <Input type="password" id="confirmPassword" required />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">{t("doctorRegisterValidationProcessTitle")}</h4>
                <p className="text-sm text-blue-700 mt-1">{t("doctorRegisterValidationProcessInfo")}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("doctorRegisterPreviousButton")}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {t("doctorRegisterCreateAccountButton")} <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const RegistrationForm = ({ onRegistrationSubmit }: { onRegistrationSubmit: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  const steps = [
    { id: 1, labelKey: "doctorRegisterStep1" },
    { id: 2, labelKey: "doctorRegisterStep2" },
    { id: 3, labelKey: "doctorRegisterStep3" },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
              <div className={`flex items-center ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${currentStep >= step.id ? "bg-blue-600 text-white border-blue-600" : "bg-gray-200 border-gray-300"}`}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}
                >
                  {t(step.labelKey as TranslationKey)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && <RegistrationStep1 onNext={() => setCurrentStep(2)} />}
      {currentStep === 2 && <RegistrationStep2 onNext={() => setCurrentStep(3)} onPrev={() => setCurrentStep(1)} />}
      {currentStep === 3 && <RegistrationStep3 onPrev={() => setCurrentStep(2)} onSubmit={onRegistrationSubmit} />}
    </div>
  )
}

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-lg font-medium">{t("doctorRegisterSuccessModalTitle")}</DialogTitle>
          <DialogDescription className="mt-2 px-2 text-sm text-gray-500">
            {t("doctorRegisterSuccessModalMessage")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
            {t("doctorRegisterSuccessModalUnderstood")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DoctorAccessPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const { language } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)

  const handleRegistrationSuccess = () => {
    setIsSuccessModalOpen(true)
  }

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false)
    setActiveTab("login") // Switch to login tab after closing modal
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100">
      <DoctorPageHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
            <TabsTrigger value="login">{t("doctorLoginTab")}</TabsTrigger>
            <TabsTrigger value="register">{t("doctorRegisterTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-8">
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("doctorLoginNewDoctor")}{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-500 font-medium"
                  onClick={() => setActiveTab("register")}
                >
                  {t("doctorLoginCreateAccount")}
                </Button>
              </p>
            </div>
          </TabsContent>
          <TabsContent value="register" className="mt-8">
            <RegistrationForm onRegistrationSubmit={handleRegistrationSuccess} />
          </TabsContent>
        </Tabs>
      </div>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} />
    </div>
  )
}
