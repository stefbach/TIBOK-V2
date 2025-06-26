import { create } from "zustand"
import Daily, { type DailyCall, type DailyParticipant, type DailyEventObjectAppMessage } from "@daily-co/daily-js"

// --- Interfaces (Types) ---

export interface Consultation {
  id: string
  doctorId: string
  patientId: string
  roomUrl?: string
  roomName?: string
  status: "scheduled" | "active" | "ended"
  startTime: Date
  endTime?: Date
}

export interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: Date
  isLocal: boolean
}

export interface AISuggestion {
  id: string
  type: "suggestion" | "alert" | "diagnosis"
  content: string
  confidence: number
  timestamp: Date
}

type CallStatus = "idle" | "preparing" | "connecting" | "connected" | "left" | "error"
type NetworkQuality = "good" | "poor" | "disconnected"

type PreCallTestStatus = "idle" | "testing" | "completed" | "failed"
interface NetworkTestResult {
  quality: number // 0-100
  stats: {
    download?: { bitsPerSecond: number }
    upload?: { bitsPerSecond: number }
    latency?: { milliseconds: number }
  }
  recommendation: string
}

interface ErrorState {
  message: string
  details?: any
}

// --- État du Store ---

interface ConsultationState {
  // Core State
  currentConsultation: Consultation | null
  callStatus: CallStatus
  participants: DailyParticipant[]
  roomUrl: string | null
  roomName: string | null
  callObject: DailyCall | null
  error: ErrorState | null

  // Media & Permissions
  mediaPermissions: { camera: boolean; audio: boolean }
  isCameraOff: boolean
  isMicMuted: boolean

  // Features State
  chatMessages: ChatMessage[]
  aiSuggestions: AISuggestion[]
  networkQuality: NetworkQuality

  preCallTestStatus: PreCallTestStatus
  networkTestResult: NetworkTestResult | null
  isAudioOnly: boolean

  // Actions
  startNewConsultation: (consultationId: string, doctorId: string, patientId: string) => Promise<void>
  joinExistingConsultation: (roomUrl: string, userName: string, userType?: "patient" | "doctor") => Promise<void>
  leaveCall: () => void
  toggleCamera: () => void
  toggleMicrophone: () => void
  sendMessage: (content: string) => void
  addAISuggestion: (suggestion: Omit<AISuggestion, "id" | "timestamp">) => void
  runPreCallTests: () => Promise<boolean>
  switchToAudioOnly: () => void
  cleanup: () => void
}

// --- Création du Store Zustand ---

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  // Initial State
  currentConsultation: null,
  callStatus: "idle",
  participants: [],
  roomUrl: null,
  roomName: null,
  callObject: null,
  error: null,
  mediaPermissions: { camera: false, audio: false },
  isCameraOff: false,
  isMicMuted: false,
  chatMessages: [],
  aiSuggestions: [],
  networkQuality: "good",
  preCallTestStatus: "idle",
  networkTestResult: null,
  isAudioOnly: false,

  // --- Actions ---

  startNewConsultation: async (consultationId, doctorId, patientId) => {
    set({ callStatus: "preparing", error: null })
    try {
      const response = await fetch("/api/daily/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId, doctorId, patientId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create consultation room.", { cause: errorData.details })
      }
      const { roomUrl, roomName } = await response.json()

      const newConsultation: Consultation = {
        id: consultationId,
        doctorId,
        patientId,
        roomUrl,
        roomName,
        status: "active",
        startTime: new Date(),
      }
      set({ currentConsultation: newConsultation, roomUrl, roomName })

      await get().joinExistingConsultation(roomUrl, "Doctor", "doctor") // Medecin = owner
    } catch (error: any) {
      set({ callStatus: "error", error: { message: error.message, details: error.cause } })
    }
  },

  joinExistingConsultation: async (roomUrl, userName, userType = "patient") => {
    const { callObject: existingCallObject } = get()
    if (existingCallObject) return

    set({ callStatus: "connecting", roomUrl })
    const co = Daily.createCallObject()
    set({ callObject: co })

    // Extraire le roomName de l'URL (ex: https://xxx.daily.co/roomName)
    const roomName = roomUrl.split("/").pop()

    // Appeler le backend pour obtenir un token sécurisé
    let token: string | undefined = undefined
    try {
      const tokenRes = await fetch("/api/daily/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userName, userType }),
      })
      if (!tokenRes.ok) {
        throw new Error("Impossible d'obtenir le token d'accès.")
      }
      const tokenData = await tokenRes.json()
      token = tokenData.token
    } catch (e: any) {
      set({ callStatus: "error", error: { message: "Impossible d'obtenir le token d'accès." } })
      return
    }

    // Event listeners
    co.on("joined-meeting", () => set({ callStatus: "connected", participants: Object.values(co.participants()) }))
      .on("participant-updated", () => set({ participants: Object.values(co.participants()) }))
      .on("left-meeting", () => get().cleanup())
      .on("error", (e) => set({ callStatus: "error", error: { message: e.errorMsg } }))
      .on("camera-error", (e) => set({ error: { message: `Camera error: ${e.errorMsg}` } }))
      .on("network-quality-change", (e) => set({ networkQuality: e.threshold === "good" ? "good" : "poor" }))
      .on("app-message", (e: DailyEventObjectAppMessage) => {
        const sender = e.fromId === co.participants().local.session_id
        const senderName = co.participants()[e.fromId]?.user_name || "Inconnu"
        const newMessage: ChatMessage = {
          id: `${Date.now()}-${e.fromId}`,
          content: e.data.message,
          sender: senderName,
          timestamp: new Date(),
          isLocal: sender,
        }
        set((state) => ({ chatMessages: [...state.chatMessages, newMessage] }))
      })

    try {
      await co.join({ url: roomUrl, token, userName })
    } catch (error: any) {
      set({ callStatus: "error", error: { message: "Impossible de rejoindre l'appel." } })
    }
  },

  leaveCall: () => get().callObject?.leave(),

  cleanup: () => {
    get().callObject?.destroy()
    set({
      callStatus: "left",
      callObject: null,
      participants: [],
      // roomUrl et roomName conservés pour éventuel résumé ou reconnexion
    })
  },

  toggleCamera: () => {
    const co = get().callObject
    if (co) {
      const newVideoState = !co.localVideo()
      co.setLocalVideo(newVideoState)
      set({ isCameraOff: !newVideoState })
    }
  },

  toggleMicrophone: () => {
    const co = get().callObject
    if (co) {
      const newAudioState = !co.localAudio()
      co.setLocalAudio(newAudioState)
      set({ isMicMuted: !newAudioState })
    }
  },

  sendMessage: (content: string) => {
    get().callObject?.sendAppMessage({ message: content }, "*")
    const localParticipant = Object.values(get().participants).find((p) => p.local)
    const newMessage: ChatMessage = {
      id: `${Date.now()}-local`,
      content,
      sender: localParticipant?.user_name || "Moi",
      timestamp: new Date(),
      isLocal: true,
    }
    set((state) => ({ chatMessages: [...state.chatMessages, newMessage] }))
  },

  addAISuggestion: (suggestion) => {
    const newSuggestion: AISuggestion = {
      ...suggestion,
      id: `ai-${Date.now()}`,
      timestamp: new Date(),
    }
    set((state) => ({ aiSuggestions: [...state.aiSuggestions, newSuggestion] }))
  },

  runPreCallTests: async () => {
    set({ preCallTestStatus: "testing", networkTestResult: null })
    try {
      const testResults = await Daily.createCallObject().startWebsocketNetworkTest()
      const result: NetworkTestResult = {
        quality: testResults.quality,
        stats: {
          download: testResults.results.download,
          upload: testResults.results.upload,
          latency: testResults.results.latency,
        },
        recommendation:
          testResults.quality < 50
            ? "Votre connexion semble faible. Pensez à vous rapprocher de votre routeur."
            : "Votre connexion est bonne pour la consultation.",
      }
      set({ preCallTestStatus: "completed", networkTestResult: result })
      return result.quality >= 50
    } catch (error) {
      set({ preCallTestStatus: "failed", error: { message: "Le test de connexion a échoué." } })
      return false
    }
  },

  switchToAudioOnly: () => {
    const { callObject } = get()
    if (callObject) {
      callObject.setLocalVideo(false)
      callObject.updateSubscriptions({ "*": { video: false } })
    }
    set({ isAudioOnly: true, isCameraOff: true })
  },
}))
