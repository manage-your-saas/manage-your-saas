import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";
import { createClient } from "@supabase/supabase-js";
import { getDateRange } from "@/lib/dateFilter";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { apiKey, userId } = await req.json();

    if (!apiKey || !userId) {
      return NextResponse.json(
        { error: "apiKey and userId are required" },
        { status: 400 }
      );
    }

    // Base64 encode the API key for security
    const encodedApiKey = Buffer.from(apiKey).toString("base64");

    // Upsert the API key into the database
    const { error } = await supabase.from("dodo_payments_accounts").upsert(
      {
        user_id: userId,
        api_key: encodedApiKey,
        connected_at: new Date().toISOString(),
      },
      { onConflict: ["user_id"] }
    );

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to save API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Connect error:", err.message);
    return NextResponse.json(
      { error: "Failed to connect Dodo Payments account" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateFilter = searchParams.get("dateFilter") || "This Month";

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const apiKey = await getDodoApiKey(userId);
    const dateRange = getDateRange(dateFilter);

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    // Call everything in parallel (FAST)
    const [
      paymentsRes,
      productsRes,
      subscriptionsRes,
      refundsRes,
      payoutsRes,
      customersRes
    ] = await Promise.all([
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/payments`, { headers }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/products`, { headers }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/subscriptions`, { headers }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/refunds`, { headers }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/payouts`, { headers }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/customers`, { headers }),
    ]);

    const payments = paymentsRes.data.items || [];
    const products = productsRes.data.items || [];
    const subscriptions = subscriptionsRes.data.items || [];
    const refunds = refundsRes.data.items || [];
    const payouts = payoutsRes.data.items || [];
    const customers = customersRes.data.items || [];

    // Filter by date range
    const filteredPayments = payments.filter(p => {
      const paymentDate = new Date(p.created_at);
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    });

    const filteredSubscriptions = subscriptions.filter(sub => {
      const subDate = new Date(sub.created_at);
      return subDate >= dateRange.start && subDate <= dateRange.end;
    });

    const filteredRefunds = refunds.filter(r => {
      const refundDate = new Date(r.created_at);
      return refundDate >= dateRange.start && refundDate <= dateRange.end;
    });

    // Revenue calculation
    let totalRevenue = 0;
    filteredPayments.forEach(p => {
      if (p.status === "succeeded") {
        // Convert amount to USD first
        const usdAmount = convertToUSD(p.total_amount, p.currency);
        totalRevenue += usdAmount;
      }
    });

    // Refund calculation
    let totalRefunds = 0;
    filteredRefunds.forEach(r => {
      // Convert refund amount to USD
      const usdAmount = convertToUSD(r.total_amount, r.currency);
      totalRefunds += usdAmount;
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: totalRevenue / 100, // Convert cents to USD
        totalRefunds: totalRefunds / 100, // Convert cents to USD
        netRevenue: (totalRevenue - totalRefunds) / 100, // Convert cents to USD
        totalPayments: payments.length,
        totalProducts: products.length,
        totalSubscriptions: subscriptions.length,
        totalCustomers: customers.length,
        totalPayouts: payouts.length,
      },
      raw: {
        payments: payments.map(p => ({
          ...p,
          usdAmount: p.total_amount ? (convertToUSD(p.total_amount, p.currency) / 100).toFixed(2) : '0.00',
          originalAmount: p.total_amount ? (p.total_amount / 100).toFixed(2) : '0.00',
          currency: p.currency || 'USD'
        })),
        products,
        subscriptions: subscriptions.map(s => ({
          ...s,
          usdPrice: s.recurring_pre_tax_amount ? (convertToUSD(s.recurring_pre_tax_amount, s.currency) / 100).toFixed(2) : '0.00',
          originalPrice: s.recurring_pre_tax_amount ? (s.recurring_pre_tax_amount / 100).toFixed(2) : '0.00',
          currency: s.currency || 'USD'
        })),
        refunds: refunds.map(r => ({
          ...r,
          usdAmount: r.total_amount ? (convertToUSD(r.total_amount, r.currency) / 100).toFixed(2) : '0.00',
          originalAmount: r.total_amount ? (r.total_amount / 100).toFixed(2) : '0.00',
          currency: r.currency || 'USD'
        })),
        payouts,
        customers,
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err.message);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
