"use client"

import React, { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  HeartPulse,
  Bell,
  UserCircle,
  LayoutDashboard,
  Users,
  Video,
  UserIcon as UserMd,
  Pill,
  Bot,
  History,
  Crown,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react"
import LanguageSwitcher from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  labelKey: TranslationKey
  icon: React.ElementType
  live?: boolean
}

const navItems: NavItem[] = [
  { id: "dashboard", labelKey: "navDashboard", icon: LayoutDashboard },
  { id: "family", labelKey: "navFamily", icon: Users },
  { id: "waiting-room", labelKey: "navWaitingRoom", icon: Video, live: true },
  { id: "second-opinion", labelKey: "navSecondOpinion", icon: UserMd },
  { id: "pharmacy", labelKey: "navPharmacy", icon: Pill },
  { id: "tibot", labelKey: "navTibotAI", icon: Bot },
  { id: "history", labelKey: "navHistory", icon: History },
]

// Mock user data - replace with actual auth data
const mockUser = {
  name: "Marie Dubois",
  avatarUrl: "/placeholder.svg?width=32&height=32",
  plan: "dashboardPlanFamily",
  consultationsRemaining: 3,
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HeartPulse className="text-white text-xl" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">TIBOK</h1>
                  <p className="text-xs text-gray-500">{t.dashboardBaseline}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
                <Bell size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-1 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={mockUser.avatarUrl || "/placeholder.svg"} alt={mockUser.name} />
                      <AvatarFallback>{mockUser.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{mockUser.name}</span>
                    <ChevronDown size={16} className="hidden md:inline text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{mockUser.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle size={16} className="mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings size={16} className="mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-sm fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 hidden md:block">
          <nav className="mt-6">
            <div className="px-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Crown size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{t[mockUser.plan as TranslationKey]}</p>
                    <p className="text-xs text-gray-500">
                      {mockUser.consultationsRemaining} {t.dashboardConsultationsRemaining}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard?tab=${item.id}`}
                  onClick={(e) => {
                    e.preventDefault() // Prevent full page reload
                    setActiveTab(item.id)
                    // Update URL without full reload for better UX, if desired
                    // window.history.pushState(null, "", `/dashboard?tab=${item.id}`);
                  }}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150",
                    activeTab === item.id
                      ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600" // Active style from HTML was border-r-2
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <item.icon size={18} className="mr-3" />
                  {t[item.labelKey]}
                  {item.live && (
                    <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {t.navLive}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 mt-0">
          {" "}
          {/* Removed top margin from header height */}
          {React.cloneElement(children as React.ReactElement, { activeTab })}
        </main>
      </div>
    </div>
  )
}
