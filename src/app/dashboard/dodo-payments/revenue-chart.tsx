"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3, LineChart, Loader2 } from "lucide-react"

export function RevenueChart({ userId }: { userId: string }) {
  const [chartType, setChartType] = useState<"area" | "bar">("area")
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({
    totalMrr: 0,
    newMrr: 0,
    churnedMrr: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchChartData = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const revenueData = await response.json()
          setData(revenueData.monthlyData)
          setMetrics({
            totalMrr: revenueData.metrics.mrr,
            newMrr: revenueData.metrics.newMrr,
            churnedMrr: revenueData.metrics.churnedMrr
          })
        } else {
          console.error('Failed to fetch chart data:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

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
              chartType === "area" ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`p-2 rounded-lg transition-all ${
              chartType === "bar" ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-muted/40">
          <p className="text-sm text-muted-foreground mb-1">Total MRR</p>
          <p className="text-2xl font-heading font-bold text-emerald-500">${metrics.totalMrr.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/40">
          <p className="text-sm text-muted-foreground mb-1">New MRR</p>
          <p className="text-2xl font-heading font-bold text-blue-500">+${metrics.newMrr.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/40">
          <p className="text-sm text-muted-foreground mb-1">Churned MRR</p>
          <p className="text-2xl font-heading font-bold text-red-500">-${metrics.churnedMrr.toLocaleString()}</p>
        </div>
      </div>

      <div className="h-72">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
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
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}
                  formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()}`, 'MRR'] : [0, 'MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={2} fill="url(#mrrGradient)" />
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
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}
                  formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : '$0'}
                />
                <Bar dataKey="newMrr" name="New MRR" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churnMrr" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
