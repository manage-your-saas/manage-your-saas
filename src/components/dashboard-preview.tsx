"use client"

import type React from "react"

import { TrendingUp, Users, DollarSign, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function DashboardPreview() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

      {/* Browser frame */}
      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground border border-border">
              app.manageyoursaas.com
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 bg-background">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Revenue" value="$48,352" change="+12.5%" isPositive icon={DollarSign} />
            <StatCard title="Active Users" value="2,847" change="+8.2%" isPositive icon={Users} />
            <StatCard title="Page Views" value="124.5K" change="+24.1%" isPositive icon={Eye} />
            <StatCard title="Conversion" value="3.24%" change="-0.4%" isPositive={false} icon={TrendingUp} />
          </div>

          {/* Chart placeholder */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Revenue Overview</h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">Weekly</span>
                <span className="text-xs px-2 py-1 rounded text-muted-foreground">Monthly</span>
              </div>
            </div>
            <div className="h-48 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent/20 rounded-t-sm relative group hover:bg-accent/30 transition-colors"
                  style={{ height: `${height}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-sm transition-all duration-500"
                    style={{ height: `${height * 0.7}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Integration badges */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {["Google Analytics", "Stripe", "LinkedIn", "Reddit", "X", "Search Console"].map((name) => (
              <span key={name} className="px-3 py-1.5 text-xs font-medium bg-muted rounded-full text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ElementType
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`flex items-center text-xs font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
    </div>
  )
}
