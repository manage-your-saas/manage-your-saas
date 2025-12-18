'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MetricsChart from '@/components/MetricsChart';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function Integrations({ integrationStatus, googleAuthUrl, googleSearchAuthUrl, stripeAuthUrl }) {
  const buttonStyle = "px-6 py-3 rounded-lg border-0 border-black text-white transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 active:scale-95";

  return (
    <div className="flex justify-center gap-4 mb-8">
      <a
        href={integrationStatus.stripe === 'connected' ? '/dashboard/stripe' : stripeAuthUrl}
        className={`${buttonStyle} tracking-wider text-3xl bg-violet-400 hover:bg-violet-600 focus:ring-violet-300`}
      >
        {integrationStatus.stripe === 'connected' ? 'View Stripe' : 'Connect Stripe'}
      </a>
      <a
        href={integrationStatus.google_search_console === 'connected' ? '/dashboard/seo' : googleSearchAuthUrl}
        className={`${buttonStyle} text-white tracking-wider text-3xl bg-blue-400 hover:bg-blue-600 focus:ring-blue-300`}
      >
        {integrationStatus.google_search_console === 'connected' ? 'View Search Console' : 'Connect Search Console'}
      </a>
      <a
        href={integrationStatus.google_analytics === 'connected' ? '/dashboard/analytics' : googleAuthUrl}
        className={`${buttonStyle} tracking-wider text-3xl  bg-amber-400 hover:bg-amber-600 focus:ring-amber-300`}
      >
        {integrationStatus.google_analytics === 'connected' ? 'View Google Analytics' : 'Connect Google Analytics'}
      </a>
    </div>
  );
}

export default function Stripe() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [user,setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState({
    mrr: 0,
    arr: 0,
    growth: 0,
    monthlyData: [],
    customerCount: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  // const [user, setUser] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
      setUser(auth.user);
      
      // Check if SEO is connected
      const { data: integrationStatus } = await supabase
        .from('user_integrations')
        .select('status')
        .eq('user_id', auth.user.id)
        .eq('integration', 'google_search_console')
        .single();

      // If SEO is not connected, redirect to SEO dashboard
      if (!integrationStatus || integrationStatus.status !== 'connected') {
        window.location.href = '/dashboard/seo';
        return;
      }
      
      // Fetch all data in parallel
      const [analyticsRes, customersRes, subscriptionsRes, invoicesRes] = await Promise.all([
        fetch(`/api/stripe/analytics?userId=${auth.user.id}`),
        fetch(`/api/stripe/customers?userId=${auth.user.id}`),
        fetch(`/api/stripe/subscriptions?userId=${auth.user.id}`),
        fetch(`/api/stripe/invoices?userId=${auth.user.id}`)
      ]);

      const [analyticsData, customersData, subscriptionsData, invoicesData] = await Promise.all([
        analyticsRes.json(),
        customersRes.json(),
        subscriptionsRes.json(),
        invoicesRes.json()
      ]);

      // Fetch GA Status
      const gaStatusRes = await fetch(`/api/google/status?userId=${auth.user.id}`);
      const gaStatusData = await gaStatusRes.json();
      if (gaStatusRes.ok && gaStatusData.connected) {
        setIntegrationStatus(prev => ({...prev, google_analytics: 'connected'}));
      }

      // Fetch SC Status
      const scStatusRes = await fetch(`/api/search-console/status?userId=${auth.user.id}`);
      const scStatusData = await scStatusRes.json();
      if (scStatusRes.ok && scStatusData.siteUrl) {
        setIntegrationStatus(prev => ({...prev, google_search_console: 'connected'}));
      }

      if (analyticsRes.ok && analyticsData) {
        setIntegrationStatus(prev => ({...prev, stripe: 'connected'}));
      }

      // Log the data for debugging
      console.log('Subscriptions:', subscriptionsData);
      console.log('Customers:', customersData);

      if (analyticsData.error) throw new Error(analyticsData.error);
      if (customersData.error) throw new Error(customersData.error);
      if (subscriptionsData.error) throw new Error(subscriptionsData.error);
      if (invoicesData.error) throw new Error(invoicesData.error);

      // Update state with the fetched data
      setAnalytics(analyticsData);
      setSubscriptions(subscriptionsData.subscriptions || []);
      setCustomers(customersData.customers || []);
      setInvoices(invoicesData.invoices || []);

      // Calculate active subscriptions
      const activeSubs = (subscriptionsData.subscriptions || []).filter(
        sub => sub.status === 'active' || sub.status === 'trialing'
      ).length;

      // Update metrics
      setMetrics({
        ...analyticsData,
        customerCount: customersData.customers?.length || 0,
        activeSubscriptions: activeSubs,
        totalRevenue: analyticsData.mrr || 0
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
      <div style={{ fontFamily: "var(--font-story-script)" }}  className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading Revenue data...</p>
        </div>
      </div>
    );
  }

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

  const stripeAuthUrl = user ? `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&state=${state}` : '#';

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    let date;
    // If it's a number, assume it's a Unix timestamp in seconds
    if (typeof dateInput === 'number') {
      // Check if it's in seconds (10 digits) or milliseconds (13 digits)
      date = new Date(dateInput.toString().length === 10 ? dateInput * 1000 : dateInput);
    } else if (typeof dateInput === 'string') {
      // If it's a string, try to parse it as a date
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      // If it's already a Date object, use it directly
      date = dateInput;
    } else {
      return 'Invalid Date';
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Format: MMM DD, YYYY (e.g., Dec 12, 2023)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp * 1000);
    
    // Format: MMM DD, YYYY, hh:mm a (e.g., Dec 12, 2023, 02:30 PM)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'Just now';
  };

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="mt-16 min-h-screen bg-gray-50 p-4 md:p-8">

      <div>
        <Integrations 
          integrationStatus={integrationStatus} 
          googleAuthUrl={googleAuthUrl} 
          googleSearchAuthUrl={googleSearchAuthUrl} 
          stripeAuthUrl={stripeAuthUrl} 
        />
  </div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.monthlyData.length > 0 ? 
                    `$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
                    : '-'}
                </p>
                {metrics.growth !== 0 && (
                  <p className={`text-sm ${metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.growth >= 0 ? '↑' : '↓'} {Math.abs(metrics.growth)}% from last month
                  </p>
                )}
              </div>
            </div>
          </div>

          

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.arr > 0 ? 
                    `$${metrics.arr.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
                    : '-'}
                </p>
                <p className="text-sm text-gray-500">Run Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.customerCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total accounts</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.activeSubscriptions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Active plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* MRR Chart */}
        {metrics.monthlyData.length > 0 && (
          <div className="mb-8">
            <MetricsChart 
              monthlyData={metrics.monthlyData}
              mrr={metrics.mrr}
              growth={metrics.growth}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Invoices
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white text-gray-700 shadow rounded-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {subscriptions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="border-b pb-2">
                    <p className="font-medium">{sub.customer?.name || 'Unknown Customer'}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {formatCurrency(sub.plan.amount / 100, sub.plan.currency)} / {sub.plan.interval}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {formatDate(sub.current_period_end)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Next Billing
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((sub) => {
                    // Find the customer data from the customers array using customer ID or email
                    const customer = typeof sub.customer === 'string' 
                      ? customers.find(c => c.id === sub.customer || c.email === sub.customer_email)
                      : sub.customer;
                      
                    const customerName = customer?.name || sub.customer_email || 'Unknown Customer';
                    const customerEmail = customer?.email || sub.customer_email || '';
                    
                    return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {customerName[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customerName}
                            </div>
                            {customerEmail && (
                              <div className="text-xs text-gray-500">
                                {customerEmail}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(sub.created)}
                              {customer?.created && (
                                <span className="ml-2">• Created {formatTimeAgo(customer.created)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sub.plan?.product?.name || sub.plan?.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.plan?.interval || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(sub.plan.amount / 100, sub.plan.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.plan?.billing_scheme === 'per_unit' ? 'Per unit' : 'Tiered'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sub.status === 'active' || sub.status === 'trialing'
                              ? 'bg-green-100 text-green-800'
                              : sub.status === 'canceled' || sub.status === 'unpaid'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                          {sub.cancel_at_period_end && (
                            <span className="text-xs text-gray-500">
                              Ends {formatDate(sub.cancel_at)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div title={formatDateTime(sub.created)}>
                          {formatDate(sub.created)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.cancel_at_period_end ? (
                          <span className="text-red-500">Ending {formatDate(sub.cancel_at)}</span>
                        ) : (
                          <div title={formatDateTime(sub.current_period_end)}>
                            {formatDate(sub.current_period_end)}
                          </div>
                        )}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          

          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscriptions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const customerSubscriptions = subscriptions.filter(s => s.customer === customer.id);
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {(customer.name || customer.email || '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name || 'Unnamed Customer'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customerSubscriptions.length} active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div title={formatDateTime(customer.created)}>
                            {formatDate(customer.created)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(customer.created)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.number || invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.customer_name || invoice.customer_email || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(invoice.amount_paid / 100, invoice.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}