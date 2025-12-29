"use client"

import { Users, UserPlus, UserMinus, Target, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

const customerStats = [
  {
    label: "Total Customers",
    value: "1,247",
    change: "+8.3%",
    trend: "up",
    icon: Users,
    color: "violet",
  },
  {
    label: "New This Month",
    value: "124",
    change: "+22.1%",
    trend: "up",
    icon: UserPlus,
    color: "emerald",
  },
  {
    label: "Churned",
    value: "18",
    change: "-12.5%",
    trend: "down",
    icon: UserMinus,
    color: "red",
  },
  {
    label: "Net New",
    value: "+106",
    change: "+31.2%",
    trend: "up",
    icon: Target,
    color: "blue",
  },
]

const colorMap: Record<string, { gradient: string; bg: string }> = {
  violet: { gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10" },
  emerald: { gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10" },
  red: { gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10" },
  blue: { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
}

export function CustomerMetrics() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Customer Metrics</h3>
          <p className="text-sm text-muted-foreground mt-1">Customer acquisition and retention</p>
        </div>
        <button className="text-sm text-violet-600 hover:underline flex items-center gap-1">
          View all customers <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {customerStats.map((stat) => {
          const Icon = stat.icon
          const colors = colorMap[stat.color]
          const isGood = stat.color !== "red" ? stat.trend === "up" : stat.trend === "down"

          return (
            <div key={stat.label} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <div className={`flex items-center gap-1 text-xs ${isGood ? "text-emerald-600" : "text-red-500"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
