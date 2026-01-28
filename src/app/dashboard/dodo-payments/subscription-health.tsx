"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react"

type SubscriptionStat = {
  label: string
  count: number
  percentage: number
  icon: any
  color: string
}

export function SubscriptionHealth({ userId }: { userId: string }) {
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchSubscriptionHealth = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          const subscriptions = data.subscriptionHealth || []
          
          const total = subscriptions.reduce((acc: number, sub: any) => acc + sub.count, 0)
          const stats = subscriptions.map((sub: any) => ({
            label: sub.status.charAt(0).toUpperCase() + sub.status.slice(1),
            count: sub.count,
            percentage: Math.round((sub.count / total) * 100),
            icon: sub.status === 'active' ? CheckCircle : 
                  sub.status === 'trialing' ? Clock : 
                  sub.status === 'past_due' ? AlertCircle : XCircle,
            color: sub.status === 'active' ? 'emerald' : 
                   sub.status === 'trialing' ? 'blue' : 
                   sub.status === 'past_due' ? 'amber' : 'red'
          }))
          
          setSubscriptionStats(stats)
        }
      } catch (error) {
        console.error('Failed to fetch subscription health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionHealth()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-muted rounded w-8 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const total = subscriptionStats.reduce((acc, stat) => acc + stat.count, 0)

  const colorMap: Record<string, string> = {
    active: "bg-emerald-500",
    trialing: "bg-blue-500",
    past_due: "bg-amber-500",
    canceled: "bg-red-500",
  }

  const textColorMap: Record<string, string> = {
    active: "text-emerald-500",
    trialing: "text-blue-500",
    past_due: "text-amber-500",
    canceled: "text-red-500",
  }

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
            <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${textColorMap[stat.color]}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{stat.count}</span>
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className={`${colorMap[stat.color]} h-2 rounded-full`} style={{ width: `${stat.percentage}%` }}></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
