"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/pharmacy-data"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface OrdersTrackingProps {
  orders: Order[]
}

export function OrdersTracking({ orders }: OrdersTrackingProps) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.navOrders}</CardTitle>
        <CardDescription>{t.ordersListTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.orderNumber}</TableHead>
              <TableHead>{t.patient}</TableHead>
              <TableHead>{t.transferDate}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">{t.trackingNumber}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>{o.patient.name}</TableCell>
                <TableCell>{new Date(o.transferDate).toLocaleString(language)}</TableCell>
                <TableCell>
                  <Badge variant="default">{t.statusTransferredToLogistics}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{o.trackingNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
