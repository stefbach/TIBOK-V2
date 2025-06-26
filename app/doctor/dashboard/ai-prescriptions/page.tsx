import AIPrescriptionsPage from "./AIPrescriptionsPage"

async function getAiPrescriptions() {
  // Ici tu fais ton fetch serveur (DB, API, etc)
  return [
    { name: "Doliprane", dosage: "500mg", frequency: "2/day", duration: "5 days" }
  ]
}

export default async function Page() {
  const prescriptions = await getAiPrescriptions()
  return <AIPrescriptionsPage initialPrescription={prescriptions} />
}
