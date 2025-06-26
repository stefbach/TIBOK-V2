"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Paperclip, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import NetworkMonitor from "./network-monitor"
import { useConsultationStore } from "@/stores/consultation-store"

type CallState = "idle" | "joining" | "connected" | "left" | "error"
interface ChatMessage {
  id: string
  sender: string
  text: string
  time: string
  isLocal: boolean
}

interface PatientConsultationProps {
  roomUrl: string
  userName: string
  userType: "patient" | "doctor"
  onCallEnd: () => void
}

// --- Sous-composants UI ---

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

const ChatSidebar = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}: {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
}) => {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out flex flex-col",
        "w-full max-w-sm sm:w-[350px]",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.isLocal ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-xl text-sm",
                msg.isLocal ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none",
              )}
            >
              <p className="font-semibold mb-1">{msg.sender}</p>
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Composant principal ---

export default function PatientConsultation() {
  const { callStatus, participants, isMicMuted, isCameraOff, toggleMicrophone, toggleCamera, leaveCall } =
    useConsultationStore()

  const localParticipant = participants.find((p) => p.local)
  const remoteParticipants = participants.filter((p) => !p.local)

  if (callStatus !== "connected") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="animate-spin h-8 w-8 mr-3" />
        {callStatus === "connecting" ? "Connexion..." : "En attente..."}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-900 text-white relative flex flex-col">
      <NetworkMonitor />
      <main className="flex-1 p-4">
        {remoteParticipants.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg text-gray-300">En attente du médecin...</p>
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {localParticipant && <VideoTile participant={localParticipant} />}
            {remoteParticipants.map((p) => (
              <VideoTile key={p.session_id} participant={p} />
            ))}
          </div>
        )}
      </main>
      <footer className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-md mx-auto flex justify-center items-center space-x-4 bg-black/30 backdrop-blur-sm p-3 rounded-full">
          <Button onClick={toggleMicrophone} size="icon" className="rounded-full w-14 h-14">
            {isMicMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button onClick={toggleCamera} size="icon" className="rounded-full w-14 h-14">
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
          <Button onClick={leaveCall} size="icon" className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700">
            <PhoneOff size={28} />
          </Button>
        </div>
      </footer>
    </div>
  )
}
