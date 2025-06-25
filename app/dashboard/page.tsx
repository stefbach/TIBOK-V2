"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Video,
  UserIcon as UserMd,
  Pill,
  Bot,
  Clock,
  Download,
  Share,
  Plus,
  CreditCard,
  Send,
  Heart,
  Check,
  Wifi,
  VideoOff,
  MicOff,
  Mic,
  PhoneCall,
  Stethoscope,
  AlertTriangle,
  Lightbulb,
  Camera,
  Volume2,
  Play,
  Loader2,
  ClipboardList,
  UploadCloud,
  FlaskConical,
  SearchIcon,
  Info,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  XIcon as XRay,
  FileIcon as FileMedical,
  CheckCircle,
  Paperclip,
  Hospital,
  MapPin,
  MessageCircleIcon,
  Thermometer,
  Lock,
  BotIcon as Robot,
  ArrowLeft,
  HistoryIcon,
  EllipsisVertical,
  Eye,
  LineChart,
  CalendarCheck,
  StickyNoteIcon as NotesMedical,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import type { CoreMessage } from "ai"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale)

const mockMedicalHistoryExtended = [
  {
    id: "consult1",
    type: "consultation",
    titleKey: "historyConsultationGPTitle" as TranslationKey,
    date: "15 Novembre 2024",
    time: "14:30",
    statusKey: "historyStatusCompleted" as TranslationKey,
    statusColor: "bg-green-500",
    borderColor: "border-blue-500",
    iconColor: "text-blue-500",
    doctorName: "Dr. Marie Dubois",
    doctorSpecialtyKey: "historyDoctorSpecialtyGP" as TranslationKey,
    reasonKey: "historyReasonCoughFatigue" as TranslationKey,
    summaryIcon: NotesMedical,
    summaryTitleKey: "historyMedicalSummaryTitle" as TranslationKey,
    summaryTextKey: "historySummaryTextConsult1" as TranslationKey,
    diagnoses: [{ textKey: "historyDiagnosisPostViral" as TranslationKey, icon: Stethoscope, color: "bg-yellow-500" }],
    recommendationsKey: "historyRecommendationsConsult1" as TranslationKey,
    hasPrescription: true,
    actions: [
      { type: "viewDetails", labelKey: "historyActionViewDetails" as TranslationKey },
      { type: "downloadPDF", labelKey: "historyActionDownloadPDF" as TranslationKey },
      { type: "share", labelKey: "historyActionShare" as TranslationKey },
    ],
  },
  {
    id: "consult2",
    type: "second-opinion",
    titleKey: "historyConsultationCardioSecondOpinionTitle" as TranslationKey,
    date: "28 Octobre 2024",
    time: "16:00",
    statusKey: "historyStatusCompleted" as TranslationKey,
    statusColor: "bg-green-500",
    borderColor: "border-orange-500",
    iconColor: "text-orange-500",
    doctorName: "Prof. Jean-Pierre Martin",
    doctorSpecialtyKey: "historyDoctorSpecialtyCardioParis" as TranslationKey,
    reasonKey: "historyReasonECGAnalysis" as TranslationKey,
    fee: "6 500 MUR",
    summaryIcon: UserMd,
    summaryTitleKey: "historyExpertOpinionTitle" as TranslationKey,
    summaryTextKey: "historySummaryTextConsult2" as TranslationKey,
    diagnoses: [{ textKey: "historyDiagnosisNormalHeart" as TranslationKey, icon: Heart, color: "bg-yellow-500" }],
    recommendationsKey: "historyRecommendationsConsult2" as TranslationKey,
    hasPrescription: false,
    reportLinkKey: "historyActionFullReport" as TranslationKey,
    actions: [
      { type: "downloadPDF", labelKey: "historyActionDownloadPDF" as TranslationKey },
      { type: "share", labelKey: "historyActionShare" as TranslationKey },
    ],
  },
  {
    id: "consult3",
    type: "consultation",
    titleKey: "historyConsultationGPTitle" as TranslationKey,
    date: "12 Octobre 2024",
    time: "10:15",
    statusKey: "historyStatusCompleted" as TranslationKey,
    statusColor: "bg-green-500",
    borderColor: "border-green-500",
    iconColor: "text-green-500",
    doctorName: "Dr. Raj Patel",
    doctorSpecialtyKey: "historyDoctorSpecialtyGP" as TranslationKey,
    reasonKey: "historyReasonBloodPressureCheck" as TranslationKey,
    summaryIcon: NotesMedical,
    summaryTitleKey: "historyMedicalSummaryTitle" as TranslationKey,
    summaryTextKey: "historySummaryTextConsult3" as TranslationKey,
    diagnoses: [
      { textKey: "historyDiagnosisControlledHypertension" as TranslationKey, icon: Heart, color: "bg-yellow-500" },
    ],
    recommendationsKey: "historyRecommendationsConsult3" as TranslationKey,
    hasPrescription: true,
    actions: [
      { type: "viewDetails", labelKey: "historyActionViewDetails" as TranslationKey },
      { type: "downloadPDF", labelKey: "historyActionDownloadPDF" as TranslationKey },
      { type: "share", labelKey: "historyActionShare" as TranslationKey },
    ],
  },
]

// Mock data - replace with actual data fetching
const mockUser = {
  name: "Marie Dubois",
  plan: "dashboardPlanFamily", // or "pricingSoloPackTitle" or null
  consultationsRemaining: 3,
  stats: {
    consultations: "3/4",
    prescriptions: 2,
    secondOpinions: 1,
    deliveries: 5,
  },
  familyMembers: [
    {
      id: "marie",
      name: "Marie Dubois",
      roleKey: "familyAccountHolder" as TranslationKey,
      consultations: "2/4",
      lastConsultation: "15/12/2024",
      avatarColor: "bg-pink-100",
      iconColor: "text-pink-600",
      icon: UserMd,
    },
    {
      id: "pierre",
      name: "Pierre Dubois",
      roleKey: "familySpouse" as TranslationKey,
      consultations: "1/4",
      lastConsultation: "10/12/2024",
      avatarColor: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: UserMd,
    },
    {
      id: "emma",
      name: "Emma Dubois",
      roleKey: "familyDaughter" as TranslationKey,
      age: 8,
      consultations: "0/4",
      lastConsultation: "-",
      avatarColor: "bg-green-100",
      iconColor: "text-green-600",
      icon: Users,
    },
  ],
  waitingRoomData: {
    connectionStatus: "connected",
    connectionMessageKey: "connection-message" as TranslationKey,
    doctors: [
      {
        id: "dubois",
        name: "Dr. Martin Dubois",
        specialtyKey: "doctor1-specialty" as TranslationKey,
        statusKey: "waitingRoomDoctorAvailable" as TranslationKey,
        waitTime: "~5",
        queueCount: 2,
        icon: UserMd,
        color: "blue",
      },
      {
        id: "laurent",
        name: "Dr. Sophie Laurent",
        specialtyKey: "doctor2-specialty" as TranslationKey,
        statusKey: "waitingRoomDoctorBusy" as TranslationKey,
        waitTime: "~12",
        queueCount: 4,
        icon: UserMd,
        color: "purple",
      },
      {
        id: "patel",
        name: "Dr. Ahmed Patel",
        specialtyKey: "waitingRoomPediatrics" as TranslationKey,
        statusKey: "waitingRoomDoctorAvailable" as TranslationKey,
        waitTime: "~3",
        queueCount: 1,
        badgeKey: "waitingRoomDoctorFamily" as TranslationKey,
        icon: Stethoscope,
        color: "green",
      },
      {
        id: "rousseau",
        name: "Dr. Marie Rousseau",
        specialtyKey: "waitingRoomCardiology" as TranslationKey,
        statusKey: "waitingRoomDoctorAvailable" as TranslationKey,
        waitTime: "~8",
        queueCount: 0,
        badgeKey: "waitingRoomDoctorPaid" as TranslationKey,
        price: "1500 MUR",
        icon: Heart,
        color: "orange",
      },
    ],
    userQueuePosition: null as number | null,
    estimatedUserWaitTime: null as string | null,
    liveQueue: [
      {
        id: "p1",
        nameKey: "patient1" as TranslationKey,
        statusKey: "waitingRoomInConsultation" as TranslationKey,
        position: 1,
        color: "blue",
      },
      {
        id: "p2",
        nameKey: "patient2" as TranslationKey,
        statusKey: "waitingRoomWaiting" as TranslationKey,
        position: 2,
        color: "yellow",
      },
    ],
  },
  pharmacyData: {
    prescription: {
      date: "15 Décembre 2024",
      doctor: "Dr. Patel",
      statusKey: "pharmacyStatusProcessing" as TranslationKey,
      items: [
        {
          nameKey: "pharmacyMedicationParacetamol" as TranslationKey,
          dosageKeyFR: "pharmacyMedicationParacetamolDosageFR",
          dosageKeyEN: "pharmacyMedicationParacetamolDosageEN",
        },
        {
          nameKey: "pharmacyMedicationAmoxicillin" as TranslationKey,
          dosageKeyFR: "pharmacyMedicationAmoxicillinDosageFR",
          dosageKeyEN: "pharmacyMedicationAmoxicillinDosageEN",
        },
        {
          nameKey: "pharmacyMedicationCoughSyrup" as TranslationKey,
          dosageKeyFR: "pharmacyMedicationCoughSyrupDosageFR",
          dosageKeyEN: "pharmacyMedicationCoughSyrupDosageEN",
        },
      ],
    },
    selectedPharmacy: {
      nameKey: "pharmacySelectedPharmacyName" as TranslationKey,
      addressKey: "pharmacySelectedPharmacyAddress" as TranslationKey,
      allMedsAvailableKeyFR: "pharmacyAllMedsAvailableFR",
      allMedsAvailableKeyEN: "pharmacyAllMedsAvailableEN",
      prepTimeKeyFR: "pharmacyPreparationTimeFR",
      prepTimeKeyEN: "pharmacyPreparationTimeEN",
      statusKey: "pharmacyStatusSelectedFR" as TranslationKey,
    },
    processSteps: [
      {
        id: 1,
        titleKeyFR: "pharmacyStep1TitleFR",
        titleKeyEN: "pharmacyStep1TitleEN",
        descKeyFR: "pharmacyStep1DescFR",
        descKeyEN: "pharmacyStep1DescEN",
        status: "completed",
        time: "14:32",
      },
      {
        id: 2,
        titleKeyFR: "pharmacyStep2TitleFR",
        titleKeyEN: "pharmacyStep2TitleEN",
        descKeyFR: "pharmacyStep2DescFR",
        descKeyEN: "pharmacyStep2DescEN",
        status: "active",
        timeKeyFR: "pharmacyStepStatusInProgressFR",
        timeKeyEN: "pharmacyStepStatusInProgressEN",
      },
      {
        id: 3,
        titleKeyFR: "pharmacyStep3TitleFR",
        titleKeyEN: "pharmacyStep3TitleEN",
        descKeyFR: "pharmacyStep3DescFR",
        descKeyEN: "pharmacyStep3DescEN",
        status: "waiting",
      },
      {
        id: 4,
        titleKeyFR: "pharmacyStep4TitleFR",
        titleKeyEN: "pharmacyStep4TitleEN",
        descKeyFR: "pharmacyStep4DescFR",
        descKeyEN: "pharmacyStep4DescEN",
        status: "waiting",
      },
      {
        id: 5,
        titleKeyFR: "pharmacyStep5TitleFR",
        titleKeyEN: "pharmacyStep5TitleEN",
        descKeyFR: "pharmacyStep5DescFR",
        descKeyEN: "pharmacyStep5DescEN",
        status: "waiting",
      },
    ],
    estimate: {
      medicationsAmount: "~850 MUR",
      prepFees: "50 MUR",
      deliveryKeyFR: "pharmacyEstimateDeliveryFreeSoloFR",
      deliveryKeyEN: "pharmacyEstimateDeliveryFreeSoloEN",
      totalAmount: "~900 MUR",
      statusKeyFR: "pharmacyAwaitingFinalQuoteFR",
      statusKeyEN: "pharmacyAwaitingFinalQuoteEN",
    },
    notifications: [
      {
        type: "success",
        messageKeyFR: "pharmacyNotifPrescriptionSentFR",
        messageKeyEN: "pharmacyNotifPrescriptionSentEN",
        time: "14:32 - Pharmacie Central Plus",
      },
      {
        type: "info",
        messageKeyFR: "pharmacyNotifQuoteInProgressFR",
        messageKeyEN: "pharmacyNotifQuoteInProgressEN",
        detailsKeyFR: "pharmacyNotifQuoteInProgressDescFR",
        detailsKeyEN: "pharmacyNotifQuoteInProgressDescEN",
      },
    ],
  },
  medicalHistory: mockMedicalHistoryExtended, // Use the new extended history
}

interface UserProfile {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  email: string | undefined
}

interface DashboardPageContentProps {
  activeTab?: string
  currentUser?: UserProfile | null
  isLoadingUser?: boolean
}

interface StepProps {
  stepNumber: number
  labelKey: TranslationKey
  currentStep: number
}

const SopStep: React.FC<StepProps> = ({ stepNumber, labelKey, currentStep }) => {
  const { language } = useLanguage()
  const t = translations[language]
  const isActive = stepNumber === currentStep
  const isCompleted = stepNumber < currentStep
  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          isActive ? "bg-blue-700 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600",
        )}
      >
        {isCompleted ? <Check size={16} /> : stepNumber}
      </div>
      <span className={cn("text-xs sm:text-sm font-medium", isActive ? "text-gray-900" : "text-gray-500")}>
        {t[labelKey]}
      </span>
    </div>
  )
}

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList | null) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesSelected, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files))
      onFilesSelected(event.target.files)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      setUploadedFiles(Array.from(event.dataTransfer.files))
      onFilesSelected(event.dataTransfer.files)
    }
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-gray-50 transition-all"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      {uploadedFiles.length === 0 ? (
        <>
          <UploadCloud className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">{t.sopDragAndDrop}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t.sopOrClickToSelect}</p>
          <Button variant="outline" size="sm" className="mt-3 sm:mt-4">
            {t.sopSelectFilesButton}
          </Button>
        </>
      ) : (
        <>
          <CheckCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium text-green-700 mb-1 sm:mb-2">
            {t("sopFileUploadSuccess", { count: uploadedFiles.length })}
          </p>
          <p className="text-xs sm:text-sm text-green-600">{t.sopFileUploadSuccessDesc}</p>
          <ul className="mt-2 text-left text-xs text-gray-600 max-h-20 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="truncate flex items-center">
                <Paperclip size={12} className="mr-1 shrink-0" /> {file.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

interface ChatMessage {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
}

interface MedicationReminder {
  id: string
  name: string
  time: string
}

export default function DashboardPageContent({
  activeTab: activeTabFromLayout,
  currentUser,
  isLoadingUser,
}: DashboardPageContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabFromQuery = searchParams.get("tab")
  const activeTab = activeTabFromLayout || tabFromQuery || "dashboard"

  const { language, setLanguage } = useLanguage()
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let translation = translations[language][key] || key
      if (params) {
        Object.keys(params).forEach((paramKey) => {
          translation = translation.replace(`{${paramKey}}`, String(params[paramKey]))
        })
      }
      return translation
    },
    [language],
  )

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [showVideoPrep, setShowVideoPrep] = useState(false)
  const [userQueuePosition, setUserQueuePosition] = useState<number | null>(mockUser.waitingRoomData.userQueuePosition)
  const [estimatedUserWaitTime, setEstimatedUserWaitTime] = useState<string | null>(
    mockUser.waitingRoomData.estimatedUserWaitTime,
  )
  const [liveQueue, setLiveQueue] = useState(mockUser.waitingRoomData.liveQueue)
  const [videoPrepStatusKey, setVideoPrepStatusKey] = useState<TranslationKey>("waitingRoomVideoPrepStatusConnecting")
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(false)

  const [sopCurrentStep, setSopCurrentStep] = useState(2)
  const [sopFiles, setSopFiles] = useState<FileList | null>(null)

  const [pharmacyProcessSteps, setPharmacyProcessSteps] = useState(mockUser.pharmacyData.processSteps)

  // TiBot State
  const [tibotSubscription, setTibotSubscription] = useState<"solo" | "family" | null>(null)
  const [tibotMessages, setTibotMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "bot",
      text: t("tibotInitialMessage"),
      timestamp: new Date(),
    },
  ])
  const [tibotInput, setTibotInput] = useState("")
  const [isTibotTyping, setIsTibotTyping] = useState(false)
  const [medicationReminders, setMedicationReminders] = useState<MedicationReminder[]>([])
  const [showMedicationModal, setShowMedicationModal] = useState(false)
  const [newMedName, setNewMedName] = useState("")
  const [newMedTime, setNewMedTime] = useState("")
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // History Tab State
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historyFilterType, setHistoryFilterType] = useState("all")
  const [historyFilterPeriod, setHistoryFilterPeriod] = useState("all")
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [shareMessage, setShareMessage] = useState("")

  const filteredHistory = mockUser.medicalHistory
    .filter((item) => {
      if (historyFilterType !== "all" && item.type !== historyFilterType) {
        return false
      }
      // Period filtering logic would go here - more complex, needs date parsing
      return true
    })
    .filter((item) => {
      const searchTermLower = historySearchTerm.toLowerCase()
      return (
        t(item.titleKey).toLowerCase().includes(searchTermLower) ||
        item.doctorName.toLowerCase().includes(searchTermLower) ||
        t(item.reasonKey).toLowerCase().includes(searchTermLower) ||
        (item.diagnoses && item.diagnoses.some((d) => t(d.textKey).toLowerCase().includes(searchTermLower)))
      )
    })

  const healthChartData: ChartData<"line"> = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
    datasets: [
      {
        label: t("historyChartSystolic"),
        data: [140, 138, 135, 132, 130, 128, 130, 129, 131, 130, 129, 128],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: t("historyChartDiastolic"),
        data: [90, 88, 85, 82, 80, 78, 80, 79, 81, 80, 79, 78],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: t("historyChartWeight"),
        data: [75, 74.5, 74, 73.5, 73, 72.8, 72.5, 72.3, 72, 71.8, 71.5, 71.2],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  }

  const healthChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: t("historyChartYAxisTension") },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: t("historyChartYAxisWeight") },
        grid: { drawOnChartArea: false },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
  }

  useEffect(() => {
    if (activeTab === "pharmacy") {
      const quoteStep = pharmacyProcessSteps.find((step) => step.id === 2)
      if (quoteStep && quoteStep.status === "active") {
        setTimeout(() => {
          setPharmacyProcessSteps((prevSteps) =>
            prevSteps.map((step) =>
              step.id === 2
                ? { ...step, status: "completed", time: "14:38" }
                : step.id === 3
                  ? { ...step, status: "active" }
                  : step,
            ),
          )
        }, 5000)
      }
    }
  }, [activeTab, pharmacyProcessSteps])

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [tibotMessages])

  const handleSopFilesSelected = (files: FileList | null) => {
    setSopFiles(files)
  }

  const handleSelectDoctor = (doctorId: string, waitTime: string, queuePos: number, isPaid = false) => {
    if (isPaid) {
      const confirmPayment = window.confirm(
        language === "fr"
          ? `Confirmer le paiement de ${mockUser.waitingRoomData.doctors.find((d) => d.id === doctorId)?.price} pour la consultation avec ${mockUser.waitingRoomData.doctors.find((d) => d.id === doctorId)?.name} ?`
          : `Confirm payment of ${mockUser.waitingRoomData.doctors.find((d) => d.id === doctorId)?.price} for consultation with ${mockUser.waitingRoomData.doctors.find((d) => d.id === doctorId)?.name}?`,
      )
      if (!confirmPayment) return
    }

    setSelectedDoctor(doctorId)
    setUserQueuePosition(isPaid ? 1 : queuePos + 1)
    setEstimatedUserWaitTime(isPaid ? "~2" : waitTime.replace("~", ""))

    const updatedQueue = [
      ...mockUser.waitingRoomData.liveQueue,
      {
        id: "user",
        nameKey: "Vous" as any,
        statusKey: "waitingRoomWaiting" as TranslationKey,
        position: isPaid ? 1 : queuePos + 1,
        color: "blue",
      },
    ].sort((a, b) => a.position - b.position)
    setLiveQueue(updatedQueue)

    setShowVideoPrep(false)
    setVideoPrepStatusKey("waitingRoomVideoPrepStatusConnecting")
    setTimeout(
      () => {
        setShowVideoPrep(true)
        setTimeout(() => setVideoPrepStatusKey("waitingRoomVideoPrepStatusReady"), 2000)
      },
      isPaid ? 500 : 2000,
    )
  }

  const handleStartConsultation = () => {
    if (!selectedDoctor) return
    const dailyRoomUrl = `/consultation/${selectedDoctor}-${Date.now()}`
    alert(
      language === "fr"
        ? `Ouverture de la consultation vidéo...\n\nURL: ${dailyRoomUrl}`
        : `Opening video consultation...\n\nURL: ${dailyRoomUrl}`,
    )
    window.location.href = dailyRoomUrl
  }

  const handleProceedToPayment = (amount: string, description: string) => {
    router.push(
      `/payment?amount=${encodeURIComponent(amount)}&description=${encodeURIComponent(description)}&lang=${language}`,
    )
  }

  const handleTibotSubscriptionSelect = (plan: "solo" | "family") => {
    setTibotSubscription(plan)
  }

  const handleAccessTibot = () => {
    if (tibotSubscription) {
      // In a real app, you'd verify this against user data
      console.log(`Accessing TiBot with ${tibotSubscription} pack.`)
    } else {
      alert(language === "fr" ? "Veuillez sélectionner un pack." : "Please select a pack.")
    }
  }

  const handleTibotSendMessage = async (messageText?: string) => {
    const textToSend = messageText || tibotInput.trim()
    if (!textToSend) return

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    }
    setTibotMessages((prev) => [...prev, newUserMessage])
    setTibotInput("")
    setIsTibotTyping(true)

    try {
      const coreHistory = tibotMessages.slice(-5).map<CoreMessage>((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }))

      const response = await fetch("/api/tibot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: coreHistory,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply,
        timestamp: new Date(),
      }
      setTibotMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Error fetching TiBot response:", error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: language === "fr" ? "Désolé, une erreur s'est produite." : "Sorry, an error occurred.",
        timestamp: new Date(),
      }
      setTibotMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTibotTyping(false)
    }
  }

  const handleTibotQuickAction = (topic: string) => {
    let prompt = ""
    if (topic === "symptoms") {
      prompt = language === "fr" ? "Je voudrais décrire mes symptômes." : "I would like to describe my symptoms."
    } else if (topic === "medication") {
      prompt = language === "fr" ? "J'ai une question sur mes médicaments." : "I have a question about my medications."
    }
    handleTibotSendMessage(prompt)
  }

  const handleTibotQuickResponse = (responseTextKey: TranslationKey) => {
    handleTibotSendMessage(t(responseTextKey))
  }

  const handleAddMedicationReminder = () => {
    if (newMedName && newMedTime) {
      const newReminder: MedicationReminder = {
        id: Date.now().toString(),
        name: newMedName,
        time: newMedTime,
      }
      setMedicationReminders((prev) => [...prev, newReminder])
      setShowMedicationModal(false)
      setNewMedName("")
      setNewMedTime("")
    }
  }

  const handleConfirmShare = () => {
    // Logic to actually share the data would go here
    alert(t("historyShareSuccessMessage"))
    setShowShareModal(false)
    setShareEmail("")
    setShareMessage("")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        const dashboardDisplayName = isLoadingUser
          ? "" // Will be handled by Skeleton
          : currentUser
            ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
              (currentUser as any).fullName ||
              (currentUser as any).name ||
              currentUser.email?.split("@")[0] ||
              t("dashboardDefaultUserName" as TranslationKey) // Assuming you add this key
            : t("dashboardDefaultUserName" as TranslationKey) // Assuming you add this key

        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isLoadingUser ? (
                  <Skeleton className="h-7 w-52 inline-block" />
                ) : (
                  <>
                    {t("dashboardWelcome")} {dashboardDisplayName}
                  </>
                )}
              </h1>
              <p className="text-gray-600">{t("dashboardSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { labelKey: "statConsultations", value: mockUser.stats.consultations, icon: Video, color: "blue" },
                {
                  labelKey: "statPrescriptions",
                  value: mockUser.stats.prescriptions.toString(),
                  icon: Pill,
                  color: "green",
                },
                {
                  labelKey: "statSecondOpinions",
                  value: mockUser.stats.secondOpinions.toString(),
                  icon: UserMd,
                  color: "purple",
                },
                {
                  labelKey: "statDeliveries",
                  value: mockUser.stats.deliveries.toString(),
                  icon: Users,
                  color: "orange",
                },
              ].map((stat) => (
                <Card key={stat.labelKey} className="shadow-md">
                  <CardContent className="p-6 flex items-center">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mr-4`}>
                      <stat.icon className={`text-${stat.color}-600`} size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t(stat.labelKey as TranslationKey)}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  titleKey: "quickActionImmediateConsultation",
                  descKey: "quickActionJoinWaitingRoom",
                  buttonKey: "quickActionStart",
                  icon: Video,
                  color: "blue",
                  targetTab: "waiting-room",
                },
                {
                  titleKey: "quickActionRequestSecondOpinion",
                  descKey: "quickActionConsultSpecialist",
                  buttonKey: "quickActionStartRequest",
                  icon: UserMd,
                  color: "purple",
                  targetTab: "second-opinion",
                },
                {
                  titleKey: "quickActionTibotAssistant",
                  descKey: "quickActionChatWithAI",
                  buttonKey: "quickActionChat",
                  icon: Bot,
                  color: "green",
                  targetTab: "tibot",
                },
              ].map((action) => (
                <Card key={action.titleKey} className="shadow-md text-center">
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-${action.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <action.icon className={`text-${action.color}-600`} size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(action.titleKey as TranslationKey)}</h3>
                    <p className="text-gray-600 text-sm mb-4">{t(action.descKey as TranslationKey)}</p>
                    <Link href={`/dashboard?tab=${action.targetTab}`} passHref>
                      <Button className={`w-full bg-${action.color}-600 hover:bg-${action.color}-700`}>
                        {t(action.buttonKey as TranslationKey)}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      case "family":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("familyManagementTitle")}</h1>
              <p className="text-gray-600">{t("familyManagementSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUser.familyMembers.map((member) => (
                <Card key={member.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-16 h-16 ${member.avatarColor} rounded-full flex items-center justify-center mr-4`}
                      >
                        <member.icon className={member.iconColor} size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">
                          {t(member.roleKey)} {member.age && `- ${member.age} ${t("familyYearsOld")}`}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("statConsultations")}</span>{" "}
                        <span className="font-semibold">{member.consultations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("familyLastConsultation")}</span>{" "}
                        <span className="font-semibold">{member.lastConsultation}</span>
                      </div>
                    </div>
                    <Button className="w-full">{t("familyViewProfile")}</Button>
                  </CardContent>
                </Card>
              ))}
              <Card className="shadow-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("familyAddMember")}</h3>
                <p className="text-gray-500 text-sm">{t("familyUpToMembers")}</p>
              </Card>
            </div>
          </div>
        )
      case "waiting-room":
        const { connectionStatus, connectionMessageKey, doctors } = mockUser.waitingRoomData
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("connection-title")}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          connectionStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-yellow-500",
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          connectionStatus === "connected" ? "text-green-600" : "text-yellow-600",
                        )}
                      >
                        {t(
                          connectionStatus === "connected"
                            ? "connection-status"
                            : ("waitingRoomConnecting" as TranslationKey),
                        )}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  className={cn("rounded-lg p-4", connectionStatus === "connected" ? "bg-green-50" : "bg-yellow-50")}
                >
                  <p className={cn("text-sm", connectionStatus === "connected" ? "text-green-700" : "text-yellow-700")}>
                    {t(connectionMessageKey)}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("doctors-title")}</CardTitle>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock size={16} />
                      <span className="text-sm">{t("update-time")}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        "rounded-lg p-4 border flex items-center justify-between transition-all duration-300 hover:shadow-md",
                        `bg-gradient-to-r from-${doc.color}-50 to-${doc.color}-100 border-${doc.color}-200`,
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 bg-${doc.color}-600 rounded-full flex items-center justify-center text-white`}
                        >
                          <doc.icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                          <p className="text-sm text-gray-600">{t(doc.specialtyKey)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {doc.badgeKey && (
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full text-white font-medium",
                                  doc.badgeKey === "waitingRoomDoctorFamily" ? "bg-green-600" : "bg-orange-500",
                                )}
                              >
                                {t(doc.badgeKey)}
                              </span>
                            )}
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                doc.statusKey === "waitingRoomDoctorAvailable" ? "bg-green-500" : "bg-yellow-500",
                              )}
                            ></div>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                doc.statusKey === "waitingRoomDoctorAvailable" ? "text-green-600" : "text-yellow-600",
                              )}
                            >
                              {t(doc.statusKey)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.price ? doc.price : `${doc.waitTime} ${t("waitingRoomMinutesSuffix")}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.queueCount}{" "}
                          {doc.queueCount === 1 ? t("waitingRoomPatientSuffix") : t("waitingRoomPatientsSuffix")}
                        </div>
                        <Button
                          size="sm"
                          className={`mt-2 bg-${doc.color}-600 hover:bg-${doc.color}-700 text-white`}
                          onClick={() => handleSelectDoctor(doc.id, doc.waitTime, doc.queueCount, !!doc.price)}
                        >
                          {doc.price ? t("doctor4-select") : t("doctor1-select")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {showVideoPrep && selectedDoctor && (
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle>{t("waitingRoomVideoPrepTitle")}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            videoPrepStatusKey === "waitingRoomVideoPrepStatusReady"
                              ? "bg-white animate-pulse"
                              : "bg-gray-300",
                          )}
                        ></div>
                        <span className="text-sm font-medium">{t(videoPrepStatusKey)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h3 className="font-medium mb-2 text-gray-700">{t("waitingRoomCameraTest")}</h3>
                        <div className="bg-gray-800 rounded-lg h-32 flex items-center justify-center text-gray-400 mb-2">
                          {isCameraEnabled ? <Video size={32} /> : <VideoOff size={32} />}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                        >
                          {isCameraEnabled ? (
                            <VideoOff size={16} className="mr-2" />
                          ) : (
                            <Camera size={16} className="mr-2" />
                          )}
                          {isCameraEnabled ? t("waitingRoomDisable") : t("waitingRoomEnable")}
                        </Button>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h3 className="font-medium mb-2 text-gray-700">{t("waitingRoomAudioTest")}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{t("waitingRoomMicrophone")}</span>
                            <Button variant="outline" size="sm" onClick={() => setIsMicEnabled(!isMicEnabled)}>
                              {isMicEnabled ? (
                                <MicOff size={16} className="mr-1" />
                              ) : (
                                <Mic size={16} className="mr-1" />
                              )}
                              {isMicEnabled ? t("waitingRoomDisable") : t("waitingRoomEnable")}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{t("waitingRoomSpeakers")}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alert(language === "fr" ? "Test audio..." : "Testing audio...")}
                            >
                              <Volume2 size={16} className="mr-1" />
                              {t("waitingRoomTest")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base"
                      onClick={handleStartConsultation}
                      disabled={videoPrepStatusKey !== "waitingRoomVideoPrepStatusReady"}
                    >
                      {videoPrepStatusKey === "waitingRoomVideoPrepStatusReady" ? (
                        <Play size={20} className="mr-2" />
                      ) : (
                        <Loader2 size={20} className="mr-2 animate-spin" />
                      )}
                      {t("waitingRoomStartConsultation")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("waitingRoomMyPosition")}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{userQueuePosition || "-"}</div>
                  <p className="text-sm text-gray-600">
                    {userQueuePosition
                      ? language === "fr"
                        ? `Vous êtes en ${userQueuePosition}ème position`
                        : `You are ${userQueuePosition}${userQueuePosition === 1 ? "st" : userQueuePosition === 2 ? "nd" : userQueuePosition === 3 ? "rd" : "th"} in queue`
                      : t("waitingRoomSelectDoctorToJoin")}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("waitingRoomEstimatedWaitTime")}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {estimatedUserWaitTime ? `${estimatedUserWaitTime} ${t("waitingRoomMinutesSuffix")}` : "-"}
                  </div>
                  <p className="text-sm text-gray-600">{t("waitingRoomRealTimeEstimate")}</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("waitingRoomLiveQueue")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {liveQueue.map((p) => (
                    <div key={p.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                      <div className={`w-8 h-8 bg-${p.color}-100 rounded-full flex items-center justify-center`}>
                        <span className={`text-sm font-medium text-${p.color}-600`}>{p.position}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.id === "user" ? (language === "fr" ? "Vous" : "You") : t(p.nameKey)}
                        </p>
                        <p className="text-xs text-gray-500">{t(p.statusKey)}</p>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            p.statusKey === "waitingRoomInConsultation"
                              ? "bg-green-500"
                              : `bg-${p.color}-500 animate-pulse`,
                          )}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">{t("waitingRoomWaitingTips")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  {[
                    { icon: Lightbulb, textKey: "waitingRoomTipSymptoms", color: "yellow" },
                    { icon: Camera, textKey: "waitingRoomTipCameraMic", color: "blue" },
                    { icon: Wifi, textKey: "waitingRoomTipConnection", color: "green" },
                    { icon: Pill, textKey: "waitingRoomTipMeds", color: "purple" },
                  ].map((tip) => (
                    <li key={tip.textKey} className="flex items-start space-x-2">
                      <tip.icon className={`text-${tip.color}-500 mt-0.5 flex-shrink-0`} size={16} />
                      <span>{t(tip.textKey as TranslationKey)}</span>
                    </li>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="text-red-500" />
                    <CardTitle className="text-red-900">{t("waitingRoomEmergency")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700 mb-3">{t("waitingRoomEmergencyText")}</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <PhoneCall size={16} className="mr-2" />
                    {t("waitingRoomCallEmergency")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "second-opinion":
        const sopSteps = [
          { num: 1, labelKey: "sopStep1" as TranslationKey },
          { num: 2, labelKey: "sopStep2" as TranslationKey },
          { num: 3, labelKey: "sopStep3" as TranslationKey },
          { num: 4, labelKey: "sopStep4" as TranslationKey },
        ]
        const docTypes = [
          { icon: XRay, titleKey: "sopDocTypeImaging", descKey: "sopDocTypeImagingDesc", color: "blue" },
          { icon: FileMedical, titleKey: "sopDocTypeReports", descKey: "sopDocTypeReportsDesc", color: "green" },
          { icon: FlaskConical, titleKey: "sopDocTypeAnalysis", descKey: "sopDocTypeAnalysisDesc", color: "purple" },
          { icon: Pill, titleKey: "sopDocTypeTreatments", descKey: "sopDocTypeTreatmentsDesc", color: "orange" },
        ]
        const analysisStatus = [
          { icon: CheckCircle, textKey: "sopStatusDossierReceived", color: "green", done: sopCurrentStep > 1 },
          { icon: Clock, textKey: "sopStatusAnalysisInProgress", color: "yellow", done: sopCurrentStep > 2 },
          { icon: UserMd, textKey: "sopStatusExpertSearch", color: "gray", done: sopCurrentStep > 3 },
          { icon: CheckCircle, textKey: "sopStatusConsultationProgramming", color: "gray", done: sopCurrentStep > 4 },
        ]
        const howItWorksSteps = [
          { num: 1, titleKey: "sopHowItWorksStep1Title", descKey: "sopHowItWorksStep1Desc" },
          { num: 2, titleKey: "sopHowItWorksStep2Title", descKey: "sopHowItWorksStep2Desc" },
          { num: 3, titleKey: "sopHowItWorksStep3Title", descKey: "sopHowItWorksStep3Desc" },
          { num: 4, titleKey: "sopHowItWorksStep4Title", descKey: "sopHowItWorksStep4Desc" },
        ]
        const guarantees = [
          "sopGuaranteeBestExpert",
          "sopGuaranteeReport72h",
          "sopGuaranteeVideoConsultation",
          "sopGuaranteeSupport247",
          "sopGuaranteeConfidentiality",
        ]
        const contactDetails = [
          { icon: Phone, textKey: "sopHelpPhone" },
          { icon: Mail, textKey: "sopHelpEmail" },
          { icon: MessageSquare, textKey: "sopHelpChat" },
        ]

        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {t("secondOpinionRequestTitle")}
              </h1>
              <p className="text-base sm:text-lg text-gray-600">{t("secondOpinionRequestSubtitle")}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
              {sopSteps.map((step, index) => (
                <React.Fragment key={step.num}>
                  <SopStep stepNumber={step.num} labelKey={step.labelKey} currentStep={sopCurrentStep} />
                  {index < sopSteps.length - 1 && <div className="h-0.5 w-4 sm:w-8 bg-gray-300 hidden sm:block"></div>}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <ClipboardList className="text-blue-600 mr-2" size={24} />
                      {t("sopCaseDescriptionTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sop-reason" className="mb-2 block">
                        {t("sopReasonLabel")}
                      </Label>
                      <Textarea id="sop-reason" placeholder={t("sopReasonPlaceholder")} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="sop-symptoms" className="mb-2 block">
                        {t("sopSymptomsLabel")}
                      </Label>
                      <Textarea id="sop-symptoms" placeholder={t("sopSymptomsPlaceholder")} rows={4} />
                    </div>
                    <div>
                      <Label htmlFor="sop-timeline" className="mb-2 block">
                        {t("sopTimelineLabel")}
                      </Label>
                      <Textarea id="sop-timeline" placeholder={t("sopTimelinePlaceholder")} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="sop-questions" className="mb-2 block">
                        {t("sopQuestionsLabel")}
                      </Label>
                      <Textarea id="sop-questions" placeholder={t("sopQuestionsPlaceholder")} rows={3} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <UploadCloud className="text-blue-600 mr-2" size={24} />
                      {t("sopDocumentsTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadZone onFilesSelected={handleSopFilesSelected} t={t} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mt-4">
                      {docTypes.map((doc) => (
                        <div key={doc.titleKey} className="text-center p-3 bg-gray-50 rounded-lg">
                          <doc.icon className={`text-2xl text-${doc.color}-600 mb-2 mx-auto`} />
                          <p className="font-medium">{t(doc.titleKey as TranslationKey)}</p>
                          <p className="text-gray-500 text-xs">{t(doc.descKey as TranslationKey)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <SearchIcon className="text-blue-600 mr-2" size={24} />
                      {t("sopAnalysisTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-blue-900 text-sm sm:text-base">{t("sopAnalysisInProgress")}</p>
                          <p className="text-xs sm:text-sm text-blue-700">{t("sopAnalysisInProgressDesc")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm sm:text-base">
                      {analysisStatus.map((status) => (
                        <div key={status.textKey} className={cn("flex items-center", !status.done && "text-gray-400")}>
                          <status.icon
                            className={cn(
                              "mr-3",
                              status.done ? `text-${status.color}-500` : "text-gray-400",
                              status.textKey === "sopStatusAnalysisInProgress" &&
                                sopCurrentStep === 2 &&
                                "animate-pulse",
                            )}
                            size={18}
                          />
                          <span className={cn(status.done && "text-gray-700")}>
                            {t(status.textKey as TranslationKey)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Info className="text-blue-600 mr-2" />
                      {t("sopHowItWorksTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {howItWorksSteps.map((step) => (
                      <div key={step.num} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 font-bold text-xs">{step.num}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t(step.titleKey as TranslationKey)}</p>
                          <p className="text-gray-600">{t(step.descKey as TranslationKey)}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <CreditCard className="text-green-600 mr-2" />
                      {t("sopPricingTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("sopPricingBaseRate")}</span>
                      <span className="font-semibold">{t("sopPricingBaseRateAmount")}</span>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-gray-600 mb-2">{t("sopPricingVariablesTitle")}</p>
                      <ul className="space-y-1 text-gray-500 text-xs">
                        {[
                          "sopPricingVariableExpertLevel",
                          "sopPricingVariableSpecialty",
                          "sopPricingVariableComplexity",
                          "sopPricingVariableLocation",
                          "sopPricingVariableDelay",
                        ].map((item) => (
                          <li key={item}>• {t(item as TranslationKey)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <p className="text-green-800 font-medium text-xs">💰 {t("sopPricingQuoteNote")}</p>
                      <p className="text-green-700 text-xs">{t("sopPricingQuoteDetail")}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <ShieldCheck className="text-green-600 mr-2" />
                      {t("sopGuaranteesTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {guarantees.map((guarantee) => (
                      <div key={guarantee} className="flex items-center space-x-2">
                        <Check className="text-green-500 shrink-0" size={16} />
                        <span className="text-gray-700">{t(guarantee as TranslationKey)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">{t("sopHelpTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-100 text-sm mb-4">{t("sopHelpSubtitle")}</p>
                    <div className="space-y-2 text-sm">
                      {contactDetails.map((detail) => (
                        <div key={detail.textKey} className="flex items-center space-x-2">
                          <detail.icon size={16} />
                          <span>{t(detail.textKey as TranslationKey)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-6 sm:px-8 py-3">
                <Send className="mr-2" size={20} />
                {t("sopSubmitButton")}
              </Button>
              <p className="text-sm text-gray-500 mt-2">{t("sopSubmitNote")}</p>
            </div>
          </div>
        )

      case "pharmacy":
        const { prescription, selectedPharmacy, estimate, notifications } = mockUser.pharmacyData
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-blue-700">
                      {t("pharmacyYourPrescriptionTitle")}
                    </CardTitle>
                    <CardDescription>
                      {t("pharmacyConsultationDate", { date: prescription.date, doctorName: prescription.doctor })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full inline-block mr-2",
                        prescription.statusKey === "pharmacyStatusProcessing" ? "bg-blue-500" : "bg-green-500",
                      )}
                    ></div>
                    <span className="text-sm font-medium text-blue-600">{t(prescription.statusKey)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">{t("pharmacyPrescribedMedications")}</h3>
                <div className="space-y-3">
                  {prescription.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{t(item.nameKey)}</p>
                        <p className="text-sm text-gray-600">
                          {language === "fr" ? t(item.dosageKeyFR) : t(item.dosageKeyEN)}
                        </p>
                      </div>
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center mb-1">
                  <Hospital size={24} className="text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg font-semibold text-blue-700">
                      {t("pharmacySelectedByTibokTitle")}
                    </CardTitle>
                    <CardDescription>
                      {language === "fr" ? t("pharmacySelectionCriteriaDescFR") : t("pharmacySelectionCriteriaDescEN")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{t(selectedPharmacy.nameKey)}</h4>
                      <p className="text-gray-600 flex items-center mt-1">
                        <MapPin size={16} className="mr-2" />
                        {t(selectedPharmacy.addressKey)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {language === "fr"
                            ? t(selectedPharmacy.allMedsAvailableKeyFR)
                            : t(selectedPharmacy.allMedsAvailableKeyEN)}
                        </span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          <Clock size={14} className="mr-1 inline-block" />
                          {language === "fr" ? t(selectedPharmacy.prepTimeKeyFR) : t(selectedPharmacy.prepTimeKeyEN)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></div>
                      <span className="text-sm font-medium text-green-600">
                        {language === "fr" ? t("pharmacyStatusSelectedFR") : t("pharmacyStatusSelectedEN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">
                    {language === "fr"
                      ? t("pharmacyTibokSelectionCriteriaTitleFR")
                      : t("pharmacyTibokSelectionCriteriaTitleEN")}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {[
                      { icon: CheckCircle, textKeyFR: "pharmacyCriteriaStockFR", textKeyEN: "pharmacyCriteriaStockEN" },
                      {
                        icon: CheckCircle,
                        textKeyFR: "pharmacyCriteriaProximityFR",
                        textKeyEN: "pharmacyCriteriaProximityEN",
                      },
                      {
                        icon: CheckCircle,
                        textKeyFR: "pharmacyCriteriaPrepTimeFR",
                        textKeyEN: "pharmacyCriteriaPrepTimeEN",
                      },
                    ].map((crit, idx) => (
                      <div key={idx} className="flex items-center">
                        <crit.icon size={16} className="text-green-500 mr-2" />
                        <span>{language === "fr" ? t(crit.textKeyFR) : t(crit.textKeyEN)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">{t("pharmacyProcessStepsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pharmacyProcessSteps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center p-4 border-2 rounded-lg",
                      step.status === "completed" && "border-green-500 bg-green-50",
                      step.status === "active" && "border-blue-500 bg-blue-50",
                      step.status === "waiting" && "border-gray-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 shrink-0",
                        step.status === "completed" && "bg-green-500",
                        step.status === "active" && "bg-blue-500",
                        step.status === "waiting" && "bg-gray-300",
                      )}
                    >
                      {step.status === "completed" ? (
                        <Check size={18} />
                      ) : step.status === "active" ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={cn("font-medium", step.status === "waiting" && "text-gray-500")}>
                        {language === "fr" ? t(step.titleKeyFR) : t(step.titleKeyEN)}
                      </h4>
                      <p className={cn("text-sm", step.status === "waiting" ? "text-gray-400" : "text-gray-600")}>
                        {language === "fr" ? t(step.descKeyFR) : t(step.descKeyEN)}
                      </p>
                    </div>
                    {step.time && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          step.status === "completed" ? "text-green-600" : "text-blue-600",
                        )}
                      >
                        {step.time}
                      </span>
                    )}
                    {step.timeKeyFR && step.timeKeyEN && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          step.status === "active" && "animate-pulse",
                          step.status === "completed" ? "text-green-600" : "text-blue-600",
                        )}
                      >
                        {language === "fr" ? t(step.timeKeyFR) : t(step.timeKeyEN)}
                      </span>
                    )}
                    {step.id === 3 && step.status === "active" && (
                      <Button
                        size="sm"
                        className="ml-4 bg-green-600 hover:bg-green-700"
                        onClick={() => handleProceedToPayment(estimate.totalAmount, t("pharmacyOrderTrack"))}
                      >
                        {t("pharmacyGoToPayment")}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-blue-700">
                    {t("pharmacyPreliminaryEstimateTitle")}
                  </CardTitle>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    {language === "fr" ? t(estimate.statusKeyFR) : t(estimate.statusKeyEN)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {language === "fr" ? t("pharmacyEstimateMedicationsFR") : t("pharmacyEstimateMedicationsEN")}
                  </span>
                  <span className="font-medium">{estimate.medicationsAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {language === "fr" ? t("pharmacyEstimatePrepFeesFR") : t("pharmacyEstimatePrepFeesEN")}
                  </span>
                  <span className="font-medium">{estimate.prepFees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {language === "fr" ? t("pharmacyEstimateDeliveryFR") : t("pharmacyEstimateDeliveryEN")}
                  </span>
                  <span className="font-medium text-green-600">
                    {language === "fr" ? t(estimate.deliveryKeyFR) : t(estimate.deliveryKeyEN)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>{language === "fr" ? t("pharmacyEstimateTotalFR") : t("pharmacyEstimateTotalEN")}</span>
                  <span className="text-blue-700">{estimate.totalAmount}</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-start">
                    <Info size={16} className="mr-2 mt-0.5 shrink-0" />
                    <span>{language === "fr" ? t("pharmacyFinalQuoteInfoFR") : t("pharmacyFinalQuoteInfoEN")}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">{t("pharmacyNotificationsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notif, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start p-3 rounded border-l-4",
                      notif.type === "success" ? "bg-green-50 border-green-500" : "bg-blue-50 border-blue-500",
                    )}
                  >
                    {notif.type === "success" ? (
                      <CheckCircle size={20} className="text-green-500 mr-3 shrink-0" />
                    ) : (
                      <Loader2 size={20} className="text-blue-500 mr-3 shrink-0 animate-spin" />
                    )}
                    <div>
                      <p className={cn("font-medium", notif.type === "success" ? "text-green-800" : "text-blue-800")}>
                        {language === "fr" ? t(notif.messageKeyFR) : t(notif.messageKeyEN)}
                      </p>
                      <p className={cn("text-sm", notif.type === "success" ? "text-green-600" : "text-blue-600")}>
                        {notif.detailsKeyFR && notif.detailsKeyEN
                          ? language === "fr"
                            ? t(notif.detailsKeyFR)
                            : t(notif.detailsKeyEN)
                          : notif.time}
                      </p>
                      {notif.detailsKeyFR && notif.detailsKeyEN && notif.time && (
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">{t("pharmacyNeedHelpTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {language === "fr" ? t("pharmacyNeedHelpDescFR") : t("pharmacyNeedHelpDescEN")}
                </p>
                <div className="flex space-x-3">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <MessageCircleIcon size={16} className="mr-2" />
                    {t("pharmacyWhatsappButton")}
                  </Button>
                  <Button className="bg-blue-700 hover:bg-blue-800">
                    <Phone size={16} className="mr-2" />
                    {t("pharmacyCallButton")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "tibot":
        const isSubscribed = mockUser.plan === "pricingSoloPackTitle" || mockUser.plan === "dashboardPlanFamily"
        const currentPlanKey =
          mockUser.plan === "pricingSoloPackTitle"
            ? "tibotConnectedPlanSolo"
            : mockUser.plan === "dashboardPlanFamily"
              ? "tibotConnectedPlanFamily"
              : null

        if (!isSubscribed && !tibotSubscription) {
          return (
            <div className="max-w-2xl mx-auto">
              <Card className="text-center shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-blue-600" size={32} />
                  </div>
                  <CardTitle className="text-2xl">{t("tibotAccessReserved")}</CardTitle>
                  <CardDescription>{t("tibotAccessInfo")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant={tibotSubscription === "solo" ? "default" : "outline"}
                      className="w-full py-6"
                      onClick={() => handleTibotSubscriptionSelect("solo")}
                    >
                      <div>
                        <h3 className="font-semibold">{t("pricingSoloPackTitle")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("pricingSoloPackPrice")} {t("pricingSoloPackDesc")}
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant={tibotSubscription === "family" ? "default" : "outline"}
                      className="w-full py-6"
                      onClick={() => handleTibotSubscriptionSelect("family")}
                    >
                      <div>
                        <h3 className="font-semibold">{t("pricingFamilyPackTitle")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("pricingFamilyPackPrice")} {t("pricingFamilyPackDesc")}
                        </p>
                      </div>
                    </Button>
                  </div>
                  <Button onClick={handleAccessTibot} className="w-full" disabled={!tibotSubscription}>
                    {t("tibotAccessButton")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        }

        return (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="text-green-600" />
                  </div>
                  <span className="text-green-600 font-medium">
                    {currentPlanKey ? t(currentPlanKey) : t("tibotConnectedPlanSolo")}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("tibotWelcomeMessage")}</h2>
                <p className="text-gray-600 text-sm">{t("tibotWelcomeInfo")}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">{t("tibotQuickActionsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Thermometer,
                    titleKey: "tibotQuickActionSymptoms",
                    descKey: "tibotQuickActionSymptomsDesc",
                    action: () => handleTibotQuickAction("symptoms"),
                  },
                  {
                    icon: Pill,
                    titleKey: "tibotQuickActionMedication",
                    descKey: "tibotQuickActionMedicationDesc",
                    action: () => handleTibotQuickAction("medication"),
                  },
                  {
                    icon: UserMd,
                    titleKey: "tibotQuickActionConsultation",
                    descKey: "tibotQuickActionConsultationDesc",
                    action: () => router.push("/dashboard?tab=waiting-room"),
                  },
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={item.action}
                  >
                    <item.icon className="text-blue-600 mb-1" size={20} />
                    <h4 className="font-medium">{t(item.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Robot className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium">TiBot</h3>
                    <p className="text-sm text-green-600">{t("tibotChatHeaderOnline")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent ref={chatMessagesRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                {tibotMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex items-start space-x-3", msg.sender === "user" && "justify-end")}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Robot className="text-white text-sm" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-[70%] text-sm",
                        msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800",
                      )}
                    >
                      <p>{msg.text}</p>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserMd className="text-gray-600 text-sm" />
                      </div>
                    )}
                  </div>
                ))}
                {isTibotTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Robot className="text-white text-sm" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="text-sm text-gray-500 animate-pulse">Typing...</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="border-t p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    { textKey: "tibotQuickResponseFever" as TranslationKey },
                    { textKey: "tibotQuickResponseHeadache" as TranslationKey },
                    { textKey: "tibotQuickResponseTired" as TranslationKey },
                  ].map((qr) => (
                    <Button
                      key={qr.textKey}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTibotQuickResponse(qr.textKey)}
                    >
                      {t(qr.textKey)}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    value={tibotInput}
                    onChange={(e) => setTibotInput(e.target.value)}
                    placeholder={t("tibotInputPlaceholder")}
                    onKeyPress={(e) => e.key === "Enter" && handleTibotSendMessage()}
                  />
                  <Button onClick={() => handleTibotSendMessage()} disabled={isTibotTyping || !tibotInput.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>

            <Accordion type="single" collapsible className="w-full mt-6">
              <AccordionItem value="faq">
                <AccordionTrigger className="text-lg font-semibold">{t("tibotFaqTitle")}</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-fever">
                      <AccordionTrigger>{t("tibotFaqFeverTitle")}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">{t("tibotFaqFeverContent")}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-consult">
                      <AccordionTrigger>{t("tibotFaqConsultTitle")}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">{t("tibotFaqConsultContent")}</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="reminders">
                <AccordionTrigger className="text-lg font-semibold">{t("tibotMedRemindersTitle")}</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  {medicationReminders.length === 0 ? (
                    <p className="text-gray-600">{t("tibotMedRemindersNone")}</p>
                  ) : (
                    medicationReminders.map((reminder) => (
                      <div key={reminder.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>
                          {reminder.name} - {reminder.time}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMedicationReminders((prev) => prev.filter((r) => r.id !== reminder.id))}
                        >
                          <XRay size={16} />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button variant="link" onClick={() => setShowMedicationModal(true)} className="p-0 h-auto">
                    <Plus size={16} className="mr-1" /> {t("tibotMedRemindersAddButton")}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Dialog open={showMedicationModal} onOpenChange={setShowMedicationModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("tibotMedModalTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="med-name">{t("tibotMedModalNameLabel")}</Label>
                    <Input id="med-name" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="med-time">{t("tibotMedModalTimeLabel")}</Label>
                    <Input
                      id="med-time"
                      type="time"
                      value={newMedTime}
                      onChange={(e) => setNewMedTime(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t("tibotMedModalCancelButton")}</Button>
                  </DialogClose>
                  <Button onClick={handleAddMedicationReminder}>{t("tibotMedModalAddButton")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )

      case "history":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6 border-b pb-3 mb-6">
              <Link href="/dashboard" className="text-blue-600 font-medium flex items-center hover:underline">
                <ArrowLeft className="mr-2" size={18} />
                {t("historyBackToDashboard")}
              </Link>
              <div className="text-gray-300">|</div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <HistoryIcon className="mr-2 text-blue-600" size={22} />
                {t("historyTitle")}
              </h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder={t("historySearchPlaceholder")}
                      className="pl-10"
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Select value={historyFilterType} onValueChange={setHistoryFilterType}>
                      <SelectTrigger className="w-full sm:w-auto">
                        <SelectValue placeholder={t("historyFilterTypeAll")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("historyFilterTypeAll")}</SelectItem>
                        <SelectItem value="consultation">{t("historyFilterTypeConsultations")}</SelectItem>
                        <SelectItem value="second-opinion">{t("historyFilterTypeSecondOpinions")}</SelectItem>
                        <SelectItem value="prescription">{t("historyFilterTypePrescriptions")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={historyFilterPeriod} onValueChange={setHistoryFilterPeriod}>
                      <SelectTrigger className="w-full sm:w-auto">
                        <SelectValue placeholder={t("historyFilterPeriodAll")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("historyFilterPeriodAll")}</SelectItem>
                        <SelectItem value="week">{t("historyFilterPeriodWeek")}</SelectItem>
                        <SelectItem value="month">{t("historyFilterPeriodMonth")}</SelectItem>
                        <SelectItem value="year">{t("historyFilterPeriodYear")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Download className="mr-2" size={16} />
                      {t("historyExportPDF")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: UserMd, labelKey: "historySummaryTotalConsultations", value: "18", color: "blue" },
                { icon: Pill, labelKey: "historySummaryPrescriptions", value: "12", color: "green" },
                { icon: Stethoscope, labelKey: "historySummarySecondOpinions", value: "2", color: "orange" },
                {
                  icon: CalendarCheck,
                  labelKey: "historySummaryLastConsultation",
                  value: t("historySummaryLastConsultationValue"),
                  color: "purple",
                },
              ].map((item) => (
                <Card key={item.labelKey}>
                  <CardContent className="p-6 flex items-center">
                    <div className={`p-3 rounded-full bg-${item.color}-100 mr-4`}>
                      <item.icon className={`text-${item.color}-600`} size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t(item.labelKey as TranslationKey)}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 text-blue-600" size={22} />
                  {t("historyChartTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Line data={healthChartData} options={healthChartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HistoryIcon className="mr-2 text-blue-600" size={22} />
                  {t("historyConsultationHistoryTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {filteredHistory.map((item, index) => (
                  <Card
                    key={item.id}
                    className={cn("bg-gray-50 border-l-4 p-6 hover:shadow-md transition-shadow", item.borderColor)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={cn("w-3 h-3 rounded-full mr-4", item.iconColor.replace("text-", "bg-"))}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{t(item.titleKey)}</h4>
                          <p className="text-sm text-gray-500">
                            {item.date} - {item.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={cn("text-white text-xs px-2 py-1 rounded-full", item.statusColor)}>
                          {t(item.statusKey)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <EllipsisVertical size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4 text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>{t("historyDoctorLabel")}</strong> {item.doctorName} - {t(item.doctorSpecialtyKey)}
                      </p>
                      <p>
                        <strong>{t("historyReasonLabel")}</strong> {t(item.reasonKey)}
                      </p>
                      {item.fee && (
                        <p>
                          <strong>{t("historyFeeLabel")}</strong> {item.fee}
                        </p>
                      )}
                    </div>
                    <Card className="bg-white mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <item.summaryIcon className={cn("mr-2", item.iconColor)} size={18} />
                          {t(item.summaryTitleKey)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">{t(item.summaryTextKey)}</p>
                        {item.diagnoses && item.diagnoses.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {item.diagnoses.map((diag) => (
                              <span
                                key={diag.textKey}
                                className={cn(
                                  "text-white text-xs px-2 py-1 rounded-full flex items-center",
                                  diag.color,
                                )}
                              >
                                <diag.icon size={12} className="mr-1" />
                                {t(diag.textKey)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          <strong>{t("historyRecommendationsLabel")}</strong>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            {t(item.recommendationsKey)
                              .split("\n")
                              .map((rec, i) => rec.trim() && <li key={i}>{rec.trim().replace(/^- /, "")}</li>)}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.hasPrescription ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-green-500 text-white hover:bg-green-600 hover:text-white"
                          >
                            <Pill size={14} className="mr-1" /> {t("historyLinkedPrescription")}
                          </Button>
                        ) : item.reportLinkKey ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs p-0 h-auto text-blue-600 hover:text-blue-700"
                          >
                            <FileMedical size={14} className="mr-1" /> {t(item.reportLinkKey)}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                            <XRay size={14} className="mr-1 inline-block" /> {t("historyNoPrescription")}
                          </span>
                        )}
                        {item.actions.find((a) => a.type === "viewDetails") && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs p-0 h-auto text-blue-600 hover:text-blue-700"
                          >
                            <Eye size={14} className="mr-1" />{" "}
                            {t(item.actions.find((a) => a.type === "viewDetails")!.labelKey)}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.actions.find((a) => a.type === "downloadPDF") && (
                          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                            <Download size={14} className="mr-1" />{" "}
                            {t(item.actions.find((a) => a.type === "downloadPDF")!.labelKey)}
                          </Button>
                        )}
                        {item.actions.find((a) => a.type === "share") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setShowShareModal(true)}
                          >
                            <Share size={14} className="mr-1" />{" "}
                            {t(item.actions.find((a) => a.type === "share")!.labelKey)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="text-center mt-4">
                  <Button>
                    <Plus className="mr-2" size={16} />
                    {t("historyViewMoreButton")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("historyShareModalTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="share-email">{t("historyShareModalEmailLabel")}</Label>
                    <Input
                      id="share-email"
                      type="email"
                      placeholder="docteur@exemple.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="share-message">{t("historyShareModalMessageLabel")}</Label>
                    <Textarea
                      id="share-message"
                      placeholder={t("historyShareModalMessagePlaceholder")}
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowShareModal(false)}>
                    {t("historyShareModalCancelButton")}
                  </Button>
                  <Button onClick={handleConfirmShare}>
                    <Share className="mr-2" size={16} />
                    {t("historyShareModalShareButton")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      default:
        return <div>{t("navDashboard")} Content</div>
    }
  }

  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      {renderContent()}
    </React.Suspense>
  )
}
