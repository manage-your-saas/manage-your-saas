// src/app/api/stripe/customers/route.js
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
      console.error('No Stripe account found:', accountError?.message || 'No accounts in database');
      return NextResponse.json(
        { 
          error: 'No Stripe account found',
          details: accountError?.message || 'Please connect a Stripe account first'
        },
        { status: 404 }
      );
    }

    console.log('Fetching customers for account:', account.stripe_account_id);
    
    // Fetch customers using the connected account's access token
    const customers = await stripe.customers.list(
      { limit: 100 },
      {
        stripeAccount: account.stripe_account_id,
        apiKey: account.access_token,
      }
    );

    console.log(`Found ${customers.data?.length || 0} customers`);
    
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
    console.error('Error fetching customers:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch customers',
        details: error.message,
        type: error.type
      },
      { status: 500 }
    );
  }
}