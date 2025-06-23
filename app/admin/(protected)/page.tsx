import DashboardSection from "@/components/admin/sections/dashboard-section"
import { Suspense } from "react"

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement du tableau de bord…</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardSection />
    </Suspense>
  )
}
