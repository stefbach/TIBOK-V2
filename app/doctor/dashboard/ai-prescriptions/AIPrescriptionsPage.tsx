"use client"

export default function AIPrescriptionsPage({ initialPrescription }) {
  return (
    <div>
      <pre>{JSON.stringify(initialPrescription)}</pre>
    </div>
  )
}
