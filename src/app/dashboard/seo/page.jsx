"use client"

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MetricsBento } from "./metrics-bento";
import { PerformanceChart } from "./performance-chart";
import { QueriesTable } from "./queries-table";
import { QuickInsights } from "./quick-insights";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DATE_RANGES = [
  { label: "Last 7 days", value: "7daysAgo" },
  { label: "Last 28 days", value: "28daysAgo" },
  { label: "Last 3 months", value: "90daysAgo" },
];

export default function DashboardPage() {
  const [seoData, setSeoData] = useState({
    summary: null,
    queries: [],
    pages: [],
    countries: [],
    devices: [],
    chartData: [],
    loading: true,
    error: null,
    siteUrl: "",
    selectedRange: "28daysAgo"
  });

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/dashboard';
          return;
        }

        // Check Search Console status
        const statusRes = await fetch(`/api/search-console/status?userId=${user.id}`);
        const status = await statusRes.json();

        if (!status?.siteUrl) {
          throw new Error("No Search Console site selected");
        }

        // Fetch SEO summary
        const [summaryRes, queriesRes, pagesRes, countriesRes, devicesRes] = await Promise.all([
          fetch(`/api/search-console/seo-summary?userId=${user.id}&siteUrl=${encodeURIComponent(status.siteUrl)}&startDate=${seoData.selectedRange}`),
          fetch(`/api/search-console/performance?userId=${user.id}&dimension=query&startDate=${seoData.selectedRange}`),
          fetch(`/api/search-console/performance?userId=${user.id}&dimension=page&startDate=${seoData.selectedRange}`),
          fetch(`/api/search-console/performance?userId=${user.id}&dimension=country&startDate=${seoData.selectedRange}`),
          fetch(`/api/search-console/performance?userId=${user.id}&dimension=device&startDate=${seoData.selectedRange}`)
        ]);

        const summary = await summaryRes.json();
        const queries = await queriesRes.json();
        const pages = await pagesRes.json();
        const countries = await countriesRes.json();
        const devices = await devicesRes.json();

        // Process data for charts
        const chartData = processChartData(summary?.data || []);

        setSeoData(prev => ({
          ...prev,
          summary: summary?.seo,
          queries: queries?.rows || [],
          pages: pages?.rows || [],
          countries: countries?.rows || [],
          devices: devices?.rows || [],
          chartData,
          siteUrl: status.siteUrl.replace("sc-domain:", "").trim(),
          loading: false
        }));

      } catch (error) {
        console.error("Error fetching SEO data:", error);
        setSeoData(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    fetchSeoData();
  }, [seoData.selectedRange]);

  const processChartData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: (item.ctr * 100).toFixed(2),
      position: item.position.toFixed(2),
    }));
  };

  const handleRangeChange = (e) => {
    const newRange = e.target.value;
    setSeoData(prev => ({
      ...prev,
      selectedRange: newRange,
      loading: true
    }));
  };

  if (seoData.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading SEO data...</div>
      </div>
    );
  }

  if (seoData.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">Error: {seoData.error}</div>
      </div>
    );
  }

  // Check if no Search Console site is selected
  if (!seoData.siteUrl || seoData.siteUrl.trim() === "") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md w-full p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              No Search Console Account Connected
            </h1>
            <p className="text-muted-foreground mb-8">
              You need to connect your Google Search Console account to view SEO performance data. Please select a site and connect your account to get started.
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
              <button 
                onClick={() => window.location.href = "/dashboard/analytics"}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Connect Google Analytics
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Need help? Visit our <a href="/dashboard" className="text-blue-600 hover:underline">overview</a> to manage your integrations.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
                  {seoData.siteUrl || "Your Site"}
                </h1>
                <p className="text-muted-foreground mt-1">Search Console Performance Overview</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={seoData.selectedRange}
                  onChange={handleRangeChange}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50"
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

          {/* Bento Grid Metrics */}
          <MetricsBento metrics={seoData.summary} />

          {/* Charts & Insights Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PerformanceChart data={seoData.chartData} selectedRange={seoData.selectedRange} />
            </div>
            <QuickInsights data={seoData.summary} />
          </div>

          {/* Data Table */}
          <QueriesTable 
            queries={seoData.queries} 
            pages={seoData.pages} 
            countries={seoData.countries} 
            devices={seoData.devices} 
          />
        </main>
      </div>
    </div>
  );
}