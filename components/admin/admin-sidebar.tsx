"use client"

import type React from "react"
import { useContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building,
  Truck,
  Activity,
  BarChartBig,
  Settings,
  Users,
  Workflow,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { LanguageContext } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const navItems = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/pharmacies", labelKey: "pharmacies", icon: Building },
  { href: "/admin/deliveries", labelKey: "deliveries", icon: Truck },
  { href: "/admin/clients", labelKey: "clientInterfaces", icon: Users },
  { href: "/admin/monitoring", labelKey: "monitoring", icon: Activity },
  { href: "/admin/analytics", labelKey: "analytics", icon: BarChartBig },
]

const systemNavItems = [
  { href: "/admin/workflows", labelKey: "n8nWorkflows", icon: Workflow },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
  { href: "/admin/logs", labelKey: "systemLogs", icon: FileText },
]

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { language } = useContext(LanguageContext)
  const t = translations[language].adminNav

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200",
        pathname === href ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium" : "",
      )}
    >
      <Icon className={cn("h-5 w-5", isOpen ? "mr-3" : "mx-auto")} />
      {isOpen && <span className="truncate">{label}</span>}
    </Link>
  )

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isOpen ? "w-64" : "w-20",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700",
          isOpen ? "" : "flex-col",
        )}
      >
        {isOpen && (
          <Link href="/admin" className="flex items-center">
            <Image
              src="/placeholder.svg?width=32&height=32"
              alt="TIBOK Admin Logo"
              width={32}
              height={32}
              className="mr-2 rounded-full"
            />
            <span className="text-lg font-semibold">TIBOK Admin</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className={cn(isOpen ? "" : "mt-2")}>
          {isOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {isOpen && (
          <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t.navigation}
          </h3>
        )}
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={t[item.labelKey as keyof typeof t]} icon={item.icon} />
        ))}

        {isOpen && (
          <h3 className="px-4 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t.system}
          </h3>
        )}
        {systemNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={t[item.labelKey as keyof typeof t]} icon={item.icon} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={cn(
            "flex items-center p-2 bg-green-100 dark:bg-green-800 rounded-lg",
            isOpen ? "" : "justify-center",
          )}
        >
          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          {isOpen && <span className="ml-2 text-sm text-green-700 dark:text-green-300">Système Sécurisé</span>}
        </div>
      </div>
    </aside>
  )
}
