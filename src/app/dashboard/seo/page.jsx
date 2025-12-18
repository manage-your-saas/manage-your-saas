"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const DATE_PRESETS = [
  { label: "Last 7 days", value: "7daysAgo" },
  { label: "Last 28 days", value: "28daysAgo" },
  { label: "Last 3 months", value: "90daysAgo" },
]

export default function SeoDashboard() {
  const [overview, setOverview] = useState(null)
  const [queries, setQueries] = useState([])
  const [countries,setCountries] = useState([])
  const [chartData, setChartData] = useState([])
  const [range, setRange] = useState("28daysAgo")
  const [tab, setTab] = useState("QUERIES")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeMetrics, setActiveMetrics] = useState({ clicks: true, impressions: true, ctr: false, position: false })
  const [siteUrl, setSiteUrl] = useState("")
  const [user, setUser] = useState(null)
  const [integrationStatus, setIntegrationStatus] = useState({})

  useEffect(() => {
    loadSeo()
  }, [range])

  async function loadSeo() {
    setLoading(true)
    setError(null)

    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) {
      setError("User not logged in")
      setLoading(false)
      return
    }
    setUser(auth.user)

    try {
      const statusRes = await fetch(`/api/search-console/status?userId=${auth.user.id}`)
      const status = await statusRes.json()

      if (!status.siteUrl) {
        setError("No Search Console site selected")
        setLoading(false)
        return
      }
      setSiteUrl(status.siteUrl.replace("sc-domain:", "").trim())

      // Overview
      const overviewRes = await fetch(
        `/api/search-console/seo-summary?userId=${auth.user.id}&siteUrl=${encodeURIComponent(
          status.siteUrl,
        )}&startDate=${range}`,
      )
      const overviewJson = await overviewRes.json()
      setOverview(overviewJson.seo)

      // Queries
      const queryRes = await fetch(
        `/api/search-console/performance?userId=${auth.user.id}&dimension=query&startDate=${range}`,
      )
      const queryJson = await queryRes.json();
      setQueries(queryJson.rows || []);

      // Country
      const countryRes = await fetch(
        `/api/search-console/performance?userId=${auth.user.id}&dimension=country&startDate=${range}`
      )
      const countryJson = await countryRes.json();
      setCountries(countryJson.rows || [])

      // Chart Data
      const chartRes = await fetch(
        `/api/search-console/performance?userId=${auth.user.id}&dimension=date&startDate=${range}`,
      );
      const chartJson = await chartRes.json();
      setChartData(chartJson.rows || []);

      // Fetch GA Status
      const gaStatusRes = await fetch(`/api/google/status?userId=${auth.user.id}`);
      const gaStatusData = await gaStatusRes.json();
      if (gaStatusRes.ok && gaStatusData.connected) {
        setIntegrationStatus(prev => ({...prev, google_analytics: 'connected'}));
      }

      // Fetch SC Status
      if (status.siteUrl) {
        setIntegrationStatus(prev => ({...prev, google_search_console: 'connected'}));
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

      const toggleMetric = (metric) => {
    setActiveMetrics((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount === 1 && prev[metric]) {
        return prev;
      }
      return { ...prev, [metric]: !prev[metric] };
    });
  };

function Integrations({ integrationStatus, googleAuthUrl, googleSearchAuthUrl, stripeAuthUrl }) {
  const buttonStyle = "px-6 py-3 rounded-lg border-2 border-black text-white transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 active:scale-95";

  return (
    <div className="flex justify-center gap-4 mb-8">
      <a
        href={integrationStatus.stripe === 'connected' ? '/dashboard/stripe' : stripeAuthUrl}
        className={`${buttonStyle} tracking-wider text-3xl bg-violet-500 hover:bg-violet-600 focus:ring-violet-300`}
      >
        {integrationStatus.stripe === 'connected' ? 'View Stripe' : 'Connect Stripe'}
      </a>
      <a
        href={integrationStatus.google_search_console === 'connected' ? '/dashboard/seo' : googleSearchAuthUrl}
        className={`${buttonStyle} tracking-wider text-3xl bg-blue-500 hover:bg-blue-600 focus:ring-blue-300`}
      >
        {integrationStatus.google_search_console === 'connected' ? 'View Search Console' : 'Connect Search Console'}
      </a>
      <a
        href={integrationStatus.google_analytics === 'connected' ? '/dashboard/analytics' : googleAuthUrl}
        className={`${buttonStyle} tracking-wider text-3xl  bg-amber-500 hover:bg-amber-600 focus:ring-amber-300`}
      >
        {integrationStatus.google_analytics === 'connected' ? 'View Google Analytics' : 'Connect Google Analytics'}
      </a>
    </div>
  );
}

  if (!overview)
    return (
      <div  className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
            <div className="h-80 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )

  const state = user ? encodeURIComponent(JSON.stringify({ userId: user.id })) : '';

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/analytics.readonly` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`;

  const googleSearchAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_REDIRECT_URI
    )}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(
      "https://www.googleapis.com/auth/webmasters.readonly"
    )}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&include_granted_scopes=true` +
    `&state=${state}`;

  const stripeAuthUrl = user ? `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&user_id=${user.id}` : '#';

  if (error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="min-h-screen bg-white relative">
      {loading && (
        <div className="flex inset-0 absolute z-50 flex-row items-center justify-center">
          <p className="text-2xl font-bold text-black">Loading...</p>
        </div>
      )}
      <div className={`max-w-[1800px] mx-auto px-6 py-8 ${loading ? 'blur-sm' : ''}`}>
        <Integrations 
          integrationStatus={integrationStatus} 
          googleAuthUrl={googleAuthUrl} 
          googleSearchAuthUrl={googleSearchAuthUrl} 
          stripeAuthUrl={stripeAuthUrl} 
        />
        <div className="mb-8">
          <h1 className="text-5xl font-normal text-[#202124] mb-1"><span className="font-bold">{siteUrl}</span> Performance</h1>
          <p className="text-lg text-[#5f6368]">Search results performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 font-bold lg:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Total clicks" value={overview.clicks.toLocaleString()} color="blue" change={overview.clicksChange} active={activeMetrics.clicks} onClick={() => toggleMetric('clicks')} />
          <MetricCard title="Total impressions" value={overview.impressions.toLocaleString()} color="purple" change={overview.impressionsChange} active={activeMetrics.impressions} onClick={() => toggleMetric('impressions')} />
          <MetricCard
            title="Average CTR"
            value={`${(Number.parseFloat(overview.ctr) * 100).toFixed(2)}%`}
            color="green"
            change={overview.ctrChange}
            active={activeMetrics.ctr}
            onClick={() => toggleMetric('ctr')}
          />
          <MetricCard title="Average position" value={Number.parseFloat(overview.position).toFixed(1)} color="orange" change={overview.positionChange} active={activeMetrics.position} onClick={() => toggleMetric('position')} />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-lg text-[#5f6368] font-medium">Date:</span>
          <div className="flex gap-2">
            {DATE_PRESETS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-1.5 rounded-full text-lg border-2 cursor-pointer font-medium transition-all ${
                  range === r.value
                    ? "bg-[#e8f0fe] text-[#1967d2] border border-[#1967d2]"
                    : "bg-white text-[#5f6368] border border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#5f6368]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-lg p-6 mb-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-[#202124] mb-1">Performance over time</h3>
            <p className="text-xs text-[#5f6368]">Total clicks and impressions</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis
                  dataKey="keys[0]"
                  stroke="#5f6368"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis yAxisId="left" label={{ value: 'Clicks', angle: -90, position: 'insideLeft', fill: '#5f6368' }} stroke="#1967d2" />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Impressions', angle: -90, position: 'insideRight', fill: '#5f6368' }} stroke="#8430ce" />
                <YAxis yAxisId="ctr" orientation="right" dataKey="ctr" stroke="#188038" hide={true} />
                <YAxis yAxisId="position" orientation="right" dataKey="position" stroke="#e37400" hide={true} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #dadce0",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#202124", fontWeight: 500 }}
                />
                {activeMetrics.clicks && <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#1967d2" strokeWidth={2} dot={false} />}
                {activeMetrics.impressions && <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#8430ce" strokeWidth={2} dot={false} />}
                {activeMetrics.ctr && <Line yAxisId="ctr" type="monotone" dataKey="ctr" stroke="#188038" strokeWidth={2} dot={false} />}
                {activeMetrics.position && <Line yAxisId="position" type="monotone" dataKey="position" stroke="#e37400" strokeWidth={2} dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>




        <div className="border-b border-[#dadce0] mb-6">
          <div className="flex gap-8">
            {["QUERIES", "PAGES", "COUNTRIES", "DEVICES"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  tab === t ? "text-[#1967d2]" : "text-[#5f6368] hover:text-[#202124]"
                }`}
              >
                {t}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1967d2]"></div>}
              </button>
            ))}
          </div>
        </div>

        {tab === "QUERIES" && (
          <div className="bg-white border border-[#dadce0] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                    <th className="px-6 py-3 text-left text-xl font-medium text-[#5f6368] uppercase tracking-wider">
                      Top queries
                    </th>
                    <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e0e0]">
                  {queries.slice(0, 20).map((q, i) => (
                    <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#202124]">
                        <div className="flex items-center gap-3">
                          <span className="text-[#5f6368] font-mono text-xs">{i + 1}</span>
                          <span className="text-lg font-medium">{q.keys[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xl text-right text-[#202124] font-medium">
                        {q.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-[#5f6368]">{q.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#202124]">{(q.ctr * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-[#202124] font-medium">{q.position.toFixed(1)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {queries.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-[#5f6368]">No query data available for this period</p>
              </div>
            )}
          </div>
        )}

        {tab === "COUNTRIES" && (
  <div className="bg-white border border-[#dadce0] rounded-lg overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <th className="px-6 py-3 text-left text-xl font-medium text-[#5f6368] uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
              Clicks
            </th>
            <th className="px-6 py-3 text-right text-xl font-medium text-[#5f6368] uppercase tracking-wider">
              Impressions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e0e0e0]">
          {countries.slice(0, 20).map((c, i) => (
            <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
              <td className="px-6 py-4 text-sm text-[#202124]">
                <div className="flex items-center gap-3">
                  <span className="text-[#5f6368] font-mono text-xs">
                    {i + 1}
                  </span>
                  {/* <span className="text-lg font-medium">
                    {getCountryName(c.keys[0])}
                  </span> */}
                  <span className="text-xl text-[#00000] uppercase">
                    ({c.keys[0]})
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 text-xl text-right text-[#202124] font-medium">
                {c.clicks.toLocaleString()}
              </td>

              <td className="px-6 py-4 text-xl text-right text-[#5f6368]">
                {c.impressions.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {countries.length === 0 && (
      <div className="py-12 text-center">
        <p className="text-sm text-[#5f6368]">
          No country data available for this period
        </p>
      </div>
    )}
  </div>
)}

        {tab !== "QUERIES" && "COUNTRY" && (
          <div className="bg-white border border-[#dadce0] rounded-lg p-12 text-center">
            <p className="text-sm text-[#5f6368]">{tab} view coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, color, change, active, onClick }) {
  const colorStyles = {
    blue: {
      text: "text-[#1967d2]",
      border: "border-l-[#1967d2]",
      bg: "bg-blue-50",
      darkBg: "bg-blue-100",
    },
    purple: {
      text: "text-[#8430ce]",
      border: "border-l-[#8430ce]",
      bg: "bg-purple-50",
      darkBg: "bg-purple-100",
    },
    green: {
      text: "text-[#188038]",
      border: "border-l-[#188038]",
      bg: "bg-green-50",
      darkBg: "bg-green-100",
    },
    orange: {
      text: "text-[#e37400]",
      border: "border-l-[#e37400]",
      bg: "bg-orange-50",
      darkBg: "bg-orange-100",
    },
  }

  const isPositive = change >= 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border border-transparent border-l-4 ${colorStyles[color].border} ${active ? colorStyles[color].darkBg : colorStyles[color].bg} rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative`}
    >
      <div className={`absolute top-3 right-3 rounded-full h-5 w-5 flex items-center justify-center ${active ? 'bg-white' : 'bg-white border-2 border-black'}`}>
        <svg className={`h-4 w-4 ${active ? colorStyles[color].text : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-5xl font-bold ${colorStyles[color].text} tracking-tight`}>
        {value}
      </p>
      <div className={`flex items-center text-sm tracking-wide mt-2 text-[#5f6368]`}>
        <span className={`${isPositive ? "text-green-600" : "text-red-600"}`}>{isPositive ? "▲" : "▼"} {typeof change === 'number' ? change.toFixed(0) : 0}%</span>
        <span className="ml-1">vs previous</span>
      </div>
    </button>
  )
}
