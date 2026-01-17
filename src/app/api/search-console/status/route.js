// src/app/api/search-console/status/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Validate userId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return NextResponse.json(
      { error: "Invalid userId format" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("search_console_accounts")
    .select("selected_site")
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
    siteUrl: data.selected_site, // can be null if not selected
  });
}
