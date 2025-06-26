// PAS de "use client" ici !

import AIPrescriptionsPage from "./AIPrescriptionsPage"

// Exemple de fonction serveur pour récupérer les données (simulé ici)
async function getAiPrescriptions() {
  // Ici tu peux faire du fetch vers ton API, DB, etc.
  // Exemple fictif :
  return [
    { name: "Doliprane", dosage: "500mg", frequency: "2/day", duration: "5 days" }
  ]
}

export default async function Page() {
  // Ici tu récupères tes données côté serveur !
  const prescriptions = await getAiPrescriptions()
  // Passe les prescriptions en props à ton composant client
  return <AIPrescriptionsPage initialPrescription={prescriptions} />
}
