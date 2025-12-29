import { DashboardSidebar } from "../seo-test/dashboard-sidebar"
import { DashboardTopbar } from "../seo-test/dashboard-topbar"
import { AnalyticsMetrics } from "./analytics-metrics"
import { AnalyticsChart } from "./analytics-chart"
import { TrafficSources } from "./traffic-sources"
import { TopPages } from "./top-pages"
import { GeographyMap } from "./geography-map"
import { RealTimeUsers } from "./real-time-users"

export default function AnalyticsPage() {
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
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-medium text-blue-600">Real-time</span>
                  </div>
                  <span className="text-xs text-muted-foreground">47 users online now</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Google Analytics</h1>
                <p className="text-muted-foreground mt-1">Website traffic and engagement metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option>Last 7 days</option>
                  <option>Last 28 days</option>
                  <option>Last 3 months</option>
                  <option>Last 12 months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-time Users Bar */}
          <RealTimeUsers />

          {/* Metrics Grid */}
          <AnalyticsMetrics />

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AnalyticsChart />
            </div>
            <TrafficSources />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopPages />
            <GeographyMap />
          </div>
        </main>
      </div>
    </div>
  )
}
