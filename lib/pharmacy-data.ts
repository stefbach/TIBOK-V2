export interface Patient {
  id: string
  name: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  quantity: number
}

export interface Prescription {
  id: string
  patient: Patient
  doctorName: string
  date: string
  medications: Medication[]
  status: "new" | "processing" | "quoted"
}

export interface Quote {
  id: string
  prescriptionId: string
  patient: Patient
  date: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  prepFees: number
  deliveryFees: number
  grandTotal: number
  status: "sent" | "paid" | "expired"
}

export interface Order {
  id: string
  quoteId: string
  patient: Patient
  transferDate: string
  trackingNumber: string
  status: "transferred"
}

const patients: Patient[] = [
  { id: "p001", name: "Jean Dupont" },
  { id: "p002", name: "Marie Curie" },
  { id: "p003", name: "Louis Pasteur" },
]

export const initialPrescriptions: Prescription[] = [
  {
    id: "PRES-001",
    patient: patients[0],
    doctorName: "Dr. Sarah Martin",
    date: new Date().toISOString(),
    medications: [
      { id: "med01", name: "Paracétamol 500mg", dosage: "2 comprimés, 3 fois/jour", quantity: 30 },
      { id: "med02", name: "Amoxicilline 250mg", dosage: "1 gélule, 2 fois/jour", quantity: 14 },
    ],
    status: "new",
  },
  {
    id: "PRES-002",
    patient: patients[1],
    doctorName: "Dr. Alain Bernard",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    medications: [{ id: "med03", name: "Sirop Toux 120ml", dosage: "5ml, 3 fois/jour", quantity: 1 }],
    status: "new",
  },
  {
    id: "PRES-003",
    patient: patients[2],
    doctorName: "Dr. Sarah Martin",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    medications: [{ id: "med04", name: "Ibuprofène 400mg", dosage: "1 comprimé si douleur", quantity: 20 }],
    status: "processing",
  },
]

export const initialQuotes: Quote[] = [
  {
    id: "QUO-001",
    prescriptionId: "PRES-004",
    patient: { id: "p004", name: "Sophie Marceau" },
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: "Amlodipine 5mg", quantity: 30, unitPrice: 10, total: 300 }],
    prepFees: 50,
    deliveryFees: 100,
    grandTotal: 450,
    status: "sent",
  },
  {
    id: "QUO-002",
    prescriptionId: "PRES-005",
    patient: { id: "p005", name: "Vincent Cassel" },
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: "Metformine 850mg", quantity: 60, unitPrice: 8, total: 480 }],
    prepFees: 50,
    deliveryFees: 0,
    grandTotal: 530,
    status: "paid",
  },
]

export const initialOrders: Order[] = [
  {
    id: "ORD-001",
    quoteId: "QUO-003",
    patient: { id: "p006", name: "Juliette Binoche" },
    transferDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: "TIBOK-LIV-XYZ789",
    status: "transferred",
  },
]
