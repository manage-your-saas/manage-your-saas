// src/app/api/stripe/customers/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin, STRIPE_ACCOUNTS_TABLE } from '@/lib/supabaseClient';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }

    // Get Stripe account for specific user
    const { data: account, error: accountError } = await supabaseAdmin
      .from(STRIPE_ACCOUNTS_TABLE)
      .select('stripe_account_id, access_token')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Stripe account not connected' },
        { status: 404 }
      );
    }
    
    // Fetch customers using the connected account's access token
    const customers = await stripe.customers.list(
      { limit: 100 },
      {
        stripeAccount: account.stripe_account_id,
        apiKey: account.access_token,
      }
    );
    
    // Format customer data
    const formattedCustomers = customers.data.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      created: new Date(customer.created * 1000).toLocaleDateString(),
      subscriptions: customer.subscriptions?.data?.length || 0,
    }));

    return NextResponse.json({
      customers: formattedCustomers,
      has_more: customers.has_more,
      count: formattedCustomers.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}