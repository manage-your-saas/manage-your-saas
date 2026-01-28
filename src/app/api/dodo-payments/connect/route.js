import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";
import { createClient } from "@supabase/supabase-js";

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

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const apiKey = await getDodoApiKey(userId);

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

    // Revenue calculation
    let totalRevenue = 0;
    payments.forEach(p => {
      if (p.status === "succeeded") totalRevenue += p.amount;
    });

    // Refund calculation
    let totalRefunds = 0;
    refunds.forEach(r => {
      totalRefunds += r.amount;
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalRefunds,
        netRevenue: totalRevenue - totalRefunds,
        totalPayments: payments.length,
        totalProducts: products.length,
        totalSubscriptions: subscriptions.length,
        totalCustomers: customers.length,
        totalPayouts: payouts.length,
      },
      raw: {
        payments,
        products,
        subscriptions,
        refunds,
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
