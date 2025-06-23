"use client"

import { Truck } from "lucide-react"

export default function AdminDeliveriesPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Truck className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Suivi des Livraisons n8n</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Suivez l'état des livraisons gérées par les workflows n8n.</p>
      {/* Le contenu de la page de suivi des livraisons sera ajouté ici */}
    </div>
  )
}
