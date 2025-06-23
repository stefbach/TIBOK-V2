"use client"

import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Package, FileText, CreditCard, Truck, LifeBuoy } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export function PharmacyDashboardSidebar() {
  const { language } = useLanguage()
  const t = translations[language]

  const navItems = [
    { href: "/pharmacy-dashboard", icon: Home, label: t.navOverview },
    { href: "/pharmacy-dashboard?view=prescriptions", icon: FileText, label: t.navPrescriptions },
    { href: "/pharmacy-dashboard?view=payments", icon: CreditCard, label: t.navPayments },
    { href: "/pharmacy-dashboard?view=orders", icon: Truck, label: t.navOrders },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-white sm:flex dark:bg-gray-950 dark:border-gray-800">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 text-lg font-semibold text-white md:h-8 md:w-8 md:text-base"
          >
            <Package className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">TIBOK</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-950 md:h-8 md:w-8 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-950 md:h-8 md:w-8 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <LifeBuoy className="h-5 w-5" />
                <span className="sr-only">{t.sopHelpTitle}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t.sopHelpTitle}</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
