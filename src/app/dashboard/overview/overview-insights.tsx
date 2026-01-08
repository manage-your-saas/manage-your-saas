"use client"

import { Lightbulb, TrendingUp, Target, Zap, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"

const insights = [
  {
    type: "success",
    icon: CheckCircle,
    title: "Revenue Goal on Track",
    description: "You're 92% toward your $15K MRR goal. Keep it up!",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    action: "View Revenue",
  },
  {
    type: "opportunity",
    icon: TrendingUp,
    title: "Traffic Spike Detected",
    description: "Visitors from Twitter up 340%. Consider a follow-up post.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    action: "View Traffic",
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Churn Risk Alert",
    description: "3 customers haven't logged in for 14+ days.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    action: "View Customers",
  },
  {
    type: "tip",
    icon: Target,
    title: "SEO Opportunity",
    description: "5 keywords are on page 2. A few backlinks could push them to page 1.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    action: "View Keywords",
  },
]

const healthScore = 87

export function OverviewInsights() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-fade-up" style={{ animationDelay: "600ms" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold">AI Insights</h2>
          <p className="text-xs text-muted-foreground">Smart recommendations</p>
        </div>
      </div>

      {/* Health Score */}
      <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Business Health Score</span>
          <span className="text-2xl font-heading font-bold text-emerald-500">{healthScore}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-emerald-500/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Based on revenue, traffic, and engagement metrics</p>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div
              key={index}
              className="group p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-0.5">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  <button className="flex items-center gap-1 mt-2 text-xs font-medium text-accent hover:underline">
                    {insight.action}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" />
        Get Full AI Report
      </button>
    </div>
  )
}
