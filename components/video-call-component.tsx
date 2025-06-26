"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Daily, { type DailyCall, type DailyParticipant, type DailyEventObjectFatalError } from "@daily-co/daily-js"
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CallState = "idle" | "testing" | "joining" | "connected" | "ended" | "error"

interface VideoCallComponentProps {
  roomUrl: string
  userName: string
  userType: "patient" | "doctor"
  onCallEnd: () => void
  onCallStart: () => void
}

const ParticipantTile = ({ participant }: { participant: DailyParticipant }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const videoEl = videoRef.current
    const audioEl = audioRef.current
    if (!videoEl || !audioEl || !participant) return

    videoEl.srcObject = new MediaStream([participant.tracks.video.persistentTrack as MediaStreamTrack])
    audioEl.srcObject = new MediaStream([participant.tracks.audio.persistentTrack as MediaStreamTrack])
  }, [participant])

  return (
    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      {!participant.audio && (
        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
          <MicOff className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-2 w-full">
        <span className="text-white text-sm font-medium">{participant.user_name}</span>
      </div>
    </div>
  )
}

export default function VideoCallComponent({ roomUrl, userName, onCallEnd, onCallStart }: VideoCallComponentProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const [callState, setCallState] = useState<CallState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({})

  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)

  const handleStartTest = useCallback(async () => {
    setCallState("testing")
    const co = Daily.createCallObject()

    try {
      await co.startCamera()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = co.localStream()
      }
      setCallObject(co)
    } catch (err) {
      console.error("Failed to start camera:", err)
      setError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.")
      setCallState("error")
      co.destroy()
    }
  }, [])

  const handleJoinCall = useCallback(async () => {
    if (!callObject) return
    setCallState("joining")
    try {
      await callObject.join({ url: roomUrl, userName })
    } catch (err) {
      console.error("Failed to join call:", err)
      setError("La connexion à la salle a échoué.")
      setCallState("error")
    }
  }, [callObject, roomUrl, userName])

  const handleLeaveCall = useCallback(() => {
    callObject?.leave()
  }, [callObject])

  const handleToggleMic = useCallback(() => {
    if (!callObject) return
    const newMutedState = !isMicMuted
    callObject.setLocalAudio(newMutedState)
    setIsMicMuted(newMutedState)
  }, [callObject, isMicMuted])

  const handleToggleCamera = useCallback(() => {
    if (!callObject) return
    const newCameraState = !isCameraOff
    callObject.setLocalVideo(newCameraState)
    setIsCameraOff(newCameraState)
  }, [callObject, isCameraOff])

  useEffect(() => {
    if (!callObject) return

    const events: (keyof DailyCall)[] = [
      "joined-meeting",
      "left-meeting",
      "participant-joined",
      "participant-updated",
      "participant-left",
      "error",
    ]

    const handleNewParticipants = () => {
      if (!callObject) return
      const allParticipants = callObject.participants()
      setParticipants(allParticipants)
    }

    const handleJoinedMeeting = () => {
      setCallState("connected")
      onCallStart()
      handleNewParticipants()
    }

    const handleLeftMeeting = () => {
      setCallState("ended")
      onCallEnd()
      callObject.destroy()
    }

    const handleError = (e?: DailyEventObjectFatalError) => {
      console.error("Daily error:", e)
      setError(e?.errorMsg || "Une erreur inattendue est survenue.")
      setCallState("error")
    }

    callObject.on("joined-meeting", handleJoinedMeeting)
    callObject.on("left-meeting", handleLeftMeeting)
    callObject.on("participant-joined", handleNewParticipants)
    callObject.on("participant-updated", handleNewParticipants)
    callObject.on("participant-left", handleNewParticipants)
    callObject.on("error", handleError)

    return () => {
      events.forEach((event) => callObject.off(event as any, () => {}))
    }
  }, [callObject, onCallEnd, onCallStart])

  const renderContent = () => {
    switch (callState) {
      case "idle":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Prêt pour la consultation ?</h2>
            <p className="text-gray-300 mb-8">Nous allons d'abord tester votre caméra et votre micro.</p>
            <Button onClick={handleStartTest} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Démarrer le test
            </Button>
          </div>
        )
      case "testing":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Vérification du matériel</h2>
            <div className="w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-300 mb-8">Si vous vous voyez, tout est prêt.</p>
            <Button onClick={handleJoinCall} size="lg" className="bg-[#10B981] hover:bg-[#059669]">
              Rejoindre la consultation
            </Button>
          </div>
        )
      case "joining":
        return (
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-xl">Connexion en cours...</p>
          </div>
        )
      case "connected":
        const remoteParticipants = Object.values(participants).filter((p) => !p.local)
        const localParticipant = participants.local

        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {localParticipant && (
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-2 w-full">
                    <span className="text-white text-sm font-medium">{localParticipant.user_name} (Vous)</span>
                  </div>
                </div>
              )}
              {remoteParticipants.map((p) => (
                <ParticipantTile key={p.session_id} participant={p} />
              ))}
            </div>
          </div>
        )
      case "ended":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Appel terminé</h2>
            <Button onClick={onCallEnd} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Retourner au tableau de bord
            </Button>
          </div>
        )
      case "error":
        return (
          <div className="text-center text-white bg-red-900/50 p-8 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Une erreur est survenue</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <Button onClick={onCallEnd} variant="secondary">
              Fermer
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center relative">
      {renderContent()}
      {callState === "connected" && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-4">
          <div className="flex justify-center items-center space-x-4">
            <Button
              onClick={handleToggleMic}
              size="icon"
              className={cn(
                "rounded-full w-14 h-14",
                isMicMuted ? "bg-white text-gray-800 hover:bg-gray-200" : "bg-gray-700/80 text-white hover:bg-gray-600",
              )}
            >
              {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
            <Button
              onClick={handleToggleCamera}
              size="icon"
              className={cn(
                "rounded-full w-14 h-14",
                isCameraOff
                  ? "bg-white text-gray-800 hover:bg-gray-200"
                  : "bg-gray-700/80 text-white hover:bg-gray-600",
              )}
            >
              {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            </Button>
            <Button
              onClick={handleLeaveCall}
              size="icon"
              className="rounded-full w-16 h-16 bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              <PhoneOff size={28} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
