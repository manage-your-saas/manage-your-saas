import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // 1️⃣ Supabase (service role for backend)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2️⃣ Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Get this user's GA credentials
    const { data: account, error } = await supabase
      .from("analytics_accounts")
      .select("google_refresh_token, google_property_id")
      .eq("user_id", user.id)
      .single();

    if (error || !account) {
      return NextResponse.json(
        { error: "Google Analytics not connected" },
        { status: 400 }
      );
    }

    if (!account.google_property_id) {
      return NextResponse.json(
        { error: "GA property not selected" },
        { status: 400 }
      );
    }

    // 4️⃣ Setup OAuth client using USER token
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: account.google_refresh_token,
    });

    // 5️⃣ Fetch analytics
    const analytics = google.analyticsdata("v1beta");

    try {
      const result = await analytics.properties.runReport({
        auth,
        property: `properties/${account.google_property_id}`,
        requestBody: {
          dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
          metrics: [
            { name: "totalUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
            { name: "newUsers" }
          ],
          dimensions: [{ name: "sessionSource" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 5
        }
      });

      // Validate response
      if (!result?.data?.rows) {
        console.error('Invalid GA4 response:', result);
        throw new Error('Invalid response from Google Analytics');
      }

      const rows = result.data.rows || [];
      const metrics = {
        sources: [],
        totalUsers: 0,
        totalSessions: 0,
        totalPageviews: 0,
        totalEngagement: 0,
        newUsers: 0
      };

      // Process each row
      for (const row of rows) {
        try {
          const source = row.dimensionValues?.[0]?.value || "direct";
          const users = parseInt(row.metricValues?.[0]?.value || "0", 10);
          const sessions = parseInt(row.metricValues?.[1]?.value || "0", 10);
          
          metrics.sources.push({ source, users, sessions });
          metrics.totalUsers += users;
          metrics.totalSessions += sessions;
          metrics.totalPageviews += parseInt(row.metricValues?.[2]?.value || "0", 10);
          metrics.totalEngagement += parseFloat(row.metricValues?.[3]?.value || "0");
          metrics.newUsers += parseInt(row.metricValues?.[4]?.value || "0", 10);
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          // Continue with other rows even if one fails
        }
      }

      // Calculate derived metrics
      const returningUsers = Math.max(0, metrics.totalUsers - metrics.newUsers);
      const avgEngagementSeconds = metrics.totalSessions > 0 
        ? Math.round(metrics.totalEngagement / metrics.totalSessions)
        : 0;

      // Format response
      return NextResponse.json({
        users: metrics.totalUsers,
        sessions: metrics.totalSessions,
        pageviews: metrics.totalPageviews,
        avgEngagement: `${avgEngagementSeconds}s`,
        returningUsers,
        sources: metrics.sources
      });

    } catch (error) {
      console.error('GA4 API Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}