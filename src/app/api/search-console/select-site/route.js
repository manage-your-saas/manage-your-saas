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

  // First, get the current account to preserve available_sites
  const { data: account, error: fetchError } = await supabase
    .from('search_console_accounts')
    .select('available_sites')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching account:', fetchError);
    return NextResponse.json(
      { error: 'Failed to fetch account data' },
      { status: 500 }
    );
  }

  // Update the selected site and preserve available_sites
  const { error: updateError } = await supabase
    .from('search_console_accounts')
    .upsert({
      user_id: userId,
      site_url: siteUrl,  // Keep for backward compatibility
      selected_site: siteUrl,
      available_sites: account?.available_sites || [siteUrl],
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (updateError) {
    console.error('Error updating site selection:', updateError);
    return NextResponse.json(
      { error: 'Failed to update site selection' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
