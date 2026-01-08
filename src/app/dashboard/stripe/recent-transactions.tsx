"use client"

import { ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from "lucide-react"

const transactions = [
  {
    id: "pi_1234",
    customer: "Sarah Johnson",
    email: "sarah@company.com",
    amount: "$49.00",
    type: "payment",
    plan: "Pro Monthly",
    date: "2 min ago",
    status: "succeeded",
  },
  {
    id: "pi_1235",
    customer: "Mike Chen",
    email: "mike@startup.io",
    amount: "$199.00",
    type: "payment",
    plan: "Team Annual",
    date: "15 min ago",
    status: "succeeded",
  },
  {
    id: "re_1236",
    customer: "Alex Smith",
    email: "alex@email.com",
    amount: "-$29.00",
    type: "refund",
    plan: "Starter",
    date: "1 hour ago",
    status: "refunded",
  },
  {
    id: "pi_1237",
    customer: "Emma Wilson",
    email: "emma@design.co",
    amount: "$49.00",
    type: "renewal",
    plan: "Pro Monthly",
    date: "2 hours ago",
    status: "succeeded",
  },
  {
    id: "pi_1238",
    customer: "James Lee",
    email: "james@tech.com",
    amount: "$99.00",
    type: "payment",
    plan: "Pro Annual",
    date: "3 hours ago",
    status: "succeeded",
  },
]

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

export function RecentTransactions() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest payment activity</p>
        </div>
        <button className="text-sm text-violet-600 hover:underline flex items-center gap-1">
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
