"use client"

import { useConsultationStore } from "@/stores/consultation-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Patient {
  id: string
  full_name: string | null
}

interface StartConsultationClientProps {
  patients: Patient[]
  doctorId: string
}

export function StartConsultationClient({ patients, doctorId }: StartConsultationClientProps) {
  const { startNewConsultation, callStatus, roomUrl, error } = useConsultationStore()
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const handleStart = () => {
    if (!selectedPatientId) {
      alert("Veuillez sélectionner un patient.")
      return
    }
    startNewConsultation(`consult-${Date.now()}`, doctorId, selectedPatientId)
  }

  useEffect(() => {
    if (callStatus === "connected") {
      router.push("/doctor/consultation-active")
    }
  }, [callStatus, router])

  const getSelectedPatientName = () => {
    return patients.find((p) => p.id === selectedPatientId)?.full_name || ""
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Démarrer une Consultation</CardTitle>
          <CardDescription className="text-gray-600">
            Sélectionnez un patient pour commencer la téléconsultation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patient-select" className="font-semibold text-gray-700">
                Choisir un patient
              </Label>
              <Select onValueChange={setSelectedPatientId} value={selectedPatientId || ""}>
                <SelectTrigger id="patient-select" className="w-full">
                  <SelectValue placeholder="Sélectionnez un patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name || "Patient anonyme"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">Aucun patient trouvé.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStart}
              disabled={!selectedPatientId || callStatus === "preparing" || callStatus === "connecting"}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {callStatus === "preparing" || callStatus === "connecting" ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Démarrer avec {getSelectedPatientName()}
            </Button>

            {error && (
              <div className="text-sm text-red-600 text-center p-3 bg-red-50 rounded-md border border-red-200">
                <p className="font-bold">Erreur: {error.message || error}</p>
              </div>
            )}

            {roomUrl && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200 text-left">
                <p className="text-sm font-semibold text-green-800">Salle créée avec succès !</p>
                <p className="text-xs text-gray-700 mt-2">
                  Partagez ce lien avec le patient :
                  <br />
                  <code className="block bg-gray-200 p-2 rounded mt-1 break-all text-blue-800 text-xs">
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
