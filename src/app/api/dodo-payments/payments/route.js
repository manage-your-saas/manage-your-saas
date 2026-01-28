import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const apiKey = await getDodoApiKey(userId);

    const res = await axios.get(
      `${process.env.DODO_PAYMENTS_BASE_URL}/payments`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      success: true,
      items: res.data.items,
    });

  } catch (err) {
    console.error("Payments error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
