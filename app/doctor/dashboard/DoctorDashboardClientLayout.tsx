"use client"

import type React from "react"
import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage, type Language } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  HeartPulse,
  LayoutDashboard,
  Video,
  FileText,
  Users,
  MessageSquare,
  UserCircle,
  FileSignature,
  LineChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import DoctorSidebar from "@/components/doctor/doctor-sidebar"
import DoctorHeader from "@/components/doctor/doctor-header"

const getTranslation = (lang: Language, key: TranslationKey) => {
  return translations[lang]?.[key] || translations["en"]?.[key] || String(key)
}

interface NavItem {
  href: string
  icon: React.ElementType
  labelKey: TranslationKey
  badge?: number
}

export default function DoctorDashboardClientLayout({
  user,
  profile,
  children,
}: {
  user: any
  profile: any
  children: ReactNode
}) {
  const { language, setLanguage } = useLanguage()
  const t = (key: TranslationKey) => getTranslation(language, key)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { href: "/doctor/dashboard", icon: LayoutDashboard, labelKey: "doctorDashboardNavDashboard" },
    { href: "/doctor/dashboard/video-consultation", icon: Video, labelKey: "doctorDashboardNavVideoConsultation" },
    { href: "/doctor/dashboard/ai-prescriptions", icon: FileText, labelKey: "doctorDashboardNavAIPrescriptions" },
    { href: "/doctor/dashboard/patient-records", icon: Users, labelKey: "doctorDashboardNavPatientRecords" },
    { href: "/doctor/dashboard/chat", icon: MessageSquare, labelKey: "doctorDashboardNavPatientChat", badge: 3 },
    { href: "/doctor/dashboard/profile", icon: UserCircle, labelKey: "doctorDashboardNavMyProfile" },
    { href: "/doctor/dashboard/ai-reports", icon: FileSignature, labelKey: "doctorDashboardNavAIReports" },
    { href: "/doctor/dashboard/performance", icon: LineChart, labelKey: "doctorDashboardNavPerformance" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/doctor/dashboard" className="flex items-center space-x-3">
          <HeartPulse className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">TIBOK</span>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{t("doctorDashboardTitle")}</p>
      </div>
      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group",
              pathname === item.href
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                : "text-gray-700 dark:text-gray-300",
            )}
          >
            <item.icon className="h-5 w-5 mr-3 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
            <span className="flex-1">{t(item.labelKey)}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <DoctorSidebar />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-white dark:bg-gray-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DoctorHeader user={user} profile={profile} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">{children}</main>
      </div>
    </div>
  )
}
