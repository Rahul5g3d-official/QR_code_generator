import { z } from "zod";
import { validateSafeUrl } from "../utils/validateSafeUrl.js";

export const createQrSchema = z.object({
  title: z
    .string({ required_error: "Title is required." })
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or fewer."),
  originalUrl: z
    .string({ required_error: "Original URL is required." })
    .trim()
    .max(2048, "Original URL must be 2048 characters or fewer.")
    .superRefine((value, ctx) => {
      const result = validateSafeUrl(value);
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.reason,
        });
      }
    }),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid QR code ID."),
});

export const shortCodeParamSchema = z.object({
  shortCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{6,20}$/, "Invalid QR tracking code."),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
