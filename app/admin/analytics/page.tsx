"use client"

import { BarChartBig } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <BarChartBig className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Analytics</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Visualisez les données et les statistiques clés de la plateforme.
      </p>
      {/* Le contenu de la page d'analytics sera ajouté ici */}
    </div>
  )
}
