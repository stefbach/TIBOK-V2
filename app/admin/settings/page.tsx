"use client"

import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Paramètres</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Configurez les paramètres généraux de l'application d'administration.
      </p>
      {/* Le contenu de la page des paramètres sera ajouté ici */}
    </div>
  )
}
