import { formatDistanceToNow, format } from "date-fns";

export function formatDateTime(value) {
  if (!value) return "Unknown";
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

export function timeAgo(value) {
  if (!value) return "Unknown";
  return `${formatDistanceToNow(new Date(value), { addSuffix: true })}`;
}

export function formatCount(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

export function getHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function toTitle(value) {
  if (!value) return "Unknown";
  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
