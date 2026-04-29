import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url =
  import.meta.env.VITE_SUPABASE_URL ?? "https://wjzbxeerpilwfvgnqxdc.supabase.co";
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemJ4ZWVycGlsd2Z2Z25xeGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjUzODQsImV4cCI6MjA5MjgwMTM4NH0.8KMcBPP7tBruGiWa8H1oYzm8NmlLrNIK3-zareDsVyA";

export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
