"use client"

import { useConsultationStore } from "@/stores/consultation-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Données fictives. Dans une vraie application, cela viendrait de votre base de données.
const mockPatients = [
  { id: "pat-7a4b", name: "Alice Martin" },
  { id: "pat-9c2d", name: "Bernard Dubois" },
  { id: "pat-3e8f", name: "Chloé Petit" },
]

export default function DoctorVideoConsultationPage() {
  const { startNewConsultation, callStatus, roomUrl, error } = useConsultationStore()
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const handleStart = () => {
    if (!selectedPatientId) {
      // Normalement, le bouton est désactivé, mais c'est une sécurité supplémentaire.
      alert("Veuillez sélectionner un patient.")
      return
    }
    // Utilisation d'un ID de médecin fixe et de l'ID du patient sélectionné.
    startNewConsultation(`consult-${Date.now()}`, "doc-123", selectedPatientId)
  }

  useEffect(() => {
    // Quand la connexion est établie, rediriger vers la page de consultation active
    if (callStatus === "connected") {
      router.push("/doctor/consultation-active")
    }
  }, [callStatus, router])

  const getSelectedPatientName = () => {
    return mockPatients.find((p) => p.id === selectedPatientId)?.name || ""
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Démarrer une Consultation</CardTitle>
          <CardDescription>Sélectionnez un patient pour commencer la téléconsultation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-select">Choisir un patient</Label>
              <Select onValueChange={setSelectedPatientId} value={selectedPatientId || ""}>
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Sélectionnez un patient..." />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStart}
              disabled={!selectedPatientId || callStatus === "preparing" || callStatus === "connecting"}
            >
              {callStatus === "preparing" || callStatus === "connecting" ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Démarrer la consultation avec {getSelectedPatientName()}
            </Button>

            {error && (
              <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-md">
                <p className="font-bold">Erreur: {error.message || error}</p>
                {error.details && <p className="text-xs mt-1">Détails: {JSON.stringify(error.details)}</p>}
              </div>
            )}

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
