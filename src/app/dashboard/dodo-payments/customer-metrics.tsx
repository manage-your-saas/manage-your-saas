"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, UserMinus, Target, ArrowUpRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react"

type CustomerStat = {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  color: string
}

export function CustomerMetrics({ userId, dateFilter }: { userId: string; dateFilter: string }) {
  const [customerStats, setCustomerStats] = useState<CustomerStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!userId) return;

    const fetchCustomerMetrics = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}&dateFilter=${encodeURIComponent(dateFilter)}`)
        if (response.ok) {
          const data = await response.json()
          const metrics = data.metrics
          const prevMetrics = data.previousMetrics

          const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? "+100%" : "+0%"
            const percentage = ((current - previous) / previous) * 100
            return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
          }

          const newStats = [
            {
              label: "Total Customers",
              value: metrics.totalCustomers?.toString() || "0",
              change: calculateChange(metrics.totalCustomers || 0, prevMetrics.totalCustomers || 0),
              trend: ((metrics.totalCustomers || 0) >= (prevMetrics.totalCustomers || 0) ? "up" : "down") as "up" | "down",
              icon: Users,
              color: "emerald"
            },
            {
              label: "New This Month",
              value: metrics.newThisMonth?.toString() || "0",
              change: calculateChange(metrics.newThisMonth || 0, prevMetrics.newThisMonth || 0),
              trend: ((metrics.newThisMonth || 0) >= (prevMetrics.newThisMonth || 0) ? "up" : "down") as "up" | "down",
              icon: UserPlus,
              color: "blue"
            },
            {
              label: "Churned",
              value: metrics.churned?.toString() || "0",
              change: calculateChange(metrics.churned || 0, prevMetrics.churned || 0),
              trend: ((metrics.churned || 0) <= (prevMetrics.churned || 0) ? "up" : "down") as "up" | "down",
              icon: UserMinus,
              color: "red"
            },
            {
              label: "Net New",
              value: `+${metrics.netNew?.toString() || "0"}`,
              change: calculateChange(metrics.netNew || 0, prevMetrics.netNew || 0),
              trend: ((metrics.netNew || 0) >= (prevMetrics.netNew || 0) ? "up" : "down") as "up" | "down",
              icon: Target,
              color: "violet"
            },
          ]
          setCustomerStats(newStats)
        } else {
          console.error('Failed to fetch customer metrics:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch customer metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerMetrics()
  }, [userId, dateFilter])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/30">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse mb-3" />
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded w-12 animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const colorMap: Record<string, { gradient: string; text: string; shadow: string }> = {
    emerald: { gradient: "from-emerald-500 to-teal-500", text: "text-emerald-500", shadow: "shadow-emerald-500/20" },
    blue: { gradient: "from-blue-500 to-cyan-500", text: "text-blue-500", shadow: "shadow-blue-500/20" },
    red: { gradient: "from-red-500 to-rose-500", text: "text-red-500", shadow: "shadow-red-500/20" },
    violet: { gradient: "from-violet-500 to-purple-500", text: "text-violet-500", shadow: "shadow-violet-500/20" },
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Customer Metrics</h3>
          <p className="text-sm text-muted-foreground mt-1">Customer acquisition and retention</p>
        </div>
        <button className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
          View all customers <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {customerStats.map((stat) => {
          const Icon = stat.icon
          const colors = colorMap[stat.color]
          const isGood = stat.color !== "red" ? !stat.change.startsWith('-') : stat.change.startsWith('-')

          return (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.shadow}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${isGood ? "text-emerald-500" : "text-red-500"}`}>
                  {isGood ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-heading font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
