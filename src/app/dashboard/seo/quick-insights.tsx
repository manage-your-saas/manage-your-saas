"use client"

import { Lightbulb, TrendingUp, TrendingDown, Target, Zap } from "lucide-react"

const insights = [
  {
    type: "positive",
    icon: TrendingUp,
    title: "Clicks trending up",
    description: "Your clicks increased 12.5% compared to last period.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    type: "tip",
    icon: Target,
    title: "Optimize for position",
    description: "3 keywords are close to page 1. Focus on building backlinks.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    type: "alert",
    icon: TrendingDown,
    title: "CTR decreased",
    description: "Consider updating meta descriptions for better click-through.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
]

export function QuickInsights() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold">Quick Insights</h2>
          <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div
              key={index}
              className="group p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-0.5">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button className="w-full mt-5 py-2.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        View All Insights
      </button>
    </div>
  )
}
