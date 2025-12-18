import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

function getDates(range) {
  const now = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  let startDate, endDate = formatDate(now);

  switch (range) {
    case 'today':
      startDate = formatDate(now);
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      startDate = formatDate(yesterday);
      endDate = formatDate(yesterday);
      break;
    case 'thisWeek':
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate = formatDate(firstDayOfWeek);
      break;
    case 'lastWeek':
      const lastWeekEndDate = new Date();
      lastWeekEndDate.setDate(now.getDate() - now.getDay() - 1);
      const lastWeekStartDate = new Date(lastWeekEndDate);
      lastWeekStartDate.setDate(lastWeekEndDate.getDate() - 6);
      startDate = formatDate(lastWeekStartDate);
      endDate = formatDate(lastWeekEndDate);
      break;
    case 'thisMonth':
      startDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = formatDate(lastMonth);
      endDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 0));
      break;
    case 'quarterToDate':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = formatDate(new Date(now.getFullYear(), quarter * 3, 1));
      break;
    case 'thisYear':
      startDate = formatDate(new Date(now.getFullYear(), 0, 1));
      break;
    case '7daysAgo':
    case '28daysAgo':
    case '30daysAgo':
    case '90daysAgo':
      startDate = range;
      endDate = 'today';
      break;
    default:
      startDate = '7daysAgo';
      endDate = 'today';
  }
  return { startDate, endDate };
}

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  // ✅ Supabase service role (no auth cookies)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const range = req.nextUrl.searchParams.get("startDate") || "7daysAgo";
    const { startDate, endDate } = getDates(range);

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

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
    const dimension = req.nextUrl.searchParams.get("dimension");

    if (dimension) {
      // Time-series data for chart
      const res = await analytics.properties.runReport({
        property: `properties/${data.google_property_id}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: dimension }],
          metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
        },
      });

      const rows = res.data.rows?.map(row => ({
        keys: [row.dimensionValues[0].value],
        clicks: parseFloat(row.metricValues[0].value ?? "0"), // Using activeUsers as clicks for now
        impressions: parseFloat(row.metricValues[1].value ?? "0"), // Using newUsers as impressions
      })) || [];

      return NextResponse.json({ success: true, rows });

    } else {
      // Summary data for metric cards
      const res = await analytics.properties.runReport({
        property: `properties/${data.google_property_id}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
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
          activeUsers: parseFloat(row?.metricValues?.[0]?.value ?? "0"),
          newUsers: parseFloat(row?.metricValues?.[1]?.value ?? "0"),
          sessions: parseFloat(row?.metricValues?.[2]?.value ?? "0"),
          pageViews: parseFloat(row?.metricValues?.[3]?.value ?? "0"),
          engagementRate: parseFloat(row?.metricValues?.[4]?.value ?? "0"),
          avgSessionDuration: parseFloat(row?.metricValues?.[5]?.value ?? "0"),
        },
      });
    }
  } catch (err) {
    console.error("Metrics API error:", err);
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}