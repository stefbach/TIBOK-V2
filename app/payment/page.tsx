"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  CalendarCheck,
  UserIcon as UserMd,
  Pill,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Lock,
  Loader2,
  CheckCircle,
  Headset,
  Mail,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"

type TransactionType = "consultation" | "subscription" | "secondopinion" | "pharmacy"
type PaymentMethod = "card" | "juice" | "paypal" | "credit"
type Language = "fr" | "en"

const transactionTypeDetails: Record<
  TransactionType,
  {
    icon: React.ElementType
    defaultAmountMUR: number
    defaultAmountEUR?: number
    titleKey: TranslationKey
    descKey: TranslationKey
    priceKey?: TranslationKey
  }
> = {
  consultation: {
    icon: Stethoscope,
    defaultAmountMUR: 1000,
    defaultAmountEUR: 35,
    titleKey: "paymentConsultationTitleFR",
    descKey: "paymentConsultationDescFR",
  },
  subscription: {
    icon: CalendarCheck,
    defaultAmountMUR: 2800,
    titleKey: "paymentSubscriptionTitleFR",
    descKey: "paymentSubscriptionDescFR",
  }, // Example: Family pack
  secondopinion: {
    icon: UserMd,
    defaultAmountMUR: 4500,
    defaultAmountEUR: 150,
    titleKey: "paymentSecondOpinionTitleFR",
    descKey: "paymentSecondOpinionDescFR",
  },
  pharmacy: {
    icon: Pill,
    defaultAmountMUR: 0,
    titleKey: "paymentPharmacyTitleFR",
    descKey: "paymentPharmacyDescFR",
    priceKey: "paymentPharmacyPriceFR",
  },
}

const paymentMethodDetails: Record<
  PaymentMethod,
  {
    icon: React.ElementType
    titleKey: TranslationKey
    descKey?: TranslationKey
    balanceKey?: TranslationKey
    iconColor?: string
  }
> = {
  card: { icon: CreditCard, titleKey: "paymentCardTitleFR", descKey: "paymentCardDesc", iconColor: "text-blue-600" },
  juice: {
    icon: Smartphone,
    titleKey: "paymentJuiceTitle",
    descKey: "paymentJuiceDescFR",
    iconColor: "text-orange-500",
  },
  paypal: {
    icon: Landmark,
    titleKey: "paymentPaypalTitle",
    descKey: "paymentPaypalDescFR",
    iconColor: "text-blue-500",
  },
  credit: {
    icon: Wallet,
    titleKey: "paymentCreditTitleFR",
    balanceKey: "paymentCreditBalanceFR",
    iconColor: "text-green-600",
  },
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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

  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [currentAmountMUR, setCurrentAmountMUR] = useState(0)
  const [currentAmountEUR, setCurrentAmountEUR] = useState<number | undefined>(undefined)
  const [amountDescription, setAmountDescription] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [transactionDate, setTransactionDate] = useState("")

  useEffect(() => {
    const amountParam = searchParams.get("amount")
    const descriptionParam = searchParams.get("description")
    const langParam = searchParams.get("lang") as Language

    if (langParam && (langParam === "fr" || langParam === "en")) {
      setLanguage(langParam)
    }

    if (amountParam) {
      const numericAmount = Number.parseFloat(amountParam.replace(/[^0-9.-]+/g, ""))
      if (!isNaN(numericAmount)) {
        setCurrentAmountMUR(numericAmount)
        setSelectedTransactionType("pharmacy") // Assume pharmacy if amount is passed
        setAmountDescription(descriptionParam || t("paymentPharmacyDescFR"))
      }
    }
  }, [searchParams, language, setLanguage, t])

  const handleSelectTransactionType = (type: TransactionType) => {
    setSelectedTransactionType(type)
    const details = transactionTypeDetails[type]
    setCurrentAmountMUR(details.defaultAmountMUR)
    setCurrentAmountEUR(details.defaultAmountEUR)
    setAmountDescription(t(details.descKey))
    setSelectedPaymentMethod(null) // Reset payment method
  }

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
  }

  const handleProcessPayment = () => {
    if (!selectedTransactionType || !selectedPaymentMethod) {
      alert(t("selectOptionsAlert"))
      return
    }
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setTransactionId(
        `TBK-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${Math.floor(Math.random() * 1000)}`,
      )
      setTransactionDate(new Date().toLocaleString(language === "fr" ? "fr-FR" : "en-US"))
      setShowSuccessModal(true)
    }, 3000)
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setSelectedTransactionType(null)
    setSelectedPaymentMethod(null)
    setCurrentAmountMUR(0)
    setCurrentAmountEUR(undefined)
    setAmountDescription("")
    router.push("/dashboard") // Or to a relevant page
  }

  const currentMockCreditBalance = 2500

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <HeartPulse className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TIBOK</h1>
                <p className="text-sm text-gray-600">
                  {t(language === "fr" ? "paymentHeaderSubtitleFR" : "paymentHeaderSubtitleEN")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <ShieldCheck size={16} className="mr-1" />
                <span>{t(language === "fr" ? "paymentSecureTextFR" : "paymentSecureTextEN")}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t(language === "fr" ? "paymentPageTitleFR" : "paymentPageTitleEN")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {!searchParams.get("amount") && ( // Only show transaction type selection if not coming from pharmacy with specific amount
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-3">
                      {t(language === "fr" ? "paymentTransactionTypeLabelFR" : "paymentTransactionTypeLabelEN")}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(transactionTypeDetails).map(([key, details]) => (
                        <div
                          key={key}
                          className={cn(
                            "border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all",
                            selectedTransactionType === key ? "border-blue-600 bg-blue-50" : "border-gray-200",
                          )}
                          onClick={() => handleSelectTransactionType(key as TransactionType)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{t(details.titleKey)}</h3>
                              <p className="text-sm text-gray-600">{t(details.descKey)}</p>
                              <div className="mt-2">
                                <span className="text-lg font-bold text-blue-600">
                                  {details.priceKey
                                    ? t(details.priceKey)
                                    : `${details.defaultAmountMUR.toLocaleString(language)} MUR`}
                                </span>
                                {details.defaultAmountEUR && (
                                  <span className="text-sm text-gray-500 ml-2">/ {details.defaultAmountEUR} €</span>
                                )}
                              </div>
                            </div>
                            <details.icon className="text-blue-600 text-2xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedTransactionType || searchParams.get("amount")) && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        {amountDescription || t(language === "fr" ? "paymentAmountLabelFR" : "paymentAmountLabelEN")}
                      </p>
                      <div className="text-3xl font-bold text-blue-700">
                        {currentAmountMUR.toLocaleString(language)} MUR
                      </div>
                      {currentAmountEUR && <p className="text-sm text-gray-500 mt-1">{currentAmountEUR} €</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        {t(language === "fr" ? "paymentAmountDetailsFR" : "paymentAmountDetailsEN")}
                      </p>
                    </div>
                  </div>
                )}

                {(selectedTransactionType || searchParams.get("amount")) && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-4">
                      {t(language === "fr" ? "paymentMethodLabelFR" : "paymentMethodLabelEN")}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(paymentMethodDetails).map(([key, details]) => (
                        <div
                          key={key}
                          className={cn(
                            "border-2 rounded-lg p-4 cursor-pointer flex items-center space-x-3 hover:shadow-md transition-all",
                            selectedPaymentMethod === key ? "border-blue-600 bg-blue-50" : "border-gray-200",
                          )}
                          onClick={() => handleSelectPaymentMethod(key as PaymentMethod)}
                        >
                          <details.icon className={cn("text-xl", details.iconColor)} />
                          <div>
                            <h3 className="font-semibold">{t(details.titleKey)}</h3>
                            {details.descKey && <p className="text-sm text-gray-600">{t(details.descKey)}</p>}
                            {details.balanceKey && (
                              <p className="text-sm text-gray-600">
                                {t(details.balanceKey, { amount: currentMockCreditBalance.toLocaleString(language) })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPaymentMethod && (
                  <div className="mt-8">
                    {selectedPaymentMethod === "card" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                              {t(language === "fr" ? "paymentCardNumberLabelFR" : "paymentCardNumberLabelEN")}
                            </Label>
                            <Input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div>
                            <Label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                              {t(language === "fr" ? "paymentExpiryLabelFR" : "paymentExpiryLabelEN")}
                            </Label>
                            <Input type="text" id="expiryDate" placeholder="MM/AA" />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                              {t("paymentCVVLabel")}
                            </Label>
                            <Input type="text" id="cvv" placeholder="123" />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-2">
                              {t(language === "fr" ? "paymentCardHolderLabelFR" : "paymentCardHolderLabelEN")}
                            </Label>
                            <Input
                              type="text"
                              id="cardHolder"
                              placeholder={language === "fr" ? "Jean Dupont" : "John Doe"}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedPaymentMethod === "juice" && (
                      <div>
                        <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          {t(language === "fr" ? "paymentPhoneLabelFR" : "paymentPhoneLabelEN")}
                        </Label>
                        <Input type="tel" id="phoneNumber" placeholder="+230 5XXX XXXX" />
                        <p className="text-sm text-gray-600 mt-2">
                          {t(language === "fr" ? "paymentJuiceInfoFR" : "paymentJuiceInfoEN")}
                        </p>
                      </div>
                    )}
                    {selectedPaymentMethod === "paypal" && (
                      <div className="text-center py-8">
                        <Landmark className="text-6xl text-blue-500 mb-4 mx-auto" />
                        <p className="text-gray-600">
                          {t(language === "fr" ? "paymentPaypalInfoFR" : "paymentPaypalInfoEN")}
                        </p>
                      </div>
                    )}
                    {selectedPaymentMethod === "credit" && (
                      <div
                        className={cn(
                          "rounded-lg p-6 text-center",
                          currentMockCreditBalance >= currentAmountMUR ? "bg-green-50" : "bg-red-50",
                        )}
                      >
                        {currentMockCreditBalance >= currentAmountMUR ? (
                          <>
                            <CheckCircle className="text-green-600 text-4xl mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                              {t(language === "fr" ? "paymentCreditSufficientFR" : "paymentCreditSufficientEN")}
                            </h3>
                            <p className="text-green-700">
                              {t(language === "fr" ? "paymentCreditInfoFR" : "paymentCreditInfoEN")}
                            </p>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="text-red-600 text-4xl mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                              {language === "fr" ? "Solde insuffisant" : "Insufficient Balance"}
                            </h3>
                            <p className="text-red-700">
                              {language === "fr"
                                ? `Votre solde TIBOK (${currentMockCreditBalance.toLocaleString(language)} MUR) est insuffisant.`
                                : `Your TIBOK credit (${currentMockCreditBalance.toLocaleString(language)} MUR) is insufficient.`}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={handleProcessPayment}
                      className="w-full mt-8 bg-blue-600 text-white py-4 text-lg font-semibold hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                      disabled={
                        isProcessing ||
                        (selectedPaymentMethod === "credit" && currentMockCreditBalance < currentAmountMUR)
                      }
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-5 w-5" />
                      )}
                      {isProcessing
                        ? t(language === "fr" ? "paymentProcessingTextFR" : "paymentProcessingTextEN")
                        : t(language === "fr" ? "paymentPayButtonTextFR" : "paymentPayButtonTextEN")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t(language === "fr" ? "paymentHistoryTitleFR" : "paymentHistoryTitleEN")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    titleKey: "paymentLastConsultationFR",
                    date: "15/12/2023",
                    doctor: "Dr. Martin",
                    statusKey: "paymentStatusPaidFR",
                    amount: "1,000 MUR",
                    color: "green",
                  },
                  {
                    titleKey: "paymentLastPharmacyFR",
                    date: "12/12/2023",
                    order: "#1234",
                    statusKey: "paymentStatusDeliveredFR",
                    amount: "850 MUR",
                    color: "blue",
                  },
                  {
                    titleKey: "paymentLastSubscriptionFR",
                    date: "Décembre 2023",
                    statusKey: "paymentStatusActiveFR",
                    amount: "800 MUR",
                    color: "orange",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`border-l-4 border-${item.color}-500 pl-4 py-2 hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{t(item.titleKey)}</h4>
                        <p className="text-sm text-gray-600">
                          {item.date} {item.doctor && `- ${item.doctor}`} {item.order && `- Ordonnance ${item.order}`}
                        </p>
                        <span
                          className={`inline-block bg-${item.color}-100 text-${item.color}-800 text-xs px-2 py-1 rounded-full mt-1`}
                        >
                          {t(item.statusKey)}
                        </span>
                      </div>
                      <span className={`font-semibold text-${item.color}-600`}>{item.amount}</span>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full mt-2 text-blue-600 hover:text-blue-800">
                  {t(language === "fr" ? "paymentViewAllTransactionsFR" : "paymentViewAllTransactionsEN")}{" "}
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t(language === "fr" ? "paymentSupportTitleFR" : "paymentSupportTitleEN")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Headset, phoneKey: "paymentSupportPhoneFR", hoursKey: "paymentSupportHoursFR" },
                  { icon: Mail, email: "support@tibok.mu", responseKey: "paymentSupportEmailDescFR" },
                  {
                    icon: MessageCircle,
                    chatKey: "paymentSupportChatFR",
                    availabilityKey: "paymentSupportChatHoursFR",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="text-blue-600 text-xl" />
                    <div>
                      <p className="font-semibold">
                        {item.phoneKey ? t(item.phoneKey) : item.email ? item.email : t(item.chatKey!)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.hoursKey
                          ? t(item.hoursKey)
                          : item.responseKey
                            ? t(item.responseKey)
                            : t(item.availabilityKey!)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <CheckCircle className="text-green-600 text-6xl mb-4 mx-auto" />
            <DialogTitle className="text-2xl font-bold">
              {t(language === "fr" ? "paymentSuccessTitleFR" : "paymentSuccessTitleEN")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t(language === "fr" ? "paymentSuccessMessageFR" : "paymentSuccessMessageEN")}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 my-6 text-sm text-gray-700">
            <p>{t(language === "fr" ? "paymentTransactionIdFR" : "paymentTransactionIdEN", { id: transactionId })}</p>
            <p>
              {t(language === "fr" ? "paymentTransactionDateFR" : "paymentTransactionDateEN", {
                date: transactionDate,
              })}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={closeSuccessModal} className="w-full bg-blue-600 hover:bg-blue-700">
              {t(language === "fr" ? "paymentCloseButtonFR" : "paymentCloseButtonEN")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
