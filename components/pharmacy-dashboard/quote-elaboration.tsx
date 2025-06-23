"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Prescription, Quote } from "@/lib/pharmacy-data"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import { ArrowLeft } from "lucide-react"

interface QuoteElaborationProps {
  prescription: Prescription
  onBack: () => void
  onSendQuote: (quote: Omit<Quote, "id" | "date">) => void
}

interface QuoteItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export function QuoteElaboration({ prescription, onBack, onSendQuote }: QuoteElaborationProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const initialItems: QuoteItem[] = prescription.medications.map((med) => ({
    name: `${med.name} (${med.dosage})`,
    quantity: med.quantity,
    unitPrice: 0,
    total: 0,
  }))

  const [items, setItems] = useState<QuoteItem[]>(initialItems)
  const [prepFees, setPrepFees] = useState(50)
  const [deliveryFees, setDeliveryFees] = useState(100)

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items]
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    newItems[index] = { ...newItems[index], [field]: numValue }
    if (field === "unitPrice" || field === "quantity") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    setItems(newItems)
  }

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0) + prepFees + deliveryFees

  const handleSubmit = () => {
    const newQuote: Omit<Quote, "id" | "date"> = {
      prescriptionId: prescription.id,
      patient: prescription.patient,
      items: items,
      prepFees,
      deliveryFees,
      grandTotal,
      status: "sent",
    }
    onSendQuote(newQuote)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {t.quoteCreationTitle}
          </h1>
        </div>
        <CardDescription>
          {t.prescriptionDetails} pour {prescription.patient.name} (ID: {prescription.id})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.medication}</TableHead>
              <TableHead className="w-[100px]">{t.quantity}</TableHead>
              <TableHead className="w-[120px]">{t.unitPrice} (MUR)</TableHead>
              <TableHead className="w-[120px] text-right">{t.total} (MUR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-right">{item.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div></div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>{t.preparationFees}</Label>
              <Input
                type="number"
                className="w-32"
                value={prepFees}
                onChange={(e) => setPrepFees(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t.deliveryFees}</Label>
              <Input
                type="number"
                className="w-32"
                value={deliveryFees}
                onChange={(e) => setDeliveryFees(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between font-semibold text-lg">
              <Label>{t.grandTotal}</Label>
              <span>{grandTotal.toFixed(2)} MUR</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit}>{t.sendQuoteToPatient}</Button>
      </CardFooter>
    </Card>
  )
}
