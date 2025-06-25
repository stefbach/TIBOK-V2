"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

// Import conditionnel et sécurisé
let supabase: any = null
let useLanguageHook: any = () => ({ language: "fr" })
let translationsData: any = {}

try {
  const { getSupabaseBrowserClient } = require("@/lib/supabase/client")
  supabase = getSupabaseBrowserClient()
} catch (error) {
  console.warn("Supabase non disponible:", error)
}

try {
  const langContext = require("@/contexts/language-context")
  const transData = require("@/lib/translations")
  useLanguageHook = langContext.useLanguage
  translationsData = transData.translations
} catch (error) {
  console.warn("Contexte de langue non disponible:", error)
}

// Configuration statique
const STEPS = [
  { id: 1, label: "Authentification" },
  { id: 2, label: "Tarification" },
  { id: 3, label: "Informations" },
  { id: 4, label: "Paiement" },
]

// Fonction pour créer les options de tarification - stable
const createPricingOptions = (translations: any) => {
  const t = translations || {}
  return [
    {
      id: "payperuse-local",
      title: t.pricingPayPerUseLocalTitle || "Pay per use - Résident",
      price: t.pricingPayPerUseLocalPrice || "25€",
      desc: t.pricingPayPerUseLocalDesc || "Paiement à l'utilisation pour résidents locaux",
      features: [
        t.pricingPayPerUseLocalFeat1 || "Consultation immédiate",
        t.pricingPayPerUseLocalFeat2 || "Rapport médical détaillé",
        t.pricingPayPerUseLocalFeat3 || "Support client local",
      ],
    },
    {
      id: "payperuse-tourist",
      title: t.pricingPayPerUseTouristTitle || "Pay per use - Touriste",
      price: t.pricingPayPerUseTouristPrice || "35€",
      desc: t.pricingPayPerUseTouristDesc || "Paiement à l'utilisation pour touristes",
      features: [
        t.pricingPayPerUseTouristFeat1 || "Consultation immédiate",
        t.pricingPayPerUseTouristFeat2 || "Rapport médical multilingue",
        t.pricingPayPerUseTouristFeat3 || "Support touristique 24/7",
      ],
    },
    {
      id: "solo",
      title: t.pricingSoloPackTitle || "Pack Solo",
      price: t.pricingSoloPackPrice || "49€/mois",
      desc: t.pricingSoloPackDesc || "Plan individuel complet",
      features: [
        t.pricingSoloPackFeat1 || "Consultations illimitées",
        t.pricingSoloPackFeat2 || "Suivi médical personnalisé",
        t.pricingSoloPackFeat3 || "Téléconsultations incluses",
      ],
    },
    {
      id: "family",
      title: t.pricingFamilyPackTitle || "Pack Famille",
      price: t.pricingFamilyPackPrice || "149€/mois",
      desc: t.pricingFamilyPackDesc || "Plan familial pour 4 personnes maximum",
      features: [
        t.pricingFamilyPackFeat1 || "Consultations illimitées pour la famille",
        t.pricingFamilyPackFeat2 || "Suivi médical complet",
        t.pricingFamilyPackFeat3 || "Urgences médicales 24/7",
        t.pricingFamilyPackFeat4 || "Pharmacie en ligne avec livraison",
      ],
      isPopular: true,
    },
  ]
}

interface AppState {
  // Status
  isLoading: boolean
  error: string | null
  currentStep: number
  isInitialized: boolean

  // Auth
  user: any
  authView: "login" | "signup"

  // Forms
  loginEmail: string
  loginPassword: string
  signupEmail: string
  signupPassword: string

  // Patient
  firstName: string
  lastName: string
  phone: string
  birthDate: string
  gender: string
  address: string
  city: string
  country: string
  emergencyName: string
  emergencyPhone: string

  // Pricing
  selectedPlan: string | null
}

export default function StartConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Hook de langue avec fallback stable
  const { language } = useLanguageHook()

  // Traductions memoized pour éviter les re-calculs
  const translations = useMemo(() => {
    return translationsData[language] || {}
  }, [language])

  // Options de tarification memoized
  const pricingOptions = useMemo(() => {
    return createPricingOptions(translations)
  }, [translations])

  // État centralisé
  const [state, setState] = useState<AppState>({
    isLoading: false,
    error: null,
    currentStep: 1,
    isInitialized: false,
    user: null,
    authView: "login",
    loginEmail: "",
    loginPassword: "",
    signupEmail: "",
    signupPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    emergencyName: "",
    emergencyPhone: "",
    selectedPlan: null,
  })

  // Helper pour mettre à jour l'état - useCallback pour stabilité
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Initialisation - Effect séparé et stable
  useEffect(() => {
    let mounted = true

    const initializePage = async () => {
      // Vérifier le plan initial depuis l'URL
      const initialPlan = searchParams.get("plan")
      if (initialPlan && pricingOptions.some((p) => p.id === initialPlan)) {
        if (mounted) updateState({ selectedPlan: initialPlan })
      }

      // Vérifier la session si Supabase est disponible
      if (supabase) {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (mounted && session?.user) {
            // Utilisateur connecté - vérifier s'il a déjà des données patient
            updateState({ user: session.user })

            try {
              const { data: patientData } = await supabase
                .from("patients")
                .select("user_id")
                .eq("user_id", session.user.id)
                .maybeSingle()

              if (patientData && mounted) {
                // Patient existe déjà, rediriger vers dashboard
                console.log("Redirection vers /dashboard car patient existe")
                router.push("/dashboard")
                return
              } else if (mounted) {
                // Patient n'existe pas, aller à l'étape de sélection de tarif
                console.log("Pas de données patient, étape 2")
                updateState({ currentStep: 2 })
              }
            } catch (e) {
              console.warn("Erreur vérification patient:", e)
              if (mounted) updateState({ currentStep: 2 })
            }
          } else if (mounted) {
            // Pas d'utilisateur connecté, rester à l'étape 1
            console.log("Pas de session, étape 1")
            updateState({ currentStep: 1 })
          }
        } catch (error) {
          console.warn("Erreur session:", error)
          if (mounted) updateState({ currentStep: 1 })
        }
      }

      if (mounted) updateState({ isInitialized: true })
    }

    initializePage()

    return () => {
      mounted = false
    }
  }, [searchParams, router, updateState, pricingOptions])

  // Authentification
  const handleAuth = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!supabase) {
        updateState({ error: "Service d'authentification non disponible" })
        return
      }

      updateState({ isLoading: true, error: null })

      try {
        const email = state.authView === "signup" ? state.signupEmail : state.loginEmail
        const password = state.authView === "signup" ? state.signupPassword : state.loginPassword

        if (state.authView === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/start-consultation`,
            },
          })

          if (error) {
            updateState({
              error: error.message.includes("User already registered")
                ? "Un compte avec cet email existe déjà."
                : `Erreur d'inscription: ${error.message}`,
            })
          } else if (data.user && !data.session) {
            updateState({
              error: null,
              currentStep: 1,
            })
            alert("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.")
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })

          if (error) {
            updateState({
              error: error.message.includes("Invalid login credentials")
                ? "Email ou mot de passe incorrect."
                : `Erreur de connexion: ${error.message}`,
            })
          } else if (data.user) {
            updateState({ user: data.user, currentStep: 2, error: null })
          }
        }
      } catch (error: any) {
        updateState({ error: "Erreur de connexion. Vérifiez votre connexion internet." })
      } finally {
        updateState({ isLoading: false })
      }
    },
    [state.authView, state.signupEmail, state.loginEmail, state.signupPassword, state.loginPassword, updateState],
  )

  // Navigation entre étapes
  const handleNextStep = useCallback(async () => {
    updateState({ error: null })

    switch (state.currentStep) {
      case 1:
        updateState({ currentStep: 2 })
        break

      case 2:
        if (!state.selectedPlan) {
          updateState({ error: "Veuillez sélectionner un plan tarifaire." })
          return
        }
        updateState({ currentStep: 3 })
        break

      case 3:
        if (!state.firstName || !state.lastName) {
          updateState({ error: "Veuillez remplir au moins le prénom et le nom." })
          return
        }

        // Sauvegarder les données patient si Supabase disponible
        if (supabase && state.user) {
          updateState({ isLoading: true })

          try {
            const patientData = {
              user_id: state.user.id,
              first_name: state.firstName,
              last_name: state.lastName,
              date_of_birth: state.birthDate || null,
              gender: state.gender || null,
              phone_number: state.phone || null,
              email: state.user.email,
              address: state.address || null,
              city: state.city || null,
              country: state.country || null,
              emergency_contact_name: state.emergencyName || null,
              emergency_contact_phone: state.emergencyPhone || null,
            }

            const { error } = await supabase.from("patients").upsert(patientData, { onConflict: "user_id" })

            if (error) {
              updateState({ error: `Erreur sauvegarde: ${error.message}` })
              return
            }

            // Mettre à jour le profil
            const fullName = `${state.firstName} ${state.lastName}`.trim()
            await supabase.from("profiles").upsert({ id: state.user.id, full_name: fullName }, { onConflict: "id" })
          } catch (error: any) {
            updateState({ error: `Erreur: ${error.message}` })
            return
          } finally {
            updateState({ isLoading: false })
          }
        }

        updateState({ currentStep: 4 })
        break

      case 4:
        updateState({ currentStep: 5 })
        break
    }
  }, [
    state.currentStep,
    state.selectedPlan,
    state.firstName,
    state.lastName,
    state.user,
    state.birthDate,
    state.gender,
    state.phone,
    state.address,
    state.city,
    state.country,
    state.emergencyName,
    state.emergencyPhone,
    updateState,
  ])

  // Handlers pour les formulaires
  const handleTabChange = useCallback(
    (value: string) => {
      updateState({ authView: value as "login" | "signup", error: null })
    },
    [updateState],
  )

  const handleSelectPricing = useCallback(
    (planId: string) => {
      updateState({ selectedPlan: planId })
    },
    [updateState],
  )

  const handleDemoMode = useCallback(() => {
    updateState({
      currentStep: 2,
      user: { email: "demo@tibok.com" },
      error: null,
    })
  }, [updateState])

  // Gestion des erreurs de rendu
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
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
                <p className="text-sm text-gray-600">Votre santé, notre priorité</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicateur d'étapes */}
        {state.currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                        state.currentStep >= step.id ? "bg-blue-700" : "bg-gray-400"
                      }`}
                    >
                      {state.currentStep > step.id ? <Check size={18} /> : step.id}
                    </div>
                    <span
                      className={`ml-0 sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-medium ${
                        state.currentStep >= step.id ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 max-w-[3rem] sm:max-w-[4rem]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {state.error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
            <span className="block sm:inline">{state.error}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => updateState({ error: null })}>
              <span className="sr-only">Fermer</span>×
            </button>
          </div>
        )}

        {/* Étape 1: Authentification */}
        {state.currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Authentification</CardTitle>
              <CardDescription>Connectez-vous ou créez un compte pour continuer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md mx-auto">
              <Tabs value={state.authView} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleAuth} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={state.loginEmail}
                        onChange={(e) => updateState({ loginEmail: e.target.value })}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={state.loginPassword}
                        onChange={(e) => updateState({ loginPassword: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={state.isLoading}>
                      {state.isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Connexion...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleAuth} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={state.signupEmail}
                        onChange={(e) => updateState({ signupEmail: e.target.value })}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={state.signupPassword}
                        onChange={(e) => updateState({ signupPassword: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={state.isLoading}>
                      {state.isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Inscription...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Mode dégradé si pas de Supabase */}
              {!supabase && (
                <div className="mt-4 text-center">
                  <Button onClick={handleDemoMode} variant="outline" className="w-full">
                    Continuer en mode démo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Mode démonstration - Aucune donnée ne sera sauvegardée</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection du tarif */}
        {state.currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sélection du tarif</CardTitle>
              <CardDescription>Choisissez le plan qui vous convient</CardDescription>
              {state.user?.email && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-700 flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Connecté en tant que <strong className="ml-1">{state.user.email}</strong>
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {pricingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-[-2px] ${
                      state.selectedPlan === option.id ? "border-blue-700 bg-blue-500/5" : "border-gray-200"
                    }`}
                    onClick={() => handleSelectPricing(option.id)}
                  >
                    <div className="text-center">
                      {option.isPopular && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 inline-block">
                          {translations.pricingPopularBadge || "Populaire"}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{option.title}</h3>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">{option.price}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">{option.desc}</p>
                      <ul className="text-xs text-gray-600 space-y-1 text-left">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check size={14} className="mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section Second Avis Médical */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
                  {translations.secondOpinionServiceTitle || "Service de second avis médical"}
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <h4 className="font-semibold text-gray-900">
                        {translations.secondOpinionSubtitle || "Second avis médical"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {translations.secondOpinionDesc || "Obtenez un second avis d'expert"}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {translations.secondOpinionPriceDetails || "Sur devis"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {translations.secondOpinionPriceCondition || "Tarif personnalisé"}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <Search className="text-blue-600 text-xl mb-2 mx-auto" />
                      <h5 className="font-medium text-gray-900 text-sm">
                        {translations.secondOpinionSearchSpecialist || "Recherche de spécialiste"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {translations.secondOpinionSearchSpecialistDesc || "Accès à notre réseau d'experts"}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <UserMdIcon className="text-blue-600 text-xl mb-2 mx-auto" />
                      <h5 className="font-medium text-gray-900 text-sm">
                        {translations.secondOpinionExpertConsultation || "Consultation d'expert"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {translations.secondOpinionExpertConsultationDesc || "Avis médical spécialisé"}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <FileMedical className="text-blue-600 text-xl mb-2 mx-auto" />
                      <h5 className="font-medium text-gray-900 text-sm">
                        {translations.secondOpinionDetailedReport || "Rapport détaillé"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {translations.secondOpinionDetailedReportDesc || "Analyse complète et recommandations"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleNextStep}
                  className="px-8 py-3 text-base"
                  disabled={state.isLoading || !state.selectedPlan}
                >
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations patient */}
        {state.currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Informations patient</CardTitle>
              <CardDescription>Renseignez vos informations médicales</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={state.firstName}
                      onChange={(e) => updateState({ firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={state.lastName}
                      onChange={(e) => updateState({ lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email-patient">Email</Label>
                    <Input
                      id="email-patient"
                      type="email"
                      placeholder="email@example.com"
                      value={state.user?.email || ""}
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+230 5xxx xxxx"
                      value={state.phone}
                      onChange={(e) => updateState({ phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={state.birthDate}
                      onChange={(e) => updateState({ birthDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe</Label>
                    <Select value={state.gender} onValueChange={(value) => updateState({ gender: value })}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Sélectionner le sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculin</SelectItem>
                        <SelectItem value="female">Féminin</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    placeholder="123 Rue Principale"
                    value={state.address}
                    onChange={(e) => updateState({ address: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Port Louis"
                      value={state.city}
                      onChange={(e) => updateState({ city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="Maurice"
                      value={state.country}
                      onChange={(e) => updateState({ country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergencyName">Contact d'urgence - Nom</Label>
                    <Input
                      id="emergencyName"
                      placeholder="Jean Dupont"
                      value={state.emergencyName}
                      onChange={(e) => updateState({ emergencyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Contact d'urgence - Téléphone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="+230 5xxx xxxx"
                      value={state.emergencyPhone}
                      onChange={(e) => updateState({ emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleNextStep}
                    className="px-8 py-3 text-base"
                    disabled={state.isLoading || !state.firstName || !state.lastName}
                  >
                    {state.isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Continuer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Paiement */}
        {state.currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Paiement</CardTitle>
              <CardDescription>Finalisez votre inscription</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Modes de paiement acceptés</h3>
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
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiration</Label>
                    <Input id="expiryDate" placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardHolderName">Nom du titulaire</Label>
                  <Input id="cardHolderName" placeholder="Nom du titulaire" />
                </div>
              </form>

              {state.selectedPlan && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">Plan sélectionné</span>
                    <span className="font-bold text-blue-600">
                      {pricingOptions.find((p) => p.id === state.selectedPlan)?.title} -{" "}
                      {pricingOptions.find((p) => p.id === state.selectedPlan)?.price}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <Button onClick={handleNextStep} className="w-full px-6 py-3 text-base font-medium">
                  {state.isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Finaliser l'inscription
                </Button>
                <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                  <Lock size={12} className="mr-1" /> Paiement sécurisé
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 5: Succès */}
        {state.currentStep === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
              <CardDescription>Votre compte a été créé avec succès.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                  <Users className="text-blue-600 text-xl mb-2 mx-auto" />
                  <h3 className="font-medium text-gray-900 text-sm">Salle d'attente</h3>
                  <p className="text-xs text-gray-600">Accédez à vos consultations</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                  <History className="text-blue-600 text-xl mb-2 mx-auto" />
                  <h3 className="font-medium text-gray-900 text-sm">Historique</h3>
                  <p className="text-xs text-gray-600">Consultez vos antécédents</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                  <UserMdIcon className="text-blue-600 text-xl mb-2 mx-auto" />
                  <h3 className="font-medium text-gray-900 text-sm">Second avis</h3>
                  <p className="text-xs text-gray-600">Demandez un avis expert</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                  <BotIcon className="text-blue-600 text-xl mb-2 mx-auto" />
                  <h3 className="font-medium text-gray-900 text-sm">TiBot</h3>
                  <p className="text-xs text-gray-600">Assistant médical IA</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Link href="/dashboard" passHref>
                  <Button className="px-8 py-3 text-base font-medium">Aller au tableau de bord</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
