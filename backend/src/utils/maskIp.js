export function maskIp(ipAddress) {
  if (!ipAddress) return "";

  if (ipAddress.includes(":")) {
    const parts = ipAddress.split(":");
    return `${parts.slice(0, 4).join(":")}::xxxx`;
  }

  const parts = ipAddress.split(".");
  if (parts.length !== 4) return "";
  return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
}
