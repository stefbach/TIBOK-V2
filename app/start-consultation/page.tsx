"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const [authView, setAuthView] = useState<AuthView>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const [authError, setAuthError] = useState<string | null>(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [patientDateOfBirth, setPatientDateOfBirth] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [patientPhoneNumber, setPatientPhoneNumber] = useState("")
  const [patientAddress, setPatientAddress] = useState("")
  const [patientCity, setPatientCity] = useState("")
  const [patientCountry, setPatientCountry] = useState("")
  const [patientEmergencyContactName, setPatientEmergencyContactName] = useState("")
  const [patientEmergencyContactPhone, setPatientEmergencyContactPhone] = useState("")

  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState<string | null>(null)

  const createUserProfile = useCallback(
    async (userId: string, email: string) => {
      try {
        console.log("StartConsultationPage: createUserProfile called for userId:", userId)
        const { error } = await supabase.from("profiles").insert([{ id: userId, full_name: "" }])
        if (error) console.error("StartConsultationPage: Erreur lors de la création du profil:", error)
        else console.log("StartConsultationPage: Profil utilisateur créé avec succès pour userId:", userId)
      } catch (error) {
        console.error("StartConsultationPage: Exception lors de la création du profil:", error)
      }
    },
    [supabase],
  )

  const ensureUserProfile = useCallback(
    async (userId: string, email: string) => {
      try {
        console.log("StartConsultationPage: ensureUserProfile called for userId:", userId)
        const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).single()
        if (error && error.code === "PGRST116") {
          console.log("StartConsultationPage: Profil non trouvé pour userId:", userId, "Tentative de création.")
          await createUserProfile(userId, email)
        } else if (error) {
          console.error("StartConsultationPage: Erreur lors de la vérification du profil pour userId:", userId, error)
        } else {
          console.log("StartConsultationPage: Profil existant trouvé pour userId:", userId, data)
        }
      } catch (error) {
        console.error("StartConsultationPage: Exception lors de la vérification du profil pour userId:", userId, error)
      }
    },
    [supabase, createUserProfile],
  )

  useEffect(() => {
    console.log(
      "StartConsultationPage: useEffect for onAuthStateChange MOUNTED. Initial isCheckingSession:",
      isCheckingSession,
      "Initial currentStep:",
      currentStep,
    )

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "%cStartConsultationPage: onAuthStateChange TRIGGERED",
        "color: blue; font-weight: bold;",
        "Event:",
        event,
        "Session:",
        session ? `Exists (User ID: ${session.user.id})` : "Null",
      )

      if (session) {
        console.log("StartConsultationPage: Session DETECTED. User ID:", session.user.id, "Email:", session.user.email)
        setIsUserLoggedIn(true)
        setUserEmail(session.user.email)

        await ensureUserProfile(session.user.id, session.user.email || "")
        console.log("StartConsultationPage: User profile ensured for", session.user.id)

        try {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle()

          if (patientError) {
            console.error("StartConsultationPage: Error checking patient data (production log):", patientError)
            setCurrentStep(2)
          } else if (patientData) {
            console.log("StartConsultationPage: Patient data FOUND (production log). Redirecting to /dashboard.")
            router.push("/dashboard")
          } else {
            console.log("StartConsultationPage: NO patient data (production log). Setting currentStep to 2.")
            setCurrentStep(2)
          }
        } catch (e) {
          console.error("StartConsultationPage: CATCH block for patient data check (production log):", e)
          setCurrentStep(2)
        }
      } else {
        console.log("StartConsultationPage: NO session detected (production log). Event:", event)
        setIsUserLoggedIn(false)
        setUserEmail(undefined)
        console.log("StartConsultationPage: Setting currentStep to 1 (Auth/Login step) (production log).")
        setCurrentStep(1)
      }
      console.log(
        "%cStartConsultationPage: Setting isCheckingSession to false (production log).",
        "color: green; font-weight: bold;",
      )
      setIsCheckingSession(false)
    })

    return () => {
      console.log(
        "StartConsultationPage: useEffect for onAuthStateChange UNMOUNTING (production log). Cleaning up listener.",
      )
      subscription.unsubscribe()
    }
  }, [supabase, router, ensureUserProfile])

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

  const [selectedPricing, setSelectedPricing] = useState<string | null>(null)

  useEffect(() => {
    if (initialPlan && pricingOptions.some((p) => p.id === initialPlan)) {
      console.log("StartConsultationPage: Initial plan from URL:", initialPlan)
      setSelectedPricing(initialPlan)
    } else if (initialPlan) {
      console.warn("StartConsultationPage: Initial plan from URL not found in pricingOptions:", initialPlan)
    }
  }, [initialPlan, t])

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)
    setSignupSuccessMessage(null)
    const email = authView === "signup" ? signupEmail : loginEmail
    const password = authView === "signup" ? signupPassword : loginPassword
    console.log(
      `StartConsultationPage: handleEmailAuth called (production log). View: ${authView}, Email: ${email.substring(0, 3)}...`,
    )

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
          console.error("StartConsultationPage: Signup error (production log):", error)
          setAuthError(
            error.message.includes("User already registered")
              ? "Un compte avec cet email existe déjà. Essayez de vous connecter."
              : `Erreur d'inscription: ${error.message}`,
          )
        } else if (data.user && !data.session) {
          console.log("StartConsultationPage: Signup successful, email confirmation pending.")
          setSignupSuccessMessage(
            "Inscription réussie ! Veuillez consulter votre boîte de réception pour confirmer votre adresse e-mail avant de vous connecter.",
          )
        } else {
          console.log("StartConsultationPage: Signup successful, user session created (auto-confirm likely on).")
          // onAuthStateChange will handle next steps
        }
      } else {
        // Login
        console.log("StartConsultationPage: Attempting signInWithPassword (production log)...")
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          console.error("StartConsultationPage: Login error (production log):", error.message, error)
          setAuthError(
            error.message.includes("Email not confirmed")
              ? "Votre e-mail n'a pas été confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation."
              : error.message.includes("Invalid login credentials")
                ? "Email ou mot de passe incorrect."
                : `Erreur de connexion: ${error.message}`,
          )
        } else {
          console.log(
            "StartConsultationPage: Login successful via signInWithPassword (production log). Session data:",
            data.session ? "Exists" : "Null",
            "User data:",
            data.user ? "Exists" : "Null",
          )
        }
      }
    } catch (error: any) {
      console.error(`StartConsultationPage: Unhandled error during ${authView} (production log):`, error)
      setAuthError("Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.")
    } finally {
      setIsLoading(false)
      console.log("StartConsultationPage: handleEmailAuth finished (production log). isLoading set to false.")
    }
  }

  const handleTabChange = (value: string) => {
    setAuthView(value as AuthView)
    setAuthError(null)
    setSignupSuccessMessage(null)
  }

  const handleNextStep = async () => {
    console.log(`StartConsultationPage: handleNextStep called. Current step: ${currentStep}`)
    if (currentStep === 3) {
      // Submitting patient info
      if (!firstName || !lastName) {
        setAuthError(t.fillRequiredFieldsError || "Veuillez remplir le prénom et le nom.")
        return
      }
      setIsLoading(true)
      setAuthError(null)
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("StartConsultationPage: Error fetching user or no user found in step 3:", userError)
          setAuthError("Utilisateur non trouvé. Veuillez vous reconnecter.")
          setIsLoading(false)
          setCurrentStep(1) // Force re-auth
          return
        }

        console.log("StartConsultationPage: Step 3 - User confirmed:", user.id)
        const patientData = {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: patientDateOfBirth || null,
          gender: patientGender || null,
          phone_number: patientPhoneNumber || null,
          email: user.email,
          address: patientAddress || null,
          city: patientCity || null,
          country: patientCountry || null,
          emergency_contact_name: patientEmergencyContactName || null,
          emergency_contact_phone: patientEmergencyContactPhone || null,
        }
        console.log("StartConsultationPage: Step 3 - Upserting patient data:", patientData)
        const { error: patientError } = await supabase.from("patients").upsert(patientData, { onConflict: "user_id" })

        if (patientError) {
          console.error("StartConsultationPage: Patient save error (step 3):", patientError)
          setAuthError(`Erreur lors de la sauvegarde des informations patient: ${patientError.message}`)
          setIsLoading(false)
          return
        }
        console.log("StartConsultationPage: Step 3 - Patient data saved successfully.")

        const fullName = `${firstName} ${lastName}`.trim()
        console.log("StartConsultationPage: Step 3 - Upserting profile data with full_name:", fullName)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" })

        if (profileError) {
          console.error("StartConsultationPage: Profile save error (step 3):", profileError)
        } else {
          console.log("StartConsultationPage: Step 3 - Profile data saved successfully.")
        }
        console.log("StartConsultationPage: Step 3 - Advancing to step 4 (Payment).")
        setCurrentStep(4)
      } catch (error: any) {
        console.error("StartConsultationPage: Unexpected error in handleNextStep (step 3):", error)
        setAuthError(`Une erreur inattendue est survenue: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (currentStep === 1) {
      console.log("StartConsultationPage: Advancing from step 1 to 2 (Plan Selection).")
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!selectedPricing) {
        setPricingError(t.selectPlanError || "Veuillez sélectionner un plan tarifaire.")
        return
      }
      setPricingError(null)
      console.log("StartConsultationPage: Advancing from step 2 to 3 (Patient Info). Selected plan:", selectedPricing)
      setCurrentStep(3)
    } else if (currentStep === 4) {
      console.log("StartConsultationPage: Simulating payment success. Advancing from step 4 to 5 (Success).")
      setCurrentStep(5)
    }
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

  const handleSelectPricing = (id: string) => {
    setSelectedPricing(id)
    if (pricingError) setPricingError(null)
  }

  const getSelectedPlanInfo = () => {
    if (!selectedPricing) return ""
    const plan = pricingOptions.find((p) => p.id === selectedPricing)
    if (!plan) return ""
    return `${t[plan.titleKey]} - ${plan.price}${plan.descKey !== "pricingPayPerUseLocalDesc" && plan.descKey !== "pricingPayPerUseTouristDesc" ? t[plan.descKey] : ""}`
  }

  const getStep1Label = () => {
    if (isUserLoggedIn) return t.step1Label || "Authentification"
    return authView === "login" ? "Connexion" : "Inscription"
  }

  if (isCheckingSession) {
    console.log(
      "StartConsultationPage: RENDERING - isCheckingSession is TRUE (production log). Displaying global loader.",
    )
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
        <p className="ml-2">Vérification de la session...</p>
      </div>
    )
  }

  console.log(
    `StartConsultationPage: RENDERING - isCheckingSession is FALSE (production log). Current step: ${currentStep}, Auth view: ${authView}, User logged in: ${isUserLoggedIn}, Email: ${userEmail ? userEmail.substring(0, 3) + "..." : "undefined"}`,
  )

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
                <p className="text-sm text-gray-600">{t.startConsultationBaseline || "Votre santé, notre priorité"}</p>
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
                      {step.id === 1 ? getStep1Label() : t[step.labelKey] || `Étape ${step.id}`}
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

        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Authentification</CardTitle>
              <CardDescription>Connectez-vous ou créez un compte pour continuer</CardDescription>
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
                  <TabsTrigger
                    value="login"
                    className="text-gray-900 font-medium data-[state=active]:text-gray-900 data-[state=active]:bg-white"
                  >
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="text-gray-900 font-medium data-[state=active]:text-gray-900 data-[state=active]:bg-white"
                  >
                    Inscription
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleEmailAuth} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="login-email">{t.emailLabel || "Email"}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">{t.passwordLabel || "Mot de passe"}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
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
                      <Label htmlFor="signup-email">{t.emailLabel || "Email"}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">{t.passwordLabel || "Mot de passe"}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
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

        {currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.pricingSelectionTitle || "Sélection du tarif"}</CardTitle>
              <CardDescription>{t.pricingSelectionSubtitle || "Choisissez le plan qui vous convient"}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs || "Connecté en tant que"} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {pricingError && (
                <div
                  className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                  <span className="block sm:inline">{pricingError}</span>
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {pricingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-[-2px] ${selectedPricing === option.id ? "border-blue-700 bg-blue-500/5" : "border-gray-200"}`}
                    onClick={() => handleSelectPricing(option.id)}
                  >
                    <div className="text-center">
                      {option.isPopular && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 inline-block">
                          {t.pricingPopularBadge || "Populaire"}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                        {t[option.titleKey] || option.titleKey}
                      </h3>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">{option.price}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                        {t[option.descKey] || option.descKey}
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 text-left">
                        {option.featuresKeys.map((featKey) => (
                          <li key={featKey} className="flex items-start">
                            <Check size={14} className="mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{t[featKey] || featKey}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
                  {t.secondOpinionServiceTitle || "Service de second avis médical"}
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <h4 className="font-semibold text-gray-900">
                        {t.secondOpinionSubtitle || "Second avis médical"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t.secondOpinionDesc || "Obtenez un second avis d'expert"}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {t.secondOpinionPriceDetails || "Sur devis"}
                      </div>
                      <p className="text-sm text-gray-600">{t.secondOpinionPriceCondition || "Tarif personnalisé"}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {secondOpinionFeatures.map((feature) => (
                      <div key={feature.titleKey} className="text-center p-4 bg-white rounded-lg shadow-sm">
                        {feature.icon}
                        <h5 className="font-medium text-gray-900 text-sm">{t[feature.titleKey] || feature.titleKey}</h5>
                        <p className="text-xs text-gray-600">{t[feature.descKey] || feature.descKey}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleNextStep}
                  className="px-8 py-3 text-base"
                  disabled={isLoading || !selectedPricing}
                >
                  {isLoading && currentStep === 2 ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Chargement...
                    </>
                  ) : (
                    t.continueButton || "Continuer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.patientInfoTitle || "Informations patient"}</CardTitle>
              <CardDescription>{t.patientInfoSubtitle || "Renseignez vos informations médicales"}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs || "Connecté en tant que"} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {authError && (
                <div
                  className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                  <span className="block sm:inline">{authError}</span>
                </div>
              )}
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">{t.firstNameLabel || "Prénom"}</Label>
                    <Input
                      id="firstName"
                      placeholder={t.firstNameLabel || "Prénom"}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastNameLabel || "Nom"}</Label>
                    <Input
                      id="lastName"
                      placeholder={t.lastNameLabel || "Nom"}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email-patient">{t.emailLabel || "Email"}</Label>
                    <Input
                      id="email-patient"
                      type="email"
                      placeholder="email@example.com"
                      value={userEmail || ""}
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-phone-number">{t.phoneLabel || "Téléphone"}</Label>
                    <Input
                      id="patient-phone-number"
                      type="tel"
                      placeholder="+230 5xxx xxxx"
                      value={patientPhoneNumber}
                      onChange={(e) => setPatientPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="patient-date-of-birth">{t.birthDateLabel || "Date de naissance"}</Label>
                    <Input
                      id="patient-date-of-birth"
                      type="date"
                      value={patientDateOfBirth}
                      onChange={(e) => setPatientDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">{t.weightLabel || "Poids (kg)"}</Label>
                    <Input id="weight" type="number" placeholder="70" />
                  </div>
                  <div>
                    <Label htmlFor="height">{t.heightLabel || "Taille (cm)"}</Label>
                    <Input id="height" type="number" placeholder="170" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="patient-gender">{t.genderLabel || "Sexe"}</Label>
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger id="patient-gender">
                      <SelectValue placeholder={t.genderPlaceholder || "Sélectionner le sexe"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.genderMale || "Masculin"}</SelectItem>
                      <SelectItem value="female">{t.genderFemale || "Féminin"}</SelectItem>
                      <SelectItem value="other">{t.genderOther || "Autre"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patient-address">{t.addressLabel || "Adresse"}</Label>
                  <Textarea
                    id="patient-address"
                    placeholder={t.addressPlaceholder || "123 Rue Principale"}
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="patient-city">{t.cityLabel || "Ville"}</Label>
                    <Input
                      id="patient-city"
                      placeholder={t.cityPlaceholder || "Port Louis"}
                      value={patientCity}
                      onChange={(e) => setPatientCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-country">{t.countryLabel || "Pays"}</Label>
                    <Input
                      id="patient-country"
                      placeholder={t.countryPlaceholder || "Maurice"}
                      value={patientCountry}
                      onChange={(e) => setPatientCountry(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="patient-emergency-contact-name">
                      {t.emergencyContactNameLabel || "Nom du contact d'urgence"}
                    </Label>
                    <Input
                      id="patient-emergency-contact-name"
                      placeholder={t.emergencyContactNamePlaceholder || "Jean Dupont"}
                      value={patientEmergencyContactName}
                      onChange={(e) => setPatientEmergencyContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-emergency-contact-phone">
                      {t.emergencyContactPhoneLabel || "Téléphone du contact d'urgence"}
                    </Label>
                    <Input
                      id="patient-emergency-contact-phone"
                      type="tel"
                      placeholder="+230 5xxx xxxx"
                      value={patientEmergencyContactPhone}
                      onChange={(e) => setPatientEmergencyContactPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicalHistory">{t.medicalHistoryLabel || "Antécédents médicaux"}</Label>
                  <Textarea id="medicalHistory" placeholder={`${t.medicalHistoryLabel || "Antécédents médicaux"}...`} />
                </div>
                <div>
                  <Label>{t.currentTreatmentLabel || "Traitement en cours"}</Label>
                  <RadioGroup defaultValue="no" className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="treatment-yes" />
                      <Label htmlFor="treatment-yes">{t.treatmentYes || "Oui"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="treatment-no" />
                      <Label htmlFor="treatment-no">{t.treatmentNo || "Non"}</Label>
                    </div>
                  </RadioGroup>
                  <Textarea
                    className="mt-2"
                    placeholder={`${t.currentTreatmentLabel || "Traitement en cours"} (si oui)...`}
                  />
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleNextStep}
                    className="px-8 py-3 text-base"
                    disabled={isLoading || !firstName || !lastName}
                  >
                    {isLoading && currentStep === 3 ? <Loader2 className="animate-spin mr-2" /> : null}
                    {t.continueButton || "Continuer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.paymentStepTitle || "Paiement"}</CardTitle>
              <CardDescription>{t.paymentStepSubtitle || "Finalisez votre inscription"}</CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs || "Connecté en tant que"} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent className="max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  {t.paymentMethodsAcceptedTitle || "Modes de paiement acceptés"}
                </h3>
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
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="cardNumber">{t.cardNumberLabel || "Numéro de carte"}</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">{t.expiryLabel || "Expiration"}</Label>
                    <Input id="expiryDate" placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t.cvvLabel || "CVV"}</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardHolderName">{t.cardholderNameLabel || "Nom du titulaire"}</Label>
                  <Input id="cardHolderName" placeholder={t.cardholderNameLabel || "Nom du titulaire"} />
                </div>
              </form>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{t.selectedPlanLabel || "Plan sélectionné"}</span>
                  <span className="font-bold text-blue-600">{getSelectedPlanInfo()}</span>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <Button onClick={handleNextStep} className="w-full px-6 py-3 text-base font-medium">
                  {isLoading && currentStep === 4 ? <Loader2 className="animate-spin mr-2" /> : null}
                  {t.completeRegistrationButton || "Finaliser l'inscription"}
                </Button>
                <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                  <Lock size={12} className="mr-1" /> {t.securePaymentText || "Paiement sécurisé"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <CardTitle className="text-2xl">{t.registrationSuccessTitle || "Inscription réussie !"}</CardTitle>
              <CardDescription>
                {t.registrationSuccessMessage || "Votre compte a été créé avec succès."}
              </CardDescription>
              {userEmail && (
                <p className="text-sm text-gray-600">
                  {t.loggedInAs || "Connecté en tant que"} {userEmail}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {successDashboardLinks.map((link) => (
                  <div key={link.titleKey} className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                    {link.icon}
                    <h3 className="font-medium text-gray-900 text-sm">{t[link.titleKey] || link.titleKey}</h3>
                    <p className="text-xs text-gray-600">{t[link.descKey] || link.descKey}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Link href="/dashboard" passHref>
                  <Button className="px-8 py-3 text-base font-medium">
                    {t.goToDashboardButton || "Aller au tableau de bord"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
