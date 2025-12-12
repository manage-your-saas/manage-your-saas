import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getValidAccessToken } from '@/lib/googleAuth';

/**
 * GET /api/google/sites
 * Fetches the list of Google Search Console sites for the authenticated user
 * 
 * Query parameters:
 * - email: User's email to identify which user's tokens to use
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email parameter is required' },
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

    // Fetch list of sites
    const response = await searchConsole.sites.list();

    // Return the sites list
    return NextResponse.json({
      success: true,
      sites: response.data.siteEntry || [],
    });
  } catch (error) {
    console.error('Error fetching GSC sites:', error);
    
    // Handle specific error cases
    if (error.code === 401) {
      return NextResponse.json(
        { message: 'Authentication failed. Please reconnect your Google account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Failed to fetch Google Search Console sites',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

