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

    // Generate state parameter (optional - can include email for backward compatibility)
    // If email is provided, include it in state, otherwise let Google provide it
    const state = email ? Buffer.from(email).toString('base64') : null;

    // Get the Google OAuth authorization URL
    // Google will ask user to select their account and grant permissions
    const authUrl = getGoogleAuthUrl(state);

    // Redirect user to Google consent screen
    // Google will show account selection and permission screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { message: 'Failed to initiate Google OAuth', error: error.message },
      { status: 500 }
    );
  }
}

