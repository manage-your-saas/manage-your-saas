"use client"

import { MousePointerClick, Eye, Percent, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

const metrics = [
  {
    id: "clicks",
    label: "Total Clicks",
    value: 7,
    change: 12.5,
    sparkline: [3, 5, 4, 7, 6, 8, 7],
    icon: MousePointerClick,
    gradient: "from-blue-500 to-cyan-400",
    bgGradient: "from-blue-500/10 to-cyan-400/10",
  },
  {
    id: "impressions",
    label: "Impressions",
    value: 92,
    change: 8.3,
    sparkline: [40, 55, 48, 72, 68, 85, 92],
    icon: Eye,
    gradient: "from-emerald-500 to-teal-400",
    bgGradient: "from-emerald-500/10 to-teal-400/10",
  },
  {
    id: "ctr",
    label: "Avg. CTR",
    value: 7.61,
    suffix: "%",
    change: -2.1,
    sparkline: [8.2, 7.8, 8.5, 7.2, 7.9, 7.4, 7.61],
    icon: Percent,
    gradient: "from-amber-500 to-orange-400",
    bgGradient: "from-amber-500/10 to-orange-400/10",
  },
  {
    id: "position",
    label: "Avg. Position",
    value: 4.8,
    change: 15.2,
    sparkline: [6.2, 5.8, 5.4, 5.1, 4.9, 4.8, 4.8],
    icon: TrendingUp,
    gradient: "from-rose-500 to-pink-400",
    bgGradient: "from-rose-500/10 to-pink-400/10",
    invertChange: true,
  },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((val - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
    </svg>
  )
}

export function MetricsBento() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.invertChange ? metric.change > 0 : metric.change > 0
        const displayPositive = metric.invertChange ? metric.change > 0 : metric.change > 0

        return (
          <div
            key={metric.id}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 hover:shadow-xl hover:shadow-black/5 hover:border-accent/30 transition-all duration-500 animate-fade-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <div className="relative">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                    displayPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {displayPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>

              {/* Value */}
              <div className="mb-1">
                <span className="text-3xl font-heading font-bold tracking-tight">{metric.value}</span>
                {metric.suffix && (
                  <span className="text-xl font-heading font-bold text-muted-foreground">{metric.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground font-medium mb-4">{metric.label}</p>

              {/* Sparkline */}
              <div className="h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkline data={metric.sparkline} color={`url(#gradient-${metric.id})`} />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id={`gradient-${metric.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop
                        offset="0%"
                        stopColor={
                          metric.id === "clicks"
                            ? "#3b82f6"
                            : metric.id === "impressions"
                              ? "#10b981"
                              : metric.id === "ctr"
                                ? "#f59e0b"
                                : "#f43f5e"
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          metric.id === "clicks"
                            ? "#22d3ee"
                            : metric.id === "impressions"
                              ? "#2dd4bf"
                              : metric.id === "ctr"
                                ? "#fb923c"
                                : "#ec4899"
                        }
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
