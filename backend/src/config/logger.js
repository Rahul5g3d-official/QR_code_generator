import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./env.js";

export const logger = pino({
  level: process.env.LOG_LEVEL || (env.isProduction ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-supabase-auth']",
      "*.password",
      "*.access_token",
      "*.refresh_token",
      "*.SUPABASE_SERVICE_ROLE_KEY",
    ],
    censor: "[redacted]",
  },
});

export const httpLogger = pinoHttp({
  logger,
  customProps(req) {
    return {
      requestId: req.id,
      userId: req.user?.id,
    };
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
