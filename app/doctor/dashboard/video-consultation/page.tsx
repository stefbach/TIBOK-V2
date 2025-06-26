"use client"

import { useConsultationStore } from "@/stores/consultation-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DoctorVideoConsultationPage() {
  const { startNewConsultation, callStatus, roomUrl, error } = useConsultationStore()
  const router = useRouter()

  const handleStart = () => {
    // Utilisation d'IDs de test pour le moment
    startNewConsultation(`consult-${Date.now()}`, "doc-123", "pat-456")
  }

  useEffect(() => {
    // Quand la connexion est établie, rediriger vers la page de consultation active
    if (callStatus === "connected") {
      router.push("/doctor/consultation-active")
    }
  }, [callStatus, router])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Démarrer une Consultation</CardTitle>
          <CardDescription>Prêt à commencer la téléconsultation avec le patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button onClick={handleStart} disabled={callStatus === "preparing" || callStatus === "connecting"}>
              {callStatus === "preparing" || callStatus === "connecting" ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Démarrer la consultation
            </Button>
            {error && <p className="text-sm text-red-600 text-center">Erreur: {error}</p>}
            {roomUrl && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-left">
                <p className="text-sm font-semibold text-green-700">Salle créée avec succès !</p>
                <p className="text-xs text-gray-700 mt-2">
                  Partagez ce lien avec le patient pour qu'il puisse vous rejoindre :
                  <br />
                  <code className="block bg-gray-200 p-2 rounded mt-1 break-all text-blue-800">
                    {`${window.location.origin}/patient/pre-check?roomUrl=${encodeURIComponent(roomUrl)}`}
                  </code>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
