// src/app/api/search-console/status/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("search_console_accounts")
    .select("site_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      connected: false,
      siteUrl: null,
    });
  }

  return NextResponse.json({
    connected: true,
    siteUrl: data.site_url, // can be null if not selected
  });
}
