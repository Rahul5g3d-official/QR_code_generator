import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/corsOptions.js";
import { env } from "./config/env.js";
import { httpLogger, logger } from "./config/logger.js";
import { asyncHandler } from "./lib/asyncHandler.js";
import { checkDatabaseReadiness } from "./lib/databaseReadiness.js";
import { scheduleScanRetention } from "./lib/scanRetention.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalApiRateLimiter } from "./middleware/rateLimiters.js";
import { requestId } from "./middleware/requestId.js";
import qrRoutes from "./routes/qrRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");
const indexFile = path.join(distDir, "index.html");

if (env.isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(requestId);
app.use(httpLogger);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: env.isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: false,
        }
      : false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use((req, _res, next) => {
  if (req.url.startsWith("//")) {
    req.url = `/${req.url.replace(/^\/+/, "")}`;
  }
  next();
});

app.get("/runtime-config.js", (_req, res) => {
  res
    .type("application/javascript")
    .setHeader("Cache-Control", "no-store, max-age=0");
  res.send(
    `window.__QR_TRACK_CONFIG__ = ${JSON.stringify({
      apiBaseUrl: "",
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
    })};`,
  );
});

app.get("/health", (_req, res) => {
  res.json({ success: true, ok: true });
});

app.get("/health/db", asyncHandler(async (_req, res) => {
  const readiness = await checkDatabaseReadiness();
  res.status(readiness.ready ? 200 : 503).json({
    success: readiness.ready,
    ready: readiness.ready,
    checks: readiness.checks,
    message: readiness.ready
      ? "Database schema is ready."
      : "Database schema is not installed for this Supabase project. Run supabase/schema.sql in the Supabase SQL editor.",
  });
}));

app.use(redirectRoutes);
app.use("/api", globalApiRateLimiter);
app.use("/api/qr", qrRoutes);

if (fs.existsSync(indexFile)) {
  app.use(
    express.static(distDir, {
      index: false,
      maxAge: env.isProduction ? "1h" : 0,
    }),
  );

  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/q") ||
      req.path.startsWith("/health")
    ) {
      next();
      return;
    }

    res.sendFile(indexFile);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      nodeEnv: env.nodeEnv,
      publicBaseUrl: env.publicBaseUrl,
    },
    "QR Track API listening",
  );
});

scheduleScanRetention();

export default app;
