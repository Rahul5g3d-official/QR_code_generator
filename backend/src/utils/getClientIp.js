function cleanIp(value) {
  if (!value) return "";
  return String(value).replace(/^::ffff:/, "").trim();
}

export function getClientIp(req) {
  const trustsProxy = Boolean(req.app?.get("trust proxy"));

  if (trustsProxy) {
    const forwardedFor = req.get("x-forwarded-for")?.split(",")[0];
    const proxyIp =
      req.get("cf-connecting-ip") || req.get("x-real-ip") || forwardedFor;
    if (proxyIp) return cleanIp(proxyIp);
  }

  return cleanIp(req.ip || req.socket?.remoteAddress || "");
}
