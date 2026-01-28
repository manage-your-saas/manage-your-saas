"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingDown, Calendar, Loader2 } from "lucide-react"

type ChurnReason = {
  reason: string
  percentage: number
  count: number
}

type AtRiskCustomer = {
  name: string
  mrr: string
  lastActive: string
  risk: string
}

export function ChurnAnalysis({ userId }: { userId: string }) {
  const [churnReasons, setChurnReasons] = useState<ChurnReason[]>([])
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchChurnAnalysis = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setChurnReasons([
            { reason: "Too expensive", percentage: 35, count: 7 },
            { reason: "Missing features", percentage: 25, count: 5 },
            { reason: "Switched to competitor", percentage: 20, count: 4 },
            { reason: "No longer needed", percentage: 15, count: 3 },
            { reason: "Other", percentage: 5, count: 1 },
          ])
          setAtRiskCustomers(data.atRiskCustomers || [])
        }
      } catch (error) {
        console.error('Failed to fetch churn analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChurnAnalysis()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-8 animate-pulse" />
                </div>
                <div className="h-2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Churn Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">Understand why customers leave</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <TrendingDown className="w-3 h-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-600">2.1% churn rate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Reasons */}
        <div className="space-y-4">
          <p className="text-sm font-medium">Top Reasons</p>
          <div className="space-y-4">
            {churnReasons.map((item) => (
              <div key={item.reason}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">{item.reason}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-linear-to-r from-amber-500 to-orange-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Customers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              At-Risk Customers
            </p>
            <button className="text-xs text-emerald-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {atRiskCustomers.map((customer) => (
              <div key={customer.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/80 transition-colors">
                <div>
                  <p className="font-semibold text-sm">{customer.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3" />
                    {customer.lastActive}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{customer.mrr}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full mt-1 inline-block font-medium ${
                      customer.risk === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                    {customer.risk} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
