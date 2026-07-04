import crypto from "node:crypto";

export function requestId(req, res, next) {
  const incomingId = req.get("x-request-id");
  req.id = incomingId && incomingId.length <= 128 ? incomingId : crypto.randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}
