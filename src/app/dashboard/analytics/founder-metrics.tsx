"use client"

import { Users, TrendingUp, DollarSign, Target } from "lucide-react"

interface FounderMetricsProps {
  metrics?: {
    totalUsers: number
    totalUsersChange: number
    totalConversions: number
    totalConversionsChange: number
    conversionRate: number
    conversionRateChange: number
    revenue: number
    revenueChange: number
  }
}

export function FounderMetrics({ metrics }: FounderMetricsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const metricsData = [
    {
      id: "users",
      label: "Total Users",
      value: metrics.totalUsers?.toLocaleString() || "0",
      change: metrics.totalUsersChange || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      id: "conversions",
      label: "Total Conversions",
      value: metrics.totalConversions?.toLocaleString() || "0",
      change: metrics.totalConversionsChange || 0,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "conversionRate",
      label: "Conversion Rate",
      value: metrics.conversionRate ? `${metrics.conversionRate.toFixed(2)}%` : "0.00%",
      change: metrics.conversionRateChange || 0,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      id: "revenue",
      label: "Revenue / MRR",
      value: metrics.revenue ? `$${metrics.revenue.toLocaleString()}` : "$0",
      change: metrics.revenueChange || 0,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change > 0

        return (
          <div
            key={metric.id}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:shadow-xl hover:shadow-black/5 hover:border-accent/30 transition-all duration-500 animate-fade-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="relative">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${metric.bgColor} ${metric.borderColor} border flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>

              {/* Value */}
              <div className="mb-2">
                <span className="text-3xl font-heading font-bold tracking-tight">{metric.value}</span>
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground font-medium mb-3">{metric.label}</p>

              {/* Change Indicator */}
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                isPositive ? "text-emerald-600" : "text-red-500"
              }`}>
                <span className={`w-0 h-0 border-l-4 border-l-transparent ${
                  isPositive ? "border-b-emerald-600" : "border-t-red-500"
                } border-r-4 border-r-transparent`}>
                </span>
                {Math.abs(metric.change).toFixed(2)}% vs previous period
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
