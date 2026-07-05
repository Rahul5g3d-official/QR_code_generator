import express from "express";
import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  qrScanIpRateLimiter,
  qrScanShortCodeRateLimiter,
} from "../middleware/rateLimiters.js";
import { detectBot } from "../utils/detectBot.js";
import { getClientIp } from "../utils/getClientIp.js";
import { maskIp } from "../utils/maskIp.js";
import { parseUserAgent } from "../utils/parseUserAgent.js";
import { shortCodeParamSchema } from "../validators/qrValidators.js";

const router = express.Router();

function readLocationHeader(req, name) {
  const value = req.get(name);
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getApproximateLocation(req) {
  return {
    country:
      req.get("cf-ipcountry") ||
      req.get("x-vercel-ip-country") ||
      req.get("x-appengine-country") ||
      "",
    city:
      readLocationHeader(req, "x-vercel-ip-city") ||
      req.get("x-appengine-city") ||
      "",
    region:
      readLocationHeader(req, "x-vercel-ip-country-region") ||
      req.get("x-appengine-region") ||
      "",
  };
}

function renderNotFound(res) {
  return res.status(404).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QR code not found</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 32rem; padding: 2rem; text-align: center; }
    a { color: #2563eb; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>QR code not found</h1>
    <p>This tracking link is unavailable or has been removed.</p>
    <a href="${env.frontendUrl}/privacy">Privacy notice</a>
  </main>
</body>
</html>`);
}

function renderTrackingUnavailable(res) {
  return res.status(503).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tracking unavailable</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 32rem; padding: 2rem; text-align: center; }
    a { color: #2563eb; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>Tracking is temporarily unavailable</h1>
    <p>This QR link exists, but the tracking service is not ready. Please try again later.</p>
    <a href="${env.frontendUrl}/privacy">Privacy notice</a>
  </main>
</body>
</html>`);
}

async function redirectWithoutAnalytics(req, res, shortCode) {
  const { data: qrCode, error } = await supabaseAdmin
    .from("qr_codes")
    .select("original_url")
    .eq("short_code", shortCode)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return renderNotFound(res);
    }

    req.log?.error(
      {
        err: error,
        shortCode,
      },
      "failed to load QR code for degraded redirect",
    );
    return renderTrackingUnavailable(res);
  }

  if (!qrCode?.original_url) {
    return renderNotFound(res);
  }

  req.log?.warn(
    { shortCode },
    "redirecting QR scan without analytics because scan recording failed",
  );

  return res.redirect(302, qrCode.original_url);
}

router.get(
  "/q/:shortCode",
  qrScanShortCodeRateLimiter,
  qrScanIpRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = shortCodeParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return renderNotFound(res);
    }

    const userAgent = req.get("user-agent") || "";
    const location = getApproximateLocation(req);
    const parsedUserAgent = parseUserAgent(userAgent);
    const ipAddress = getClientIp(req);

    const { data, error } = await supabaseAdmin.rpc("record_qr_scan", {
      p_short_code: parsed.data.shortCode,
      p_ip_address: ipAddress,
      p_masked_ip: maskIp(ipAddress),
      p_country: location.country,
      p_city: location.city,
      p_region: location.region,
      p_device_type: parsedUserAgent.deviceType,
      p_browser: parsedUserAgent.browser,
      p_os: parsedUserAgent.os,
      p_user_agent: userAgent,
      p_referrer: req.get("referer") || req.get("referrer") || "",
      p_is_bot: detectBot(userAgent),
    });

    if (error) {
      req.log?.error(
        {
          err: error,
          shortCode: parsed.data.shortCode,
        },
        "failed to record QR scan",
      );
      return redirectWithoutAnalytics(req, res, parsed.data.shortCode);
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.found || !result.original_url) {
      return renderNotFound(res);
    }

    return res.redirect(302, result.original_url);
  }),
);

export default router;
