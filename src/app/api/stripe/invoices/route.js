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

    // Fetch invoices using the connected account's access token
    const invoices = await stripe.invoices.list(
      { 
        limit: 100,
        expand: ['data.customer', 'data.payment_intent', 'data.lines']
      },
      {
        stripeAccount: account.stripe_account_id,
        apiKey: account.access_token,
      }
    );

    // Format invoice data
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      customer_name: invoice.customer_name || invoice.customer?.name || 'Unknown',
      customer_email: invoice.customer_email || invoice.customer?.email || '',
      amount_due: invoice.amount_due / 100,
      amount_paid: invoice.amount_paid / 100,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : null,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      payment_intent_status: invoice.payment_intent?.status,
      currency: invoice.currency.toUpperCase(),
      lines: invoice.lines,
    }));

    return NextResponse.json({ 
      invoices: formattedInvoices,
      has_more: invoices.has_more,
      count: formattedInvoices.length
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch invoices',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
