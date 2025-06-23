"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface PharmacyLoginFormProps {
  onBack: () => void
  // In a real app, this would handle successful login, e.g., redirecting
  onLoginSuccess: () => void
}

export function PharmacyLoginForm({ onBack, onLoginSuccess }: PharmacyLoginFormProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required.") // This should be translated in a real app
      return
    }

    // --- Placeholder for actual login logic ---
    console.log("Logging in with:", { email, password, rememberMe })
    // Simulate a successful login
    // The alert is removed, as redirection is handled by the parent page.
    onLoginSuccess()
    // --- End of placeholder ---
  }

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{t.pharmacyLoginFormTitle}</CardTitle>
          <CardDescription>{t.joinTibokNetworkSubtitle}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.doctorLoginPassword}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t.passwordPlaceholder}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t.rememberMeLabel}
                </Label>
              </div>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                {t.forgotPasswordLink}
              </Link>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              {t.backButtonText}
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              {t.loginButtonText}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
