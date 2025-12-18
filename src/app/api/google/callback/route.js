// api/google/callback/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    // 🔐 Decode state
    let userId;
    try {
      userId = JSON.parse(decodeURIComponent(state)).userId;
    } catch {
      return NextResponse.json(
        { error: "Invalid state" },
        { status: 400 }
      );
    }

    // 🔁 Exchange code → tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    // 🔑 Service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔍 Check existing token
    const { data: existing } = await supabase
      .from("analytics_accounts")
      .select("google_refresh_token")
      .eq("user_id", userId)
      .single();

    // ✅ Decide final refresh token
    const refreshToken =
      tokenData.refresh_token || existing?.google_refresh_token;

    if (!refreshToken) {
      return NextResponse.json(
        {
          error: "Google Analytics authorization incomplete",
          reason:
            "No refresh token returned and none exists in database. User must revoke access and reconnect.",
        },
        { status: 400 }
      );
    }

    // 💾 Upsert analytics account
    await supabase.from("analytics_accounts").upsert(
      {
        user_id: userId,
        google_refresh_token: refreshToken,
      },
      { onConflict: "user_id" }
    );

    // 💾 Integration status
    await supabase.from("integration_status").upsert(
      {
        user_id: userId,
        integration: "google_analytics",
        status: "connected",
        last_checked: new Date().toISOString(),
      },
      { onConflict: "user_id,integration" }
    );

    return NextResponse.redirect(new URL("/analytics", req.url));
  } catch (err) {
    console.error("OAUTH CALLBACK ERROR:", err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
