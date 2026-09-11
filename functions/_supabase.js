import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabase(env = {}) {
  const supabaseUrl = env.SUPABASE_URL || "https://xikrjtbaqtidnifnkpxd.supabase.co";
  const supabaseKey = env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3JqdGJhcXRpZG5pZm5rcHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDMxNDcsImV4cCI6MjA5NjU3OTE0N30.ARW-hXikuKeOiYqAwTcBkqXMpyKaPPulPqF4O2hFzXA";

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'wilayah' },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedClient;
}
