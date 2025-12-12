import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create a state parameter to verify the callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    // Create OAuth URL
    const url = await stripe.oauth.authorizeUrl({
      scope: 'read_write',
      state,
      redirect_uri: process.env.STRIPE_REDIRECT_URI,
      client_id: process.env.STRIPE_CLIENT_ID,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating Stripe connect URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate Stripe connect URL' },
      { status: 500 }
    );
  }
}
