"use client"

import { FileText } from "lucide-react"

export default function AdminLogsPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Logs Système</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Consultez les logs du système pour le débogage et le suivi.</p>
      {/* Le contenu de la page des logs système sera ajouté ici */}
    </div>
  )
}
