import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getValidAccessToken } from '@/lib/googleAuth';

/**
 * GET /api/google/seo-summary
 * Fetches aggregated SEO summary metrics for a user's site
 * Perfect for displaying on a dashboard
 * 
 * Query parameters:
 * - email: string (required) - User's email
 * - siteUrl: string (required) - The site URL (e.g., "https://example.com/" or "sc-domain:example.com")
 * - days: number (optional) - Number of days to look back (default: 30)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const siteUrl = searchParams.get('siteUrl');
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Validate required parameters
    if (!email || !siteUrl) {
      return NextResponse.json(
        { 
          message: 'Missing required parameters: email and siteUrl are required' 
        },
        { status: 400 }
      );
    }

    // Calculate date range (last N days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Format dates as YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Connect to database
    await dbConnect();

    // Find user and get their tokens
    const user = await User.findOne({ email });
    
    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { message: 'User not found or not authenticated with Google. Please connect your Google account first.' },
        { status: 401 }
      );
    }

    // Get a valid access token (refresh if needed)
    const tokenResult = await getValidAccessToken(
      user.googleAccessToken,
      user.googleRefreshToken,
      user.tokenExpiry
    );

    // Update token and expiry in database if it was refreshed
    if (tokenResult.wasRefreshed) {
      await User.updateOne(
        { email },
        {
          googleAccessToken: tokenResult.accessToken,
          tokenExpiry: tokenResult.expiryDate,
          googleRefreshToken: tokenResult.refreshToken,
        }
      );
    }

    const accessToken = tokenResult.accessToken;

    // Create OAuth2 client and set credentials
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Create Search Console API client
    const searchConsole = google.webmasters({
      version: 'v3',
      auth: oauth2Client,
    });

    // Fetch search analytics data (aggregated, no dimensions for summary)
    const response = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        rowLimit: 1, // We only need aggregated totals
      },
    });

    // Extract summary metrics from response
    const data = response.data;
    const rows = data.rows || [];
    
    // Calculate totals and averages
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalCTR = 0;
    let totalPosition = 0;
    let rowCount = rows.length;

    rows.forEach((row) => {
      totalClicks += parseInt(row.clicks || 0, 10);
      totalImpressions += parseInt(row.impressions || 0, 10);
      totalCTR += parseFloat(row.ctr || 0);
      totalPosition += parseFloat(row.position || 0);
    });

    // Calculate averages
    const averageCTR = rowCount > 0 ? totalCTR / rowCount : 0;
    const averagePosition = rowCount > 0 ? totalPosition / rowCount : 0;

    // Return formatted SEO summary
    return NextResponse.json({
      success: true,
      siteUrl,
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        days,
      },
      summary: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: parseFloat(averageCTR.toFixed(4)), // CTR as decimal (e.g., 0.0234 = 2.34%)
        ctrPercentage: parseFloat((averageCTR * 100).toFixed(2)), // CTR as percentage
        averagePosition: parseFloat(averagePosition.toFixed(2)),
        rowCount,
      },
      // Include raw data if needed
      rawData: data,
    });
  } catch (error) {
    console.error('Error fetching SEO summary:', error);
    
    // Handle specific error cases
    if (error.code === 401) {
      return NextResponse.json(
        { message: 'Authentication failed. Please reconnect your Google account.' },
        { status: 401 }
      );
    }

    if (error.code === 403) {
      return NextResponse.json(
        { message: 'Access denied. Make sure you have access to this site in Google Search Console.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Failed to fetch SEO summary',
        error: error.message,
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}

