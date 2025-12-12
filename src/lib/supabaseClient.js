// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const STRIPE_ACCOUNTS_TABLE = 'stripe_accounts';

// Regular client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Admin client for server-side operations that need elevated privileges
let supabaseAdmin;

// Only initialize the admin client if we have the service role key
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
} else {
  // In development, we'll use the regular client with a warning
  if (process.env.NODE_ENV === 'development') {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Using regular client for admin operations.');
  }
  supabaseAdmin = supabase;
}

export { supabaseAdmin };