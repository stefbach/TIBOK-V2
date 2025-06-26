"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Video, FileText, Users, MessageSquare, UserCircle, BarChart2, Badge } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/doctor/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/doctor/dashboard/video-consultation", label: "Consultation Vidéo", icon: Video },
  { href: "/doctor/dashboard/ai-prescriptions", label: "Ordonnances IA", icon: FileText },
  { href: "/doctor/dashboard/patients", label: "Dossiers Patients", icon: Users },
  { href: "/doctor/dashboard/chat", label: "Chat Patients", icon: MessageSquare, badge: 3 },
  { href: "/doctor/dashboard/profile", label: "Mon Profil", icon: UserCircle },
  { href: "/doctor/dashboard/ai-reports", label: "Comptes-rendus IA", icon: FileText },
  { href: "/doctor/dashboard/performance", label: "Performance", icon: BarChart2 },
]

export default function DoctorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">TIBOK</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Interface Médecin</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              pathname === item.href ? "bg-blue-100 dark:bg-blue-900 text-blue-600 font-semibold" : "",
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="destructive" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
