"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  description?: string
  className?: string
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  description,
  className,
}: KpiCardProps) {
  const trendColor =
    trendDirection === "up"
      ? "text-green-500"
      : trendDirection === "down"
        ? "text-red-500"
        : "text-gray-500 dark:text-gray-400"

  return (
    <Card className={cn("hover:shadow-lg transition-shadow duration-300 dark:hover:shadow-blue-500/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
        <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
        {trend && <p className={cn("text-xs mt-1", trendColor)}>{trend}</p>}
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
