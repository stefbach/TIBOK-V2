"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useConsultationStore } from "@/stores/consultation-store"
import MediaTest from "@/components/media-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function PreCheckContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { preCallTestStatus, networkTestResult, runPreCallTests, joinExistingConsultation, callStatus } =
    useConsultationStore()
  const [mediaTestOk, setMediaTestOk] = useState(false)
  const [isTestingNetwork, setIsTestingNetwork] = useState(false)

  const roomUrl = searchParams.get("roomUrl")

  useEffect(() => {
    if (callStatus === "connected") {
      router.push("/patient/consultation-active")
    }
  }, [callStatus, router])

  if (!roomUrl) {
    return <p>Erreur : URL de la salle manquante.</p>
  }

  const handleStartNetworkTest = () => {
    setIsTestingNetwork(true)
    runPreCallTests()
  }

  const allTestsPassed = mediaTestOk && preCallTestStatus === "completed"

  const handleProceed = () => {
    joinExistingConsultation(roomUrl, "Patient Dupont")
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Préparation de la Consultation</h1>
      <MediaTest onTestComplete={setMediaTestOk} />
      <Card>
        <CardHeader>
          <CardTitle>Test de Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          {!isTestingNetwork && (
            <Button onClick={handleStartNetworkTest} disabled={!mediaTestOk}>
              Démarrer le test réseau
            </Button>
          )}
          {isTestingNetwork && (
            <div>
              {preCallTestStatus === "testing" && <p>Test en cours...</p>}
              {preCallTestStatus === "completed" && networkTestResult && <p>{networkTestResult.recommendation}</p>}
              {preCallTestStatus === "failed" && <p>Échec du test.</p>}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center">
        <Button size="lg" disabled={!allTestsPassed || callStatus === "connecting"} onClick={handleProceed}>
          {callStatus === "connecting" ? <Loader2 className="animate-spin mr-2" /> : null}
          Rejoindre la consultation
        </Button>
      </div>
    </div>
  )
}

export default function PreConsultationCheckPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PreCheckContent />
    </Suspense>
  )
}
