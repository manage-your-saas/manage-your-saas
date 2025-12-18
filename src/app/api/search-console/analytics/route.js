import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
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

    // 🔑 Supabase service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔐 Get refresh token
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

    // 🔑 OAuth client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: data.google_refresh_token,
    });

    // 📊 Search Console API
    const searchConsole = google.webmasters({
      version: "v3",
      auth,
    });

    // 📅 Convert relative date
    const endDate = new Date().toISOString().slice(0, 10);
    const start = getDateFromRelative(startDate);

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: start,
        endDate,
        dimensions: [],
        rowLimit: 1,
      },
    });

    const row = response.data.rows?.[0];

    return NextResponse.json({
      success: true,
      metrics: {
        clicks: row?.clicks ?? 0,
        impressions: row?.impressions ?? 0,
        ctr: row ? (row.ctr * 100).toFixed(2) + "%" : "0%",
        position: row?.position?.toFixed(1) ?? "0",
      },
    });
  } catch (err) {
    console.error("Search Console Analytics Error:", err);

    // 🔄 Handle expired tokens
    if (err.message?.includes("invalid_grant")) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

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
      { error: "Failed to fetch Search Console analytics" },
      { status: 500 }
    );
  }
}

/**
 * Convert "7daysAgo" → YYYY-MM-DD
 */
function getDateFromRelative(relative) {
  const days = parseInt(relative.replace("daysAgo", ""), 10);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
