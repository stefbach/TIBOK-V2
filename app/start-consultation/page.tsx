"use client"

import React, { useState, useEffect } from "react"
import {
  HeartPulse,
  Check,
  Search,
  UserIcon as UserMdIcon,
  FileIcon as FileMedical,
  BotIcon,
  Users,
  History,
  Lock,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LanguageSwitcher from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const stepsConfig = [
  { id: 1, labelKey: "step1Label" as TranslationKey },
  { id: 2, labelKey: "step2Label" as TranslationKey },
  { id: 3, labelKey: "step3Label" as TranslationKey },
  { id: 4, labelKey: "step4Label" as TranslationKey },
]

interface PricingOption {
  id: string
  titleKey: TranslationKey
  price: string
  descKey: TranslationKey
  featuresKeys: TranslationKey[]
  isPopular?: boolean
}

type AuthView = "signup" | "login"

export default function StartConsultationPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get("plan")

  const [currentStep, setCurrentStep] = useState(1)
  const { language } = useLanguage()
  const t = translations[language]

  // États d'authentification séparés pour éviter les conflits
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  
  const [authView, setAuthView] = useState<AuthView>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // État séparé pour éviter les conflits avec currentStep
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        
        if (session) {
          setIsUserLoggedIn(true)
          setUserEmail(session.user.email)
          // Ne changer l'étape que si on est encore à l'étape 1 et que la session vient d'être vérifiée
          if (currentStep === 1 && !sessionChecked) {
            setCurrentStep(2)
          }
        } else {
          setIsUserLoggedIn(false)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error)
        setIsUserLoggedIn(false)
      } finally {
        setSessionChecked(true)
      }
    }

    if (!sessionChecked) {
      checkUserSession()
    }

    // Écoute les changements d'authentification
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.email)
      
      if (event === "SIGNED_IN" && session) {
        setIsUserLoggedIn(true)
        setUserEmail(session.user.email)
        setAuthError(null)
        setSignupSuccessMessage(null)
        // Passer à l'étape suivante seulement si on est à l'étape d'auth
        if (currentStep === 1) {
          setCurrentStep(2)
        }
      } else if (event === "SIGNED_OUT") {
        setIsUserLoggedIn(false)
        setUserEmail(undefined)
        if (currentStep > 1) {
          setCurrentStep(1)
        }
      }
    })

    return () => {
      authListener?.unsubscribe?.()
    }
  }, [supabase, currentStep, sessionChecked])

  const pricingOptions: PricingOption[] = [
    {
      id: "payperuse-local",
      titleKey: "pricingPayPerUseLocalTitle",
      price: t.pricingPayPerUseLocalPrice,
      descKey: "pricingPayPerUseLocalDesc",
      featuresKeys: ["pricingPayPerUseLocalFeat1", "pricingPayPerUseLocalFeat2", "pricingPayPerUseLocalFeat3"],
    },
    {
      id: "payperuse-tourist",
      titleKey: "pricingPayPerUseTouristTitle",
      price: t.pricingPayPerUseTouristPrice,
      descKey: "pricingPayPerUseTouristDesc",
      featuresKeys: ["pricingPayPerUseTouristFeat1", "pricingPayPerUseTouristFeat2", "pricingPayPerUseTouristFeat3"],
    },
    {
      id: "solo",
      titleKey: "pricingSoloPackTitle",
      price: t.pricingSoloPackPrice,
      descKey: "pricingSoloPackDesc",
      featuresKeys: ["pricingSoloPackFeat1", "pricingSoloPackFeat2", "pricingSoloPackFeat3"],
    },
    {
      id: "family",
      titleKey: "pricingFamilyPackTitle",
      price: t.pricingFamilyPackPrice,
      descKey: "pricingFamilyPackDesc",
      featuresKeys: [
        "pricingFamilyPackFeat1",
        "pricingFamilyPackFeat2",
        "pricingFamilyPackFeat3",
        "pricingFamilyPackFeat4",
      ],
      isPopular: true,
    },
  ]

  const [selectedPricing, setSelectedPricing] = useState<string | null>(
    initialPlan && pricingOptions.some((p) => p.id === initialPlan) ? initialPlan : null,
  )

  useEffect(() => {
    if (initialPlan && pricingOptions.some((p) => p.id === initialPlan)) {
      setSelectedPricing(initialPlan)
    }
  }, [initialPlan])

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)
    setSignupSuccessMessage(null)

    // Utiliser les bonnes variables selon l'onglet actif
    const email = authView === "signup" ? signupEmail : loginEmail
    const password = authView === "signup" ? signupPassword : loginPassword

    try {
      if (authView === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/start-consultation`,
          },
        })
        
        if (error) {
          setAuthError(error.message)
        } else if (data.user && data.user.identities?.length === 0) {
          setAuthError(t.authErrorUserExistsOrUnconfirmed)
        } else if (data.session) {
          // Auto-confirmé et connecté
          console.log("Utilisateur inscrit et connecté")
        } else if (data.user) {
          // Email de confirmation envoyé
          setSignupSuccessMessage(t.authSuccessSignup)
        } else {
          setAuthError(t.authErrorGeneric)
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        
        if (error) {
          setAuthError(error.message)
        } else if (data.session) {
          console.log("Utilisateur connecté")
        } else {
          setAuthError(t.authErrorInvalidLogin)
        }
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error)
      setAuthError(t.authErrorGeneric)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setAuthView(value as AuthView)
    setAuthError(null)
    setSignupSuccessMessage(null)
    // Optionnel: réinitialiser les champs
    // setLoginEmail(""); setLoginPassword("");
    // setSignupEmail(""); setSignupPassword("");
  }

  const secondOpinionFeatures = [
    {
      icon: <Search className="text-blue-600 text-xl mb-2" />,
      titleKey: "secondOpinionSearchSpecialist" as TranslationKey,
      descKey: "secondOpinionSearchSpecialistDesc" as TranslationKey,
    },
    {
      icon: <UserMdIcon className="text-blue-600 text-xl mb-2" />,
      titleKey: "secondOpinionExpertConsultation" as TranslationKey,
      descKey: "secondOpinionExpertConsultationDesc" as TranslationKey,
    },
    {
      icon: <FileMedical className="text-blue-600 text-xl mb-2" />,
      titleKey: "secondOpinionDetailedReport" as TranslationKey,
      descKey: "secondOpinionDetailedReportDesc" as TranslationKey,
    },
  ]

  const successDashboardLinks = [
    {
      icon: <Users className="text-blue-600 text-xl mb-2" />,
      titleKey: "waitingRoomTitle" as TranslationKey,
      descKey: "waitingRoomDesc" as TranslationKey,
    },
    {
      icon: <History className="text-blue-600 text-xl mb-2" />,
      titleKey: "historyTitle" as TranslationKey,
      descKey: "historyDesc" as TranslationKey,
    },
    {
      icon: <UserMdIcon className="text-blue-600 text-xl mb-2" />,
      titleKey: "secondOpinionLinkTitle" as TranslationKey,
      descKey: "secondOpinionLinkDesc" as TranslationKey,
    },
    {
      icon: <BotIcon className="text-blue-600 text-xl mb-2" />,
      titleKey: "tibotTitle" as TranslationKey,
      descKey: "tibotDesc" as TranslationKey,
    },
  ]

  const handleNextStep = async () => {
    if (currentStep === 3) {
      setIsLoading(true)
      setAuthError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && firstName && lastName) {
        const fullName = `${firstName} ${lastName}`
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq("id", user.id)

        if (profileError) {
          setAuthError(`Erreur lors de la mise à jour du profil: ${profileError.message}`)
          setIsLoading(false)
          return
        }
      }
      setIsLoading(false)
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 4) {
      setCurrentStep(5)
    }
  }

  const handleSelectPricing = (id: string) => {
    setSelectedPricing(id)
  }

  const getSelectedPlanInfo = () => {
    if (!selectedPricing) return ""
    const plan = pricingOptions.find((p) => p.id === selectedPricing)
    if (!plan) return ""
    return `${t[plan.titleKey]} - ${plan.price}${plan.descKey !== "pricingPayPerUseLocalDesc" && plan.descKey !== "pricingPayPerUseTouristDesc" ? t[plan.descKey] : ""}`
  }

  // Fonction pour obtenir le label dynamique de l'étape 1
  const getStep1Label = () => {
    if (isUserLoggedIn) return t.step1Label
    return authView === "login" ? t.authLoginTitle : t.authSignupTitle
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <HeartPulse className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  TIBOK<sup className="text-xs">®</sup>
                </h1>
                <p className="text-sm text-gray-600">{t.startConsultationBaseline}</p>
              </div>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {stepsConfig.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                        currentStep >= step.id ? "bg-blue-700" : "bg-gray-400"
                      }`}
                    >
                      {currentStep > step.id ? <Check size={18} /> : step.id}
                    </div>
                    <span
                      className={`ml-0 sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-medium ${currentStep >= step.id ? "text-blue-700" : "text-gray-500"}`}
                    >
                      {step.id === 1 ? getStep1Label() : t[step.labelKey]}
                    </span>
                  </div>
                  {index < stepsConfig.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 max-w-[3rem] sm:max-w-[4rem]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Login / Signup */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.authWelcomeTitle || "Connexion / Inscription"}</CardTitle>
              <CardDescription>{t.authWelcomeDesc || "Connectez-vous ou créez un compte pour continuer"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md mx-auto">
              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                  <span className="block sm:inline">{authError}</span>
                </div>
              )}
              {signupSuccessMessage && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <Check className="inline-block mr-2 h-5 w-5" />
                  <span className="block sm:inline">{signupSuccessMessage}</span>
                </div>
              )}

              <Tabs value={authView} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="text-black data-[state=active]:text-black">{t.authLoginTitle}</TabsTrigger>
                  <TabsTrigger value="signup" className="text-black data-[state=active]:text-black">{t.authSignupTitle}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleEmailAuth} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="login-email">{t.emailLabel}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">{t.passwordLabel}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Validation
                        </>
                      ) : (
                        "Validation"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleEmailAuth} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="signup-email">{t.emailLabel}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">{t.passwordLabel}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Validation
                        </>
                      ) : (
                        "Validation"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pricing Selection */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.pricingSelectionTitle}</CardTitle>
              <CardDescription>{t.pricingSelectionSubtitle}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {pricingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-[-2px] ${
                      selectedPricing === option.id ? "border-blue-700 bg-blue-500/5" : "border-gray-200"
                    }`}
                    onClick={() => handleSelectPricing(option.id)}
                  >
                    <div className="text-center">
                      {option.isPopular && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 inline-block">
                          {t.pricingPopularBadge}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                        {t[option.titleKey]}
                      </h3>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">{option.price}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">{t[option.descKey]}</p>
                      <ul className="text-xs text-gray-600 space-y-1 text-left">
                        {option.featuresKeys.map((featKey) => (
                          <li key={featKey} className="flex items-start">
                            <Check size={14} className="mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{t[featKey]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
                  {t.secondOpinionServiceTitle}
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <h4 className="font-semibold text-gray-900">{t.secondOpinionSubtitle}</h4>
                      <p className="text-sm text-gray-600">{t.secondOpinionDesc}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{t.secondOpinionPriceDetails}</div>
                      <p className="text-sm text-gray-600">{t.secondOpinionPriceCondition}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {secondOpinionFeatures.map((feature) => (
                      <div key={feature.titleKey} className="text-center p-4 bg-white rounded-lg shadow-sm">
                        {feature.icon}
                        <h5 className="font-medium text-gray-900 text-sm">{t[feature.titleKey]}</h5>
                        <p className="text-xs text-gray-600">{t[feature.descKey]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button onClick={handleNextStep} className="px-8 py-3 text-base" disabled={!selectedPricing}>
                  {t.continueButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Patient Information */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.patientInfoTitle}</CardTitle>
              <CardDescription>{t.patientInfoSubtitle}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {authError && currentStep === 3 && (
                <div
                  className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                  <span className="block sm:inline">{authError}</span>
                </div>
              )}
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">{t.firstNameLabel}</Label>
                    <Input
                      id="firstName"
                      placeholder={t.firstNameLabel}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastNameLabel}</Label>
                    <Input
                      id="lastName"
                      placeholder={t.lastNameLabel}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email-patient">{t.emailLabel}</Label>
                    <Input
                      id="email-patient"
                      type="email"
                      placeholder="email@example.com"
                      defaultValue={userEmail || ""}
                      readOnly={!!userEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.phoneLabel}</Label>
                    <Input id="phone" type="tel" placeholder="+230 5xxx xxxx" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="birthDate">{t.birthDateLabel}</Label>
                    <Input id="birthDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="weight">{t.weightLabel}</Label>
                    <Input id="weight" type="number" placeholder="70" />
                  </div>
                  <div>
                    <Label htmlFor="height">{t.heightLabel}</Label>
                    <Input id="height" type="number" placeholder="170" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicalHistory">{t.medicalHistoryLabel}</Label>
                  <Textarea id="medicalHistory" placeholder={`${t.medicalHistoryLabel}...`} />
                </div>
                <div>
                  <Label>{t.currentTreatmentLabel}</Label>
                  <RadioGroup defaultValue="no" className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="treatment-yes" />
                      <Label htmlFor="treatment-yes">{t.treatmentYes}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="treatment-no" />
                      <Label htmlFor="treatment-no">{t.treatmentNo}</Label>
                    </div>
                  </RadioGroup>
                  <Textarea className="mt-2" placeholder={`${t.currentTreatmentLabel} (si oui)...`} />
                </div>
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={handleNextStep} 
                    className="px-8 py-3 text-base" 
                    disabled={isLoading || !firstName || !lastName}
                  >
                    {isLoading && currentStep === 3 ? <Loader2 className="animate-spin mr-2" /> : null}
                    {t.continueButton}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.paymentStepTitle}</CardTitle>
              <CardDescription>{t.paymentStepSubtitle}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent className="max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">{t.paymentMethodsAcceptedTitle}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-sm">
                    <HeartPulse className="text-blue-600 mr-2" size={20} /> Visa
                  </div>
                  <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-sm">
                    <HeartPulse className="text-red-600 mr-2" size={20} /> Mastercard
                  </div>
                  <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-sm">
                    <HeartPulse className="text-blue-600 mr-2" size={20} /> PayPal
                  </div>
                  <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-sm">
                    <HeartPulse className="text-green-600 mr-2" size={20} /> Juice MCB
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">{t.cardNumberLabel}</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">{t.expiryLabel}</Label>
                    <Input id="expiryDate" placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t.cvvLabel}</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardHolderName">{t.cardholderNameLabel}</Label>
                  <Input id="cardHolderName" placeholder={t.cardholderNameLabel} />
                </div>
              </form>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{t.selectedPlanLabel}</span>
                  <span className="font-bold text-blue-600">{getSelectedPlanInfo()}</span>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <Button onClick={handleNextStep} className="w-full px-6 py-3 text-base font-medium">
                  {t.completeRegistrationButton}
                </Button>
                <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                  <Lock size={12} className="mr-1" /> {t.securePaymentText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Success Message */}
        {currentStep === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <CardTitle className="text-2xl">{t.registrationSuccessTitle}</CardTitle>
              <CardDescription>{t.registrationSuccessMessage}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {successDashboardLinks.map((link) => (
                  <div key={link.titleKey} className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                    {link.icon}
                    <h3 className="font-medium text-gray-900 text-sm">{t[link.titleKey]}</h3>
                    <p className="text-xs text-gray-600">{t[link.descKey]}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Link href="/dashboard" passHref>
                  <Button className="px-8 py-3 text-base font-medium">{t.goToDashboardButton}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
