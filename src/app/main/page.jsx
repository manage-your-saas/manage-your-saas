import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://db.drvwaxkamziqsmzpebhh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydndheGthbXppcXNtenBlYmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDExNzAsImV4cCI6MjA4MDU3NzE3MH0.NIflGqeMQKN3iJywwCBIUfXh87sgAdy-bjMA3gZrAxE"
);
