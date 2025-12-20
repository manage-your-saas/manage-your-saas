// src/app/api/search-console/select-site/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const { userId, siteUrl } = await req.json();

  if (!userId || !siteUrl) {
    return NextResponse.json(
      { error: "Missing userId or siteUrl" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

const { data: existingAccount, error: fetchError } = await supabase
  .from('search_console_accounts')
  .select('google_refresh_token, available_sites')
  .eq('user_id', userId)
  .single();

if (fetchError && fetchError.code !== 'PGRST116') {
  console.error('Error fetching account:', fetchError);
  return NextResponse.json(
    { error: 'Failed to fetch account data' }, 
    { status: 500 }
  );
}

// If no account exists yet, create one with the selected site
if (!existingAccount) {
  const { error: insertError } = await supabase
    .from('search_console_accounts')
    .insert([{
      user_id: userId,
      selected_site: siteUrl,
      google_refresh_token: '', // This will fail if the column is NOT NULL
      updated_at: new Date().toISOString()
    }]);

  if (insertError) {
    console.error('Error creating account:', insertError);
    return NextResponse.json(
      { error: 'Please connect your Google account first' },
      { status: 400 }
    );
  }
} else {
  // Update existing account
  const { error: updateError } = await supabase
    .from('search_console_accounts')
    .update({
      selected_site: siteUrl,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating site:', updateError);
    return NextResponse.json(
      { error: 'Failed to update site selection' },
      { status: 500 }
    );
  }
}

return NextResponse.json({ success: true });
}
