"use client"

import { useConsultationStore } from "@/stores/consultation-store"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NetworkMonitor() {
  const { callStatus, networkQuality } = useConsultationStore()

  if (callStatus !== "connected") {
    return null
  }

  const qualityStyles = {
    good: "bg-green-100 text-green-800 border-green-200",
    poor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    disconnected: "bg-red-100 text-red-800 border-red-200 animate-pulse",
  }

  const qualityIcons = {
    good: <Wifi className="mr-1 h-3 w-3" />,
    poor: <Wifi className="mr-1 h-3 w-3" />,
    disconnected: <WifiOff className="mr-1 h-3 w-3" />,
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge className={cn("text-xs", qualityStyles[networkQuality])}>
        {qualityIcons[networkQuality]}
        {networkQuality === "good" && "Connexion stable"}
        {networkQuality === "poor" && "Connexion faible"}
        {networkQuality === "disconnected" && "Déconnecté"}
      </Badge>
    </div>
  )
}
