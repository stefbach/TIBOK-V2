"use client"

import { Workflow } from "lucide-react"

export default function AdminWorkflowsPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Workflow className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Workflows n8n</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Gérez et configurez les workflows d'automatisation n8n.</p>
      {/* Le contenu de la page des workflows n8n sera ajouté ici */}
    </div>
  )
}
