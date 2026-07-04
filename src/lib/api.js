import { config } from "./config";
import { supabase } from "./supabase";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});
  const requestPath = path.startsWith("/") ? path : `/${path}`;

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${config.apiBaseUrl}${requestPath}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the backend API at ${config.apiBaseUrl}. Start the Express server and check VITE_API_BASE_URL.`,
      0,
    );
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      await supabase?.auth.signOut();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    throw new ApiError(
      payload?.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return payload;
}

export async function listQrCodes() {
  return apiFetch("/api/qr");
}

export async function createQrCode(body) {
  return apiFetch("/api/qr", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getQrCode(id) {
  return apiFetch(`/api/qr/${id}`);
}

export async function deleteQrCode(id) {
  return apiFetch(`/api/qr/${id}`, {
    method: "DELETE",
  });
}

export async function getQrScans(id, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch(`/api/qr/${id}/scans?${params.toString()}`);
}
