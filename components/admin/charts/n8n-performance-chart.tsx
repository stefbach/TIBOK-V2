"use client"

import { useContext } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { LanguageContext, translations } from "@/contexts/language-context"
import { useTheme } from "next-themes"

const data = [
  { name: "Jan", workflows: 400, deliveries: 240 },
  { name: "Feb", workflows: 300, deliveries: 139 },
  { name: "Mar", workflows: 200, deliveries: 980 },
  { name: "Apr", workflows: 278, deliveries: 390 },
  { name: "May", workflows: 189, deliveries: 480 },
  { name: "Jun", workflows: 239, deliveries: 380 },
]

export default function N8nPerformanceChart() {
  const { language } = useContext(LanguageContext)
  const { theme } = useTheme()
  const t = translations[language].adminDashboard

  const tickColor = theme === "dark" ? "#9ca3af" : "#6b7280" // gray-400 dark / gray-500 light
  const gridColor = theme === "dark" ? "#374151" : "#e5e7eb" // gray-700 dark / gray-200 light

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
        <YAxis tick={{ fill: tickColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", // gray-800 dark / white light
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb", // gray-700 dark / gray-200 light
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }} // gray-100 dark / gray-900 light
        />
        <Legend wrapperStyle={{ fontSize: "14px" }} />
        <Bar dataKey="workflows" name={t.chartActiveWorkflows} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="deliveries" name={t.chartDeliveriesPerHour} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
