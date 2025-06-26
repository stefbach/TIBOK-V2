"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useConsultationStore } from "@/stores/consultation-store"
import MediaTest from "@/components/media-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function PreConsultationCheckPage() {
  const router = useRouter()
  const { preCallTestStatus, networkTestResult, runPreCallTests } = useConsultationStore()
  const [mediaTestOk, setMediaTestOk] = useState(false)
  const [isTestingNetwork, setIsTestingNetwork] = useState(false)

  const handleStartNetworkTest = () => {
    setIsTestingNetwork(true)
    runPreCallTests()
  }

  const allTestsPassed = mediaTestOk && preCallTestStatus === "completed"

  const handleProceed = () => {
    // Ici, vous démarreriez la consultation, par exemple en naviguant
    // vers la page de consultation qui utilisera le store.
    // Pour la démo, on navigue vers une page de succès.
    router.push("/consultation-demo") // Remplacez par votre page de consultation
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Préparation de la Consultation</h1>

        {/* Étape 1: Test du matériel */}
        <MediaTest onTestComplete={setMediaTestOk} />

        {/* Étape 2: Test du réseau */}
        <Card>
          <CardHeader>
            <CardTitle>Test de Connexion</CardTitle>
            <CardDescription>Nous allons vérifier la qualité de votre réseau.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isTestingNetwork && (
              <Button onClick={handleStartNetworkTest} disabled={!mediaTestOk}>
                Démarrer le test réseau
              </Button>
            )}
            {isTestingNetwork && (
              <div className="space-y-4">
                {preCallTestStatus === "testing" && (
                  <div className="flex items-center text-gray-600">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    <p>Test en cours, veuillez patienter...</p>
                  </div>
                )}
                {preCallTestStatus === "completed" && networkTestResult && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800 font-semibold">
                      <CheckCircle className="mr-2 h-5 w-5" /> Test terminé
                    </div>
                    <p className="text-sm text-green-700 mt-2">{networkTestResult.recommendation}</p>
                    <div className="text-xs mt-2 text-gray-600">
                      Qualité: {networkTestResult.quality}% | Latence: {networkTestResult.stats.latency?.milliseconds}ms
                    </div>
                  </div>
                )}
                {preCallTestStatus === "failed" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800 font-semibold">
                      <AlertCircle className="mr-2 h-5 w-5" /> Échec du test
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Impossible de vérifier votre connexion. Veuillez réessayer.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Étape 3: Démarrer */}
        <div className="text-center">
          <Button size="lg" disabled={!allTestsPassed} onClick={handleProceed}>
            {allTestsPassed ? "Rejoindre la consultation" : "Veuillez compléter les tests"}
          </Button>
        </div>
      </div>
    </div>
  )
}
