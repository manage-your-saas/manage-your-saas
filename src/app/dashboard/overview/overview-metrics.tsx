"use client"

import {
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CreditCard,
  Activity,
} from "lucide-react"

const metricsData = {
  revenue: [
    {
      id: "mrr",
      label: "Monthly Revenue",
      value: "$12,450",
      change: 18.2,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-400",
      source: "Stripe",
    },
    {
      id: "arr",
      label: "Annual Run Rate",
      value: "$149,400",
      change: 22.5,
      icon: TrendingUp,
      gradient: "from-emerald-600 to-emerald-400",
      source: "Stripe",
    },
    {
      id: "customers",
      label: "Active Customers",
      value: "284",
      change: 8.3,
      icon: Users,
      gradient: "from-blue-500 to-cyan-400",
      source: "Stripe",
    },
  ],
  traffic: [
    {
      id: "visitors",
      label: "Total Visitors",
      value: "8,432",
      change: 12.5,
      icon: Eye,
      gradient: "from-violet-500 to-purple-400",
      source: "Analytics",
    },
    {
      id: "sessions",
      label: "Avg. Session",
      value: "3m 24s",
      change: 5.2,
      icon: Activity,
      gradient: "from-pink-500 to-rose-400",
      source: "Analytics",
    },
  ],
  seo: [
    {
      id: "clicks",
      label: "Search Clicks",
      value: "1,247",
      change: 15.8,
      icon: MousePointerClick,
      gradient: "from-amber-500 to-orange-400",
      source: "Search Console",
    },
    {
      id: "impressions",
      label: "Impressions",
      value: "45.2K",
      change: 28.4,
      icon: BarChart3,
      gradient: "from-orange-500 to-red-400",
      source: "Search Console",
    },
  ],
}

function MetricCard({
  metric,
  delay,
}: {
  metric: (typeof metricsData.revenue)[0]
  delay: number
}) {
  const Icon = metric.icon
  const isPositive = metric.change > 0

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 hover:shadow-xl hover:shadow-black/5 hover:border-accent/30 transition-all duration-500 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {metric.source}
        </span>
      </div>
      <div className="mb-1">
        <span className="text-2xl font-heading font-bold tracking-tight">{metric.value}</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(metric.change)}%
        </div>
      </div>
    </div>
  )
}

export function OverviewMetrics() {
  return (
    <div className="space-y-6">
      {/* Revenue Section */}
      <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-heading font-semibold text-lg">Revenue & Customers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metricsData.revenue.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} delay={100 + index * 50} />
          ))}
        </div>
      </div>

      {/* Traffic & SEO Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic */}
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-heading font-semibold text-lg">Website Traffic</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {metricsData.traffic.map((metric, index) => (
              <MetricCard key={metric.id} metric={metric} delay={250 + index * 50} />
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-heading font-semibold text-lg">Search Performance</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {metricsData.seo.map((metric, index) => (
              <MetricCard key={metric.id} metric={metric} delay={350 + index * 50} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
