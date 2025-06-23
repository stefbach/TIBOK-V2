"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Add this import
import { PharmacyRegistrationHeader } from "@/components/pharmacy-registration/header"
import { PharmacyWelcomeSection } from "@/components/pharmacy-registration/welcome-section"
import { PharmacyRegistrationForm } from "@/components/pharmacy-registration/registration-form"
import { PharmacyRegistrationSuccessPage } from "@/components/pharmacy-registration/success-page"
import { PharmacyLoginForm } from "@/components/pharmacy-registration/login-form"

type ViewState = "welcome" | "register" | "login" | "success"

export default function PharmacyRegistrationPage() {
  const [currentView, setCurrentView] = useState<ViewState>("welcome")
  const router = useRouter() // Add this line

  const handleRegisterClick = () => {
    setCurrentView("register")
  }

  const handleLoginClick = () => {
    setCurrentView("login")
  }

  const handleBackToWelcome = () => {
    setCurrentView("welcome")
  }

  const handleRegistrationSuccess = () => {
    setCurrentView("success")
  }

  const handleProceedFromSuccess = () => {
    router.push("/pharmacy-dashboard") // Update this line
  }

  const handleLoginSuccess = () => {
    router.push("/pharmacy-dashboard") // Update this line
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <PharmacyRegistrationHeader />
      <main className="py-8">
        {currentView === "welcome" && (
          <PharmacyWelcomeSection onRegisterClick={handleRegisterClick} onLoginClick={handleLoginClick} />
        )}
        {currentView === "register" && (
          <PharmacyRegistrationForm onBack={handleBackToWelcome} onSuccess={handleRegistrationSuccess} />
        )}
        {currentView === "login" && (
          <PharmacyLoginForm onBack={handleBackToWelcome} onLoginSuccess={handleLoginSuccess} />
        )}
        {currentView === "success" && <PharmacyRegistrationSuccessPage onGoToDashboard={handleProceedFromSuccess} />}
      </main>
    </div>
  )
}
