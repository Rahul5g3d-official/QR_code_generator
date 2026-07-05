import "dotenv/config";
import { z } from "zod";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== "");
}

const isHuggingFaceSpace = Boolean(
  process.env.SPACE_ID ||
    process.env.SPACE_HOST ||
    process.env.SPACE_URL ||
    process.env.HF_SPACE_ID,
);

function normalizeOrigin(value) {
  if (!value) return undefined;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

function deriveHuggingFaceSpaceUrl() {
  const explicit = normalizeOrigin(
    firstDefined(process.env.SPACE_URL, process.env.SPACE_HOST),
  );
  if (explicit) return explicit;

  const spaceId = firstDefined(process.env.SPACE_ID, process.env.HF_SPACE_ID);
  if (!spaceId || !spaceId.includes("/")) return undefined;

  const [owner, name] = spaceId.split("/");
  const slug = `${owner}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `https://${slug}.hf.space`;
}

function isLocalUrl(value) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value || "");
}

const derivedSpaceUrl = deriveHuggingFaceSpaceUrl();
const defaultLocalFrontendUrl = "http://localhost:5173";
const defaultLocalPublicBaseUrl = "http://localhost:4000";
const frontendUrlOverride =
  isHuggingFaceSpace && isLocalUrl(process.env.FRONTEND_URL)
    ? undefined
    : process.env.FRONTEND_URL;
const allowedOriginsOverride =
  isHuggingFaceSpace && isLocalUrl(process.env.ALLOWED_ORIGINS)
    ? undefined
    : process.env.ALLOWED_ORIGINS;
const publicBaseUrlOverride =
  isHuggingFaceSpace && isLocalUrl(process.env.PUBLIC_BASE_URL)
    ? undefined
    : process.env.PUBLIC_BASE_URL;

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: isHuggingFaceSpace ? "7860" : process.env.PORT || "4000",
  FRONTEND_URL: firstDefined(
    frontendUrlOverride,
    isHuggingFaceSpace ? derivedSpaceUrl : process.env.CLIENT_URL,
    !isHuggingFaceSpace ? process.env.CLIENT_URL : undefined,
    derivedSpaceUrl,
    defaultLocalFrontendUrl,
  ),
  ALLOWED_ORIGINS: firstDefined(
    allowedOriginsOverride,
    frontendUrlOverride,
    isHuggingFaceSpace ? derivedSpaceUrl : process.env.CLIENT_URL,
    !isHuggingFaceSpace ? process.env.CLIENT_URL : undefined,
    derivedSpaceUrl,
    defaultLocalFrontendUrl,
  ),
  PUBLIC_BASE_URL: firstDefined(
    publicBaseUrlOverride,
    isHuggingFaceSpace ? derivedSpaceUrl : process.env.APP_BASE_URL,
    !isHuggingFaceSpace ? process.env.APP_BASE_URL : undefined,
    derivedSpaceUrl,
    defaultLocalPublicBaseUrl,
  ),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: firstDefined(
    process.env.SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
  ),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SCAN_RETENTION_DAYS: process.env.SCAN_RETENTION_DAYS || "90",
  MAX_QR_CODES_PER_USER: process.env.MAX_QR_CODES_PER_USER || "100",
  MAX_QR_CREATE_PER_HOUR: process.env.MAX_QR_CREATE_PER_HOUR || "20",
};

const urlSchema = z.string().url();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().max(65535),
  FRONTEND_URL: urlSchema,
  ALLOWED_ORIGINS: z.string().min(1),
  PUBLIC_BASE_URL: urlSchema,
  SUPABASE_URL: urlSchema,
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SCAN_RETENTION_DAYS: z.coerce.number().int().positive().max(3650),
  MAX_QR_CODES_PER_USER: z.coerce.number().int().positive().max(10000),
  MAX_QR_CREATE_PER_HOUR: z.coerce.number().int().positive().max(1000),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid backend environment: ${details}`);
}

const values = parsed.data;
const productionUrls = [
  ["FRONTEND_URL", values.FRONTEND_URL],
  ["PUBLIC_BASE_URL", values.PUBLIC_BASE_URL],
];

if (
  values.NODE_ENV === "production" &&
  productionUrls.some(([, value]) => /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value))
) {
  const invalid = productionUrls
    .filter(([, value]) => /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value))
    .map(([name]) => name)
    .join(", ");
  throw new Error(
    `Invalid production environment: ${invalid} cannot point to localhost. Set them to your public Hugging Face Space URL.`,
  );
}

export const env = {
  nodeEnv: values.NODE_ENV,
  isProduction: values.NODE_ENV === "production",
  port: values.PORT,
  frontendUrl: values.FRONTEND_URL.replace(/\/$/, ""),
  allowedOrigins: values.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  publicBaseUrl: values.PUBLIC_BASE_URL.replace(/\/$/, ""),
  supabaseUrl: values.SUPABASE_URL,
  supabaseAnonKey: values.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: values.SUPABASE_SERVICE_ROLE_KEY,
  scanRetentionDays: values.SCAN_RETENTION_DAYS,
  maxQrCodesPerUser: values.MAX_QR_CODES_PER_USER,
  maxQrCreatePerHour: values.MAX_QR_CREATE_PER_HOUR,
  isHuggingFaceSpace,
};
