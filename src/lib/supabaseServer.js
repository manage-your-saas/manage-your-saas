import { createClient } from "@supabase/supabase-js";

export function createClientServer(req) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
      },
    }
  );
}
