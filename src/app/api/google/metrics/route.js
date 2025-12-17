// src/app/api/google/metrics/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // ✅ Service role client (NO AUTH COOKIES)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error: dbError } = await supabase
      .from("analytics_accounts")
      .select("google_refresh_token")
      .eq("user_id", userId)
      .single();

    if (dbError || !data?.google_refresh_token) {
      return NextResponse.json(
        { success: false, error: "Google Analytics not connected" },
        { status: 400 }
      );
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: data.google_refresh_token,
    });

    const analyticsAdmin = google.analyticsadmin({
      version: "v1beta",
      auth,
    });

    const res = await analyticsAdmin.accountSummaries.list();

    return NextResponse.json({
      success: true,
      accounts: res.data.accountSummaries || [],
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
