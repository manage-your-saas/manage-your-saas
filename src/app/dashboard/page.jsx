"use client"

import { DashboardSidebar } from "./seo-test/dashboard-sidebar"
import { DashboardTopbar } from "./seo-test/dashboard-topbar"
import { MetricsBento } from "./seo-test/metrics-bento"
import { PerformanceChart } from "./seo-test/performance-chart"
import { QueriesTable } from "./seo-test/queries-table"
import { QuickInsights } from "./seo-test/quick-insights"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
      setLoading(false)
    }

    init()
  }, [router])

  if (loading) return <p className="text-center mt-20">Loading…</p>
  if (!user) return null

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
    const state = encodeURIComponent(JSON.stringify({ userId: user.id }))
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
    
    window.location.href = googleSearchConsoleAuthUrl
  }

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await checkSearchConsoleStatus(user)
    }
    init()
  }, [router])

  if (isLoading || loading) {
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
          {searchConsoleConnected ? (
            <>
              <div className="animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-600">Connected</span>
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

              <MetricsBento />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <PerformanceChart />
                </div>
                <QuickInsights />
              </div>

              <QueriesTable />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
              <div className="bg-card p-8 rounded-2xl border border-border max-w-md w-full">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect Search Console</h2>
                <p className="text-muted-foreground mb-6">Connect your Google Search Console account to view search analytics and performance metrics for your website.</p>
                <button
                  onClick={connectSearchConsole}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Connect with Google
                </button>
                <p className="text-xs text-muted-foreground mt-4">We'll only request access to your search console data</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
