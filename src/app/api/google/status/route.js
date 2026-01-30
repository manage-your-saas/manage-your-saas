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

  try {
    const { data } = await supabase
      .from("analytics_accounts")
      .select("google_refresh_token, google_property_id")
      .eq("user_id", userId)
      .single();

    const isConnected = !!(data?.google_refresh_token && data?.google_property_id);

    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? "connected" : "disconnected",
      propertyId: data?.google_property_id || null,
      propertyName: `GA Property ${data?.google_property_id}` || "Unknown Property",
    });

  } catch (error) {
    console.error("Error fetching GA status:", error);
    return NextResponse.json({
      connected: false,
      status: "error",
      error: "Failed to fetch property details",
    });
  }
}
