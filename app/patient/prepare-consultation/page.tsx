"use client"

import PatientPreparation from "@/components/patient-preparation"
import { useRouter } from "next/navigation"

export default function PrepareConsultationPage() {
  const router = useRouter()

  const handleStartConsultation = () => {
    console.log("Tests réussis, redirection vers la salle de consultation...")
    // Remplacez par la logique de création/recherche de la salle Daily.co
    const roomId = "exemple-salle-123"
    router.push(`/consultation/${roomId}`)
  }

  const mockConsultationInfo = {
    doctorName: "Dr. Marie Dubois",
    consultationType: "Consultation de suivi",
    scheduledTime: "14:30",
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PatientPreparation consultationInfo={mockConsultationInfo} onStartConsultation={handleStartConsultation} />
    </div>
  )
}
