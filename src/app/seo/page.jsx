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
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is connected to Google
  useEffect(() => {
    console.log('SEO Page mounted/updated. Email:', email);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    // If email is provided, check connection
    // If not, we'll wait for user to connect (email will come from Google)
    if (email) {
      console.log('Email found, checking connection...');
      checkConnection();
    } else {
      console.log('No email provided in URL - user can still connect via Google OAuth');
      // Don't check connection if no email - user needs to connect first
      setIsConnected(false);
    }
    
    // Check for success/error messages from URL params
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (connected === 'true') {
      console.log('Connection successful!');
      setSuccessMessage('Successfully connected to Google Search Console!');
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } else if (error) {
      console.log('Error from URL:', error);
      setError(error === 'access_denied' 
        ? 'Access was denied. Please try again and grant the necessary permissions.'
        : 'Failed to connect. Please try again.');
    }
  }, [email, searchParams]);

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
    console.log('Checking connection for email:', email);
    try {
      const url = `/api/google/sites?email=${encodeURIComponent(email)}`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      console.log('Connection check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connection check response:', data);
        setIsConnected(true);
      } else if (response.status === 401) {
        console.log('Not connected (401)');
        setIsConnected(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Connection check failed:', response.status, errorData);
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
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

      console.log('Sites fetched:', data.sites);
      setSites(data.sites || []);
      // Auto-select first site if available
      if (data.sites && data.sites.length > 0 && !selectedSite) {
        setSelectedSite(data.sites[0].siteUrl);
      } else if (data.sites && data.sites.length === 0) {
        setError('No sites found in your Google Search Console. Please verify at least one site in Google Search Console first.');
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError(err.message || 'Failed to fetch sites. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch SEO summary data for selected site
   */
  const fetchSEOSummary = async () => {
    if (!selectedSite) {
      console.log('No site selected, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching SEO data for:', selectedSite, 'days:', days);
      const response = await fetch(
        `/api/google/seo-summary?email=${encodeURIComponent(email)}&siteUrl=${encodeURIComponent(selectedSite)}&days=${days}`
      );
      const data = await response.json();

      console.log('SEO data response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch SEO data');
      }

      // Check if there's actually data
      if (data.summary && data.summary.rowCount === 0) {
        // Still set the data so we can show "no data" message properly
        setSeoData(data);
        if (data.message) {
          // Don't show as error, just informational
          console.log('No data available:', data.message);
        }
      } else {
        setSeoData(data);
        console.log('SEO data loaded successfully:', data.summary);
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err);
      setError(err.message || 'Failed to fetch SEO data. Please try again.');
      setSeoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connect Google account - redirect to OAuth
   * Email will be automatically retrieved from Google during OAuth
   */
  const connectGoogle = () => {
    // No email needed - Google will provide it during OAuth
    window.location.href = '/api/google/auth';
  };

  // If no email provided, still allow connection (email will come from Google)
  // But show a note that email will be retrieved automatically

  // If not connected to Google, show connect button
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Google Search Console</h2>
          <p className="text-gray-600 mb-6">
            Connect your Google Search Console account to view SEO metrics for your SaaS site.
          </p>
          {!email && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <p>ℹ️ Google will ask you to select your account. Your email will be automatically retrieved.</p>
            </div>
          )}
          <button
            onClick={connectGoogle}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium w-full"
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
        {/* Debug Info - Remove in production */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-xs">
          <strong>Debug Info:</strong> Email: {email || 'NOT PROVIDED'} | 
          Connected: {isConnected ? 'Yes' : 'No'} | 
          Sites: {sites.length} | 
          Selected: {selectedSite || 'None'} | 
          Loading: {isLoading ? 'Yes' : 'No'} | 
          Has Data: {seoData ? 'Yes' : 'No'}
        </div>

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
          {email && (
            <p className="text-sm text-gray-500 mt-2">Logged in as: {email}</p>
          )}
        </div>

        {/* Site Selection */}
        {sites.length > 0 ? (
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
        ) : (
          !isLoading && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">No sites found in Google Search Console.</p>
              <p className="text-sm mt-1">Make sure you have verified at least one site in Google Search Console.</p>
            </div>
          )
        )}

        {/* Date Range Selector */}
        {selectedSite && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={days}
              onChange={(e) => {
                const newDays = parseInt(e.target.value, 10);
                console.log('Days changed to:', newDays);
                setDays(newDays);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={() => {
                console.log('Manual refresh clicked');
                fetchSEOSummary();
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              🔄 Refresh Data
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading SEO data...</p>
          </div>
        )}

        {/* No Data Message */}
        {!isLoading && selectedSite && seoData && seoData.summary && seoData.summary.rowCount === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              There&apos;s no search data for the selected period. This could mean:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto mb-4">
              <li>• Your site is new and hasn&apos;t received search traffic yet</li>
              <li>• Search Console data has a 2-3 day delay</li>
              <li>• No one has searched for your content in this period</li>
            </ul>
            <p className="text-sm text-gray-500">
              Try selecting a longer time period (90 days) or check back in a few days.
            </p>
          </div>
        )}

        {/* No Site Selected Message */}
        {!isLoading && !selectedSite && sites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600">Please select a site from the dropdown above to view SEO data.</p>
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

