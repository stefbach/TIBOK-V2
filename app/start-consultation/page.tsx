"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
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

// Configuration statique
const STEPS = [
  { id: 1, label: "Authentification" },
  { id: 2, label: "Tarification" },
  { id: 3, label: "Informations" },
  { id: 4, label: "Paiement" },
] as const

// Types
interface UserProfile {
  id: string
  email: string
  profile_completed?: boolean
}

interface PricingOption {
  id: string
  title: string
  price: string
  desc: string
  features: string[]
  isPopular?: boolean
}

// Configuration des prix - maintenant statique pour éviter les re-calculs
const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "payperuse-local",
    title: "À l'acte - Résident",
    price: "1000 MUR",
    desc: "Paiement à l'utilisation pour résidents Maurice",
    features: [
      "Consultation par session",
      "Livraison payante", 
      "Prescription numérique"
    ],
  },
  {
    id: "payperuse-tourist", 
    title: "À l'acte - Touriste",
    price: "35 €",
    desc: "Paiement à l'utilisation pour touristes",
    features: [
      "Consultation par session",
      "Livraison payante",
      "Prescription numérique"
    ],
  },
  {
    id: "solo",
    title: "Pack Solo",
    price: "800 MUR/mois",
    desc: "Plan individuel complet",
    features: [
      "1 consultation comprise",
      "Livraison gratuite",
      "Prescription numérique"
    ],
  },
  {
    id: "family",
    title: "Pack Famille", 
    price: "2800 MUR/mois",
    desc: "Plan familial pour 4 personnes maximum",
    features: [
      "Jusqu'à 4 personnes",
      "4 consultations par mois",
      "Livraison gratuite",
      "Accès prioritaire"
    ],
    isPopular: true,
  },
]

// Hooks personnalisés pour séparer la logique
function useSupabaseClient() {
  const [client, setClient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Vérification des variables d'environnement
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error("Variables d'environnement Supabase manquantes")
        }

        const { getSupabaseBrowserClient } = await import("@/lib/supabase/client")
        const supabaseClient = getSupabaseBrowserClient()
        
        if (!supabaseClient) {
          throw new Error("Impossible d'initialiser le client Supabase")
        }

        setClient(supabaseClient)
        setError(null)
      } catch (err: any) {
        console.error("[SUPABASE] Erreur d'initialisation:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    initSupabase()
  }, [])

  return { client, error, isLoading }
}

function useAuth(supabaseClient: any) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkUserSession = useCallback(async () => {
    if (!supabaseClient) return null

    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (session?.user) {
        // Vérifier le profil utilisateur
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("profile_completed")
          .eq("id", session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          profile_completed: profile?.profile_completed || false
        }

        setUser(userProfile)
        return userProfile
      }

      setUser(null)
      return null
    } catch (err: any) {
      console.error("[AUTH] Erreur vérification session:", err)
      setError(err.message)
      return null
    }
  }, [supabaseClient])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabaseClient) {
      throw new Error("Service d'authentification non disponible")
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) throw error

      const userProfile = await checkUserSession()
      return userProfile
    } finally {
      setIsLoading(false)
    }
  }, [supabaseClient, checkUserSession])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabaseClient) {
      throw new Error("Service d'authentification non disponible")
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/start-consultation`,
        },
      })

      if (error) throw error

      if (data.user && data.session) {
        const userProfile = await checkUserSession()
        return userProfile
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabaseClient, checkUserSession])

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    checkUserSession,
    setError
  }
}

// Composant principal
export default function StartConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { client: supabaseClient, error: supabaseError, isLoading: supabaseLoading } = useSupabaseClient()
  const { user, isLoading: authLoading, error: authError, signIn, signUp, checkUserSession, setError: setAuthError } = useAuth(supabaseClient)

  // États locaux séparés pour éviter les re-rendus excessifs
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [authView, setAuthView] = useState<"login" | "signup">("login")
  const [isInitialized, setIsInitialized] = useState(false)
  
  // États des formulaires
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({ email: "", password: "" })
  const [patientForm, setPatientForm] = useState({
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
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Ref pour éviter les effets multiples
  const initRef = useRef(false)

  // Initialisation de la page
  useEffect(() => {
    if (initRef.current || supabaseLoading) return
    if (supabaseError) {
      setIsInitialized(true)
      return
    }
    if (!supabaseClient) return

    initRef.current = true

    const initializePage = async () => {
      try {
        // Vérifier les paramètres URL
        const stepParam = searchParams.get("step")
        const planParam = searchParams.get("plan")

        if (stepParam) {
          const step = parseInt(stepParam)
          if (step >= 1 && step <= 4) {
            setCurrentStep(step)
          }
        }

        if (planParam && PRICING_OPTIONS.some(p => p.id === planParam)) {
          setSelectedPlan(planParam)
        }

        // Vérifier la session utilisateur
        const userProfile = await checkUserSession()
        
        if (userProfile?.profile_completed) {
          router.push("/dashboard")
          return
        }

        if (userProfile && !stepParam) {
          setCurrentStep(2) // Aller directement à la tarification si connecté
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("[INIT] Erreur:", error)
        setGlobalError("Erreur d'initialisation")
        setIsInitialized(true)
      }
    }

    initializePage()
  }, [supabaseClient, supabaseError, supabaseLoading, searchParams, checkUserSession, router])

  // Gestion de l'authentification
  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    setAuthError(null)

    try {
      const email = authView === "login" ? loginForm.email : signupForm.email
      const password = authView === "login" ? loginForm.password : signupForm.password

      if (!email || !password) {
        setGlobalError("Veuillez remplir tous les champs")
        return
      }

      let userProfile: any = null

      if (authView === "login") {
        userProfile = await signIn(email, password)
      } else {
        userProfile = await signUp(email, password)
        if (!userProfile) {
          alert("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.")
          return
        }
      }

      if (userProfile?.profile_completed) {
        router.push("/dashboard")
      } else {
        setCurrentStep(2)
      }
    } catch (error: any) {
      console.error("[AUTH] Erreur:", error)
      setGlobalError(error.message || "Erreur d'authentification")
    }
  }, [authView, loginForm, signupForm, signIn, signUp, router, setAuthError])

  // Navigation entre étapes avec validation
  const handleNextStep = useCallback(async () => {
    setGlobalError(null)

    switch (currentStep) {
      case 1:
        if (!user) {
          setGlobalError("Veuillez vous connecter d'abord")
          return
        }
        setCurrentStep(2)
        break

      case 2:
        if (!selectedPlan) {
          setGlobalError("Veuillez sélectionner un plan tarifaire")
          return
        }
        setCurrentStep(3)
        break

      case 3:
        if (!patientForm.firstName || !patientForm.lastName) {
          setGlobalError("Veuillez remplir au moins le prénom et le nom")
          return
        }

        if (!supabaseClient || !user) {
          setGlobalError("Service non disponible")
          return
        }

        setIsSubmitting(true)

        try {
          // Sauvegarder les données patient
          const { error: patientError } = await supabaseClient
            .from("patients")
            .upsert({
              user_id: user.id,
              first_name: patientForm.firstName,
              last_name: patientForm.lastName,
              date_of_birth: patientForm.birthDate || null,
              gender: patientForm.gender || null,
              phone_number: patientForm.phone || null,
              email: user.email,
              address: patientForm.address || null,
              city: patientForm.city || null,
              country: patientForm.country || null,
              emergency_contact_name: patientForm.emergencyName || null,
              emergency_contact_phone: patientForm.emergencyPhone || null,
            }, { onConflict: "user_id" })

          if (patientError) throw patientError

          // Marquer le profil comme complet
          const { error: profileError } = await supabaseClient
            .from("profiles")
            .upsert({
              id: user.id,
              full_name: `${patientForm.firstName} ${patientForm.lastName}`.trim(),
              profile_completed: true,
            }, { onConflict: "id" })

          if (profileError) throw profileError

          setCurrentStep(4)
        } catch (error: any) {
          console.error("[PATIENT] Erreur sauvegarde:", error)
          setGlobalError(`Erreur de sauvegarde: ${error.message}`)
        } finally {
          setIsSubmitting(false)
        }
        break

      case 4:
        // TODO: Intégrer le vrai système de paiement
        // Pour l'instant, simuler le succès
        setCurrentStep(5)
        break
    }
  }, [currentStep, user, selectedPlan, patientForm, supabaseClient])

  // Affichage conditionnel pour l'état de chargement
  if (supabaseLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  // Affichage de l'erreur Supabase critique
  if (supabaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg border-2 border-red-500">
          <div className="text-center">
            <AlertTriangle className="text-red-600 h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800">Erreur de Configuration</h1>
            <p className="mt-2 text-gray-700">Le service n'est pas disponible.</p>
            <div className="mt-4 p-4 bg-red-100 text-red-900 text-left rounded-md font-mono text-sm">
              {supabaseError}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentError = globalError || authError

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
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {STEPS.map((step, index) => (
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
                      className={`ml-0 sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-medium ${
                        currentStep >= step.id ? "text-blue-700" : "text-gray-500"
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
        {currentError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
            <span className="block sm:inline">{currentError}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => {
                setGlobalError(null)
                setAuthError(null)
              }}
            >
              <span className="sr-only">Fermer</span>×
            </button>
          </div>
        )}

        {/* Étape 1: Authentification */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Authentification</CardTitle>
              <CardDescription>Connectez-vous ou créez un compte pour continuer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md mx-auto">
              <Tabs value={authView} onValueChange={(value) => setAuthView(value as "login" | "signup")} className="w-full">
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
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={authLoading}>
                      {authLoading ? (
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
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={authLoading}>
                      {authLoading ? (
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
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection du tarif */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sélection du tarif</CardTitle>
              <CardDescription>Choisissez le plan qui vous convient</CardDescription>
              {user?.email && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-700 flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Connecté en tant que <strong className="ml-1">{user.email}</strong>
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {PRICING_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-[-2px] ${
                      selectedPlan === option.id ? "border-blue-700 bg-blue-500/5" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedPlan(option.id)}
                  >
                    <div className="text-center">
                      {option.isPopular && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 inline-block">
                          Populaire
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

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleNextStep}
                  className="px-8 py-3 text-base"
                  disabled={!selectedPlan}
                >
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations patient */}
        {currentStep === 3 && (
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
                      value={patientForm.firstName}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={patientForm.lastName}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                      value={user?.email || ""}
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
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={patientForm.birthDate}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe</Label>
                    <Select 
                      value={patientForm.gender} 
                      onValueChange={(value) => setPatientForm(prev => ({ ...prev, gender: value }))}
                    >
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
                    value={patientForm.address}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Port Louis"
                      value={patientForm.city}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="Maurice"
                      value={patientForm.country}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergencyName">Contact d'urgence - Nom</Label>
                    <Input
                      id="emergencyName"
                      placeholder="Jean Dupont"
                      value={patientForm.emergencyName}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Contact d'urgence - Téléphone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="+230 5xxx xxxx"
                      value={patientForm.emergencyPhone}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleNextStep}
                    className="px-8 py-3 text-base"
                    disabled={isSubmitting || !patientForm.firstName || !patientForm.lastName}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    Continuer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Paiement */}
        {currentStep === 4 && (
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

              {selectedPlan && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">Plan sélectionné</span>
                    <span className="font-bold text-blue-600">
                      {PRICING_OPTIONS.find((p) => p.id === selectedPlan)?.title} -{" "}
                      {PRICING_OPTIONS.find((p) => p.id === selectedPlan)?.price}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <Button onClick={handleNextStep} className="w-full px-6 py-3 text-base font-medium">
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
        {currentStep === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
              <CardDescription>Votre compte a été créé avec succès.</CardDescription>
            </CardHeader>
            <CardContent>
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
