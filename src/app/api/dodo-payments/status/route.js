import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase
      .from("dodo_payments_accounts")
      .select("api_key, account_info, connected_at")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to check Dodo Payments status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      connected: !!data?.api_key,
      accountInfo: data?.account_info || null,
      connectedAt: data?.connected_at || null
    });
  } catch (err) {
    console.error("Dodo Payments status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
