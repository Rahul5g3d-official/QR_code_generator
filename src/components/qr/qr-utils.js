import { config } from "../../lib/config";

export function getTrackingUrl(qrCode) {
  if (!qrCode?.short_code) return "";
  return `${config.apiBaseUrl.replace(/\/$/, "")}/q/${qrCode.short_code}`;
}

export function getQrFilename(qrCode) {
  const safeTitle = (qrCode?.title || "qr-code")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${safeTitle || "qr-code"}.png`;
}
