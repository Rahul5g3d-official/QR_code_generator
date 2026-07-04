const runtimeConfig =
  typeof window !== "undefined" ? window.__QR_TRACK_CONFIG__ || {} : {};

const defaultApiBaseUrl =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";

export const config = {
  apiBaseUrl: (
    runtimeConfig.apiBaseUrl ??
    import.meta.env.VITE_API_BASE_URL ??
    defaultApiBaseUrl
  ).replace(/\/+$/, ""),
  supabaseUrl: runtimeConfig.supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey:
    runtimeConfig.supabaseAnonKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  config.supabaseUrl && config.supabaseAnonKey,
);
