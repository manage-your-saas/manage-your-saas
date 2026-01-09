"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DashboardSidebar } from "../seo/dashboard-sidebar";
import { DashboardTopbar } from "../seo/dashboard-topbar";
import { AnalyticsMetrics } from "./analytics-metrics"
import { AnalyticsChart } from "./analytics-chart"
import { TrafficSources } from "./traffic-sources"
import { TopPages } from "./top-pages"
import { GeographyMap } from "./geography-map"
import { RealTimeUsers } from "./real-time-users"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DATE_RANGES = [
  { label: "Last 7 days", value: "7daysAgo" },
  { label: "Last 28 days", value: "28daysAgo" },
  { label: "Last 3 months", value: "90daysAgo" },
];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    summary: null,
    chartData: [],
    trafficSources: [],
    topPages: [],
    geoData: [],
    realTimeUsers: 0,
    loading: true,
    error: null,
    selectedRange: "28daysAgo"
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/dashboard';
          return;
        }

        // Check Google Analytics status
        const statusRes = await fetch(`/api/google/status?userId=${user.id}`);
        const status = await statusRes.json();
        
        if (!status.connected) {
          // No GA account connected - show error
          setAnalyticsData(prev => ({ 
            ...prev, 
            error: "Error: No Google Analytics account connected. Please connect your Google Analytics account to view analytics data.",
            loading: false 
          }));
          return;
        }

        // Fetch analytics data
        const [summaryRes, chartRes, trafficRes, pagesRes, geoRes] = await Promise.all([
          fetch(`/api/google/analytics?userId=${user.id}&startDate=${analyticsData.selectedRange}`),
          fetch(`/api/google/analytics?userId=${user.id}&dimension=date&metric=activeUsers&metric=sessions&metric=screenPageViews&startDate=${analyticsData.selectedRange}`),
          fetch(`/api/google/analytics?userId=${user.id}&dimension=sessionSource&metric=sessions&startDate=${analyticsData.selectedRange}`),
          fetch(`/api/google/analytics?userId=${user.id}&dimension=pagePath&metric=screenPageViews&startDate=${analyticsData.selectedRange}`),
          fetch(`/api/google/analytics?userId=${user.id}&dimension=countryId&metric=activeUsers&startDate=${analyticsData.selectedRange}`)
        ]);

        const [summary, chart, traffic, pages, geo] = await Promise.all([
          summaryRes.json(),
          chartRes.json(),
          trafficRes.json(),
          pagesRes.json(),
          geoRes.json(),
        ]);

        setAnalyticsData(prev => ({
          ...prev,
          summary: summary.metrics,
          chartData: chart.rows || [],
          trafficSources: traffic.rows || [],
          topPages: pages.rows || [],
          geoData: geo.rows || [],
          loading: false
        }));

      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setAnalyticsData(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };

    fetchAnalyticsData();
  }, [analyticsData.selectedRange]);

  useEffect(() => {
    const fetchRealTime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch(`/api/google/analytics/real-time?userId=${user.id}`);
          const data = await res.json();
          if (data.success) {
            setAnalyticsData(prev => ({ ...prev, realTimeUsers: data.activeUsers }));
          }
        }
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    fetchRealTime();
    const interval = setInterval(fetchRealTime, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRangeChange = (e) => {
    setAnalyticsData(prev => ({ ...prev, selectedRange: e.target.value, loading: true }));
  };
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
                  <span className="text-xs text-muted-foreground">{analyticsData.realTimeUsers} users online now</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Google Analytics</h1>
                <p className="text-muted-foreground mt-1">Website traffic and engagement metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={analyticsData.selectedRange}
                  onChange={handleRangeChange}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {DATE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {analyticsData.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : analyticsData.error ? (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center max-w-md w-full p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-4">
                    Error: No Google Analytics Account Connected
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    You need to connect your Google Analytics account to view analytics data. Please connect your account to get started.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={() => window.location.href = "/dashboard"}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Back to Overview
                    </button>
                    
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Need help? Visit our <a href="/dashboard" className="text-blue-600 hover:underline">overview</a> to manage your integrations.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Real-time Users Bar */}
              <RealTimeUsers realTimeUsers={analyticsData.realTimeUsers} />

              {/* Metrics Grid */}
              <AnalyticsMetrics metrics={analyticsData.summary} />

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <AnalyticsChart chartData={analyticsData.chartData} selectedRange={analyticsData.selectedRange} />
                </div>
                <TrafficSources trafficSources={analyticsData.trafficSources} />
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TopPages topPages={analyticsData.topPages} />
                <GeographyMap geoData={analyticsData.geoData} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
