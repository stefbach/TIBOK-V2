"use client"

import { Activity } from "lucide-react"

export default function AdminMonitoringPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Monitoring Système</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Surveillez les performances et l'état du système en temps réel.
      </p>
      {/* Le contenu de la page de monitoring sera ajouté ici */}
    </div>
  )
}
