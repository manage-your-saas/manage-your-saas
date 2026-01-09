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
        dimensions: [{ name: 'deviceCategory' }],
      },
    });

    let activeUsers = 0;
    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    if (response.data && response.data.rows) {
      response.data.rows.forEach(row => {
        const device = row.dimensionValues[0].value.toLowerCase();
        const users = parseInt(row.metricValues[0].value, 10);
        if (Object.prototype.hasOwnProperty.call(deviceBreakdown, device)) {
          deviceBreakdown[device] = users;
        }
        activeUsers += users;
      });
    }

    
    // console.log('GA RAW RESPONSE:', JSON.stringify(response.data, null, 2));


    return NextResponse.json({
      success: true,
      activeUsers,
      deviceBreakdown,
    });

  } catch (err) {
    console.error('ANALYTICS REAL-TIME ERROR:', err);
    return NextResponse.json({ error: 'Failed to load real-time data' }, { status: 500 });
  }
}
