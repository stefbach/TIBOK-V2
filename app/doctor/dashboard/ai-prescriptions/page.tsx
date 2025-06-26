import AIPrescriptionsPage from "./AIPrescriptionsPage"

export default async function Page() {
  return <AIPrescriptionsPage initialPrescription={[{ name: "Test", dosage: "X", frequency: "Y", duration: "Z" }]} />
}
