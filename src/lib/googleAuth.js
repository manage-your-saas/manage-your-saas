import { google } from 'googleapis';

/**
 * Google OAuth2 Configuration
 * Uses environment variables for all credentials
 */
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  NEXTAUTH_URL, // Base URL of your app (e.g., http://localhost:3000)
} = process.env;

// Validate that all required environment variables are set
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn(
    'Warning: Google OAuth credentials are not set. Please add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to your .env.local file'
  );
}

/**
 * Creates and returns a configured Google OAuth2 client
 * This client is used for authentication flows
 */
export function getGoogleOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || `${NEXTAUTH_URL || 'http://localhost:3000'}/api/google/callback`
  );
}

/**
 * Generates the Google OAuth consent URL
 * Users will be redirected here to authorize the app
 * 
 * @param {string} state - Optional state parameter for CSRF protection
 * @returns {string} Authorization URL
 */
export function getGoogleAuthUrl(state = null) {
  const oauth2Client = getGoogleOAuth2Client();
  
  // Define the scopes we need for Google Search Console
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly', // Read-only access to Search Console
  ];

  // Generate the authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh token
    scope: scopes,
    prompt: 'consent', // Force consent screen to ensure we get refresh token
    state: state, // Optional: can be used for CSRF protection
  });

  return authUrl;
}

/**
 * Exchanges authorization code for access and refresh tokens
 * This is called in the OAuth callback after user authorizes
 * 
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} Object containing tokens and expiry info
 */
export async function getTokensFromCode(code) {
  const oauth2Client = getGoogleOAuth2Client();
  
  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date, // Expiration timestamp
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Refreshes an expired access token using the refresh token
 * This function should be called whenever an access token expires
 * 
 * @param {string} refreshToken - The refresh token stored in database
 * @returns {Promise<Object>} New access token and expiry info
 */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const oauth2Client = getGoogleOAuth2Client();
  
  // Set the refresh token on the OAuth client
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    // Request a new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
      // Refresh token might be rotated, so return new one if provided
      refreshToken: credentials.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token. User may need to re-authenticate.');
  }
}

/**
 * Checks if an access token is expired or about to expire
 * 
 * @param {number} expiryDate - Token expiry timestamp in milliseconds
 * @param {number} bufferSeconds - Buffer time in seconds before expiry (default: 60)
 * @returns {boolean} True if token is expired or about to expire
 */
export function isTokenExpired(expiryDate, bufferSeconds = 60) {
  if (!expiryDate) return true;
  
  // Add buffer to refresh slightly before actual expiry
  const expiryTime = expiryDate - bufferSeconds * 1000;
  return Date.now() >= expiryTime;
}

/**
 * Gets a valid access token, refreshing if necessary
 * This is a convenience function that handles token refresh automatically
 * 
 * @param {string} accessToken - Current access token
 * @param {string} refreshToken - Refresh token
 * @param {number} expiryDate - Token expiry timestamp
 * @returns {Promise<Object>} Object with accessToken and refresh info if token was refreshed
 */
export async function getValidAccessToken(accessToken, refreshToken, expiryDate) {
  // Check if token is expired
  if (isTokenExpired(expiryDate)) {
    // Token expired, refresh it
    const refreshed = await refreshAccessToken(refreshToken);
    return {
      accessToken: refreshed.accessToken,
      wasRefreshed: true,
      expiryDate: refreshed.expiryDate,
      refreshToken: refreshed.refreshToken,
    };
  }
  
  // Token is still valid
  return {
    accessToken,
    wasRefreshed: false,
    expiryDate,
    refreshToken,
  };
}

