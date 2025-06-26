"use client"

import { useConsultationStore } from "@/stores/consultation-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function DoctorStartPage() {
  const { startNewConsultation, callStatus, roomUrl, error } = useConsultationStore()
  const router = useRouter()

  const handleStart = () => {
    startNewConsultation(`consult-${Date.now()}`, "doc-123", "pat-456")
  }

  useEffect(() => {
    if (callStatus === "connected") {
      router.push("/doctor/consultation-active")
    }
  }, [callStatus, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Portail Médecin</h1>
        <p className="text-gray-600">Cliquez ci-dessous pour démarrer une nouvelle consultation.</p>
        <Button onClick={handleStart} disabled={callStatus === "preparing" || callStatus === "connecting"}>
          {callStatus === "preparing" || callStatus === "connecting" ? <Loader2 className="animate-spin mr-2" /> : null}
          Démarrer une nouvelle consultation
        </Button>
        {error && <p className="text-sm text-red-600 mt-4">Erreur: {error}</p>}
        {roomUrl && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-left">
            <p className="text-sm font-semibold">Salle créée !</p>
            <p className="text-xs text-gray-700">
              Partagez ce lien avec le patient :
              <br />
              <code className="block bg-gray-200 p-2 rounded mt-1 break-all">
                {`${window.location.origin}/patient/pre-check?roomUrl=${encodeURIComponent(roomUrl)}`}
              </code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
