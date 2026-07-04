import { supabaseAdmin } from "../config/supabase.js";

const AUTH_VERIFY_TIMEOUT_MS = 4000;

async function ensureProfile(user) {
  await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

export async function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  let authResult;
  try {
    const authPromise = supabaseAdmin.auth.getUser(token);
    authPromise.catch(() => {});

    authResult = await Promise.race([
      authPromise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Supabase Auth verification timed out."));
        }, AUTH_VERIFY_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    req.log?.warn(
      {
        err: error,
        requestId: req.id,
      },
      "Supabase Auth verification unavailable",
    );

    return res.status(503).json({
      success: false,
      message:
        "Authentication service is temporarily unavailable. Please try again in a moment.",
    });
  }

  const { data, error } = authResult;

  if (
    error &&
    /fetch failed|timeout|network|temporarily unavailable/i.test(error.message || "")
  ) {
    req.log?.warn(
      {
        err: error,
        requestId: req.id,
      },
      "Supabase Auth verification failed due to network error",
    );

    return res.status(503).json({
      success: false,
      message:
        "Authentication service is temporarily unavailable. Please try again in a moment.",
    });
  }

  if (error || !data.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = data.user;
  await ensureProfile(data.user);
  return next();
}
