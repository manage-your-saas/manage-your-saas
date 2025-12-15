import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const userId = request.nextUrl.searchParams.get("state");

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token returned" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // const { data: account, error } = await supabase
    //   .from("analytics_accounts")
    //   .select("google_refresh_token, google_property_id")
    //   .eq("user_id", user.id)
    //   .single();

    await supabase.from("analytics_accounts").insert({
      user_id: userId, // UUID string
      google_refresh_token: tokenData.refresh_token,
    });

    return NextResponse.redirect("http://localhost:3000/analytics/");
  } catch (err) {
    console.error("GOOGLE CALLBACK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
