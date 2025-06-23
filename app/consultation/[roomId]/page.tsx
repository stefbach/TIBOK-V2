"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ClipboardList,
  FileText,
  Settings,
  Send,
  RefreshCw,
  AlertCircle,
  TurtleIcon as TibotIcon,
  Save,
  X,
  CheckCircle,
  Info,
  Loader2,
  Plus,
  UserIcon as UserMd,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Placeholder for Daily.co integration
// import DailyIframe from '@daily-co/daily-js';

interface ChatMessage {
  id: string
  sender: "patient" | "doctor"
  text: string
  time: string
}

// Mock data, replace with actual data passed from waiting room or API
const mockConsultationData = {
  doctor: {
    nameKey: "consultationDoctorName" as TranslationKey, // Dr. Marie Dubois
    specialtyKey: "consultationSpecialtyGP" as TranslationKey, // Médecin Généraliste
    avatarUrl: "/placeholder.svg?width=40&height=40",
  },
  patient: {
    name: "Jean Dupont",
    age: 35,
    subscriptionKey: "consultationSubscriptionTypeSolo" as TranslationKey, // Pack Solo
    reasonKey: "consultationReasonDefault" as TranslationKey, // Consultation générale - Fièvre et fatigue
  },
}

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { roomId } = params
  const { language, setLanguage: setGlobalLanguage } = useLanguage()
  const t = translations[language]

  const [callDuration, setCallDuration] = useState("00:00")
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [activePanel, setActivePanel] = useState<"chat" | "notes" | "prescription" | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "doctor",
      text: t.consultationChatDoctorHello.replace("{patientName}", mockConsultationData.patient.name),
      time: "14:32",
    },
    { id: "2", sender: "patient", text: t.consultationChatPatientExample, time: "14:33" },
  ])
  const [chatInput, setChatInput] = useState("")
  const [notes, setNotes] = useState(
    `Symptômes:\n- Fièvre 38.5°C depuis 2 jours\n- Fatigue générale\n\nDiagnostic provisoire:\n- Syndrome grippal`,
  )
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id: "med1", name: "Paracétamol 500mg", dosage: "1 comprimé 3x/jour pendant 5 jours" },
    { id: "med2", name: "Vitamine C 1000mg", dosage: "1 comprimé/jour pendant 7 jours" },
  ])
  const [showVideoPlaceholder, setShowVideoPlaceholder] = useState(true)
  const [notification, setNotification] = useState<{
    messageKey: TranslationKey
    type: "success" | "warning" | "info" | "error"
  } | null>(null)

  // Daily.co ref
  // const callFrameRef = useRef<any>(null); // For DailyIframe instance

  useEffect(() => {
    // Simulate Daily.co connection
    const timer = setTimeout(() => {
      setShowVideoPlaceholder(false)
      showAppNotification("consultationNotificationConnected", "success")
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setCallDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const showAppNotification = (messageKey: TranslationKey, type: "success" | "warning" | "info" | "error") => {
    setNotification({ messageKey, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted)
    showAppNotification(isMicMuted ? "consultationNotificationMicUnmuted" : "consultationNotificationMicMuted", "info")
    // Daily.co: callFrameRef.current?.setLocalAudio(isMicMuted);
  }

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    showAppNotification(isVideoOff ? "consultationNotificationCamOn" : "consultationNotificationCamOff", "info")
    // Daily.co: callFrameRef.current?.setLocalVideo(isVideoOff);
  }

  const handleSwitchCamera = () => {
    showAppNotification("consultationNotificationCamSwitch", "info")
    // Daily.co: callFrameRef.current?.cycleCamera();
  }

  const handleEndCall = () => {
    if (window.confirm(t.consultationConfirmEndCall)) {
      showAppNotification("consultationNotificationCallEnded", "success")
      // Daily.co: callFrameRef.current?.leave();
      setTimeout(() => router.push("/dashboard?tab=history"), 2000)
    }
  }

  const handleTogglePanel = (panel: "chat" | "notes" | "prescription" | null) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now().toString(),
          sender: "patient",
          text: chatInput,
          time: new Date().toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setChatInput("")
      // Simulate doctor response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-doc",
            sender: "doctor",
            text: t.consultationChatDoctorExampleReply,
            time: new Date().toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }, 1500)
    }
  }

  const handleSaveNotes = () => showAppNotification("consultationNotificationNotesSaved", "success")
  const handleAddMedication = () => alert("Add medication UI would appear here.")
  const handleRemoveMedication = (id: string) => setPrescriptionItems((prev) => prev.filter((item) => item.id !== id))
  const handleSendPrescription = () => showAppNotification("consultationNotificationPrescriptionSent", "success")
  const handleSavePrescriptionDraft = () => showAppNotification("consultationNotificationDraftSaved", "success")
  const handleOpenSettings = () => showAppNotification("consultationNotificationSettings", "info")
  const handleOpenTibot = () => showAppNotification("consultationNotificationTiBotInfo", "info")

  const controlButtons = [
    {
      id: "chat",
      icon: MessageSquare,
      labelKey: "consultationChat" as TranslationKey,
      action: () => handleTogglePanel("chat"),
      badgeCount: chatMessages.filter((m) => m.sender === "doctor" && m.id === "1").length /* Example badge */,
    },
    {
      id: "notes",
      icon: ClipboardList,
      labelKey: "consultationNotes" as TranslationKey,
      action: () => handleTogglePanel("notes"),
    },
    {
      id: "prescription",
      icon: FileText,
      labelKey: "consultationPrescription" as TranslationKey,
      action: () => handleTogglePanel("prescription"),
    },
    { id: "settings", icon: Settings, labelKey: "consultationSettings" as TranslationKey, action: handleOpenSettings },
  ]

  const PanelContent = () => {
    if (!activePanel) return null
    switch (activePanel) {
      case "chat":
        return (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.sender === "patient" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "chat-bubble max-w-[80%] p-3 rounded-xl text-sm",
                      msg.sender === "patient"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none",
                    )}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-70 block mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder={t.consultationTypeMessage}
                  className="flex-1"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
                />
                <Button onClick={handleSendChatMessage} size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        )
      case "notes":
        return (
          <>
            <div className="flex-1 p-4">
              <Textarea
                id="consultationNotes"
                className="w-full h-full border rounded-lg p-3 text-sm resize-none min-h-[200px]"
                placeholder={t.consultationNotesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="p-4 border-t">
              <Button onClick={handleSaveNotes} className="w-full bg-green-600 hover:bg-green-700">
                <Save size={18} className="mr-2" />
                {t.consultationSaveNotes}
              </Button>
            </div>
          </>
        )
      case "prescription":
        return (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {prescriptionItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 h-auto w-auto p-1"
                      onClick={() => handleRemoveMedication(item.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{item.dosage}</p>
                </div>
              ))}
              <Button onClick={handleAddMedication} variant="outline" className="w-full mt-4 border-dashed">
                <Plus size={16} className="mr-2" />
                {t.consultationAddMedication}
              </Button>
            </div>
            <div className="p-4 border-t space-y-2">
              <Button onClick={handleSendPrescription} className="w-full bg-purple-600 hover:bg-purple-700">
                <Send size={18} className="mr-2" />
                {t.consultationSendToPharmacy}
              </Button>
              <Button onClick={handleSavePrescriptionDraft} variant="outline" className="w-full">
                <Save size={18} className="mr-2" />
                {t.consultationSaveDraft}
              </Button>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const panelTitleKey =
    activePanel === "chat"
      ? "consultationChatWith"
      : activePanel === "notes"
        ? "consultationNotesTitle"
        : activePanel === "prescription"
          ? "consultationPrescriptionTitle"
          : ("" as TranslationKey)

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Notification Area */}
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 p-3 rounded-md text-white text-sm z-50 shadow-lg flex items-center",
            notification.type === "success" && "bg-green-500",
            notification.type === "warning" && "bg-yellow-500",
            notification.type === "error" && "bg-red-500",
            notification.type === "info" && "bg-blue-500",
          )}
        >
          {notification.type === "success" && <CheckCircle size={18} className="mr-2" />}
          {notification.type === "warning" && <AlertCircle size={18} className="mr-2" />}
          {notification.type === "error" && <AlertCircle size={18} className="mr-2" />}
          {notification.type === "info" && <Info size={18} className="mr-2" />}
          {t[notification.messageKey]}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={handleEndCall}>
            <PhoneOff size={20} />
          </Button>
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage
              src={mockConsultationData.doctor.avatarUrl || "/placeholder.svg"}
              alt={t[mockConsultationData.doctor.nameKey]}
            />
            <AvatarFallback>{t[mockConsultationData.doctor.nameKey].substring(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm sm:text-lg text-gray-800">{t[mockConsultationData.doctor.nameKey]}</h1>
            <p className="text-gray-600 text-xs sm:text-sm">{t[mockConsultationData.doctor.specialtyKey]}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-500 font-semibold text-sm sm:text-base">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
            {callDuration}
          </div>
          <p className="text-xs text-gray-500">{t.consultationConnectionStatusExcellent}</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col">
        <div className="video-container aspect-video bg-black rounded-lg overflow-hidden relative mb-2 sm:mb-4 flex-shrink-0">
          {/* Daily.co iframe would go here, or a placeholder */}
          {showVideoPlaceholder ? (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-purple-800 flex flex-col items-center justify-center text-white p-4">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="text-lg font-semibold mb-1">{t.waitingRoomVideoPlaceholderTitle}</p>
              <p className="text-sm opacity-80">{t.waitingRoomVideoPlaceholderSubtitle}</p>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <UserMd size={40} className="sm:text-5xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t[mockConsultationData.doctor.nameKey]}</h3>
                <p className="text-xs sm:text-sm opacity-75">{t[mockConsultationData.doctor.specialtyKey]}</p>
              </div>
            </div>
            // <iframe
            //   ref={callFrameRef} // This would be for Daily.co iframe
            //   title="Video Call"
            //   className="w-full h-full"
            //   allow="camera; microphone; fullscreen; speaker; display-capture"
            // ></iframe>
          )}

          {/* Self-view (Patient's camera) */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-20 h-28 sm:w-24 sm:h-32 bg-gray-800 rounded-md overflow-hidden border-2 border-gray-700">
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              {isVideoOff ? (
                <VideoOff size={24} className="text-gray-400" />
              ) : (
                <UserMd size={24} className="text-white" />
              )}
            </div>
          </div>

          {/* Overlay Controls for Video/Mic */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-4">
            <Button
              onClick={handleToggleMic}
              variant="secondary"
              size="icon"
              className={cn(
                "rounded-full bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12",
                isMicMuted && "bg-red-500 hover:bg-red-600",
              )}
            >
              {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              onClick={handleToggleVideo}
              variant="secondary"
              size="icon"
              className={cn(
                "rounded-full bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12",
                isVideoOff && "bg-red-500 hover:bg-red-600",
              )}
            >
              {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>
            <Button
              onClick={handleSwitchCamera}
              variant="secondary"
              size="icon"
              className="rounded-full bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {/* Patient Quick Info */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-2 sm:mb-4 flex-shrink-0 shadow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              {mockConsultationData.patient.name}, {mockConsultationData.patient.age} {language === "fr" ? "ans" : "yo"}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {t[mockConsultationData.patient.subscriptionKey]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">{t[mockConsultationData.patient.reasonKey]}</p>
        </div>

        {/* This div will be hidden on larger screens and content shown in panel */}
        <div className="lg:hidden flex-1 overflow-y-auto">
          {activePanel && (
            <div className="h-full flex flex-col shadow-none border-none">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="text-base">
                  {panelTitleKey
                    ? activePanel === "chat"
                      ? `${t[panelTitleKey]} ${t[mockConsultationData.doctor.nameKey]}`
                      : t[panelTitleKey]
                    : ""}
                </div>
                <Button
                  onClick={() => setActivePanel(null)}
                  className="text-gray-500 hover:text-gray-700 h-auto w-auto p-1"
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="p-0 flex-1 flex flex-col overflow-hidden">
                <PanelContent />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating TiBot button - visible only on mobile when no panel is open */}
      {!activePanel && (
        <Button
          onClick={handleOpenTibot}
          size="icon"
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-30 lg:hidden"
        >
          <TibotIcon size={20} />
        </Button>
      )}

      {/* Bottom Controls Bar */}
      <footer className="bg-white border-t border-gray-200 p-2 sm:p-3 shrink-0">
        <div className="flex justify-around items-center">
          {controlButtons.map((btn) => (
            <Button
              key={btn.id}
              variant="ghost"
              onClick={btn.action}
              className={cn(
                "flex flex-col items-center text-gray-600 hover:text-blue-600 h-auto px-1 py-1.5 sm:px-2 sm:py-2 relative",
                activePanel === btn.id && "text-blue-600 bg-blue-50",
              )}
            >
              <btn.icon size={18} className="sm:text-xl mb-0.5 sm:mb-1" />
              <div className="text-[10px] sm:text-xs">{t[btn.labelKey]}</div>
              {btn.badgeCount && btn.badgeCount > 0 && activePanel !== btn.id && (
                <div className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] leading-tight text-center">
                  {btn.badgeCount}
                </div>
              )}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={handleEndCall}
            className="flex flex-col items-center text-red-500 hover:text-red-700 hover:bg-red-50 h-auto px-1 py-1.5 sm:px-2 sm:py-2"
          >
            <PhoneOff size={18} className="sm:text-xl mb-0.5 sm:mb-1" />
            <div className="text-[10px] sm:text-xs">{t.consultationEndCall}</div>
          </Button>
        </div>
      </footer>

      {/* Slide-in Panel for larger screens (or when active on mobile) */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 bg-white z-40 shadow-xl transition-transform duration-300 ease-in-out w-full max-w-md transform",
          activePanel ? "translate-x-0" : "translate-x-full",
          "hidden lg:flex lg:flex-col", // Always flex on large screens, visibility controlled by activePanel
        )}
      >
        {activePanel && (
          <>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div className="font-semibold text-lg text-gray-800">
                {panelTitleKey
                  ? activePanel === "chat"
                    ? `${t[panelTitleKey]} ${t[mockConsultationData.doctor.nameKey]}`
                    : t[panelTitleKey]
                  : ""}
              </div>
              <Button onClick={() => setActivePanel(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </Button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <PanelContent />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
