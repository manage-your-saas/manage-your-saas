import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const startDate =
      req.nextUrl.searchParams.get("startDate") || "7daysAgo";

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // ✅ Supabase service role (no auth cookies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔐 Get GA tokens + selected property
    const { data, error } = await supabase
      .from("analytics_accounts")
      .select("google_refresh_token, google_property_id")
      .eq("user_id", userId)
      .single();

    if (error || !data?.google_refresh_token || !data?.google_property_id) {
      return NextResponse.json(
        { error: "Google Analytics not connected" },
        { status: 400 }
      );
    }

    // 🔑 OAuth
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: data.google_refresh_token,
    });

    const analytics = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    // 📊 Fetch metrics
    const res = await analytics.properties.runReport({
      property: `properties/${data.google_property_id}`,
      requestBody: {
        dateRanges: [{ startDate, endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
        ],
      },
    });

    const row = res.data.rows?.[0];

    return NextResponse.json({
      success: true,
      metrics: {
        activeUsers: row?.metricValues?.[0]?.value ?? "0",
        newUsers: row?.metricValues?.[1]?.value ?? "0",
        sessions: row?.metricValues?.[2]?.value ?? "0",
        pageViews: row?.metricValues?.[3]?.value ?? "0",
        engagementRate:
          ((row?.metricValues?.[4]?.value || 0) * 100).toFixed(1) + "%",
        avgSessionDuration:
          Math.round(row?.metricValues?.[5]?.value || 0) + "s",
      },
    });

    
  } catch (err) {
  if (err.message?.includes("invalid_grant")) {
    await supabase
      .from("integration_status")
      .update({
        status: "expired",
        last_checked: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("integration", "google_analytics");

    return NextResponse.json(
      { reconnect: true },
      { status: 401 }
    );
  }

  throw err;
}

}
