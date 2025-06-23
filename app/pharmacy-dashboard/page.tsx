"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import type { Prescription, Quote, Order } from "@/lib/pharmacy-data"
import { initialPrescriptions, initialQuotes, initialOrders } from "@/lib/pharmacy-data"
import { DashboardOverview } from "@/components/pharmacy-dashboard/dashboard-overview"
import { PrescriptionsReception } from "@/components/pharmacy-dashboard/prescriptions-reception"
import { QuoteElaboration } from "@/components/pharmacy-dashboard/quote-elaboration"
import { PaymentsManagement } from "@/components/pharmacy-dashboard/payments-management"
import { OrdersTracking } from "@/components/pharmacy-dashboard/orders-tracking"
import { useToast } from "@/components/ui/use-toast"

type View = "overview" | "prescriptions" | "quote-elaboration" | "payments" | "orders"

export default function PharmacyDashboardPage() {
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const t = translations[language]
  const { toast } = useToast()

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  const initialView = (searchParams.get("view") as View) || "overview"
  const [currentView, setCurrentView] = useState<View>(initialView)

  const handleProcessPrescription = (prescription: Prescription) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === prescription.id ? { ...p, status: "processing" } : p)))
    setSelectedPrescription(prescription)
    setCurrentView("quote-elaboration")
  }

  const handleBackToPrescriptions = () => {
    setSelectedPrescription(null)
    setCurrentView("prescriptions")
  }

  const handleSendQuote = (newQuote: Omit<Quote, "id" | "date">) => {
    const quote: Quote = {
      ...newQuote,
      id: `QUO-${String(quotes.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString(),
    }
    setQuotes((prev) => [...prev, quote])
    setPrescriptions((prev) => prev.map((p) => (p.id === quote.prescriptionId ? { ...p, status: "quoted" } : p)))
    toast({
      title: t.quoteSentSuccessTitle,
      description: t.quoteSentSuccessMessage.replace("{patientName}", quote.patient.name),
    })
    handleBackToPrescriptions()
  }

  const handleValidateAndTransfer = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId)
    if (!quote) return

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      quoteId: quote.id,
      patient: quote.patient,
      transferDate: new Date().toISOString(),
      trackingNumber: `TIBOK-LIV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "transferred",
    }

    setOrders((prev) => [...prev, newOrder])
    setQuotes((prev) => prev.filter((q) => q.id !== quoteId))

    toast({
      title: t.orderTransferredSuccessTitle,
      description: t.orderTransferredSuccessMessage,
    })
  }

  const renderContent = () => {
    const view = selectedPrescription ? "quote-elaboration" : searchParams.get("view") || "overview"

    switch (view) {
      case "prescriptions":
        return <PrescriptionsReception prescriptions={prescriptions} onProcess={handleProcessPrescription} />
      case "quote-elaboration":
        return selectedPrescription ? (
          <QuoteElaboration
            prescription={selectedPrescription}
            onBack={handleBackToPrescriptions}
            onSendQuote={handleSendQuote}
          />
        ) : null
      case "payments":
        return <PaymentsManagement quotes={quotes} onValidateAndTransfer={handleValidateAndTransfer} />
      case "orders":
        return <OrdersTracking orders={orders} />
      case "overview":
      default:
        return <DashboardOverview prescriptions={prescriptions} quotes={quotes} orders={orders} />
    }
  }

  return <div className="w-full">{renderContent()}</div>
}
