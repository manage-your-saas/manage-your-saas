'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * SEO Dashboard Component
 * Displays Google Search Console SEO metrics for the user's SaaS site
 */
export default function SEODashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [seoData, setSeoData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [days, setDays] = useState(30);

  // Check if user is connected to Google
  useEffect(() => {
    if (email) {
      checkConnection();
    }
  }, [email]);

  // Fetch sites when user is connected
  useEffect(() => {
    if (isConnected && email) {
      fetchSites();
    }
  }, [isConnected, email]);

  // Fetch SEO data when site is selected
  useEffect(() => {
    if (selectedSite && email) {
      fetchSEOSummary();
    }
  }, [selectedSite, email, days]);

  /**
   * Check if user has connected their Google account
   */
  const checkConnection = async () => {
    try {
      const response = await fetch(`/api/google/sites?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        setIsConnected(true);
      } else if (response.status === 401) {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    }
  };

  /**
   * Fetch list of sites from Google Search Console
   */
  const fetchSites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/google/sites?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sites');
      }

      setSites(data.sites || []);
      // Auto-select first site if available
      if (data.sites && data.sites.length > 0 && !selectedSite) {
        setSelectedSite(data.sites[0].siteUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch SEO summary data for selected site
   */
  const fetchSEOSummary = async () => {
    if (!selectedSite) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/google/seo-summary?email=${encodeURIComponent(email)}&siteUrl=${encodeURIComponent(selectedSite)}&days=${days}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch SEO data');
      }

      setSeoData(data);
    } catch (err) {
      setError(err.message);
      setSeoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connect Google account - redirect to OAuth
   */
  const connectGoogle = () => {
    window.location.href = `/api/google/auth?email=${encodeURIComponent(email)}`;
  };

  // If no email provided, show error
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Required</h2>
          <p className="text-gray-600 mb-6">Please provide your email address to view SEO data.</p>
          <button
            onClick={() => router.push('/joinhere')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  // If not connected to Google, show connect button
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Google Search Console</h2>
          <p className="text-gray-600 mb-6">
            Connect your Google Search Console account to view SEO metrics for your SaaS site.
          </p>
          <button
            onClick={connectGoogle}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Connect Google Account
          </button>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium block w-full"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-gray-600">Monitor your SaaS site&apos;s search performance</p>
        </div>

        {/* Site Selection */}
        {sites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Site
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {sites.map((site) => (
                <option key={site.siteUrl} value={site.siteUrl}>
                  {site.siteUrl} {site.permissionLevel ? `(${site.permissionLevel})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Selector */}
        {selectedSite && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600">Loading SEO data...</p>
          </div>
        )}

        {/* SEO Metrics Cards */}
        {seoData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Clicks Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Clicks</div>
              <div className="text-3xl font-bold text-gray-900">
                {seoData.summary.clicks.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {seoData.period.days} days
              </div>
            </div>

            {/* Impressions Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Impressions</div>
              <div className="text-3xl font-bold text-gray-900">
                {seoData.summary.impressions.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {seoData.period.days} days
              </div>
            </div>

            {/* CTR Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Click-Through Rate</div>
              <div className="text-3xl font-bold text-gray-900">
                {seoData.summary.ctrPercentage.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Average CTR
              </div>
            </div>

            {/* Position Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Average Position</div>
              <div className="text-3xl font-bold text-gray-900">
                {seoData.summary.averagePosition.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Search ranking
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {seoData && !isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Period Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Start Date:</span>
                <span className="ml-2 font-medium">{seoData.period.startDate}</span>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <span className="ml-2 font-medium">{seoData.period.endDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Site URL:</span>
                <span className="ml-2 font-medium break-all">{seoData.siteUrl}</span>
              </div>
              <div>
                <span className="text-gray-500">Data Points:</span>
                <span className="ml-2 font-medium">{seoData.summary.rowCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

