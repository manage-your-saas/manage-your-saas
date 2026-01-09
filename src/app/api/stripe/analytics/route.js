// src/app/api/stripe/analytics/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin, STRIPE_ACCOUNTS_TABLE } from '@/lib/supabaseClient';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the Stripe account for the specific user
    const { data: account, error: accountError } = await supabaseAdmin
      .from(STRIPE_ACCOUNTS_TABLE)
      .select('stripe_account_id, access_token')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'No Stripe account found' },
        { status: 404 }
      );
    }

    // Fetch subscriptions
    const subscriptions = await stripe.subscriptions.list(
      { 
        limit: 100,
        status: 'all',
        expand: ['data.plan.product']
      },
      {
        stripeAccount: account.stripe_account_id,
        apiKey: account.access_token,
      }
    );

    // Calculate MRR and ARR
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    
    let mrr = 0;
    let arr = 0;
    const monthlyData = Array(12).fill(0).map((_, i) => {
      const date = new Date(now);
      date.setMonth(now.getMonth() - 11 + i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        mrr: 0
      };
    });

    subscriptions.data.forEach(sub => {
      if (['active', 'trialing'].includes(sub.status)) {
        const amount = (sub.plan.amount * (sub.quantity || 1)) / 100;
        const created = new Date(sub.created * 1000);
        
        // Add to current MRR
        mrr += amount;
        
        // Add to monthly data if within the last 12 months
        const monthsAgo = (now.getFullYear() - created.getFullYear()) * 12 + 
                         now.getMonth() - created.getMonth();
        
        if (monthsAgo < 12) {
          monthlyData[11 - monthsAgo].mrr += amount;
        }
      }
    });

    // Calculate ARR
    arr = mrr * 12;

    // Calculate growth (simple month-over-month)
    const growth = monthlyData[11].mrr > 0 && monthlyData[10].mrr > 0
      ? ((monthlyData[11].mrr - monthlyData[10].mrr) / monthlyData[10].mrr * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      mrr,
      arr,
      growth: parseFloat(growth),
      monthlyData,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}