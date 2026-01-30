import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";

// Currency conversion rates (you can update these or use a real API)
const CURRENCY_RATES = {
  INR: 0.0115, // 1 INR = 0.0115 USD (approximate)
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  // Add more currencies as needed
};

function convertToUSD(amount, currency) {
  const rate = CURRENCY_RATES[currency] || 1.0;
  return amount * rate;
}

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
      items: res.data.items.map(p => ({
        ...p,
        usdAmount: p.total_amount ? (convertToUSD(p.total_amount, p.currency) / 100).toFixed(2) : '0.00',
        originalAmount: p.total_amount ? (p.total_amount / 100).toFixed(2) : '0.00',
        currency: p.currency || 'USD'
      })),
    });

  } catch (err) {
    console.error("Payments error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
