"use client"

import { Users, Eye, Clock, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react"

const metrics = [
  {
    label: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "blue",
    sparkline: [30, 45, 32, 50, 40, 60, 55, 70, 65, 80, 75, 90],
  },
  {
    label: "Page Views",
    value: "48,392",
    change: "+8.2%",
    trend: "up",
    icon: Eye,
    color: "emerald",
    sparkline: [40, 35, 50, 45, 60, 55, 70, 65, 75, 80, 85, 95],
  },
  {
    label: "Avg. Session",
    value: "3m 24s",
    change: "+15.3%",
    trend: "up",
    icon: Clock,
    color: "violet",
    sparkline: [20, 25, 30, 35, 32, 40, 38, 45, 50, 48, 55, 60],
  },
  {
    label: "Bounce Rate",
    value: "42.3%",
    change: "-5.1%",
    trend: "down",
    icon: MousePointerClick,
    color: "amber",
    sparkline: [60, 55, 58, 52, 50, 48, 45, 44, 43, 42, 41, 42],
  },
]

const colorMap: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  blue: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    border: "border-blue-500/20",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/20",
  },
  violet: {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    border: "border-violet-500/20",
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20",
  },
}

export function AnalyticsMetrics() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const colors = colorMap[metric.color]
        const isPositive = metric.trend === "up" && metric.label !== "Bounce Rate"
        const isGood = metric.label === "Bounce Rate" ? metric.trend === "down" : metric.trend === "up"

        return (
          <div
            key={metric.label}
            className="group relative bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-black/5 hover:border-border/80 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background gradient accent */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    isGood ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {isGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-semibold">{metric.change}</span>
                </div>
              </div>

              {/* Value */}
              <div className="mb-1">
                <p className="text-2xl font-heading font-bold tracking-tight">{metric.value}</p>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>

              {/* Sparkline */}
              <div className="mt-4 h-10">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`sparkline-${metric.color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop
                        offset="0%"
                        className={
                          metric.color === "blue"
                            ? "text-blue-500"
                            : metric.color === "emerald"
                              ? "text-emerald-500"
                              : metric.color === "violet"
                                ? "text-violet-500"
                                : "text-amber-500"
                        }
                        stopColor="currentColor"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        className={
                          metric.color === "blue"
                            ? "text-blue-500"
                            : metric.color === "emerald"
                              ? "text-emerald-500"
                              : metric.color === "violet"
                                ? "text-violet-500"
                                : "text-amber-500"
                        }
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 ${40 - (metric.sparkline[0] / 100) * 40} ${metric.sparkline
                      .map((v, i) => `L ${(i / (metric.sparkline.length - 1)) * 100} ${40 - (v / 100) * 40}`)
                      .join(" ")} L 100 40 L 0 40 Z`}
                    fill={`url(#sparkline-${metric.color})`}
                  />
                  <path
                    d={`M 0 ${40 - (metric.sparkline[0] / 100) * 40} ${metric.sparkline
                      .map((v, i) => `L ${(i / (metric.sparkline.length - 1)) * 100} ${40 - (v / 100) * 40}`)
                      .join(" ")}`}
                    fill="none"
                    className={
                      metric.color === "blue"
                        ? "stroke-blue-500"
                        : metric.color === "emerald"
                          ? "stroke-emerald-500"
                          : metric.color === "violet"
                            ? "stroke-violet-500"
                            : "stroke-amber-500"
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
