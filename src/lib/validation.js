export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getUrlError(value) {
  if (!value?.trim()) return "Enter a destination URL.";
  if (value.trim().length > 2048) {
    return "Use a URL that is 2048 characters or fewer.";
  }
  if (!isValidHttpUrl(value)) return "Use a valid URL starting with http:// or https://.";
  return "";
}
