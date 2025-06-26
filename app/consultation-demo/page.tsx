"use client"

import { useEffect } from "react"
import { useConsultationStore } from "@/stores/consultation-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Bot, Send } from "lucide-react"

export default function ConsultationDemoPage() {
  // Accès au store Zustand
  const {
    callStatus,
    participants,
    isCameraOff,
    isMicMuted,
    networkQuality,
    startConsultation,
    leaveCall,
    toggleCamera,
    toggleMicrophone,
    addAISuggestion,
    sendMessage,
    chatMessages,
    aiSuggestions,
  } = useConsultationStore()

  const handleStart = () => {
    // Simule le démarrage d'une consultation
    startConsultation("consult-123", "doc-abc", "pat-xyz")
  }

  const handleAddSuggestion = () => {
    addAISuggestion({
      type: "suggestion",
      content: "Penser à vérifier la saturation en oxygène.",
      confidence: 0.85,
    })
  }

  const handleSendMessage = () => {
    sendMessage("Bonjour, comment vous sentez-vous aujourd'hui ?")
  }

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      if (
        useConsultationStore.getState().callStatus !== "idle" &&
        useConsultationStore.getState().callStatus !== "ended"
      ) {
        useConsultationStore.getState().leaveCall()
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Démonstration du Store de Consultation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Colonne de Contrôle */}
        <Card>
          <CardHeader>
            <CardTitle>Contrôles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {callStatus === "idle" || callStatus === "ended" || callStatus === "error" ? (
              <Button onClick={handleStart} className="w-full">
                Démarrer une consultation
              </Button>
            ) : (
              <Button onClick={leaveCall} variant="destructive" className="w-full">
                <PhoneOff className="mr-2 h-4 w-4" /> Quitter l'appel
              </Button>
            )}
            <div className="flex space-x-2">
              <Button onClick={toggleCamera} disabled={callStatus !== "connected"} className="flex-1">
                {isCameraOff ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />} Caméra
              </Button>
              <Button onClick={toggleMicrophone} disabled={callStatus !== "connected"} className="flex-1">
                {isMicMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />} Micro
              </Button>
            </div>
            <Button onClick={handleAddSuggestion} disabled={callStatus !== "connected"} className="w-full">
              <Bot className="mr-2 h-4 w-4" /> Ajouter Suggestion IA
            </Button>
            <Button onClick={handleSendMessage} disabled={callStatus !== "connected"} className="w-full">
              <Send className="mr-2 h-4 w-4" /> Envoyer Message
            </Button>
          </CardContent>
        </Card>

        {/* Colonne d'État */}
        <Card>
          <CardHeader>
            <CardTitle>État Actuel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              Statut de l'appel:{" "}
              <Badge variant={callStatus === "connected" ? "default" : "secondary"}>{callStatus}</Badge>
            </div>
            <div>
              Qualité réseau:{" "}
              <Badge variant={networkQuality === "good" ? "default" : "destructive"}>{networkQuality}</Badge>
            </div>
            <div>
              <h4 className="font-semibold">Participants ({participants.length})</h4>
              <ul className="text-sm list-disc list-inside">
                {participants.map((p) => (
                  <li key={p.session_id}>
                    {p.user_name} {p.local && "(Moi)"}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Colonne des Données */}
        <Card>
          <CardHeader>
            <CardTitle>Données en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-semibold">Suggestions IA</h4>
              <ul className="text-sm list-disc list-inside">
                {aiSuggestions.map((s) => (
                  <li key={s.id}>{s.content}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold">Messages du Chat</h4>
              <ul className="text-sm list-disc list-inside">
                {chatMessages.map((m) => (
                  <li key={m.id}>
                    <strong>{m.sender}:</strong> {m.content}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
