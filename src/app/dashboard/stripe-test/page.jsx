import { DashboardSidebar } from "../seo-test/dashboard-sidebar"
import { DashboardTopbar } from "../seo-test/dashboard-topbar"
import { RevenueMetrics } from "./revenue-metrics"
import { RevenueChart } from "./revenue-chart"
import { SubscriptionHealth } from "./subscription-health"
import { RecentTransactions } from "./recent-transactions"
import { CustomerMetrics } from "./customer-metrics"
import { ChurnAnalysis } from "./churn-analysis"

export default function StripeDashboardPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardTopbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-xs font-medium text-violet-600">Stripe Connected</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Test mode</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Revenue Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track MRR, ARR, and subscription metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Metrics */}
          <RevenueMetrics />

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>
            <SubscriptionHealth />
          </div>

          {/* Customer Metrics */}
          <CustomerMetrics />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RecentTransactions />
            <ChurnAnalysis />
          </div>
        </main>
      </div>
    </div>
  )
}
