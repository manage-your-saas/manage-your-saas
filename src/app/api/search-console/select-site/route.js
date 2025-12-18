// src/app/api/search-console/select-site/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const { userId, siteUrl } = await req.json();

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

  await supabase
    .from("search_console_accounts")
    .update({ site_url: siteUrl })
    .eq("user_id", userId);

  return NextResponse.json({ success: true });
}
