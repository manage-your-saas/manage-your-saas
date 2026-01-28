"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw, Loader2 } from "lucide-react"

type Transaction = {
  id: string
  customer: string
  email: string
  amount: string
  type: "payment" | "refund" | "renewal"
  plan: string
  date: string
  status: "succeeded" | "refunded" | "pending"
}

export function RecentTransactions({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.recentTransactions)
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted rounded w-12 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    succeeded: "bg-emerald-500/10 text-emerald-600",
    refunded: "bg-red-500/10 text-red-500",
    pending: "bg-amber-500/10 text-amber-600",
  }

  const typeIcons: Record<string, typeof ArrowUpRight> = {
    payment: ArrowUpRight,
    refund: ArrowDownLeft,
    renewal: RefreshCw,
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest payment activity</p>
        </div>
        <button className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => {
          const TypeIcon = typeIcons[tx.type] || CreditCard
          const isRefund = tx.type === "refund"

          return (
            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isRefund ? "bg-red-500/10" : "bg-emerald-500/10"
                }`}
              >
                <TypeIcon className={`w-5 h-5 ${isRefund ? "text-red-500" : "text-emerald-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{tx.customer}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tx.status]}`}>{tx.status}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{tx.plan}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isRefund ? "text-red-500" : "text-emerald-600"}`}>{tx.amount}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
