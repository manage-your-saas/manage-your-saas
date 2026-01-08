"use client"

import { useState } from "react"
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from "recharts"

const combinedData = [
  { date: "Nov 23", revenue: 9200, visitors: 5800, clicks: 820 },
  { date: "Nov 30", revenue: 9800, visitors: 6200, clicks: 910 },
  { date: "Dec 07", revenue: 10500, visitors: 6800, clicks: 980 },
  { date: "Dec 14", revenue: 11200, visitors: 7400, clicks: 1100 },
  { date: "Dec 21", revenue: 12450, visitors: 8432, clicks: 1247 },
]

const funnelData = [
  { stage: "Impressions", value: 45200, fill: "#f59e0b" },
  { stage: "Clicks", value: 1247, fill: "#f97316" },
  { stage: "Visitors", value: 8432, fill: "#8b5cf6" },
  { stage: "Signups", value: 342, fill: "#3b82f6" },
  { stage: "Customers", value: 284, fill: "#10b981" },
]

export function OverviewCharts() {
  const [activeChart, setActiveChart] = useState<"combined" | "funnel">("combined")

  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Performance Trends</h2>
          <p className="text-sm text-muted-foreground">Revenue, traffic, and search performance combined</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/50">
          <button
            onClick={() => setActiveChart("combined")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === "combined"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveChart("funnel")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === "funnel"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Funnel
          </button>
        </div>
      </div>

      {/* Legend */}
      {activeChart === "combined" && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-sm text-muted-foreground">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">Search Clicks</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === "combined" ? (
            <ComposedChart data={combinedData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="url(#revenueGrad)"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="visitors"
                fill="url(#visitorsGrad)"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Visitors"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="clicks"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                name="Search Clicks"
              />
            </ComposedChart>
          ) : (
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Count"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-emerald-500">2.76%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-violet-500">$1.48</p>
          <p className="text-xs text-muted-foreground">Cost per Visitor</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-amber-500">$9.98</p>
          <p className="text-xs text-muted-foreground">Cost per Click</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-blue-500">$43.84</p>
          <p className="text-xs text-muted-foreground">ARPU</p>
        </div>
      </div>
    </div>
  )
}
