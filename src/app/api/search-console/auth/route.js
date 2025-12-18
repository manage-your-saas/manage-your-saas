import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/googleAuth';

/**
 * GET /api/google/auth
 * Initiates Google OAuth2 flow by redirecting user to Google consent screen
 * 
 * Query parameters:
 * - email (optional): User's email to associate with the OAuth session
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Generate state parameter (can include email for session tracking)
    // In production, you should use a secure random string and store it in session
    const state = email ? Buffer.from(email).toString('base64') : null;

    // Get the Google OAuth authorization URL
    const authUrl = getGoogleAuthUrl(state);

    // Redirect user to Google consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { message: 'Failed to initiate Google OAuth', error: error.message },
      { status: 500 }
    );
  }
}