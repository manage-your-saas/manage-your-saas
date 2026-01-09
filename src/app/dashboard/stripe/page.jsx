'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DashboardSidebar } from "../seo/dashboard-sidebar"
import { DashboardTopbar } from "../seo/dashboard-topbar"
import { RevenueMetrics } from "./revenue-metrics"
import { RevenueChart } from "./revenue-chart"
import { SubscriptionHealth } from "./subscription-health"
import { RecentTransactions } from "./recent-transactions"
import { CustomerMetrics } from "./customer-metrics"
import { ChurnAnalysis } from "./churn-analysis"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function StripeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    analytics: { mrr: 0, arr: 0, growth: 0, monthlyData: [] },
    subscriptions: [],
    customers: [],
    invoices: [],
    metrics: {
      mrr: 0,
      arr: 0,
      growth: 0,
      monthlyData: [],
      customerCount: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      arpu: 0
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not logged in");
      }

      const [analyticsRes, customersRes, subscriptionsRes, invoicesRes] = await Promise.all([
        fetch(`/api/stripe/analytics?userId=${user.id}`),
        fetch(`/api/stripe/customers?userId=${user.id}`),
        fetch(`/api/stripe/subscriptions?userId=${user.id}`),
        fetch(`/api/stripe/invoices?userId=${user.id}`)
      ]);

      const [analyticsData, customersData, subscriptionsData, invoicesData] = await Promise.all([
        analyticsRes.json(),
        customersRes.json(),
        subscriptionsRes.json(),
        invoicesRes.json()
      ]);

      if (analyticsData.error) throw new Error(analyticsData.error);
      if (customersData.error) throw new Error(customersData.error);
      if (subscriptionsData.error) throw new Error(subscriptionsData.error);
      if (invoicesData.error) throw new Error(invoicesData.error);

      const activeSubs = (subscriptionsData.subscriptions || []).filter(
        sub => sub.status === 'active' || sub.status === 'trialing'
      ).length;

      const arpu = analyticsData.mrr > 0 && activeSubs > 0 ? (analyticsData.mrr / 100) / activeSubs : 0;

      setData({
        analytics: analyticsData,
        subscriptions: subscriptionsData.subscriptions || [],
        customers: customersData.customers || [],
        invoices: invoicesData.invoices || [],
        metrics: {
          ...analyticsData,
          customerCount: customersData.customers?.length || 0,
          activeSubscriptions: activeSubs,
          totalRevenue: analyticsData.mrr || 0,
          arpu
        }
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading Stripe data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

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
                  <span className="text-xs text-muted-foreground">Live mode</span>
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
          <RevenueMetrics {...data.metrics} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RevenueChart monthlyData={data.analytics.monthlyData} />
            </div>
            <SubscriptionHealth subscriptions={data.subscriptions} />
          </div>

          {/* Customer Metrics */}
          <CustomerMetrics customers={data.customers} />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RecentTransactions invoices={data.invoices} />
            <ChurnAnalysis subscriptions={data.subscriptions} />
          </div>
        </main>
      </div>
    </div>
  )
}
