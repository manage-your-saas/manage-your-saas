import { NextResponse } from 'next/server';
import { supabaseAdmin, STRIPE_ACCOUNTS_TABLE } from '@/lib/supabaseClient';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    // Get the first available Stripe account
    const { data: account, error: accountError } = await supabaseAdmin
      .from(STRIPE_ACCOUNTS_TABLE)
      .select('stripe_account_id, access_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'No Stripe account found' },
        { status: 404 }
      );
    }

    // Fetch subscriptions using the connected account's access token
    const subscriptions = await stripe.subscriptions.list(
      { limit: 100, status: 'all' },
      {
        stripeAccount: account.stripe_account_id,
        apiKey: account.access_token,
      }
    );

    return NextResponse.json({ subscriptions: subscriptions.data });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
