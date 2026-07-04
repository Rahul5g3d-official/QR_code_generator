export const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(
    /\/+$/,
    "",
  ),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  config.supabaseUrl && config.supabaseAnonKey,
);
