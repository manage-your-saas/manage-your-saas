"use client"

import { Users, TrendingUp, Calendar } from "lucide-react"

interface EngagementMetricsProps {
  engagementData?: {
    dau: number
    mau: number
    returningUsers: number
    returningUsersPercentage: number
    avgSessionDuration: number
    engagementRate: number
  }
}

export function EngagementMetrics({ engagementData }: EngagementMetricsProps) {
  // Default to 0 values if no data provided
  const data = engagementData || {
    dau: 0,
    mau: 0,
    returningUsers: 0,
    returningUsersPercentage: 0,
    avgSessionDuration: 0,
    engagementRate: 0
  };

  const metrics = [
    {
      id: "dau",
      label: "Daily Active Users",
      value: data.dau.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      id: "mau",
      label: "Monthly Active Users",
      value: data.mau.toLocaleString(),
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "returning",
      label: "Returning Users",
      value: `${data.returningUsersPercentage.toFixed(1)}%`,
      subvalue: `${data.returningUsers.toLocaleString()} users`,
      icon: TrendingUp,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20"
    },
    {
      id: "engagement",
      label: "Engagement Rate",
      value: `${data.engagementRate.toFixed(1)}%`,
      subvalue: `${Math.floor(data.avgSessionDuration / 60)}m ${data.avgSessionDuration % 60}s avg session`,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    }
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Engagement Metrics</h3>
        <p className="text-sm text-muted-foreground mt-1">User activity and retention</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.id}
              className="group relative overflow-hidden rounded-xl bg-muted/30 border border-border p-4 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${metric.bgColor} ${metric.borderColor} border flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>

                {/* Value */}
                <div className="mb-1">
                  <span className="text-2xl font-heading font-bold tracking-tight">{metric.value}</span>
                  {metric.subvalue && (
                    <div className="text-xs text-muted-foreground mt-1">{metric.subvalue}</div>
                  )}
                </div>

                {/* Label */}
                <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* DAU/MAU Ratio */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">DAU/MAU Ratio</p>
            <p className="text-xs text-muted-foreground">Daily stickiness metric</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {data.mau > 0 
                ? `${((data.dau / data.mau) * 100).toFixed(1)}%`
                : "0.0%"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {data.dau > 0 && data.mau > 0 
                ? `${((data.dau / data.mau) * 30).toFixed(1)} days/month`
                : "0 days/month"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
