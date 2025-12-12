# SaaS Base Deployment Tutorial (Sample Config - Do Not Use Example Values Directly)

A concise guide for deploying to production. Replace all example values with your own.

## 1. Prerequisites
- Cloudflare account with Workers, D1, and R2 enabled.
- Node.js 18+ and npm installed.
- Terminal in project root directory (e.g., `/Users/you/base-saas`).

## 2. One-Time Initialization
1) Install dependencies  
   ```bash
   npm install
   ```
2) Login to Cloudflare (browser authorization)  
   ```bash
   npx wrangler login
   ```
3) Create resources (if not created yet)  
   ```bash
   npx wrangler d1 create <db-name>              # Get database_id, add to wrangler.jsonc
   npx wrangler r2 bucket create <bucket-name>   # Bucket name must match wrangler.jsonc
   ```
4) Local build check  
   ```bash
   npm run build
   ```

## 3. Configure Environment Variables / Secrets (Production)
All sensitive values must be set as secrets. Replace placeholder examples:
```bash
npx wrangler secret put BETTER_AUTH_SECRET      # e.g., generate with: openssl rand -base64 32
npx wrangler secret put GOOGLE_CLIENT_ID        # e.g., 12345-abc.apps.googleusercontent.com
npx wrangler secret put GOOGLE_CLIENT_SECRET    # e.g., GOCSPX-xxxxxxxx
npx wrangler secret put RESEND_API_KEY          # e.g., re_xxxxxxxxx
npx wrangler secret put RESEND_FROM_EMAIL       # e.g., "SaaS App <noreply@example.com>"
```
Plain text variable `BETTER_AUTH_URL` is configured in `wrangler.jsonc`. Update and redeploy if domain changes.

## 4. Google Login Configuration (Avoid redirect_uri_mismatch)
In Google Cloud Console OAuth 2.0 Client settings:
- Authorized redirect URI (example):  
  `https://your-app.example.workers.dev/api/auth/callback/google`
- Authorized JavaScript origin (example):  
  `https://your-app.example.workers.dev`
- Both are required. Domain/protocol/path must exactly match your actual access domain (path is fixed as `/api/auth/callback/google`, must use https).
- For custom domains, replace the domain portion with your actual domain while keeping the above configuration consistent.

## 5. Database Migration (Required for First Deployment)
For first deployment or after adding new database tables, sync schema to remote D1:
```bash
npm run db:remote:push
```

## 6. Deploy to Production
In the root directory, run:
```bash
npm run deploy   # Equivalent to: react-router build && wrangler deploy
```
After deployment, visit: `https://your-app.example.workers.dev` (replace with your actual domain).
View logs: `npx wrangler tail <worker-name>`

## 7. Custom Domain Binding (Common Pitfalls)
- Can only bind "active domains" in your Cloudflare account (domains with completed NS transfer). If unavailable, first add the domain to Cloudflare (add site and update NS at registrar).
- After binding, update:
  - `BETTER_AUTH_URL` in `wrangler.jsonc`
  - Google OAuth redirect URI / JS origin
  - Redeploy

## 8. FAQ
- **404 on *.pages.dev**: That's a Pages static domain. This project uses Worker SSR—use `*.workers.dev` or your bound custom domain.
- **BetterAuth default key warning**: Production is missing or has outdated `BETTER_AUTH_SECRET`. Use `wrangler secret put BETTER_AUTH_SECRET` to reset and redeploy.
- **Google login redirect_uri_mismatch**: Check that Google Console redirect URI / JS origin exactly matches current domain (including https, path `/api/auth/callback/google`).
- **Variables lost after deploy**: `wrangler deploy` overwrites Dashboard plain text variables with local `wrangler.jsonc`. Items not in config will be cleared. Secrets are unaffected, but unset secrets need `wrangler secret put`.

## 9. Preparation Checklist
- Randomly generated `BETTER_AUTH_SECRET` (e.g., string from `openssl rand -base64 32`).
- Google OAuth Client ID / Client Secret with correct redirect URI / JS origin configured.
- Resend API Key and sender email (email domain must be verified in Resend).
- (Optional) Custom domain: Domain added to Cloudflare with NS transfer completed.
