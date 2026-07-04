import { env } from "./env.js";

function isAllowedDevOrigin(origin) {
  if (env.isProduction) return false;

  try {
    const url = new URL(origin);
    const privateIpv4 =
      /^10\./.test(url.hostname) ||
      /^192\.168\./.test(url.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    return (
      url.protocol === "http:" &&
      url.port === "5173" &&
      (["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
        privateIpv4)
    );
  } catch {
    return false;
  }
}

export const corsOptions = {
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  origin(origin, callback) {
    if (!origin || env.allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  },
};
