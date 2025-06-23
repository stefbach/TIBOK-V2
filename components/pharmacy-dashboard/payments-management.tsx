"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Quote } from "@/lib/pharmacy-data"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface PaymentsManagementProps {
  quotes: Quote[]
  onValidateAndTransfer: (quoteId: string) => void
}

export function PaymentsManagement({ quotes, onValidateAndTransfer }: PaymentsManagementProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const getStatusBadge = (status: Quote["status"]) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">{t.statusSent}</Badge>
      case "paid":
        return <Badge className="bg-green-600 hover:bg-green-700">{t.statusPaid}</Badge>
      case "expired":
        return <Badge variant="destructive">{t.statusExpired}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.navPayments}</CardTitle>
        <CardDescription>{t.paymentsListTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.quoteNumber}</TableHead>
              <TableHead>{t.patient}</TableHead>
              <TableHead>{t.amount}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.id}</TableCell>
                <TableCell>{q.patient.name}</TableCell>
                <TableCell>{q.grandTotal.toFixed(2)} MUR</TableCell>
                <TableCell>{getStatusBadge(q.status)}</TableCell>
                <TableCell>{new Date(q.date).toLocaleString(language)}</TableCell>
                <TableCell className="text-right">
                  {q.status === "paid" && (
                    <Button size="sm" onClick={() => onValidateAndTransfer(q.id)}>
                      {t.actionValidateAndTransfer}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
