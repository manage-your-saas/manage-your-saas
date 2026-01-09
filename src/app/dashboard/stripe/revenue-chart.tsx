"use client"

import { useState } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3, LineChart } from "lucide-react"

const data = [
  { month: "Jul", mrr: 8200, newMrr: 1200, churnMrr: 300 },
  { month: "Aug", mrr: 9100, newMrr: 1400, churnMrr: 500 },
  { month: "Sep", mrr: 9800, newMrr: 1100, churnMrr: 400 },
  { month: "Oct", mrr: 10500, newMrr: 1300, churnMrr: 600 },
  { month: "Nov", mrr: 11400, newMrr: 1500, churnMrr: 600 },
  { month: "Dec", mrr: 12847, newMrr: 1800, churnMrr: 350 },
]

export function RevenueChart() {
  const [chartType, setChartType] = useState<"area" | "bar">("area")

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Revenue Growth</h3>
          <p className="text-sm text-muted-foreground mt-1">MRR progression over time</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType("area")}
            className={`p-2 rounded-lg transition-all ${
              chartType === "area" ? "bg-violet-500/10 text-violet-600" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`p-2 rounded-lg transition-all ${
              chartType === "bar" ? "bg-violet-500/10 text-violet-600" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
          <p className="text-xs text-muted-foreground mb-1">Total MRR</p>
          <p className="text-lg font-heading font-bold text-violet-600">$12,847</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-xs text-muted-foreground mb-1">New MRR</p>
          <p className="text-lg font-heading font-bold text-emerald-600">+$1,800</p>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <p className="text-xs text-muted-foreground mb-1">Churned MRR</p>
          <p className="text-lg font-heading font-bold text-red-500">-$350</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dx={-10}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
                        <p className="text-sm font-semibold mb-2">{label}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">MRR: </span>
                          <span className="font-semibold">${payload[0].value?.toLocaleString()}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="mrr" stroke="#8B5CF6" strokeWidth={2} fill="url(#mrrGradient)" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dx={-10}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
                        <p className="text-sm font-semibold mb-2">{label}</p>
                        {payload.map((entry: any) => (
                          <p key={entry.dataKey} className="text-sm">
                            <span className="text-muted-foreground">{entry.name}: </span>
                            <span className="font-semibold">${entry.value?.toLocaleString()}</span>
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="newMrr" name="New MRR" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churnMrr" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
