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
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/joinhere?error=access_denied`
      );
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

    // Extract email from state if provided (base64 encoded)
    let email = null;
    if (state) {
      try {
        email = Buffer.from(state, 'base64').toString('utf-8');
      } catch (e) {
        console.warn('Could not decode state parameter');
      }
    }

    // If no email in state, you might want to get it from Google API
    // For now, we'll create/update user record
    // In production, you'd typically get user info from Google and use their email
    
    // Find or create user
    // Note: In a real app, you'd want to get the user's email from Google's userinfo API
    // For now, we'll use a placeholder or require email to be passed
    if (!email) {
      // You could fetch user info from Google here
      // For now, return error or use a session-based approach
      return NextResponse.json(
        { message: 'User email is required. Please provide email in state parameter.' },
        { status: 400 }
      );
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

    // Redirect to success page or dashboard
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/joinhere?success=connected`
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/joinhere?error=oauth_failed`
    );
  }
}

