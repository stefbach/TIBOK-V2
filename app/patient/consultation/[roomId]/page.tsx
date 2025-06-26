"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PatientConsultation from "@/components/patient-consultation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HeartPulse } from "lucide-react"

// Page de lancement pour la consultation.
// Dans une application réelle, l'URL de la salle et le nom de l'utilisateur
// proviendraient de votre base de données ou de l'état de l'application.
export default function StartConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { roomId } = params

  const [roomUrl, setRoomUrl] = useState(`https://tibok.daily.co/${roomId}`)
  const [userName, setUserName] = useState("Jean Dupont")
  const [isConsultationStarted, setIsConsultationStarted] = useState(false)

  const handleStart = () => {
    if (roomUrl && userName) {
      setIsConsultationStarted(true)
    }
  }

  const handleEnd = () => {
    setIsConsultationStarted(false)
    // Rediriger vers le tableau de bord après la consultation
    router.push("/dashboard")
  }

  if (isConsultationStarted) {
    return (
      <div className="w-screen h-screen">
        <PatientConsultation roomUrl={roomUrl} userName={userName} userType="patient" onCallEnd={handleEnd} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <HeartPulse className="mx-auto h-12 w-12 text-blue-600" />
          <CardTitle className="mt-4 text-2xl">Rejoindre la consultation</CardTitle>
          <CardDescription>Veuillez confirmer vos informations pour continuer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="roomUrl">URL de la salle</Label>
            <Input id="roomUrl" value={roomUrl} onChange={(e) => setRoomUrl(e.target.value)} disabled />
          </div>
          <div>
            <Label htmlFor="userName">Votre nom</Label>
            <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <Button onClick={handleStart} className="w-full" size="lg" disabled={!roomUrl || !userName}>
            Démarrer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
