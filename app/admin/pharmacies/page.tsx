"use client"

import { Building } from "lucide-react"

export default function AdminPharmaciesPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-semibold">Gestion des Pharmacies</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Gérez les pharmacies partenaires, leurs informations, et leurs statuts.
      </p>
      {/* Le contenu de la page de gestion des pharmacies sera ajouté ici */}
    </div>
  )
}
