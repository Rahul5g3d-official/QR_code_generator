import { supabaseAdmin } from "../config/supabase.js";

export async function checkDatabaseReadiness() {
  const checks = {
    qrCodesTable: false,
    recordScanFunction: false,
  };

  const qrCodesResult = await supabaseAdmin
    .from("qr_codes")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  checks.qrCodesTable = !qrCodesResult.error;

  const rpcResult = await supabaseAdmin.rpc("record_qr_scan", {
    p_short_code: "__missing_health_check__",
    p_ip_address: "",
    p_masked_ip: "",
    p_country: "",
    p_city: "",
    p_region: "",
    p_device_type: "",
    p_browser: "",
    p_os: "",
    p_user_agent: "",
    p_referrer: "",
    p_is_bot: true,
  });

  checks.recordScanFunction = !rpcResult.error;

  return {
    ready: checks.qrCodesTable && checks.recordScanFunction,
    checks,
    error:
      qrCodesResult.error?.message ||
      rpcResult.error?.message ||
      null,
  };
}
