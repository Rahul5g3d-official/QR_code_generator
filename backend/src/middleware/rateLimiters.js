import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { getClientIp } from "../utils/getClientIp.js";

const standardLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

function limitHandler(_req, res) {
  res.status(429).json(standardLimitResponse);
}

function ipKey(req) {
  const ip = getClientIp(req) || req.ip;
  return ip ? ipKeyGenerator(ip) : "ip:unknown";
}

function userKey(req) {
  return req.user?.id || ipKey(req);
}

export const globalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: limitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: limitHandler,
});

export const qrCreateUserRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.maxQrCreatePerHour,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKey,
  handler: limitHandler,
});

export const qrCreateIpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.maxQrCreatePerHour,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: limitHandler,
});

export const qrScanShortCodeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(req) {
    return `${ipKey(req)}:${req.params.shortCode || "unknown"}`;
  },
  handler: limitHandler,
});

export const qrScanIpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: limitHandler,
});

export const analyticsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKey,
  handler: limitHandler,
});

export const qrMutationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKey,
  handler: limitHandler,
});
