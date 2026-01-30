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

    const apiKey = await getDodoApiKey(userId);

    const res = await axios.get(
      `${process.env.DODO_PAYMENTS_BASE_URL}/subscriptions`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      items: res.data.items.map(s => ({
        ...s,
        usdPrice: s.recurring_pre_tax_amount ? (convertToUSD(s.recurring_pre_tax_amount, s.currency) / 100).toFixed(2) : '0.00',
        originalPrice: s.recurring_pre_tax_amount ? (s.recurring_pre_tax_amount / 100).toFixed(2) : '0.00',
        currency: s.currency || 'USD'
      })),
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
