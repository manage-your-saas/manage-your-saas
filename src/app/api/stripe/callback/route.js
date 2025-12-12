// src/app/api/stripe/callback/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin, STRIPE_ACCOUNTS_TABLE } from '@/lib/supabaseClient';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('🔑 Received authorization code');

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
      console.error('❌ Missing required fields in OAuth response:', {
        access_token: !!access_token,
        stripe_user_id: !!stripe_user_id,
        refresh_token: !!refresh_token
      });
      throw new Error('Failed to retrieve required tokens from Stripe');
    }

    console.log('🔄 Attempting to save Stripe account to database...');
    
    // First, check if account already exists
    const { data: existingAccount, error: fetchError } = await supabaseAdmin
      .from(STRIPE_ACCOUNTS_TABLE)  // Fixed: Using the correct constant name
      .select('id')
      .eq('stripe_account_id', stripe_user_id)
      .single();

    let result;
    if (fetchError && !fetchError.details?.includes('0 rows')) {
      console.error('❌ Error checking for existing account:', fetchError);
      throw new Error('Failed to check for existing Stripe account');
    }

    if (existingAccount) {
      // Update existing account
      console.log('🔄 Updating existing Stripe account');
      result = await supabaseAdmin
        .from(STRIPE_ACCOUNTS_TABLE)  // Fixed: Using the correct constant name
        .update({
          access_token,
          refresh_token
        })
        .eq('stripe_account_id', stripe_user_id);
    } else {
      // Insert new account
      console.log('➕ Creating new Stripe account');
      result = await supabaseAdmin
        .from(STRIPE_ACCOUNTS_TABLE)  // Fixed: Using the correct constant name
        .insert([{
          stripe_account_id: stripe_user_id,
          access_token,
          refresh_token
        }]);
    }

    if (result.error) {
      console.error('❌ Database error:', result.error);
      throw new Error(`Database error: ${result.error.message}`);
    }

    console.log('✅ Successfully saved Stripe account');
    return NextResponse.redirect(
      new URL('/dashboard?success=stripe_connected', request.url)
    );

  } catch (error) {
    console.error('❌ Error in Stripe callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=stripe_connection_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}