"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

const chartData = [
  { date: "Nov 30", clicks: 3, impressions: 40 },
  { date: "Dec 01", clicks: 2, impressions: 35 },
  { date: "Dec 02", clicks: 4, impressions: 50 },
  { date: "Dec 03", clicks: 3, impressions: 45 },
  { date: "Dec 04", clicks: 5, impressions: 60 },
  { date: "Dec 05", clicks: 4, impressions: 55 },
  { date: "Dec 06", clicks: 6, impressions: 70 },
  { date: "Dec 07", clicks: 8, impressions: 90 },
  { date: "Dec 08", clicks: 5, impressions: 65 },
  { date: "Dec 09", clicks: 5, impressions: 60 },
  { date: "Dec 10", clicks: 4, impressions: 55 },
  { date: "Dec 11", clicks: 3, impressions: 40 },
  { date: "Dec 12", clicks: 4, impressions: 50 },
  { date: "Dec 13", clicks: 6, impressions: 75 },
  { date: "Dec 14", clicks: 9, impressions: 100 },
  { date: "Dec 15", clicks: 8, impressions: 95 },
  { date: "Dec 16", clicks: 7, impressions: 80 },
  { date: "Dec 17", clicks: 9, impressions: 100 },
  { date: "Dec 18", clicks: 8, impressions: 90 },
  { date: "Dec 19", clicks: 7, impressions: 85 },
]

export function PerformanceChart() {
  const [showClicks, setShowClicks] = useState(true)
  const [showImpressions, setShowImpressions] = useState(true)

  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-heading font-semibold">Performance Trends</h2>
          </div>
          <p className="text-sm text-muted-foreground">Clicks and impressions over the selected period</p>
        </div>

        {/* Legend Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowClicks(!showClicks)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showClicks ? "border-blue-500/30 bg-blue-500/10" : "border-border bg-transparent opacity-50"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
            <span className="text-sm font-medium">Clicks</span>
          </button>
          <button
            onClick={() => setShowImpressions(!showImpressions)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showImpressions ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-transparent opacity-50"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <span className="text-sm font-medium">Impressions</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickMargin={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickMargin={8}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-xl shadow-xl p-4">
                      <p className="text-sm font-semibold mb-2">{label}</p>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground capitalize">{entry.name}:</span>
                          <span className="font-semibold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            {showImpressions && (
              <Area
                type="monotone"
                dataKey="impressions"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#impressionsGradient)"
                animationDuration={1500}
              />
            )}
            {showClicks && (
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#clicksGradient)"
                animationDuration={1500}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
