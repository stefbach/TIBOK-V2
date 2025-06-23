"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Prescription } from "@/lib/pharmacy-data"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface PrescriptionsReceptionProps {
  prescriptions: Prescription[]
  onProcess: (prescription: Prescription) => void
}

export function PrescriptionsReception({ prescriptions, onProcess }: PrescriptionsReceptionProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const getStatusBadge = (status: Prescription["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">{t.statusNew}</Badge>
      case "processing":
        return <Badge variant="secondary">{t.statusInProgress}</Badge>
      case "quoted":
        return <Badge variant="default">{t.statusValidated}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.navPrescriptions}</CardTitle>
        <CardDescription>{t.prescriptionsListTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t.patient}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{p.patient.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{p.doctorName}</div>
                </TableCell>
                <TableCell>{getStatusBadge(p.status)}</TableCell>
                <TableCell>{new Date(p.date).toLocaleString(language)}</TableCell>
                <TableCell className="text-right">
                  {p.status === "new" && (
                    <Button size="sm" onClick={() => onProcess(p)}>
                      {t.actionProcess}
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
