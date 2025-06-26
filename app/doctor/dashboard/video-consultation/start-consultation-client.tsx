"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Patient {
  id: string
  full_name: string | null
}

interface StartConsultationClientProps {
  patients: Patient[]
  doctorId: string
}

export default function StartConsultationClient({ patients, doctorId }: StartConsultationClientProps) {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleStart = async () => {
    if (!selectedPatient) {
      setError("Veuillez sélectionner un patient.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      /* 1️⃣ Créer (ou réutiliser) la salle Daily */
      const roomRes = await fetch("/api/daily/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientId: selectedPatient,
          consultationId: `consult-${Date.now()}`,
        }),
      })

      if (!roomRes.ok) {
        const { error } = await roomRes.json()
        throw new Error(error ?? "Erreur lors de la création de la salle.")
      }

      const { roomUrl, roomName } = await roomRes.json()

      /* 2️⃣ Générer un token de connexion pour le médecin */
      const tokenRes = await fetch("/api/daily/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userName: "Médecin",
          userType: "doctor",
        }),
      })

      if (!tokenRes.ok) {
        const { error } = await tokenRes.json()
        throw new Error(error ?? "Erreur lors de la génération du token Daily.")
      }

      const { token } = await tokenRes.json()

      /* 3️⃣ Redirection vers l’interface de consultation */
      router.push(
        `/doctor/dashboard/video-consultation?roomUrl=${encodeURIComponent(roomUrl)}&token=${encodeURIComponent(token)}`,
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Démarrer une Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Choisissez un patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleStart} disabled={!selectedPatient || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Création…
              </>
            ) : (
              "Démarrer la consultation"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Provide a named export expected by other modules
export { StartConsultationClient }
