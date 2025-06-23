"use client"

import type React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Check,
  Users,
  Star,
  Truck,
  FileText,
  LucideCreditCard,
  LucideSmartphone,
  Search,
  Shuffle,
  UserCheck,
  Stethoscope,
  Activity,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

interface PricingCardProps {
  id: string
  titleKey: TranslationKey
  descriptionKey?: TranslationKey
  priceMURKey?: TranslationKey
  priceEURKey?: TranslationKey
  residentsKey?: TranslationKey
  touristsKey?: TranslationKey
  priceKey?: TranslationKey
  perMonthKey?: TranslationKey
  priceNoteKey?: TranslationKey
  features: { icon: React.ReactNode; textKey: TranslationKey }[]
  buttonTextKey: TranslationKey
  isFeatured?: boolean
  buttonVariant?: "default" | "secondary" | "outline" | "ghost" | "link"
}

const PricingCard: React.FC<PricingCardProps> = ({
  id,
  titleKey,
  descriptionKey,
  priceMURKey,
  priceEURKey,
  residentsKey, // Sera utilisé pour "Selon spécialité"
  touristsKey,
  priceKey,
  perMonthKey,
  // priceNoteKey, // Ou utilisez priceNoteKey si vous l'avez ajouté
  features,
  buttonTextKey,
  isFeatured,
  buttonVariant = "default",
}) => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div
      className={`bg-white p-8 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out hover:translate-y-[-5px] flex flex-col ${
        isFeatured ? "border-2 border-blue-600 relative pricing-featured" : ""
      }`}
    >
      {isFeatured && (
        <div className="absolute top-[-12px] right-5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {t.pricingPopular}
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{t[titleKey]}</h3>
      {descriptionKey && <p className="text-sm text-gray-600 mb-4">{t[descriptionKey]}</p>}
      <div className="mb-6">
        {priceMURKey && ( // Modifié pour utiliser residentsKey comme note
          <>
            <div className="text-2xl font-bold text-blue-600 mb-1">{t[priceMURKey]}</div>
            {residentsKey && <div className="text-sm text-gray-500">{t[residentsKey]}</div>}
          </>
        )}
        {priceEURKey && touristsKey && (
          <>
            <div className={`text-2xl font-bold text-blue-600 ${priceMURKey ? "mt-3" : ""} mb-1`}>{t[priceEURKey]}</div>
            <div className="text-sm text-gray-500">{t[touristsKey]}</div>
          </>
        )}
        {priceKey && perMonthKey && (
          <>
            <div className="text-3xl font-bold text-blue-600">{t[priceKey]}</div>
            <div className="text-gray-600">{t[perMonthKey]}</div>
          </>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.icon}
            <span className="ml-3 text-gray-700">{t[feature.textKey]}</span>
          </li>
        ))}
      </ul>
      <Link href={`/start-consultation?plan=${id}`} className="w-full mt-auto">
        <Button
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            buttonVariant === "default" || isFeatured
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : buttonVariant === "secondary"
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-teal-500 text-white hover:bg-teal-600" // Style par défaut pour la nouvelle carte
          }`}
          variant={isFeatured ? "default" : buttonVariant}
        >
          {t[buttonTextKey]}
        </Button>
      </Link>
    </div>
  )
}

const PaymentMethod: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => (
  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
    {icon}
    <span className="font-medium">{name}</span>
  </div>
)

const CreditCard = ({ className }: { className?: string }) => <LucideCreditCard className={className} />
const Smartphone = ({ className }: { className?: string }) => <LucideSmartphone className={className} />

export default function PricingSection() {
  const { language } = useLanguage()
  const t = translations[language]

  const plans: PricingCardProps[] = [
    {
      id: "pay-per-use", // Add this
      titleKey: "pricingPlan1Title",
      priceMURKey: "pricingPlan1PriceMUR",
      residentsKey: "pricingPlan1Residents",
      priceEURKey: "pricingPlan1PriceEUR",
      touristsKey: "pricingPlan1Tourists",
      features: [
        { icon: <Check className="text-green-500" />, textKey: "pricingPlan1Feature1" },
        { icon: <Truck className="text-orange-500" />, textKey: "pricingPlan1Feature2" },
      ],
      buttonTextKey: "pricingPlan1Button",
      buttonVariant: "secondary",
    },
    {
      id: "solo", // Add this
      titleKey: "pricingPlan2Title",
      priceKey: "pricingPlan2Price",
      perMonthKey: "pricingPlan2PerMonth",
      features: [
        { icon: <Check className="text-green-500" />, textKey: "pricingPlan2Feature1" },
        { icon: <Truck className="text-green-500" />, textKey: "pricingPlan2Feature2" }, // Changed from fas fa-shipping-fast
        { icon: <FileText className="text-green-500" />, textKey: "pricingPlan2Feature3" }, // Changed from fas fa-prescription
      ],
      buttonTextKey: "pricingPlan2Button",
    },
    {
      id: "family", // Add this
      titleKey: "pricingPlan3Title",
      priceKey: "pricingPlan3Price",
      perMonthKey: "pricingPlan3PerMonth",
      features: [
        { icon: <Users className="text-green-500" />, textKey: "pricingPlan3Feature1" },
        { icon: <Check className="text-green-500" />, textKey: "pricingPlan3Feature2" },
        { icon: <Truck className="text-green-500" />, textKey: "pricingPlan3Feature3" }, // Changed from fas fa-shipping-fast
        { icon: <Star className="text-green-500" />, textKey: "pricingPlan3Feature4" },
      ],
      buttonTextKey: "pricingPlan3Button",
      isFeatured: true,
    },
    {
      id: "second-opinion",
      titleKey: "pricingPlan4Title",
      descriptionKey: "pricingPlan4Description",
      priceMURKey: "pricingPlan4PriceMUR",
      residentsKey: "pricingPlan4PriceNote", // Utilisation de residentsKey pour "Selon spécialité"
      features: [
        { icon: <Search className="text-teal-500" />, textKey: "pricingPlan4Feature1" },
        { icon: <Shuffle className="text-teal-500" />, textKey: "pricingPlan4Feature2" },
        { icon: <UserCheck className="text-teal-500" />, textKey: "pricingPlan4Feature3" },
        { icon: <Stethoscope className="text-teal-500" />, textKey: "pricingPlan4Feature4" },
        { icon: <FileText className="text-teal-500" />, textKey: "pricingPlan4Feature5" },
        { icon: <Activity className="text-teal-500" />, textKey: "pricingPlan4Feature6" },
      ],
      buttonTextKey: "pricingPlan4Button",
      buttonVariant: "outline", // Ou un autre variant si vous préférez
    },
  ]

  const paymentMethods = [
    { icon: <CreditCard className="text-2xl text-blue-600" />, name: "Visa" },
    { icon: <CreditCard className="text-2xl text-red-500" />, name: "Mastercard" },
    { icon: <CreditCard className="text-2xl text-blue-500" />, name: "PayPal" }, // No direct PayPal icon in Lucide
    { icon: <CreditCard className="text-2xl text-blue-400" />, name: "Amex" },
    { icon: <Smartphone className="text-2xl text-green-600" />, name: "Juice by MCB" },
  ]

  return (
    <section id="tarifs" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.pricingTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map(
            (
              plan, // Changé index en plan.id pour la clé
            ) => (
              <PricingCard key={plan.id} {...plan} /> // Supprimé id={plan.id} car il est déjà dans {...plan}
            ),
          )}
        </div>
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{t.paymentMethodsTitle}</h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {paymentMethods.map((method, index) => (
              <PaymentMethod key={index} icon={method.icon} name={method.name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
