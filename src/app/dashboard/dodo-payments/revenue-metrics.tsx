"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Users, Loader2 } from "lucide-react"

type Metric = {
  label: string
  shortLabel: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  color: string
  description: string
}

export function RevenueMetrics({ userId }: { userId: string }) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          const metrics = data.metrics
          const prevMetrics = data.previousMetrics

          const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? "+100%" : "+0%"
            const percentage = ((current - previous) / previous) * 100
            return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
          }

          const newMetrics = [
            {
              label: "Total Revenue",
              shortLabel: "Revenue",
              value: `$${metrics.totalRevenue.toLocaleString()}`,
              change: calculateChange(metrics.totalRevenue, prevMetrics.totalRevenue),
              trend: "up" as const,
              icon: DollarSign,
              color: "emerald",
              description: "All time",
            },
            {
              label: "Net Revenue",
              shortLabel: "Net",
              value: `$${metrics.netRevenue.toLocaleString()}`,
              change: calculateChange(metrics.netRevenue, prevMetrics.netRevenue),
              trend: "up" as const,
              icon: TrendingUp,
              color: "blue",
              description: "After refunds",
            },
            {
              label: "Total Subscriptions",
              shortLabel: "Subs",
              value: metrics.totalSubscriptions.toLocaleString(),
              change: calculateChange(metrics.totalSubscriptions, prevMetrics.totalSubscriptions),
              trend: "up" as const,
              icon: RefreshCw,
              color: "violet",
              description: "All time",
            },
            {
              label: "Total Customers",
              shortLabel: "Customers",
              value: metrics.totalCustomers.toLocaleString(),
              change: calculateChange(metrics.totalCustomers, prevMetrics.totalCustomers),
              trend: "up" as const,
              icon: Users,
              color: "amber",
              description: "All time",
            },
          ]
          setMetrics(newMetrics)
        } else {
          console.error('Failed to fetch revenue metrics:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch revenue metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
              <div className="w-16 h-6 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-12 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const colorMap: Record<string, { gradient: string; bg: string; shadow: string }> = {
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      shadow: "shadow-emerald-500/30",
    },
    blue: {
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      shadow: "shadow-blue-500/30",
    },
    violet: {
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-500/10",
      shadow: "shadow-violet-500/30",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-500/10",
      shadow: "shadow-amber-500/30",
    },
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      {metrics.length === 0 ? (
        // Fallback when no data is loaded yet
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      ) : (
        metrics.map((metric, index) => {
          const Icon = metric.icon
          const colors = colorMap[metric.color]
          const isGood = !metric.change.startsWith('-')

          return (
            <div
              key={metric.label}
              className="group relative bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-black/5 hover:border-border/80 transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background gradient accent */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors.gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.shadow}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${isGood ? "text-emerald-500" : "text-red-500"}`}>
                    {isGood ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{metric.change}</span>
                  </div>
                </div>

                {/* Value */}
                <div className="mt-4">
                  <p className="text-3xl font-heading font-bold tracking-tight">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
