import { NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/google/callback
 * OAuth2 callback endpoint that receives authorization code from Google
 * Exchanges the code for access_token and refresh_token, then stores them
 * 
 * Query parameters:
 * - code: Authorization code from Google
 * - state: Optional state parameter (can contain user email)
 * - error: Error code if user denied access
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check if user denied access
    if (error) {
      // Try to get email from state to redirect back to SEO page
      let email = null;
      if (state) {
        try {
          email = Buffer.from(state, 'base64').toString('utf-8');
        } catch (e) {
          console.warn('Could not decode state parameter');
        }
      }
      const redirectUrl = email 
        ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/seo?email=${encodeURIComponent(email)}&error=access_denied`
        : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/seo?error=access_denied`;
      return NextResponse.redirect(redirectUrl);
    }

    // Validate that we received an authorization code
    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const { accessToken, refreshToken, expiryDate } = await getTokensFromCode(code);

    // Connect to database
    await dbConnect();

    // Get user's email from Google using the access token
    let email = null;
    
    // First, try to get email from state if provided (for backward compatibility)
    if (state) {
      try {
        email = Buffer.from(state, 'base64').toString('utf-8');
      } catch (e) {
        console.warn('Could not decode state parameter');
      }
    }

    // If no email from state, fetch it from Google's userinfo API
    if (!email) {
      try {
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: accessToken,
        });

        // Fetch user info from Google
        const oauth2 = google.oauth2({
          auth: oauth2Client,
          version: 'v2',
        });

        const userInfo = await oauth2.userinfo.get();
        email = userInfo.data.email;

        if (!email) {
          throw new Error('Could not retrieve email from Google account');
        }

        console.log('Retrieved email from Google:', email);
      } catch (error) {
        console.error('Error fetching user email from Google:', error);
        return NextResponse.json(
          { message: 'Failed to retrieve email from Google account. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Update or create user with tokens
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        tokenExpiry: expiryDate,
      },
      { upsert: true, new: true }
    );

    // Redirect to SEO dashboard with email
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/seo?email=${encodeURIComponent(email)}&connected=true`
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/seo?error=oauth_failed`
    );
  }
}

