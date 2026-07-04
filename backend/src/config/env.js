import "dotenv/config";
import { z } from "zod";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== "");
}

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "4000",
  FRONTEND_URL: firstDefined(
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    "http://localhost:5173",
  ),
  ALLOWED_ORIGINS: firstDefined(
    process.env.ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    "http://localhost:5173",
  ),
  PUBLIC_BASE_URL: firstDefined(
    process.env.PUBLIC_BASE_URL,
    process.env.APP_BASE_URL,
    "http://localhost:4000",
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
};
