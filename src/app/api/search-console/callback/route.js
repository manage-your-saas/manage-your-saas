import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    // ❌ User denied consent
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=access_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    // 🔐 Decode state (same pattern as GA)
    let userId;
    try {
      const parsed = JSON.parse(decodeURIComponent(state));
      userId = parsed.userId;
    } catch {
      return NextResponse.json(
        { error: "Invalid state" },
        { status: 400 }
      );
    }

    // 🔁 Exchange code → tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.refresh_token) {
      return NextResponse.json(
        {
          error:
            "No refresh token returned. Remove app access from Google Account and try again.",
        },
        { status: 400 }
      );
    }
    // 🔑 Supabase service role (NO cookies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔍 Fetch Search Console sites
    const sitesRes = await fetch(
      "https://www.googleapis.com/webmasters/v3/sites",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const sitesData = await sitesRes.json();

    if (!sitesData.siteEntry || sitesData.siteEntry.length === 0) {
      return NextResponse.json(
        { error: "No Search Console properties found" },
        { status: 400 }
      );
    }

    // ✅ Extract site URLs only
    const siteUrls = sitesData.siteEntry.map((site) => site.siteUrl);

      await supabase
      .from("search_console_accounts")
      .upsert(
        {
          user_id:userId,
          google_refresh_token: tokenData.refresh_token,
          available_sites: siteUrls
        },
        { onConflict: "user_id" }
      ).eq("user_id", userId);;


    // 🔄 Update integration status
    await supabase.from("integration_status").upsert(
      {
        user_id: userId,
        integration: "google_search_console",
        status: "connected",
        last_checked: new Date().toISOString(),
      },
      { onConflict: "user_id,integration" }
    );

    // 🚀 Redirect user back to dashboard
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/console`
    );
  } catch (err) {
    console.error("SEARCH CONSOLE OAUTH ERROR:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/console?error=oauth_failed`
    );
  }
}
