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

// --- État du Store ---

interface ConsultationState {
  // Core State
  currentConsultation: Consultation | null
  callStatus: CallStatus
  participants: DailyParticipant[]
  roomUrl: string | null
  roomName: string | null
  callObject: DailyCall | null
  error: string | null

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
  joinExistingConsultation: (roomUrl: string, userName: string) => Promise<void>
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

      if (!response.ok) throw new Error("Failed to create consultation room.")
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

      await get().joinExistingConsultation(roomUrl, "Doctor") // Assuming doctor joins first
    } catch (error: any) {
      set({ callStatus: "error", error: error.message })
    }
  },

  joinExistingConsultation: async (roomUrl, userName) => {
    const { callObject: existingCallObject } = get()
    if (existingCallObject) return

    set({ callStatus: "connecting", roomUrl })
    const co = Daily.createCallObject()
    set({ callObject: co })

    // Event listeners
    co.on("joined-meeting", () => set({ callStatus: "connected", participants: Object.values(co.participants()) }))
      .on("participant-updated", () => set({ participants: Object.values(co.participants()) }))
      .on("left-meeting", () => get().cleanup())
      .on("error", (e) => set({ callStatus: "error", error: e.errorMsg }))
      .on("camera-error", (e) => set({ error: `Camera error: ${e.errorMsg}` }))
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
      // In a real app, fetch a token from your /api/daily/join endpoint first
      await co.join({ url: roomUrl, userName })
    } catch (error: any) {
      set({ callStatus: "error", error: "Impossible de rejoindre l'appel." })
    }
  },

  leaveCall: () => get().callObject?.leave(),

  cleanup: () => {
    get().callObject?.destroy()
    set({
      callStatus: "ended",
      callObject: null,
      participants: [],
      roomUrl: null,
      roomName: null,
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
    const callObject = Daily.createCallObject()
    try {
      const testResults = await callObject.startWebsocketNetworkTest()
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
      set({ preCallTestStatus: "failed", error: "Le test de connexion a échoué." })
      return false
    } finally {
      callObject.destroy()
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
