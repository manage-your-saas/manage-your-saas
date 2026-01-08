"use client"

import { AlertTriangle, TrendingDown, Calendar } from "lucide-react"

const churnReasons = [
  { reason: "Too expensive", percentage: 35, count: 7 },
  { reason: "Missing features", percentage: 25, count: 5 },
  { reason: "Switched to competitor", percentage: 20, count: 4 },
  { reason: "No longer needed", percentage: 15, count: 3 },
  { reason: "Other", percentage: 5, count: 1 },
]

const atRiskCustomers = [
  { name: "Acme Corp", mrr: "$299", lastActive: "14 days ago", risk: "high" },
  { name: "TechStart", mrr: "$49", lastActive: "21 days ago", risk: "high" },
  { name: "Design Co", mrr: "$99", lastActive: "10 days ago", risk: "medium" },
]

export function ChurnAnalysis() {
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

      {/* Churn Reasons */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Top Reasons</p>
        <div className="space-y-3">
          {churnReasons.slice(0, 3).map((item) => (
            <div key={item.reason} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.reason}</span>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk Customers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            At-Risk Customers
          </p>
          <button className="text-xs text-violet-600 hover:underline">View all</button>
        </div>
        <div className="space-y-2">
          {atRiskCustomers.map((customer) => (
            <div
              key={customer.name}
              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
            >
              <div>
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {customer.lastActive}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{customer.mrr}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    customer.risk === "high" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {customer.risk} risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
