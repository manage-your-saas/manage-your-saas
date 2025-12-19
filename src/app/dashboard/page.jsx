'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ✅ Create Supabase ONCE
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div
      style={{ fontFamily: "var(--font-story-script)" }}
      className="mt-20"
    >
      <Integrations
        integrationStatus={integrationStatus}
        googleAnalyticsAuthUrl={googleAnalyticsAuthUrl}
        googleSearchConsoleAuthUrl={googleSearchConsoleAuthUrl}
        stripeAuthUrl={stripeAuthUrl}
      />
    </div>
  )
}

/* ---------------- Integrations Component ---------------- */

function Integrations({
  integrationStatus,
  googleAnalyticsAuthUrl,
  googleSearchConsoleAuthUrl,
  stripeAuthUrl
}) {
  const base =
    "px-6 py-3 rounded-lg text-3xl text-white tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"

  return (
    <div className="flex justify-center gap-6">

      {/* Stripe */}
      <a
        href={
          integrationStatus.stripe === 'connected'
            ? '/dashboard/stripe'
            : stripeAuthUrl
        }
        className={`${base} bg-violet-500 hover:bg-violet-600`}
      >
        {integrationStatus.stripe === 'connected'
          ? 'View Stripe'
          : 'Connect Stripe'}
      </a>

      {/* Search Console */}
      <a
        href={
          integrationStatus.google_search_console === 'connected'
            ? '/dashboard/seo'
            : googleSearchConsoleAuthUrl
        }
        className={`${base} bg-blue-500 hover:bg-blue-600`}
      >
        {integrationStatus.google_search_console === 'connected'
          ? 'View Search Console'
          : 'Connect Search Console'}
      </a>

      {/* Google Analytics */}
      <a
        href={
          integrationStatus.google_analytics === 'connected'
            ? '/dashboard/analytics'
            : googleAnalyticsAuthUrl
        }
        className={`${base} bg-amber-500 hover:bg-amber-600`}
      >
        {integrationStatus.google_analytics === 'connected'
          ? 'View Google Analytics'
          : 'Connect Google Analytics'}
      </a>

    </div>
  )
}
