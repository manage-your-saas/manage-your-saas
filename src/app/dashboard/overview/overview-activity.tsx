"use client"

import { CreditCard, UserPlus, TrendingUp, Search, Eye, ArrowUpRight, Filter } from "lucide-react"
import { useState } from "react"

const activities = [
  {
    id: 1,
    type: "revenue",
    icon: CreditCard,
    title: "New subscription",
    description: "Pro Plan - Monthly",
    amount: "+$49.00",
    time: "2 min ago",
    source: "Stripe",
    color: "bg-emerald-500",
  },
  {
    id: 2,
    type: "customer",
    icon: UserPlus,
    title: "New customer signup",
    description: "john@example.com",
    time: "15 min ago",
    source: "Stripe",
    color: "bg-blue-500",
  },
  {
    id: 3,
    type: "seo",
    icon: TrendingUp,
    title: "Keyword ranking improved",
    description: "'saas dashboard' moved to #3",
    time: "1 hour ago",
    source: "Search Console",
    color: "bg-amber-500",
  },
  {
    id: 4,
    type: "traffic",
    icon: Eye,
    title: "Traffic spike detected",
    description: "+45% visitors from Product Hunt",
    time: "2 hours ago",
    source: "Analytics",
    color: "bg-violet-500",
  },
  {
    id: 5,
    type: "revenue",
    icon: CreditCard,
    title: "Subscription upgraded",
    description: "Starter → Pro Plan",
    amount: "+$30.00",
    time: "3 hours ago",
    source: "Stripe",
    color: "bg-emerald-500",
  },
  {
    id: 6,
    type: "seo",
    icon: Search,
    title: "New keyword ranking",
    description: "'analytics tool' now ranking",
    time: "5 hours ago",
    source: "Search Console",
    color: "bg-amber-500",
  },
]

const filters = ["All", "Revenue", "Customers", "Traffic", "SEO"]

export function OverviewActivity() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Revenue") return activity.type === "revenue"
    if (activeFilter === "Customers") return activity.type === "customer"
    if (activeFilter === "Traffic") return activity.type === "traffic"
    if (activeFilter === "SEO") return activity.type === "seo"
    return true
  })

  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-fade-up" style={{ animationDelay: "500ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-heading font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Real-time updates across all integrations</p>
        </div>
        <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity) => {
          const Icon = activity.icon
          return (
            <div
              key={activity.id}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-emerald-500 whitespace-nowrap">{activity.amount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {activity.source}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })}
      </div>

      {/* View All */}
      <button className="w-full mt-4 py-2.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium">
        View All Activity
      </button>
    </div>
  )
}
