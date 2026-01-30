import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

function getDates(range) {
  const now = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  let startDate, endDate = formatDate(now);

  switch (range) {
    case '7daysAgo':
    case '28daysAgo':
    case '30daysAgo':
    case '90daysAgo':
      startDate = range;
      endDate = 'today';
      break;
    default:
      startDate = '28daysAgo';
      endDate = 'today';
  }
  return { startDate, endDate };
}

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");
  const startDate = req.nextUrl.searchParams.get("startDate") || "28daysAgo";

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get GA tokens + selected property
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

    // OAuth setup
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

    const { startDate: start, endDate: end } = getDates(startDate);

    // Fetch country data with all metrics
    const res = await analytics.properties.runReport({
      property: `properties/${data.google_property_id}`,
      requestBody: {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: "country" }],
        metrics: [
          { name: "totalUsers" },
          { name: "conversions" }, // Actual GA4 conversions metric
          { name: "totalRevenue" }, // Actual GA4 revenue metric
        ],
        limit: 20, // Get more countries to filter later
      },
    });

    console.log('Market Distribution GA response:', JSON.stringify(res.data, null, 2));

    // Check if there are any rows
    if (!res.data.rows || res.data.rows.length === 0) {
      console.log('No country data found, returning empty response');
      return NextResponse.json({
        metric: "users",
        title: "Top Countries by Users",
        data: [],
      });
    }

    const countries = res.data.rows?.map(row => {
      const countryName = row.dimensionValues[0].value || "Unknown";
      return {
        country: countryName,
        users: parseInt(row.metricValues[0]?.value || "0", 10),
        conversions: parseInt(row.metricValues[1]?.value || "0", 10), // Actual conversions
        revenue: parseFloat(row.metricValues[2]?.value || "0"), // Actual revenue
      };
    }) || [];

    // Calculate totals to determine primary metric
    const totalRevenue = countries.reduce((sum, c) => sum + c.revenue, 0);
    const totalConversions = countries.reduce((sum, c) => sum + c.conversions, 0);
    const totalUsers = countries.reduce((sum, c) => sum + c.users, 0);

    // Determine primary metric and title
    let primaryMetric, title;
    if (totalRevenue > 0) {
      primaryMetric = "revenue";
      title = "Top Countries by Revenue";
    } else if (totalConversions > 0) {
      primaryMetric = "conversions";
      title = "Top Countries by Conversions";
    } else {
      primaryMetric = "users";
      title = "Top Countries by Users";
    }

    // Sort by primary metric and get top 5
    const topCountries = countries
      .filter(c => c[primaryMetric] > 0) // Only include countries with the primary metric
      .sort((a, b) => b[primaryMetric] - a[primaryMetric])
      .slice(0, 5);

    return NextResponse.json({
      metric: primaryMetric,
      title: title,
      data: topCountries,
    });

  } catch (err) {
    console.error("Market Distribution API error:", err);
    return NextResponse.json(
      { error: "Failed to load market distribution data" },
      { status: 500 }
    );
  }
}
