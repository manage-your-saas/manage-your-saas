import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const apiKey = await getDodoApiKey(userId);

  const res = await axios.get(
    `${process.env.DODO_PAYMENTS_BASE_URL}/refunds`,
    {
      headers: { Authorization: `Bearer ${apiKey}` }
    }
  );

  return NextResponse.json({ success: true, items: res.data.items });
}
