"use client"

import type React from "react"
import { useContext } from "react"
import { LanguageContext } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ShieldAlert,
  Truck,
  Building,
  Settings,
  HomeIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LanguageSwitcher from "@/components/language-switcher"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"
import Image from "next/image"

interface AdminHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { language } = useContext(LanguageContext)
  const t = translations[language]
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    console.log("[AdminHeader] handleLogout: Function called via onSelect.")
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("[AdminHeader] handleLogout: Error during supabase.auth.signOut():", error)
    } else {
      console.log("[AdminHeader] handleLogout: supabase.auth.signOut() successful.")
      router.push("/admin/login")
      router.refresh()
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 lg:hidden text-gray-600 dark:text-gray-300"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Link href="/admin" className="flex items-center">
            <Image
              src="/placeholder.svg?width=32&height=32"
              alt="TIBOK Admin Logo"
              width={32}
              height={32}
              className="mr-2 rounded-sm"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">
              {t.adminCenterTitle || "Admin Center"}
            </h1>
          </Link>
          <span className="ml-3 text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center border border-green-500/50 rounded-full px-2 py-0.5">
            <ShieldAlert className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {t.systemOnline || "System Online"}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="text-gray-600 dark:text-gray-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-300">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  2
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <DropdownMenuLabel>{t.notifications || "Notifications"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-2 p-2">
                <Truck className="h-4 w-4 mt-1 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t.lateDelivery || "Late Delivery"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order #12345 is late</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start space-x-2 p-2">
                <Building className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t.newPharmacy || "New Pharmacy Approved"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Central Pharmacy approved</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 px-2 sm:px-3"
              >
                <UserCircle className="h-6 w-6" />
                <span className="hidden md:inline text-sm">{t.adminName || "Admin User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{t.adminUser || "Admin User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{t.adminEmail || "admin@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t.adminNav?.settings || "Settings"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer w-full">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  <span>{t.adminNav?.backToSite || "Back to Site"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-700/20 focus:text-red-700 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.adminNav?.logout || "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
