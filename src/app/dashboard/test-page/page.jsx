"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Line as LineJS } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJsTooltip,
  Legend,
  Filler
} from 'chart.js';
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
import MetricsChart from '@/components/MetricsChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJsTooltip,
  Legend,
  Filler
);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Main Dashboard Component
export default function TestPageDashboard() {
  const [mainTab, setMainTab] = useState('SEO');
  const [user, setUser] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const [gaStatusRes, scStatusRes] = await Promise.all([
            fetch(`/api/google/status?userId=${data.user.id}`),
            fetch(`/api/search-console/status?userId=${data.user.id}`)
        ]);
        const gaStatusData = await gaStatusRes.json();
        const scStatusData = await scStatusRes.json();
        let status = {};
        if(gaStatusRes.ok && gaStatusData.connected) status.google_analytics = 'connected';
        if(scStatusRes.ok && scStatusData.siteUrl) status.google_search_console = 'connected';
        setIntegrationStatus(status);
      }
      setLoading(false);
    };
    init();
  }, []);

  const state = user ? encodeURIComponent(JSON.stringify({ userId: user.id })) : '';
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_REDIRECT_URI)}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&access_type=offline&prompt=consent&state=${state}`;
  const googleSearchAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/webmasters.readonly")}&access_type=offline&prompt=consent&include_granted_scopes=true&state=${state}`;
  const stripeAuthUrl = user ? `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&user_id=${user.id}` : '#';

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="min-h-screen bg-white">
        <Integrations integrationStatus={integrationStatus} googleAuthUrl={googleAuthUrl} googleSearchAuthUrl={googleSearchAuthUrl} stripeAuthUrl={stripeAuthUrl} />
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 justify-center">
                <button onClick={() => setMainTab('SEO')} className={`${mainTab === 'SEO' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>SEO</button>
                <button onClick={() => setMainTab('Analytics')} className={`${mainTab === 'Analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Analytics</button>
                <button onClick={() => setMainTab('Stripe')} className={`${mainTab === 'Stripe' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Stripe</button>
            </nav>
        </div>
        <div>
            {mainTab === 'SEO' && <SeoSection user={user} />}
            {mainTab === 'Analytics' && <AnalyticsSection user={user} />}
            {mainTab === 'Stripe' && <StripeSection user={user} />}
        </div>
    </div>
  );
}

const SeoSection = ({ user }) => {
  const [overview, setOverview] = useState(null);
  const [queries, setQueries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState("28daysAgo");
  const [tab, setTab] = useState("QUERIES");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetrics, setActiveMetrics] = useState({ clicks: true, impressions: true, ctr: false, position: false });
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    if (user) loadSeo();
  }, [range, user]);

  async function loadSeo() {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await fetch(`/api/search-console/status?userId=${user.id}`);
      const status = await statusRes.json();
      if (!status.siteUrl) {
        setError("No Search Console site selected");
        setLoading(false);
        return;
      }
      setSiteUrl(status.siteUrl.replace("sc-domain:", "").trim());

      const [overviewRes, queryRes, countryRes, chartRes] = await Promise.all([
        fetch(`/api/search-console/seo-summary?userId=${user.id}&siteUrl=${encodeURIComponent(status.siteUrl)}&startDate=${range}`),
        fetch(`/api/search-console/performance?userId=${user.id}&dimension=query&startDate=${range}`),
        fetch(`/api/search-console/performance?userId=${user.id}&dimension=country&startDate=${range}`),
        fetch(`/api/search-console/performance?userId=${user.id}&dimension=date&startDate=${range}`)
      ]);

      const overviewJson = await overviewRes.json();
      const queryJson = await queryRes.json();
      const countryJson = await countryRes.json();
      const chartJson = await chartRes.json();

      setOverview(overviewJson.seo);
      setQueries(queryJson.rows || []);
      setCountries(countryJson.rows || []);
      setChartData(chartJson.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleMetric = (metric) => {
    setActiveMetrics((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount === 1 && prev[metric]) return prev;
      return { ...prev, [metric]: !prev[metric] };
    });
  };

  if (loading) return <div className="text-center p-8">Loading SEO Data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!overview) return <div className="text-center p-8">No SEO data available.</div>;

  return (
    <div className={`max-w-[1800px] mx-auto px-6 py-8`}>
      <div className="mb-8">
        <h1 className="text-5xl font-normal text-[#202124] mb-1"><span className="font-bold">{siteUrl}</span> Performance</h1>
        <p className="text-lg text-[#5f6368]">Search results performance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 font-bold lg:grid-cols-4 gap-4 mb-6">
        <SeoMetricCard title="Total clicks" value={overview.clicks.toLocaleString()} color="blue" change={overview.clicksChange} active={activeMetrics.clicks} onClick={() => toggleMetric('clicks')} />
        <SeoMetricCard title="Total impressions" value={overview.impressions.toLocaleString()} color="purple" change={overview.impressionsChange} active={activeMetrics.impressions} onClick={() => toggleMetric('impressions')} />
        <SeoMetricCard title="Average CTR" value={`${(Number.parseFloat(overview.ctr) * 100).toFixed(2)}%`} color="green" change={overview.ctrChange} active={activeMetrics.ctr} onClick={() => toggleMetric('ctr')} />
        <SeoMetricCard title="Average position" value={Number.parseFloat(overview.position).toFixed(1)} color="orange" change={overview.positionChange} active={activeMetrics.position} onClick={() => toggleMetric('position')} />
      </div>
      <div className="h-[400px] bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
        <MetricsChart
          data={chartData}
          metrics={activeMetrics}
          onMetricChange={toggleMetric}
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab('QUERIES')} className={`px-6 py-3 font-medium text-sm ${tab === 'QUERIES' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>QUERIES</button>
          <button onClick={() => setTab('COUNTRIES')} className={`px-6 py-3 font-medium text-sm ${tab === 'COUNTRIES' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>COUNTRIES</button>
        </div>
        {tab === 'QUERIES' && <DataTable data={queries} headers={['Query', 'Clicks', 'Impressions', 'CTR', 'Position']} />}
        {tab === 'COUNTRIES' && <DataTable data={countries} headers={['Country', 'Clicks', 'Impressions', 'CTR', 'Position']} />}
      </div>
    </div>
  );
}

const AnalyticsSection = ({ user }) => {
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState("7daysAgo");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if(user) load();
  }, [range, user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [res, chartRes] = await Promise.all([
        fetch(`/api/google/analytics?userId=${user.id}&startDate=${range}`),
        fetch(`/api/google/analytics?userId=${user.id}&dimension=date&startDate=${range}`)
      ]);
      const json = await res.json();
      const chartJson = await chartRes.json();
      if (!res.ok) throw new Error(json.error);
      if (!chartRes.ok) throw new Error(chartJson.error);
      setMetrics(json.metrics);
      setChartData(chartJson.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center p-8">Loading Analytics Data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-normal text-[#202124] mb-1"><span className="font-bold">Analytics</span> Performance</h1>
          <p className="text-lg text-[#5f6368]">Website traffic and engagement metrics</p>
        </div>
        <PerformanceSection metrics={metrics} />
        <EngagementSection metrics={metrics} /><br />
        <AnalyticsDateRangeSelector range={range} setRange={setRange} />
        <AnalyticsChart chartData={chartData} />
    </div>
  );
}

const StripeSection = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({ mrr: 0, arr: 0, growth: 0, monthlyData: [], customerCount: 0, activeSubscriptions: 0, totalRevenue: 0 });
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if(user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, customersRes, subscriptionsRes, invoicesRes] = await Promise.all([
        fetch('/api/stripe/analytics'),
        fetch('/api/stripe/customers'),
        fetch('/api/stripe/subscriptions'),
        fetch('/api/stripe/invoices')
      ]);
      const [analyticsData, customersData, subscriptionsData, invoicesData] = await Promise.all([ analyticsRes.json(), customersRes.json(), subscriptionsRes.json(), invoicesRes.json() ]);
      if (analyticsData.error) throw new Error(analyticsData.error);
      setSubscriptions(subscriptionsData.subscriptions || []);
      setCustomers(customersData.customers || []);
      setInvoices(invoicesData.invoices || []);
      const activeSubs = (subscriptionsData.subscriptions || []).filter(sub => sub.status === 'active' || sub.status === 'trialing').length;
      setMetrics({ ...analyticsData, customerCount: customersData.customers?.length || 0, activeSubscriptions: activeSubs, totalRevenue: analyticsData.mrr || 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading Stripe Data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Stripe Dashboard</h1>
      <StripeNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-8">
        {activeTab === 'overview' && <StripeOverview metrics={metrics} />}
        {activeTab === 'customers' && <StripeCustomersTable customers={customers} />}
        {activeTab === 'subscriptions' && <StripeSubscriptionsTable subscriptions={subscriptions} />}
        {activeTab === 'invoices' && <StripeInvoicesTable invoices={invoices} />}
      </div>
    </div>
  );
}

const analyticsDatePresets = [ { label: "Today", value: "today" }, { label: "Yesterday", value: "yesterday" }, { label: "This week", value: "thisWeek" }, { label: "Last 7 days", value: "7daysAgo" }, { label: "Last week", value: "lastWeek" }, { label: "Last 28 days", value: "28daysAgo" }, { label: "Last 30 days", value: "30daysAgo" }, { label: "This month", value: "thisMonth" }, { label: "Last month", value: "lastMonth" }, { label: "Last 90 days", value: "90daysAgo" }, { label: "Quarter to date", value: "quarterToDate" }, { label: "This year", value: "thisYear" } ];

function AnalyticsDateRangeSelector({ range, setRange }) {
  return (
    <div className="mb-6 flex items-center gap-3 flex-wrap">
      {analyticsDatePresets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => setRange(preset.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${ range === preset.value ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300" }`}>
          {preset.label}
        </button>
      ))}
    </div>
  );
}

function PerformanceSection({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AnalyticsMetricCard title="Active Users" value={metrics?.activeUsers} color="blue" change={metrics?.activeUsersChange} isPositive={metrics?.activeUsersChange >= 0} />
      <AnalyticsMetricCard title="New Users" value={metrics?.newUsers} color="purple" change={metrics?.newUsersChange} isPositive={metrics?.newUsersChange >= 0} />
      <AnalyticsMetricCard title="Total Sessions" value={metrics?.sessions} color="green" change={metrics?.sessionsChange} isPositive={metrics?.sessionsChange >= 0} />
      <AnalyticsMetricCard title="Views" value={metrics?.screenPageViews} color="orange" change={metrics?.screenPageViewsChange} isPositive={metrics?.screenPageViewsChange >= 0} />
    </div>
  );
}

function EngagementSection({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AnalyticsMetricCard title="Engagement Rate" value={`${metrics?.engagementRate ? (metrics.engagementRate * 100).toFixed(2) + '%' : 'N/A'}`} color="blue" change={metrics?.engagementRateChange} isPositive={metrics?.engagementRateChange >= 0} />
      <AnalyticsMetricCard title="Avg. Engagement Time" value={`${metrics?.averageSessionDuration ? metrics.averageSessionDuration.toFixed(2) + 's' : 'N/A'}`} color="purple" change={metrics?.averageSessionDurationChange} isPositive={metrics?.averageSessionDurationChange >= 0} />
      <AnalyticsMetricCard title="Conversions" value={metrics?.conversions} color="green" change={metrics?.conversionsChange} isPositive={metrics?.conversionsChange >= 0} />
      <AnalyticsMetricCard title="Event Count" value={metrics?.eventCount} color="orange" change={metrics?.eventCountChange} isPositive={metrics?.eventCountChange >= 0} />
    </div>
  );
}

function AnalyticsMetricCard({ title, value, color, change, isPositive }) {
  const colorStyles = { blue: { text: "text-[#1967d2]", border: "border-l-[#1967d2]", bg: "bg-blue-200" }, purple: { text: "text-[#8430ce]", border: "border-l-[#8430ce]", bg: "bg-purple-200" }, green: { text: "text-[#188038]", border: "border-l-[#188038]", bg: "bg-green-100" }, orange: { text: "text-[#e37400]", border: "border-l-[#e37400]", bg: "bg-orange-200" } };
  const formatValue = (val) => { if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) return '—'; if (String(val).includes('%')) return val; return typeof val === 'number' ? val.toLocaleString() : val; };
  return (
    <div className={`w-full text-left border border-transparent border-l-4 ${colorStyles[color].border} ${colorStyles[color].bg} rounded-lg p-5 shadow-sm`}>
      <p className="text-xl font-bold text-gray-600 uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-5xl font-bold ${colorStyles[color].text} tracking-tight`}>{formatValue(value)}</p>
      <div className={`flex items-center text-base tracking-wide mt-2 text-[#5f6368]`}><span className={`${isPositive ? "text-green-600" : "text-red-600"}`}>{isPositive ? "▲" : "▼"} {change}%</span><span className="ml-1">vs previous</span></div>
    </div>
  );
}

function SeoMetricCard({ title, value, color, change, active, onClick }) {
  const colorStyles = { blue: { text: "text-[#1967d2]", border: "border-l-[#1967d2]", bg: "bg-blue-50", darkBg: "bg-blue-100" }, purple: { text: "text-[#8430ce]", border: "border-l-[#8430ce]", bg: "bg-purple-50", darkBg: "bg-purple-100" }, green: { text: "text-[#188038]", border: "border-l-[#188038]", bg: "bg-green-50", darkBg: "bg-green-100" }, orange: { text: "text-[#e37400]", border: "border-l-[#e37400]", bg: "bg-orange-50", darkBg: "bg-orange-100" } };
  const isPositive = change >= 0;
  return (
    <button onClick={onClick} className={`w-full text-left border border-transparent border-l-4 ${colorStyles[color].border} ${active ? colorStyles[color].darkBg : colorStyles[color].bg} rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative`}>
      <div className={`absolute top-3 right-3 rounded-full h-5 w-5 flex items-center justify-center ${active ? 'bg-white' : 'bg-white border-2 border-black'}`}><svg className={`h-4 w-4 ${active ? colorStyles[color].text : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
      <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-5xl font-bold ${colorStyles[color].text} tracking-tight`}>{value}</p>
      <div className={`flex items-center text-sm tracking-wide mt-2 text-[#5f6368]`}><span className={`${isPositive ? "text-green-600" : "text-red-600"}`}>{isPositive ? "▲" : "▼"} {typeof change === 'number' ? change.toFixed(0) : 0}%</span><span className="ml-1">vs previous</span></div>
    </button>
  );
}

function StripeNav({ activeTab, setActiveTab }) {
  const navItems = ['overview', 'customers', 'subscriptions', 'invoices'];
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`${activeTab === item ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

function StripeOverview({ metrics }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StripeMetric title="Total Revenue" value={`$${(metrics.totalRevenue / 100).toLocaleString()}`} />
        <StripeMetric title="MRR" value={`$${(metrics.mrr / 100).toLocaleString()}`} />
        <StripeMetric title="Active Subscriptions" value={metrics.activeSubscriptions} />
        <StripeMetric title="Customer Count" value={metrics.customerCount} />
      </div>
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">MRR Growth</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 100).toLocaleString()}`} />
              <Line type="monotone" dataKey="mrr" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StripeMetric({ title, value }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StripeCustomersTable({ customers }) {
  return <StripeDataTable data={customers} headers={['Name', 'Email', 'Created']} formatRow={(c) => [c.name, c.email, new Date(c.created * 1000).toLocaleDateString()]} />;
}

function StripeSubscriptionsTable({ subscriptions }) {
  return <StripeDataTable data={subscriptions} headers={['Status', 'Items', 'Current Period']} formatRow={(s) => [s.status, s.items.data.length, `${new Date(s.current_period_start * 1000).toLocaleDateString()} - ${new Date(s.current_period_end * 1000).toLocaleDateString()}`]} />;
}

function StripeInvoicesTable({ invoices }) {
  return <StripeDataTable data={invoices} headers={['Status', 'Amount', 'Date', 'Customer']} formatRow={(i) => [i.status, `$${(i.amount_paid / 100).toLocaleString()}`, new Date(i.created * 1000).toLocaleDateString(), i.customer_email]} />;
}

function StripeDataTable({ data, headers, formatRow }) {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {headers.map(header => <th key={header} scope="col" className="py-3 px-6">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              {formatRow(item).map((cell, i) => <td key={i} className="py-4 px-6">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataTable({ data, headers }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {headers.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              {Object.values(row).map((value, i) => <td key={i} className="px-6 py-4">{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Integrations({ integrationStatus, googleAuthUrl, googleSearchAuthUrl, stripeAuthUrl }) {
  const buttonStyle = "px-6 py-3 rounded-lg border-2 border-black text-white transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 active:scale-95";
  return (
    <div className="flex justify-center gap-4 my-8">
      <a href={integrationStatus.stripe === 'connected' ? '/dashboard/stripe' : stripeAuthUrl} className={`${buttonStyle} tracking-wider text-3xl bg-violet-500 hover:bg-violet-600 focus:ring-violet-300`}>{integrationStatus.stripe === 'connected' ? 'View Stripe' : 'Connect Stripe'}</a>
      <a href={integrationStatus.google_search_console === 'connected' ? '/dashboard/seo' : googleSearchAuthUrl} className={`${buttonStyle} tracking-wider text-3xl bg-blue-500 hover:bg-blue-600 focus:ring-blue-300`}>{integrationStatus.google_search_console === 'connected' ? 'View Search Console' : 'Connect Search Console'}</a>
      <a href={integrationStatus.google_analytics === 'connected' ? '/dashboard/analytics' : googleAuthUrl} className={`${buttonStyle} tracking-wider text-3xl bg-amber-500 hover:bg-amber-600 focus:ring-amber-300`}>{integrationStatus.google_analytics === 'connected' ? 'View Google Analytics' : 'Connect Google Analytics'}</a>
    </div>
  );
}
