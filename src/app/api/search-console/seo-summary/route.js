import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");
  const siteUrl = req.nextUrl.searchParams.get("siteUrl"); 
  const startDate =
    req.nextUrl.searchParams.get("startDate") || "7daysAgo";

  if (!userId || !siteUrl) {
    return NextResponse.json(
      { error: "Missing userId or siteUrl" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* --------------------------------
       1️⃣ GET SEARCH CONSOLE TOKEN
    -------------------------------- */

    const { data, error } = await supabase
      .from("search_console_accounts")
      .select("google_refresh_token")
      .eq("user_id", userId)
      .single();

    if (error || !data?.google_refresh_token) {
      return NextResponse.json(
        { error: "Search Console not connected" },
        { status: 400 }
      );
    }

    /* --------------------------------
       2️⃣ AUTH CLIENT
    -------------------------------- */

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: data.google_refresh_token,
    });

    const searchConsole = google.webmasters({
      version: "v3",
      auth,
    });

    /* --------------------------------
       3️⃣ DATE RANGE
    -------------------------------- */

        const days = parseInt(startDate.replace("daysAgo", ""), 10);
    const formatDate = (date) => date.toISOString().slice(0, 10);

    // Current period
    const currentEndDate = new Date();
    const currentStartDate = new Date();
    currentStartDate.setDate(currentEndDate.getDate() - (days - 1));

    // Previous period
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - (days - 1));

    /* --------------------------------
       4️⃣ FETCH SEO METRICS
    -------------------------------- */

    const fetchMetricsForPeriod = async (start, end, dimensions) => {
      const requestBody = {
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
      if (dimensions) {
        requestBody.dimensions = dimensions;
      }

      const res = await searchConsole.searchanalytics.query({
        siteUrl,
        requestBody,
      });
      return res.data.rows || [];
    };

    const [currentDataRows, previousDataRows, dailyData] = await Promise.all([
      fetchMetricsForPeriod(currentStartDate, currentEndDate),
      fetchMetricsForPeriod(previousStartDate, previousEndDate),
      fetchMetricsForPeriod(currentStartDate, currentEndDate, ["date"]),
    ]);

    const currentData = currentDataRows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const previousData = previousDataRows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    /* --------------------------------
       5️⃣ CALCULATE CHANGES & RETURN
    -------------------------------- */

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      success: true,
      range: startDate,
      seo: {
        clicks: currentData.clicks,
        impressions: currentData.impressions,
        ctr: currentData.ctr,
        position: currentData.position,
        clicksChange: calculateChange(currentData.clicks, previousData.clicks),
        impressionsChange: calculateChange(currentData.impressions, previousData.impressions),
        ctrChange: calculateChange(currentData.ctr, previousData.ctr),
        positionChange: calculateChange(currentData.position, previousData.position),
      },
      data: dailyData.map(row => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }))
    });
  } catch (err) {
    console.error("SEO SUMMARY ERROR:", err);

    // 🔄 Handle expired token
    if (err.message?.includes("invalid_grant")) {
      await supabase
        .from("integration_status")
        .update({
          status: "expired",
          last_checked: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("integration", "google_search_console");

      return NextResponse.json(
        { reconnect: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to load SEO summary" },
      { status: 500 }
    );
  }
}

/* -------------------------------
   UTIL: 7daysAgo → YYYY-MM-DD
-------------------------------- */
function getDateFromRelative(relative) {
  const days = parseInt(relative.replace("daysAgo", ""), 10);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
