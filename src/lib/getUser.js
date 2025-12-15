import { supabase } from "./supabaseClient";

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return data.user;
}