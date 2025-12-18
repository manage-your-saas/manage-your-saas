import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const dimension = req.nextUrl.searchParams.get("dimension") || "query";
    const startInput =
      req.nextUrl.searchParams.get("startDate") || "7daysAgo";

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

    const { data } = await supabase
      .from("search_console_accounts")
      .select("google_refresh_token, site_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data?.google_refresh_token || !data?.site_url) {
      return NextResponse.json(
        { error: "Search Console not configured" },
        { status: 400 }
      );
    }

    // ✅ Convert dates
    const startDate = resolveDate(startInput);
    const endDate = new Date().toISOString().slice(0, 10);

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: data.google_refresh_token,
    });

    const webmasters = google.webmasters({
      version: "v3",
      auth,
    });

    const res = await webmasters.searchanalytics.query({
      siteUrl: data.site_url,
      requestBody: {
        startDate,
        endDate,
        dimensions: [dimension],
        rowLimit: 25,
      },
    });

    return NextResponse.json({
      success: true,
      dimension,
      rows: res.data.rows || [],
      range: { startDate, endDate },
    });
  } catch (err) {
    console.error("SEARCH CONSOLE PERFORMANCE ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to load performance data" },
      { status: 500 }
    );
  }
}

function resolveDate(dateInput) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  if (dateInput.endsWith("daysAgo")) {
    const days = parseInt(dateInput.replace("daysAgo", ""), 10);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }

  throw new Error(`Invalid date format: ${dateInput}`);
}
