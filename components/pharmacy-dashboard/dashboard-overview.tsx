"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Prescription, Quote, Order } from "@/lib/pharmacy-data"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface DashboardOverviewProps {
  prescriptions: Prescription[]
  quotes: Quote[]
  orders: Order[]
}

export function DashboardOverview({ prescriptions, quotes }: DashboardOverviewProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const newPrescriptionsCount = prescriptions.filter((p) => p.status === "new").length
  const pendingQuotesCount = quotes.filter((q) => q.status === "sent").length
  const revenueToday = quotes
    .filter((q) => q.status === "paid" && new Date(q.date).toDateString() === new Date().toDateString())
    .reduce((sum, q) => sum + q.grandTotal, 0)

  const recentActivity = [...prescriptions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.prescriptionsToday}</CardDescription>
            <CardTitle className="text-4xl">{newPrescriptionsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 dark:text-gray-400">+10% {t.doctorPerformanceVsLastMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.quotesPending}</CardDescription>
            <CardTitle className="text-4xl">{pendingQuotesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 dark:text-gray-400">+5 {t.doctorPerformanceVsLastMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.revenueToday}</CardDescription>
            <CardTitle className="text-4xl">{revenueToday.toFixed(2)} MUR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 dark:text-gray-400">+20.1% {t.doctorPerformanceVsLastMonth}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.recentActivity}</CardTitle>
          <CardDescription>{t.prescriptionsListTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.patient}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.patient.name}</div>
                    <div className="hidden text-sm text-gray-500 md:inline dark:text-gray-400">{p.doctorName}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">{new Date(p.date).toLocaleDateString(language)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
