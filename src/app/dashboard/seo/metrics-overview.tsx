"use client"

import { MousePointerClick, Eye, Percent, TrendingUp, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"

const metrics = [
  {
    id: "clicks",
    label: "Total Clicks",
    value: "7",
    change: 0,
    changeLabel: "vs previous",
    icon: MousePointerClick,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "impressions",
    label: "Total Impressions",
    value: "92",
    change: 0,
    changeLabel: "vs previous",
    icon: Eye,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: "ctr",
    label: "Average CTR",
    value: "7.61%",
    change: 0,
    changeLabel: "vs previous",
    icon: Percent,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    id: "position",
    label: "Average Position",
    value: "4.8",
    change: 0,
    changeLabel: "vs previous",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
]

export function MetricsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change >= 0

        return (
          <div
            key={metric.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color} opacity-80`} />

            {/* Background glow on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wide font-medium">{metric.label}</p>

              {/* Value */}
              <p className="text-4xl font-heading font-bold tracking-tight mb-3">{metric.value}</p>

              {/* Change indicator */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-medium ${
                    metric.change === 0
                      ? "bg-muted text-muted-foreground"
                      : isPositive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {metric.change === 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  ) : isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{metric.change}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
