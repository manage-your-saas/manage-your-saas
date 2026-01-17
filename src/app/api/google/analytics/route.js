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

  // Validate userId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return NextResponse.json(
      { error: "Invalid userId format" },
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
      const metricsParams = req.nextUrl.searchParams.getAll("metric");
      const metrics = metricsParams.length > 0 ? metricsParams.map(name => ({ name })) : [{ name: "activeUsers" }, { name: "newUsers" }];

      // Time-series data for chart
      const res = await analytics.properties.runReport({
        property: `properties/${data.google_property_id}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: dimension }],
          metrics: metrics,
        },
      });

      const rows = res.data.rows?.map(row => {
        const rowData = { dimension: row.dimensionValues[0].value };
        metrics.forEach((metric, index) => {
          rowData[metric.name] = parseFloat(row.metricValues[index].value ?? "0");
        });
        return rowData;
      }) || [];

      return NextResponse.json({ success: true, rows });

    } else {
      // Summary data for metric cards
      const metricsToFetch = [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ];

      const runReport = (dateRanges) => analytics.properties.runReport({
        property: `properties/${data.google_property_id}`,
        requestBody: { dateRanges, metrics: metricsToFetch },
      });

      const days = parseInt(range.replace('daysAgo', ''));
      const previousStartDate = `${days * 2}daysAgo`;
      const previousEndDate = `${days}daysAgo`;

      const [currentPeriodRes, previousPeriodRes] = await Promise.all([
        runReport([{ startDate, endDate }]),
        runReport([{ startDate: previousStartDate, endDate: previousEndDate }]),
      ]);


      const parseMetrics = (res) => {
        const row = res.data.rows?.[0];
        return {
          users: parseInt(row?.metricValues?.[0]?.value ?? "0", 10),
          sessions: parseInt(row?.metricValues?.[1]?.value ?? "0", 10),
          pageviews: parseInt(row?.metricValues?.[2]?.value ?? "0", 10),
          avgDuration: parseFloat(row?.metricValues?.[3]?.value ?? "0"),
          bounceRate: parseFloat(row?.metricValues?.[4]?.value ?? "0"),
        };
      };

      const currentMetrics = parseMetrics(currentPeriodRes);
      const previousMetrics = parseMetrics(previousPeriodRes);

      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return NextResponse.json({
        success: true,
        metrics: {
          ...currentMetrics,
          usersChange: calculateChange(currentMetrics.users, previousMetrics.users),
          sessionsChange: calculateChange(currentMetrics.sessions, previousMetrics.sessions),
          pageviewsChange: calculateChange(currentMetrics.pageviews, previousMetrics.pageviews),
          avgDurationChange: calculateChange(currentMetrics.avgDuration, previousMetrics.avgDuration),
          bounceRateChange: calculateChange(currentMetrics.bounceRate, previousMetrics.bounceRate),
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