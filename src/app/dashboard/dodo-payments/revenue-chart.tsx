"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { BarChart3, LineChart, Loader2 } from "lucide-react"

export function RevenueChart({ userId, dateFilter }: { userId: string; dateFilter: string }) {
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
      setLoading(true); // Show loader when date filter changes
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}&dateFilter=${encodeURIComponent(dateFilter)}`)
        if (response.ok) {
          const revenueData = await response.json()
          setData(revenueData.monthlyData)
          setMetrics({
            totalMrr: revenueData.metrics.mrr || 0,
            newMrr: revenueData.metrics.newMrr || 0,
            churnedMrr: revenueData.metrics.churnedMrr || 0
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
  }, [userId, dateFilter])

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
        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Total MRR (USD)</p>
          <p className="text-2xl font-heading font-bold text-emerald-500">${(metrics.totalMrr || 0).toLocaleString()} USD</p>
        </div>
        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground mb-1">New MRR (USD)</p>
          <p className="text-2xl font-heading font-bold text-blue-500">+${(metrics.newMrr || 0).toLocaleString()} USD</p>
        </div>
        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Churned MRR (USD)</p>
          <p className="text-2xl font-heading font-bold text-red-500">-${(metrics.churnedMrr || 0).toLocaleString()} USD</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  dy={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => {
                    if (value === 0) return '$0';
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}
                  formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()} USD`, '📈 MRR'] : ['$0 USD', '📈 MRR']}
                  labelFormatter={(label: string) => `📅 ${label}`}
                />
                <Area type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={2} fill="url(#mrrGradient)" />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barGap={4} barCategoryGap="10%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  dy={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => {
                    if (value === 0) return '$0';
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}
                  formatter={(value: any, name?: string) => {
                    if (typeof value === 'number') {
                      const formattedValue = value.toLocaleString();
                      if (name === 'New MRR') {
                        return [`$${formattedValue} USD`, '📈 New MRR'];
                      } else if (name === 'Churned MRR') {
                        return [`$${formattedValue} USD`, '📉 Churned MRR'];
                      }
                      return [`$${formattedValue} USD`, name || ''];
                    }
                    return ['$0 USD', name || ''];
                  }}
                  labelFormatter={(label: string) => `📅 ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                  formatter={(value: string) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
                />
                <Bar 
                  dataKey="newMrr" 
                  name="New MRR" 
                  fill="url(#newMrrGradient)" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                  animationBegin={100}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="churnMrr" 
                  name="Churned MRR" 
                  fill="url(#churnMrrGradient)" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                  animationBegin={200}
                  maxBarSize={60}
                />
                <defs>
                  <linearGradient id="newMrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="churnMrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
