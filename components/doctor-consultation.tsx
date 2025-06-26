"use client"

import { useRef } from "react"

import { useConsultationStore } from "@/stores/consultation-store"
import { useEffect, useState } from "react"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import NetworkMonitor from "./network-monitor"

// Mock data, in a real app this would come from props or an API call
const mockPatientData = {
  id: "pat_123",
  name: "Pierre Martin",
  age: 45,
  avatarUrl: "/placeholder.svg?width=128&height=128&text=PM",
  consultationType: "Suivi médical",
  reason: "Maux de tête persistants.",
  history: ["Hypertension artérielle (HTA) traitée"],
  allergies: ["Pénicilline"],
  medications: ["Lisinopril 10mg/jour"],
}

const mockAiSuggestions = [
  { id: "sugg_1", type: "suggestion", content: "Évaluer la tension artérielle.", confidence: 0.9 },
  { id: "sugg_2", type: "alert", content: "Allergie connue à la Pénicilline.", confidence: 1.0 },
  {
    id: "sugg_3",
    type: "diagnostic",
    content: "Diagnostics différentiels : Céphalée de tension, Migraine.",
    confidence: 0.75,
  },
]

const VideoTile = ({ participant }: { participant: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current && participant.video) {
      videoRef.current.srcObject = new MediaStream([participant.tracks.video.persistentTrack])
    }
  }, [participant])
  return (
    <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
      {participant.video ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
          <VideoOff className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
        <span className="text-white text-sm font-medium">{participant.user_name}</span>
      </div>
    </div>
  )
}

export default function DoctorConsultation() {
  const { callStatus, participants, isMicMuted, isCameraOff, toggleMicrophone, toggleCamera, leaveCall } =
    useConsultationStore()
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const localParticipant = participants.find((p) => p.local)
  const remoteParticipants = participants.filter((p) => !p.local)

  useEffect(() => {
    if (!notes) return
    const handler = setTimeout(() => {
      toast({ title: "Notes sauvegardées automatiquement." })
    }, 30000)
    return () => clearTimeout(handler)
  }, [notes, toast])

  if (callStatus !== "connected") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="animate-spin h-8 w-8 mr-3" />
        {callStatus === "connecting" ? "Connexion..." : "En attente..."}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col md:flex-row">
      <NetworkMonitor />
      {/* Video Column */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-gray-900 p-4">
        <main className="flex-1 grid grid-cols-1 grid-rows-1 gap-4">
          {remoteParticipants.length > 0 ? (
            <VideoTile participant={remoteParticipants[0]} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">En attente du patient...</p>
            </div>
          )}
        </main>
        <footer className="flex-shrink-0 mt-4">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-1">{localParticipant && <VideoTile participant={localParticipant} />}</div>
            <div className="col-span-1 flex items-center justify-center space-x-2 bg-black/20 rounded-lg">
              <Button onClick={toggleMicrophone} variant="ghost" size="icon" className="text-white">
                {isMicMuted ? <MicOff className="text-red-500" /> : <Mic />}
              </Button>
              <Button onClick={toggleCamera} variant="ghost" size="icon" className="text-white">
                {isCameraOff ? <VideoOff className="text-red-500" /> : <Video />}
              </Button>
              <Button onClick={leaveCall} size="icon" className="bg-red-600 hover:bg-red-700 rounded-full">
                <PhoneOff />
              </Button>
            </div>
          </div>
        </footer>
      </div>
      {/* Patient Info & AI Columns */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col md:flex-row">
        {/* Patient Info */}
        <div className="w-full md:w-1/2 p-4 border-l border-r overflow-y-auto">{/* Patient Card... */}</div>
        {/* AI & Notes */}
        <div className="w-full md:w-1/2 p-4 space-y-4 overflow-y-auto">{/* AI & Notes Cards... */}</div>
      </div>
    </div>
  )
}
