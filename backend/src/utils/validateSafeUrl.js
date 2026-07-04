import net from "node:net";
import { env } from "../config/env.js";

const blockedProtocols = new Set([
  "javascript:",
  "data:",
  "file:",
  "chrome:",
  "ftp:",
]);

function isPrivateIpv4(hostname) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

function isPrivateIpv6(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isLocalHostname(hostname) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "0.0.0.0"
  );
}

export function validateSafeUrl(value) {
  if (!value || typeof value !== "string") {
    return { valid: false, reason: "Original URL is required." };
  }

  const trimmed = value.trim();
  if (trimmed.length > 2048) {
    return { valid: false, reason: "Original URL must be 2048 characters or fewer." };
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return { valid: false, reason: "Use a valid URL." };
  }

  if (blockedProtocols.has(url.protocol) || !["http:", "https:"].includes(url.protocol)) {
    return { valid: false, reason: "Only http:// and https:// URLs are allowed." };
  }

  if (url.username || url.password) {
    return { valid: false, reason: "URLs with embedded credentials are not allowed." };
  }

  const hostname = url.hostname;
  const ipVersion = net.isIP(hostname);

  if (
    env.isProduction &&
    (isLocalHostname(hostname) ||
      (ipVersion === 4 && isPrivateIpv4(hostname)) ||
      (ipVersion === 6 && isPrivateIpv6(hostname)))
  ) {
    return {
      valid: false,
      reason: "Localhost and private network URLs are not allowed in production.",
    };
  }

  return {
    valid: true,
    normalizedUrl: url.toString(),
  };
}
