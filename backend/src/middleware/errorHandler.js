import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/httpError.js";

function isMissingSchemaError(error) {
  return (
    ["PGRST202", "PGRST205", "42P01"].includes(error?.code) ||
    /Could not find the table|Could not find the function|relation .* does not exist/i.test(
      error?.message || "",
    )
  );
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: req.path.startsWith("/api") ? "API route not found." : "Not found",
  });
}

export function errorHandler(error, req, res, _next) {
  const requestId = req.id;

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues[0]?.message || "Invalid request.",
      requestId,
    });
  }

  if (isMissingSchemaError(error)) {
    req.log?.error(
      {
        err: error,
        requestId,
        path: req.originalUrl,
        userId: req.user?.id,
      },
      "database schema is missing or stale",
    );

    return res.status(503).json({
      success: false,
      message:
        "Database schema is not installed for this Supabase project. Run supabase/schema.sql in the Supabase SQL editor, then try again.",
      requestId,
    });
  }

  const status = error instanceof AppError ? error.status : error.status || 500;
  const expose = error instanceof AppError ? error.expose : status < 500;

  req.log?.error(
    {
      err: error,
      requestId,
      status,
      path: req.originalUrl,
      userId: req.user?.id,
    },
    "request failed",
  );

  return res.status(status).json({
    success: false,
    message:
      expose || !env.isProduction
        ? error.message || "Something went wrong."
        : "Something went wrong.",
    requestId,
  });
}
