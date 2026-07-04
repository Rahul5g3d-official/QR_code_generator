import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { supabaseAdmin } from "../config/supabase.js";

async function runScanRetentionCleanup() {
  let result;
  try {
    result = await supabaseAdmin.rpc("cleanup_old_qr_scans", {
      p_retention_days: env.scanRetentionDays,
    });
  } catch (error) {
    logger.warn({ err: error }, "scan retention cleanup failed");
    return;
  }

  if (result.error) {
    logger.warn({ err: result.error }, "scan retention cleanup failed");
    return;
  }

  logger.info(
    { retentionDays: env.scanRetentionDays },
    "scan retention cleanup completed",
  );
}

export function scheduleScanRetention() {
  runScanRetentionCleanup();
  const interval = setInterval(runScanRetentionCleanup, 24 * 60 * 60 * 1000);
  interval.unref?.();
}
