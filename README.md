---
title: QR Track
sdk: docker
app_port: 7860
pinned: false
---

# QR Track

Production-ready dynamic QR tracking app built with React, Vite, Tailwind CSS, React Router, Express, Supabase Auth, and Supabase PostgreSQL.

QR images encode a backend tracking URL such as `/q/abc123`, not the final destination URL. The backend records privacy-aware scan analytics, increments scan counts atomically in PostgreSQL, and redirects the scanner to the original URL.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase values.

3. Run `supabase/schema.sql` in the Supabase SQL editor.

4. Start the app:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:4000`.

For Hugging Face Docker Spaces deployment, follow [HUGGINGFACE_DEPLOYMENT.md](HUGGINGFACE_DEPLOYMENT.md).

## Environment

Backend-only secrets:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

Public frontend values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=http://localhost:4000
```

Production backend values:

```bash
NODE_ENV=production
PORT=7860
FRONTEND_URL=https://yourfrontend.com
ALLOWED_ORIGINS=https://yourfrontend.com
PUBLIC_BASE_URL=https://yourapi.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SCAN_RETENTION_DAYS=90
MAX_QR_CODES_PER_USER=100
MAX_QR_CREATE_PER_HOUR=20
```

The backend validates required environment variables on startup and will not start with missing critical values.

## Security

- Supabase Auth protects dashboard APIs.
- Supabase RLS restricts profiles, QR codes, and scan rows to their owner.
- The service role key is used only on the backend and is never exposed to the frontend.
- Helmet security headers are enabled, with HSTS in production.
- CORS uses an allowlist from `ALLOWED_ORIGINS`.
- Request bodies are limited to `20kb`.
- Protected APIs verify ownership and return 404 for non-owned QR resources.
- Rate limits are active for global API traffic, QR creation, analytics, mutations, and public scan redirects.
- QR creation validates and normalizes URLs, allows only HTTP/HTTPS, rejects dangerous protocols, and blocks localhost/private IP destinations in production.
- Scan recording uses the `record_qr_scan` SQL RPC so scan insertion and `total_scans` increment happen atomically.
- Analytics scan rows are paginated and capped at 100 rows per request.
- Scanner dashboard output shows masked IPs, not full IP addresses.
- Basic bot scans are marked with `is_bot`.
- Scan retention cleanup is configurable with `SCAN_RETENTION_DAYS`.
- API errors use a consistent safe JSON shape and production responses do not leak stack traces.
- Pino request logging includes request IDs and avoids logging access tokens, passwords, Supabase keys, and full request headers.

For horizontally scaled production deployments, connect `express-rate-limit` to a shared store such as Redis so limits are enforced across all instances.

## Privacy

Scan analytics collect only:

- Scan time
- Approximate location from trusted proxy or platform headers when available
- Browser, OS, device type, user agent, and referrer
- QR code ID and creator ID
- Full IP for backend abuse checks and masked IP for dashboard display

The app does not collect exact GPS location, phone number, scanner email, scanner name, contact list, camera data, or private device identifiers.

## Useful Commands

```bash
npm run dev
npm run dev:server
npm run dev:client
npm run build
npm run lint
npm audit
```

## Container

Build and run locally:

```bash
docker build -t qr-track .
docker run --env-file .env \
  -e PORT=7860 \
  -e FRONTEND_URL=http://localhost:7860 \
  -e ALLOWED_ORIGINS=http://localhost:7860 \
  -e PUBLIC_BASE_URL=http://localhost:7860 \
  -p 7860:7860 \
  qr-track
```

Open `http://localhost:7860`.
