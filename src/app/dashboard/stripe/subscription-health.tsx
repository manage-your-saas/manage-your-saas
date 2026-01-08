"use client"

import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

const subscriptionStats = [
  { label: "Active", count: 847, percentage: 89, icon: CheckCircle, color: "emerald" },
  { label: "Trialing", count: 52, percentage: 5, icon: Clock, color: "blue" },
  { label: "Past Due", count: 38, percentage: 4, icon: AlertCircle, color: "amber" },
  { label: "Canceled", count: 19, percentage: 2, icon: XCircle, color: "red" },
]

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
}

const textColorMap: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  red: "text-red-500",
}

export function SubscriptionHealth() {
  const total = subscriptionStats.reduce((acc, stat) => acc + stat.count, 0)

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Subscription Health</h3>
        <p className="text-sm text-muted-foreground mt-1">Current subscription status breakdown</p>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-4 rounded-full overflow-hidden flex mb-6">
        {subscriptionStats.map((stat) => (
          <div
            key={stat.label}
            className={`h-full ${colorMap[stat.color]} transition-all duration-500`}
            style={{ width: `${stat.percentage}%` }}
          />
        ))}
      </div>

      {/* Total */}
      <div className="text-center mb-6 pb-6 border-b border-border">
        <p className="text-4xl font-heading font-bold">{total}</p>
        <p className="text-sm text-muted-foreground">Total Subscriptions</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        {subscriptionStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colorMap[stat.color]}`} />
                <Icon className={`w-4 h-4 ${textColorMap[stat.color]}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{stat.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{stat.percentage}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
