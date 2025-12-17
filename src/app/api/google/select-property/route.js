import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { userId, propertyId } = await req.json();

    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: "Missing userId or propertyId" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase
      .from("analytics_accounts")
      .update({ google_property_id: propertyId })
      .eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save property error:", err);
    return NextResponse.json(
      { error: "Failed to save property" },
      { status: 500 }
    );
  }
}
