"use client"

import { useState } from "react"
import { DoctorConsultation } from "@/components/doctor-consultation" // Assurez-vous que le chemin est correct

// Données fictives pour la démonstration
const mockPatientData = {
  id: "patient-123",
  name: "Pierre Martin",
  age: 45,
  avatarUrl: "/placeholder-user.jpg",
  consultationType: "Suivi médical",
  reason: "Maux de tête persistants depuis une semaine, non soulagés par les antalgiques habituels.",
  history: ["Hypertension artérielle (HTA) traitée", "Cholestérol élevé"],
  allergies: ["Pénicilline"],
  medications: ["Lisinopril 10mg/jour", "Atorvastatine 20mg/jour"],
}

const mockAiSuggestions = [
  {
    id: "sugg-1",
    type: "suggestion",
    text: "Évaluer la tension artérielle en raison des antécédents d'hypertension et des céphalées.",
  },
  {
    id: "sugg-2",
    type: "alert",
    text: "Allergie connue à la Pénicilline. Éviter les antibiotiques de la famille des bêtalactamines.",
  },
  {
    id: "sugg-3",
    type: "diagnostic",
    text: "Diagnostics différentiels à considérer : céphalée de tension, migraine, HTA non contrôlée.",
  },
  {
    id: "sugg-4",
    type: "suggestion",
    text: "Suggérer un journal des maux de tête pour suivre la fréquence, l'intensité et les déclencheurs.",
  },
]

export default function VideoConsultationPage() {
  const [consultationDetails, setConsultationDetails] = useState<{ roomUrl: string; token: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartConsultation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Créer la salle de consultation
      const roomResponse = await fetch("/api/daily/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: "doc-xyz",
          patientId: "patient-123",
          consultationId: `consult-${Date.now()}`,
        }),
      })

      if (!roomResponse.ok) {
        const errorData = await roomResponse.json()
        throw new Error(errorData.error || "Erreur lors de la création de la salle.")
      }

      const { roomUrl, roomName } = await roomResponse.json()

      // 2. Obtenir un token pour le médecin
      const tokenResponse = await fetch("/api/daily/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName,
          userName: "Dr. Lefebvre",
          userType: "doctor",
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error || "Erreur lors de la génération du token.")
      }

      const { token } = await tokenResponse.json()

      setConsultationDetails({ roomUrl, token })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (consultationDetails) {
    return (
      <DoctorConsultation
        roomUrl={consultationDetails.roomUrl}
        token={consultationDetails.token}
        patientData={mockPatientData}
        aiSuggestions={mockAiSuggestions}
        onLeave={() => setConsultationDetails(null)}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Démarrer une Consultation</h1>
          <p className="mt-2 text-sm text-gray-600">Prêt à commencer la téléconsultation avec le patient.</p>
        </div>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        <button
          onClick={handleStartConsultation}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? "Création de la salle..." : "Démarrer la consultation"}
        </button>
      </div>
    </div>
  )
}
