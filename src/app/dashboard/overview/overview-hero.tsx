"use client"

import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function OverviewHero() {
  const [dateRange, setDateRange] = useState("28d")

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600">All Systems Synced</span>
            </div>
            <span className="text-xs text-muted-foreground">Last synced 2 min ago</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Business Overview</h1>
          <p className="text-muted-foreground mt-1">Your complete SaaS performance at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-card">
            {[
              { label: "7d", value: "7d" },
              { label: "28d", value: "28d" },
              { label: "90d", value: "90d" },
              { label: "12m", value: "12m" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  dateRange === option.value
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
