"use client"

import { AlertTriangle, TrendingDown, Calendar } from "lucide-react"

interface Subscription {
  status: string;
  canceled_at?: number;
  created: number;
  customer: { name?: string, email?: string };
  plan: { amount: number };
}

interface ChurnAnalysisProps {
  subscriptions?: Subscription[];
}

function formatTimeAgo(timestamp: number) {
  const now = new Date();
  const past = new Date(timestamp * 1000);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function ChurnAnalysis({ subscriptions = [] }: ChurnAnalysisProps) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const churnedThisMonth = subscriptions.filter(s => s.status === 'canceled' && s.canceled_at && new Date(s.canceled_at * 1000) >= firstDayOfMonth).length;
  const activeLastMonth = subscriptions.filter(s => new Date(s.created * 1000) < firstDayOfMonth && (s.status === 'active' || (s.status === 'canceled' && s.canceled_at && new Date(s.canceled_at * 1000) >= firstDayOfMonth))).length;

  const churnRate = activeLastMonth > 0 ? (churnedThisMonth / activeLastMonth) * 100 : 0;

  const atRiskCustomers = subscriptions
    .filter(s => ['past_due', 'unpaid', 'incomplete'].includes(s.status))
    .slice(0, 3);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Churn Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">Customer retention and risk</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <TrendingDown className="w-3 h-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-600">{churnRate.toFixed(1)}% churn rate</span>
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
          {atRiskCustomers.length > 0 ? atRiskCustomers.map((customer) => (
            <div
              key={customer.customer.email}
              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
            >
              <div>
                <p className="text-sm font-medium">{customer.customer.name || customer.customer.email}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatTimeAgo(customer.created)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${(customer.plan.amount / 100).toFixed(2)}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500`}
                >
                  {customer.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">No at-risk customers found.</p>}
        </div>
      </div>
    </div>
  )
}
