import { DashboardSidebar } from "@/app/dashboard/seo/dashboard-sidebar"
import { DashboardTopbar } from "@/app/dashboard/seo/dashboard-topbar"
import { MetricsBento } from "@/app/dashboard/seo/metrics-bento"
import { PerformanceChart } from "./performance-chart"
import { QueriesTable } from "@/app/dashboard/seo/queries-table"
import { QuickInsights } from "@/app/dashboard/seo/quick-insights"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardTopbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-600">Live</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Last updated 2 min ago</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">interfreight.in</h1>
                <p className="text-muted-foreground mt-1">Search Console Performance Overview</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50">
                  <option>Last 28 days</option>
                  <option>Last 7 days</option>
                  <option>Last 3 months</option>
                  <option>Last 12 months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bento Grid Metrics */}
          <MetricsBento />

          {/* Charts & Insights Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PerformanceChart />
            </div>
            <QuickInsights />
          </div>

          {/* Data Table */}
          <QueriesTable />
        </main>
      </div>
    </div>
  )
}
