import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const analyticsdata = google.analyticsdata('v1beta');

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: accountData, error: accountError } = await supabase
      .from('analytics_accounts')
      .select('google_refresh_token, google_property_id')
      .eq('user_id', userId)
      .single();

    if (accountError || !accountData?.google_refresh_token || !accountData?.google_property_id) {
      return NextResponse.json({ error: 'Google Analytics not connected or property not selected' }, { status: 400 });
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: accountData.google_refresh_token,
    });

    const response = await analyticsdata.properties.runRealtimeReport({
      property: `properties/${accountData.google_property_id}`,
      auth: auth,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
      },
    });

    const activeUsers = response.data?.rows?.[0]?.metricValues?.[0]?.value || '0';

    return NextResponse.json({
      success: true,
      activeUsers: parseInt(activeUsers, 10),
    });

  } catch (err) {
    console.error('ANALYTICS REAL-TIME ERROR:', err);
    return NextResponse.json({ error: 'Failed to load real-time data' }, { status: 500 });
  }
}
