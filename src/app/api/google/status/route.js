import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { connected: false },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from("integration_status")
    .select("status")
    .eq("user_id", userId)
    .eq("integration", "google_analytics")
    .single();

  return NextResponse.json({
    connected: data?.status === "connected",
    status: data?.status ?? "disconnected",
  });
}
