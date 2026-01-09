"use client"

import { DashboardSidebar } from "./seo/dashboard-sidebar"
import { DashboardTopbar } from "./seo/dashboard-topbar"
import { MetricsBento } from "./seo/metrics-bento"
import { PerformanceChart } from "./seo/performance-chart"
import { QueriesTable } from "./seo/queries-table"
import { QuickInsights } from "./seo/quick-insights"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from "next/link"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchConsoleConnected, setSearchConsoleConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [integrationStatus, setIntegrationStatus] = useState({
    google_search_console: null,
    google_analytics: null,
    stripe: null,
  })

  // ✅ Load integration status
  const loadIntegrations = async (user) => {
    try {
      /* ---------------- Search Console ---------------- */
      const scRes = await fetch(
        `/api/search-console/status?userId=${user.id}`
      )
      const scData = await scRes.json()

      if (scData?.siteUrl) {
        setIntegrationStatus(prev => ({
          ...prev,
          google_search_console: 'connected'
        }))
      }

      /* ---------------- Google Analytics ---------------- */
      const gaRes = await fetch(
        `/api/google/status?userId=${user.id}`
      )
      const gaData = await gaRes.json()

      if (gaRes.ok && gaData?.connected) {
        setIntegrationStatus(prev => ({
          ...prev,
          google_analytics: 'connected'
        }))
      }

      /* ---------------- Stripe ---------------- */
      const stripeRes = await fetch(
        `/api/stripe/status?userId=${user.id}`
      )
      const stripeData = await stripeRes.json()

      if (stripeRes.ok && stripeData?.connected) {
        setIntegrationStatus(prev => ({
          ...prev,
          stripe: 'connected'
        }))
      }

    } catch (err) {
      console.error('Integration load error:', err)
    }
  }

  // Check search console connection status
  const checkSearchConsoleStatus = async (user) => {
    try {
      const scRes = await fetch(`/api/search-console/status?userId=${user.id}`)
      const scData = await scRes.json()
      setSearchConsoleConnected(!!scData?.siteUrl)
    } catch (err) {
      console.error('Error checking search console status:', err)
      setSearchConsoleConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search console connection
  const connectSearchConsole = () => {
    window.location.href = googleSearchConsoleAuthUrl
  }

  // Handle google analytics connection
  const connectGoogleAnalytics = () => {
    window.location.href = googleAnalyticsAuthUrl
  }

  // Handle stripe connection
  const connectStripe = () => {
    window.location.href = stripeAuthUrl
  }

  // ✅ Auth + load integrations
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await loadIntegrations(user)
      await checkSearchConsoleStatus(user)
      setLoading(false)
    }

    init()
  }, [router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  /* ---------------- OAuth URLs ---------------- */

  const state = encodeURIComponent(JSON.stringify({ userId: user.id }))

  const googleAnalyticsAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_REDIRECT_URI
    )}` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/analytics.readonly` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`

  const googleSearchConsoleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_REDIRECT_URI
    )}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(
      'https://www.googleapis.com/auth/webmasters.readonly'
    )}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&include_granted_scopes=true` +
    `&state=${state}`

  const stripeAuthUrl =
    `https://connect.stripe.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}` +
    `&scope=read_write` +
    `&state=${state}`

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome back, {user?.user_metadata?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your SaaS integrations and analytics all in one place. Connect your favorite services and unlock powerful insights for your business.
            </p>
          </div>

          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Search Console Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img src="/google-search-console-icon.svg" className="w-10 h-10"  alt="Search-console-logo" />
                </div>
                {integrationStatus.google_search_console === 'connected' ? (
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Connected</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Not Connected</span>
                )}
              </div>
              <h3 className="font-semibold mb-2">Search Console</h3>
              <p className="text-sm text-muted-foreground mb-4">Google Search Console integration for SEO performance</p>
              {integrationStatus.google_search_console === 'connected' ? (
                <button 
                  onClick={() => router.push('/dashboard/seo')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Dashboard
                </button>
              ) : (
                <button 
                  onClick={connectSearchConsole}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Google Analytics Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img src="/google-analytics-icon.svg" className="w-10 h-10"  alt="Search-console-logo" />
                </div>
                {integrationStatus.google_analytics === 'connected' ? (
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Connected</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Not Connected</span>
                )}
              </div>
              <h3 className="font-semibold mb-2">Google Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">Website traffic and user behavior analytics</p>
              {integrationStatus.google_analytics === 'connected' ? (
                <button 
                  onClick={() => router.push('/dashboard/analytics')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Dashboard
                </button>
              ) : (
                <button 
                  onClick={connectGoogleAnalytics}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Stripe Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img src="/stripe-4.svg" className="w-10 h-10"  alt="Search-console-logo" />
                </div>
                {integrationStatus.stripe === 'connected' ? (
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Connected</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Not Connected</span>
                )}
              </div>
              <h3 className="font-semibold mb-2">Stripe</h3>
              <p className="text-sm text-muted-foreground mb-4">Payment processing and subscription management</p>
              {integrationStatus.stripe === 'connected' ? (
                <button 
                  onClick={() => router.push('/dashboard/stripe')}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Dashboard
                </button>
              ) : (
                <button 
                  onClick={connectStripe}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Add More Integration Card */}
            <div className="bg-card rounded-xl border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">More Coming Soon</h3>
              <p className="text-sm text-muted-foreground">Additional integrations are on the way</p>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Active Integrations</h3>
              <div className="text-3xl font-bold text-foreground">
                {Object.values(integrationStatus).filter(status => status === 'connected').length}
              </div>
              
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Total Services</h3>
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-sm text-muted-foreground">Available integrations</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Account Status</h3>
              <div className="text-3xl font-bold text-emerald-600">Active</div>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </div>
          </div>
          </main>
      </div>
    </div>
  )
}
