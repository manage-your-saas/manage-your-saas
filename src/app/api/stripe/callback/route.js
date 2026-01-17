// src/app/api/stripe/callback/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin, STRIPE_ACCOUNTS_TABLE } from '@/lib/supabaseClient';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!state) {
      throw new Error('State parameter is missing');
    }

    const { userId } = JSON.parse(decodeURIComponent(state));

    if (!userId) {
      throw new Error('User ID is missing from state');
    }

        
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }


    // Exchange the authorization code for an access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const { 
      access_token, 
      stripe_user_id, 
      refresh_token
    } = response;

    if (!access_token || !stripe_user_id || !refresh_token) {
      console.error('❌ Missing required fields in OAuth response');
      throw new Error('Failed to retrieve required tokens from Stripe');
    }

    // First, check if account already exists
    const { data: existingAccount, error: fetchError } = await supabaseAdmin
      .from(STRIPE_ACCOUNTS_TABLE)
      .select('id')
      .eq('stripe_account_id', stripe_user_id)
      .single();

    let result;
    if (fetchError && !fetchError.details?.includes('0 rows')) {
      console.error('❌ Error checking for existing account');
      throw new Error('Failed to check for existing Stripe account');
    }

    if (existingAccount) {
      // Update existing account
      result = await supabaseAdmin
        .from(STRIPE_ACCOUNTS_TABLE)
        .update({
          access_token,
          refresh_token,
          user_id: userId
        })
        .eq('stripe_account_id', stripe_user_id);
    } else {
      // Insert new account
      result = await supabaseAdmin
        .from(STRIPE_ACCOUNTS_TABLE)
        .insert([{
          stripe_account_id: stripe_user_id,
          access_token,
          refresh_token,
          user_id: userId
        }]);
    }

    if (result.error) {
      console.error('❌ Database error saving stripe_account');
      throw new Error('Failed to save Stripe account');
    }

    // Upsert into user_integrations table
    const { error: integrationError } = await supabaseAdmin
      .from('user_integrations')
      .upsert(
        { user_id: userId, integration: 'stripe', status: 'connected', last_checked: new Date().toISOString() },
        { onConflict: 'user_id,integration' }
      );

    if (integrationError) {
      console.error('❌ Database error saving user_integration');
      throw new Error('Failed to save integration status');
    }
    return NextResponse.redirect(
      new URL('/dashboard/stripe?success=stripe_connected', request.url)
    );

  } catch (error) {
    console.error('❌ Error in Stripe callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/stripe?error=stripe_connection_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}