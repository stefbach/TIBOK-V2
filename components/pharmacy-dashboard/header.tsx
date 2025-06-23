"use client"

import Link from "next/link"
import { Bell, Home, Package, FileText, CreditCard, Truck, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/language-switcher"

export function PharmacyDashboardHeader() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 dark:bg-gray-950 dark:border-gray-800">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Home className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 text-lg font-semibold text-white md:text-base"
            >
              <Package className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">TIBOK</span>
            </Link>
            <Link
              href="/pharmacy-dashboard"
              className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Home className="h-5 w-5" />
              {t.navOverview}
            </Link>
            <Link
              href="/pharmacy-dashboard?view=prescriptions"
              className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <FileText className="h-5 w-5" />
              {t.navPrescriptions}
            </Link>
            <Link
              href="/pharmacy-dashboard?view=payments"
              className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <CreditCard className="h-5 w-5" />
              {t.navPayments}
            </Link>
            <Link
              href="/pharmacy-dashboard?view=orders"
              className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Truck className="h-5 w-5" />
              {t.navOrders}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder={t.secondOpinionSearch}
          className="w-full rounded-lg bg-gray-100 pl-8 md:w-[200px] lg:w-[336px] dark:bg-gray-800"
        />
      </div>
      <LanguageSwitcher />
      <Button variant="outline" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Pharmacie Central Plus</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t.doctorMyProfileTitle}</DropdownMenuItem>
          <DropdownMenuItem>{t.sopHelpTitle}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            {t.consultationEndCall}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
