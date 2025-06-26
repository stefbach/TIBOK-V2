"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Video, Mic, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface MediaTestProps {
  onTestComplete: (success: boolean) => void
}

export default function MediaTest({ onTestComplete }: MediaTestProps) {
  const [cameraStatus, setCameraStatus] = useState<"idle" | "testing" | "allowed" | "denied">("idle")
  const [micStatus, setMicStatus] = useState<"idle" | "testing" | "allowed" | "denied">("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  useEffect(() => {
    return cleanup
  }, [])

  const testCamera = async () => {
    setCameraStatus("testing")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setCameraStatus("allowed")
    } catch (err) {
      console.error("Camera access denied:", err)
      setCameraStatus("denied")
    }
  }

  const testMicrophone = async () => {
    setMicStatus("testing")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 512
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray)
          let sumSquares = 0.0
          for (const amplitude of dataArray) {
            const val = amplitude / 128.0 - 1.0
            sumSquares += val * val
          }
          const level = Math.sqrt(sumSquares / dataArray.length)
          setAudioLevel(level * 100)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()
      setMicStatus("allowed")
    } catch (err) {
      console.error("Microphone access denied:", err)
      setMicStatus("denied")
    }
  }

  useEffect(() => {
    if (cameraStatus === "allowed" && micStatus === "allowed") {
      onTestComplete(true)
    }
  }, [cameraStatus, micStatus, onTestComplete])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification du Matériel</CardTitle>
        <CardDescription>Assurons-nous que votre caméra et votre micro fonctionnent.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Caméra */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center">
            <Video className="mr-2 h-5 w-5" /> Test de la Caméra
          </h3>
          <div className="w-full aspect-video bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
            {cameraStatus === "allowed" ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <p className="text-gray-400">Aperçu caméra</p>
            )}
          </div>
          {cameraStatus === "idle" && <Button onClick={testCamera}>Tester la caméra</Button>}
          {cameraStatus === "testing" && (
            <p className="text-sm text-gray-500 flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Demande d'accès...
            </p>
          )}
          {cameraStatus === "denied" && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" /> Accès refusé. Veuillez vérifier les permissions de votre
              navigateur.
            </p>
          )}
          {cameraStatus === "allowed" && (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" /> Caméra activée.
            </p>
          )}
        </div>

        {/* Test Microphone */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center">
            <Mic className="mr-2 h-5 w-5" /> Test du Microphone
          </h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${audioLevel}%` }} />
          </div>
          {micStatus === "idle" && <Button onClick={testMicrophone}>Tester le micro</Button>}
          {micStatus === "testing" && (
            <p className="text-sm text-gray-500 flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Demande d'accès...
            </p>
          )}
          {micStatus === "denied" && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" /> Accès refusé. Veuillez vérifier les permissions de votre
              navigateur.
            </p>
          )}
          {micStatus === "allowed" && (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" /> Micro activé. Parlez pour voir la barre bouger.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
