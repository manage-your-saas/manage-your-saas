"use client"

import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Users } from "lucide-react"

interface RevenueMetricsProps {
  mrr?: number;
  arr?: number;
  growth?: number;
  activeSubscriptions?: number;
  arpu?: number;
}

const colorMap: Record<string, { gradient: string; bg: string; shadow: string }> = {
  violet: {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    shadow: "shadow-violet-500/30",
  },
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
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    shadow: "shadow-amber-500/30",
  },
}

export function RevenueMetrics({ mrr = 0, arr = 0, growth = 0, activeSubscriptions = 0, arpu = 0 }: RevenueMetricsProps) {
  
  const metrics = [
    {
      label: "Monthly Recurring Revenue",
      shortLabel: "MRR",
      value: `$${(mrr / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
      trend: growth >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "violet",
      description: "vs last month",
    },
    {
      label: "Annual Recurring Revenue",
      shortLabel: "ARR",
      value: `$${(arr / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
      trend: growth >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "emerald",
      description: "projected",
    },
    {
      label: "Active Subscriptions",
      shortLabel: "Subs",
      value: activeSubscriptions.toLocaleString(),
      change: "", // This needs to be calculated on the page level
      trend: "up", // This needs to be calculated on the page level
      icon: RefreshCw,
      color: "blue",
      description: "paying customers",
    },
    {
      label: "Average Revenue Per User",
      shortLabel: "ARPU",
      value: `$${arpu.toFixed(2)}`,
      change: "", // This needs to be calculated on the page level
      trend: "up", // This needs to be calculated on the page level
      icon: Users,
      color: "amber",
      description: "per month",
    },
  ]

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const colors = colorMap[metric.color]
        const isGood = metric.trend === "up"

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
                {metric.change && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      isGood ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {isGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs font-semibold">{metric.change}</span>
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="mb-1">
                <p className="text-2xl font-heading font-bold tracking-tight">{metric.value}</p>
              </div>
              <p className="text-sm font-medium text-foreground">{metric.shortLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
