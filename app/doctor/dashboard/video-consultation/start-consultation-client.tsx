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
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-center text-gray-500">Aucun patient trouvé.</div>
                  )}
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
                <p className="font-bold">Erreur: {error.message}</p>
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
