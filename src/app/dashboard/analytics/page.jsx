"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Users, 
  Activity, 
  Eye, 
  TrendingUp, 
  Clock,
  Calendar,
  RefreshCw,
  BarChart3,
  Search,
  Globe,
  Zap,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Settings
} from "lucide-react";
import AnalyticsChart from "../../components/AnalyticsChart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "thisWeek" },
  { label: "Last 7 days", value: "7daysAgo" },
  { label: "Last week", value: "lastWeek" },
  { label: "Last 28 days", value: "28daysAgo" },
  { label: "Last 30 days", value: "30daysAgo" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "Last 90 days", value: "90daysAgo" },
  { label: "Quarter to date", value: "quarterToDate" },
  { label: "This year", value: "thisYear" },
];


function MetricCard({ title, value, color, change, isPositive, description }) {
  const colorStyles = {
    blue: { text: "text-[#1967d2]", border: "border-l-[#1967d2]", bg: "bg-blue-200" },
    purple: { text: "text-[#8430ce]", border: "border-l-[#8430ce]", bg: "bg-purple-200" },
    green: { text: "text-[#188038]", border: "border-l-[#188038]", bg: "bg-green-100" },
    orange: { text: "text-[#e37400]", border: "border-l-[#e37400]", bg: "bg-orange-200" },
  };

  const formatValue = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '—';
    if (String(val).includes('%')) return val;
    return val.toLocaleString();
  };

  return (
    <div className={`w-full text-left border border-transparent border-l-4 ${colorStyles[color].border} ${colorStyles[color].bg} rounded-lg p-5 shadow-sm`}>
      <p className="text-xl font-bold text-gray-600 uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-5xl font-bold ${colorStyles[color].text} tracking-tight`}>
        {formatValue(value)}
      </p>
      <div className={`flex items-center text-base tracking-wide mt-2 text-[#5f6368]`}>
        <span className={`${isPositive ? "text-green-600" : "text-red-600"}`}>{isPositive ? "▲" : "▼"} {change}%</span>
        <span className="ml-1">vs previous</span>
      </div>
    </div>
  );
}

function DateRangeSelector({ range, setRange }) {
  return (
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
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
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
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">⚠</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
        <p className="text-sm text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-800 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}


function PerformanceSection({ metrics }) {
  const performanceMetrics = [
    { title: "Total clicks", value: metrics?.clicks, color: "blue", change: 12.5, isPositive: true },
    { title: "Total impressions", value: metrics?.impressions, color: "purple", change: 8.2, isPositive: true },
    { title: "Average CTR", value: `${(metrics?.ctr * 100).toFixed(2)}%`, color: "green", change: -2.1, isPositive: false },
    { title: "Average position", value: metrics?.position?.toFixed(1), color: "orange", change: 0.8, isPositive: true },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </section>
  );
}

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


function EngagementSection({ metrics }) {
  const engagementMetrics = [
    { title: "Engagement Rate", value: metrics?.engagementRate !== undefined ? `${(metrics.engagementRate * 100).toFixed(1)}%` : '—', color: "green", change: 5.2, isPositive: true },
    { title: "Avg. Session Duration", value: metrics?.avgSessionDuration !== undefined ? formatDuration(metrics.avgSessionDuration) : '—', color: "blue", change: 12.8, isPositive: true },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-3xl font-medium text-foreground">Engagement</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {engagementMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </section>
  );
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number') return seconds;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}


export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState("7daysAgo");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState({});
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState([]);

  async function load() {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    setUser(data.user);

    try {
      const res = await fetch(
        `/api/google/analytics?userId=${data.user.id}&startDate=${range}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMetrics(json.metrics);

      // Fetch GA Status
      const gaStatusRes = await fetch(`/api/google/status?userId=${data.user.id}`);
      const gaStatusData = await gaStatusRes.json();
      if (gaStatusRes.ok && gaStatusData.connected) {
        setIntegrationStatus(prev => ({...prev, google_analytics: 'connected'}));
      }

      // Fetch SC Status
      const scStatusRes = await fetch(`/api/search-console/status?userId=${data.user.id}`);
      const scStatusData = await scStatusRes.json();
      if (scStatusRes.ok && scStatusData.siteUrl) { // Note: SC status check for siteUrl
        setIntegrationStatus(prev => ({...prev, google_search_console: 'connected'}));
      }

      // Fetch Chart Data
      const chartRes = await fetch(`/api/google/analytics?userId=${data.user.id}&dimension=date&startDate=${range}`);
      const chartJson = await chartRes.json();
      if (!chartRes.ok) throw new Error(chartJson.error);
      setChartData(chartJson.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [range]);

  if (loading) return <LoadingState />;

  if (error) return <ErrorState error={error} onRetry={load} />;

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

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="min-h-screen bg-white">
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <Integrations 
          integrationStatus={integrationStatus} 
          googleAuthUrl={googleAuthUrl} 
          googleSearchAuthUrl={googleSearchAuthUrl} 
          stripeAuthUrl={stripeAuthUrl} 
        />
        <div className="mb-8">
          <h1 className="text-5xl font-normal text-[#202124] mb-1"><span className="font-bold">Analytics</span> Performance</h1>
          <p className="text-lg text-[#5f6368]">Website traffic and engagement metrics</p>
        </div>
        <PerformanceSection metrics={metrics} />
        <EngagementSection metrics={metrics} /><br />
        <DateRangeSelector range={range} setRange={setRange} />
        <AnalyticsChart chartData={chartData} />
      </main>
    </div>
  );
}
