import type { ReactNode } from "react"
import { PharmacyDashboardSidebar } from "@/components/pharmacy-dashboard/sidebar"
import { PharmacyDashboardHeader } from "@/components/pharmacy-dashboard/header"
import { Toaster } from "@/components/ui/toaster"

export default function PharmacyDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
      <PharmacyDashboardSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
        <PharmacyDashboardHeader />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
        <Toaster />
      </div>
    </div>
  )
}
