"use client"

export default function AIPrescriptionsPage({ initialPrescription }) {
  // Tu fais seulement de l’UI et de l’interactivité ici.
  // PAS de fetch serveur, PAS d’await.
  // Utilise les données reçues via props : initialPrescription
  return (
    <div>
      <h1>Ordonnances IA</h1>
      <ul>
        {initialPrescription.map((med, idx) => (
          <li key={idx}>
            {med.name} - {med.dosage} - {med.frequency} - {med.duration}
          </li>
        ))}
      </ul>
    </div>
  )
}
