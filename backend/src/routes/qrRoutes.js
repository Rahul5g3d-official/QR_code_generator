import express from "express";
import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { createQrImage } from "../lib/qrImage.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  analyticsRateLimiter,
  qrCreateIpRateLimiter,
  qrCreateUserRateLimiter,
  qrMutationRateLimiter,
} from "../middleware/rateLimiters.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { generateShortCode } from "../utils/generateShortCode.js";
import { validateSafeUrl } from "../utils/validateSafeUrl.js";
import {
  createQrSchema,
  paginationSchema,
  uuidParamSchema,
} from "../validators/qrValidators.js";

const router = express.Router();

const qrSelect =
  "id, creator_id, title, original_url, short_code, qr_image, total_scans, is_active, created_at, updated_at";

function buildTrackingUrl(shortCode) {
  return `${env.publicBaseUrl}/q/${shortCode}`;
}

function validateQrId(req) {
  return uuidParamSchema.parse(req.params).id;
}

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("qr_codes")
      .select(qrSelect)
      .eq("creator_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
      qrCodes: data,
    });
  }),
);

router.post(
  "/",
  qrCreateIpRateLimiter,
  qrCreateUserRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = createQrSchema.parse(req.body);
    const safeUrl = validateSafeUrl(parsed.originalUrl);

    if (!safeUrl.valid) {
      throw badRequest(safeUrl.reason);
    }

    const { count, error: countError } = await supabaseAdmin
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", req.user.id);

    if (countError) throw countError;

    if ((count || 0) >= env.maxQrCodesPerUser) {
      return res.status(403).json({
        success: false,
        message: `QR code limit reached. Maximum allowed is ${env.maxQrCodesPerUser}.`,
      });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const shortCode = generateShortCode();
      const trackingUrl = buildTrackingUrl(shortCode);
      const qrImage = await createQrImage(trackingUrl);

      const { data, error } = await supabaseAdmin
        .from("qr_codes")
        .insert({
          creator_id: req.user.id,
          title: parsed.title,
          original_url: safeUrl.normalizedUrl,
          short_code: shortCode,
          qr_image: qrImage,
        })
        .select(qrSelect)
        .single();

      if (!error) {
        return res.status(201).json({
          success: true,
          data,
          qrCode: data,
          trackingUrl,
        });
      }

      if (error.code !== "23505") throw error;
    }

    return res.status(500).json({
      success: false,
      message: "Could not allocate a unique tracking code. Please try again later.",
    });
  }),
);

router.get(
  "/:id/scans",
  analyticsRateLimiter,
  asyncHandler(async (req, res) => {
    const id = validateQrId(req);
    const pagination = paginationSchema.parse(req.query);
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    const { data: qrCode, error: qrError } = await supabaseAdmin
      .from("qr_codes")
      .select("id, title, original_url, short_code, total_scans, created_at")
      .eq("id", id)
      .eq("creator_id", req.user.id)
      .single();

    if (qrError || !qrCode) {
      throw notFound("QR code was not found.");
    }

    const { data: scans, error: scansError, count } = await supabaseAdmin
      .from("qr_scans")
      .select(
        "id, qr_code_id, creator_id, masked_ip, country, city, region, device_type, browser, os, user_agent, referrer, is_bot, scanned_at",
        { count: "exact" },
      )
      .eq("qr_code_id", qrCode.id)
      .eq("creator_id", req.user.id)
      .order("scanned_at", { ascending: false })
      .range(from, to);

    if (scansError) throw scansError;

    const total = count || 0;
    const responsePagination = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    };

    return res.json({
      success: true,
      data: scans,
      scans,
      qrCode,
      pagination: responsePagination,
    });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = validateQrId(req);

    const { data, error } = await supabaseAdmin
      .from("qr_codes")
      .select(qrSelect)
      .eq("id", id)
      .eq("creator_id", req.user.id)
      .single();

    if (error || !data) {
      throw notFound("QR code was not found.");
    }

    return res.json({
      success: true,
      data,
      qrCode: data,
    });
  }),
);

router.delete(
  "/:id",
  qrMutationRateLimiter,
  asyncHandler(async (req, res) => {
    const id = validateQrId(req);

    const { data, error } = await supabaseAdmin
      .from("qr_codes")
      .delete()
      .eq("id", id)
      .eq("creator_id", req.user.id)
      .select("id")
      .single();

    if (error || !data) {
      throw notFound("QR code was not found.");
    }

    return res.json({
      success: true,
      deleted: true,
    });
  }),
);

export default router;
