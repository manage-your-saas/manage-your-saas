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
      const parsed = JSON.parse(decodeURIComponent(state));
      userId = parsed.userId;
    } catch {
      return NextResponse.json(
        { error: "Invalid state" },
        { status: 400 }
      );
    }

    // 🔁 Exchange code → tokens
    const tokenRes = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenRes.json();
    
    if (!tokenData.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token returned" },
        { status: 400 }
      );
    }
    
    console.log(tokenData.refresh_token)
    // ✅ SERVICE ROLE CLIENT (NO COOKIES)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase.from("analytics_accounts").upsert({
      user_id: userId,
      google_refresh_token: tokenData.refresh_token,
    });

    await supabase
  .from("integration_status")
  .upsert(
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
