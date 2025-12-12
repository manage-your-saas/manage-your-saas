import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getValidAccessToken } from '@/lib/googleAuth';

/**
 * POST /api/google/analytics
 * Fetches Search Analytics data from Google Search Console
 * 
 * Request body:
 * {
 *   email: string (required) - User's email
 *   siteUrl: string (required) - The site URL (e.g., "https://example.com/" or "sc-domain:example.com")
 *   startDate: string (required) - Start date in YYYY-MM-DD format
 *   endDate: string (required) - End date in YYYY-MM-DD format
 *   dimensions: string[] (optional) - Array of dimensions: "country", "device", "page", "query", "searchAppearance"
 *   filters: object (optional) - Filter object with dimension, operator, and expression
 *   rowLimit: number (optional) - Maximum number of rows to return (default: 1000, max: 25000)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      siteUrl,
      startDate,
      endDate,
      dimensions = [],
      filters = null,
      rowLimit = 1000,
    } = body;

    // Validate required parameters
    if (!email || !siteUrl || !startDate || !endDate) {
      return NextResponse.json(
        { 
          message: 'Missing required parameters: email, siteUrl, startDate, and endDate are required' 
        },
        { status: 400 }
      );
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { message: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

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
          googleRefreshToken: tokenResult.refreshToken, // Update if rotated
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

    // Prepare the request payload
    const requestBody = {
      startDate,
      endDate,
      dimensions: dimensions.length > 0 ? dimensions : undefined,
      rowLimit: Math.min(rowLimit, 25000), // Cap at API maximum
    };

    // Add filters if provided
    // Filters format: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
    if (filters && Array.isArray(filters) && filters.length > 0) {
      requestBody.dimensionFilterGroups = [
        {
          filters: filters,
        },
      ];
    }

    // Fetch search analytics data
    const response = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: requestBody,
    });

    // Return the analytics data
    return NextResponse.json({
      success: true,
      data: response.data,
      // Include metadata
      siteUrl,
      startDate,
      endDate,
      rowCount: response.data.rows?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching Search Analytics:', error);
    
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
        message: 'Failed to fetch Search Analytics data',
        error: error.message,
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}

