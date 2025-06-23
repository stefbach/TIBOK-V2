"use client"

import { Users } from "lucide-react"

export default function AdminClientInterfacesPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Interfaces Clients</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Gérez et configurez les différentes interfaces clients.</p>
      {/* Le contenu de la page des interfaces clients sera ajouté ici */}
    </div>
  )
}
