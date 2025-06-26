"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Video, VideoOff, Mic, Volume2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ConsultationInfo = {
  doctorName: string
  consultationType: string
  scheduledTime: string
}

type PatientPreparationProps = {
  consultationInfo: ConsultationInfo
  onStartConsultation: () => void
}

type Status = "idle" | "testing" | "enabled" | "denied"

export default function PatientPreparation({ consultationInfo, onStartConsultation }: PatientPreparationProps) {
  const [cameraStatus, setCameraStatus] = useState<Status>("idle")
  const [micStatus, setMicStatus] = useState<Status>("idle")
  const [speakerTested, setSpeakerTested] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const [volume, setVolume] = useState(0)

  const testsCompleted = cameraStatus === "enabled" && micStatus === "enabled" && speakerTested

  const cleanupStreams = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupStreams()
    }
  }, [cleanupStreams])

  const handleActivateCamera = async () => {
    setCameraStatus("testing")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        mediaStreamRef.current = stream
      }
      setCameraStatus("enabled")
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err)
      setCameraStatus("denied")
    }
  }

  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(dataArray)
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] - 128)
    }
    const avg = sum / dataArray.length
    setVolume(avg / 128)
    animationFrameIdRef.current = requestAnimationFrame(visualizeAudio)
  }, [])

  const handleActivateMic = async () => {
    setMicStatus("testing")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      visualizeAudio()
      setMicStatus("enabled")
    } catch (err) {
      console.error("Erreur d'accès au microphone:", err)
      setMicStatus("denied")
    }
  }

  const handleTestSpeaker = () => {
    const audio = new Audio("/audio/test-sound.mp3") // Assurez-vous d'avoir ce fichier
    audio.play().catch((e) => console.error("Erreur lecture son:", e))
    setSpeakerTested(true)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Préparation de la Consultation
        </h1>
        <p className="text-gray-600 mt-2">Vérifions votre équipement avant de commencer.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section gauche: Tests */}
        <div className="w-full lg:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tests de l'équipement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Caméra */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Video className="mr-2 text-indigo-600" /> Test de la Caméra
                </h3>
                <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                  {cameraStatus !== "enabled" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <VideoOff size={48} className="text-gray-500" />
                      <p className="mt-2 text-gray-400">La prévisualisation de la caméra apparaîtra ici.</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {cameraStatus === "idle" && <Button onClick={handleActivateCamera}>Activer la caméra</Button>}
                  {cameraStatus === "testing" && (
                    <Button disabled>
                      <Loader2 className="animate-spin mr-2" /> Activation...
                    </Button>
                  )}
                  {cameraStatus === "enabled" && (
                    <div className="text-green-600 font-semibold flex items-center">
                      <CheckCircle className="mr-2" /> Caméra activée
                    </div>
                  )}
                  {cameraStatus === "denied" && (
                    <div className="text-red-600 font-semibold flex items-center">
                      <AlertTriangle className="mr-2" /> Accès refusé. Veuillez vérifier les permissions de votre
                      navigateur.
                    </div>
                  )}
                </div>
              </div>

              {/* Test Audio */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Mic className="mr-2 text-indigo-600" /> Test Audio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Microphone */}
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Microphone</h4>
                    {micStatus === "idle" && <Button onClick={handleActivateMic}>Activer le micro</Button>}
                    {micStatus === "testing" && (
                      <Button disabled>
                        <Loader2 className="animate-spin mr-2" /> Activation...
                      </Button>
                    )}
                    {micStatus === "enabled" && (
                      <div>
                        <div className="text-green-600 font-semibold flex items-center mb-3">
                          <CheckCircle className="mr-2" /> Micro activé
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-green-500 h-4 rounded-full transition-all"
                            style={{ width: `${volume * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Parlez pour voir le niveau sonore.</p>
                      </div>
                    )}
                    {micStatus === "denied" && (
                      <div className="text-red-600 font-semibold flex items-center">
                        <AlertTriangle className="mr-2" /> Accès refusé.
                      </div>
                    )}
                  </div>
                  {/* Haut-parleurs */}
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Haut-parleurs</h4>
                    <Button onClick={handleTestSpeaker} variant="outline">
                      <Volume2 className="mr-2" /> Tester le son
                    </Button>
                    {speakerTested && (
                      <div className="text-green-600 font-semibold flex items-center mt-3">
                        <CheckCircle className="mr-2" /> Test effectué.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section droite: Infos */}
        <div className="w-full lg:w-1/3 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Médecin:</span>
                <span className="font-semibold text-gray-900">{consultationInfo.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold text-gray-900">{consultationInfo.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heure:</span>
                <span className="font-semibold text-gray-900">{consultationInfo.scheduledTime}</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="py-1">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              </div>
              <div>
                <h4 className="font-bold text-red-800">Urgence Médicale ?</h4>
                <p className="text-sm text-red-700 mt-1">
                  Si vous êtes dans une situation d'urgence critique, veuillez ne pas attendre.
                </p>
                <a href="tel:114">
                  <Button className="mt-3 bg-red-600 hover:bg-red-700 text-white">Appeler le 114</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de démarrage */}
      <div className="mt-12 text-center">
        <Button
          size="lg"
          className={cn(
            "px-12 py-6 text-lg font-bold",
            testsCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed",
          )}
          onClick={() => {
            cleanupStreams()
            onStartConsultation()
          }}
          disabled={!testsCompleted}
        >
          {testsCompleted ? "Démarrer la Consultation" : "Veuillez compléter les tests"}
        </Button>
        {!testsCompleted && (
          <p className="text-sm text-gray-500 mt-2">
            La caméra, le microphone et les haut-parleurs doivent être testés.
          </p>
        )}
      </div>
    </div>
  )
}
