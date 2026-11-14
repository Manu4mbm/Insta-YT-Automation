# Meta / Instagram setup (Unified login — Meta apps created since Oct 2026)

New Meta apps no longer offer "API setup with Instagram login"; they use **API setup with Unified login**,
which returns a Business Integration **System User token** (never expires, owned by the business portfolio,
no Facebook Page needed). The code supports it when `IG_API_HOST=graph.facebook.com` (Vercel env).

Keep every value in `.env` / Vercel env vars. **Never paste tokens in chat.**

1. Instagram account(s) → Professional (Creator/Business), public, added to the Business portfolio.
2. developers.facebook.com → Create App → use case "Manage messaging & content on Instagram" → select the Business portfolio.
3. Use cases → Instagram API → **API setup with Unified login** → 1. Configure your app → create the Facebook Login for Business
   configuration (token: System-user access token, expiration Never, assets: the Instagram account(s)).
   Permissions: instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages,
   instagram_manage_insights, and **business_management** (add via Facebook Login for Business → Configurations → Edit).
4. Generate the token (Unified login tab, or Business Settings → Users → System users → Generate token with the same app + permissions,
   assets = the Instagram accounts) → Vercel env `IG_ACCESS_TOKEN` (Sensitive). IG account id → `IG_USER_ID`.
5. App settings → Basic → App secret → Vercel env `META_APP_SECRET` (Sensitive).
6. Webhooks: callback `https://{{APP_DOMAIN}}/api/webhook`, verify token = `WEBHOOK_VERIFY_TOKEN`, object Instagram, field **comments** (+ messages).
   The 1-minute poll cron also catches comments, so publishing + DMs work even before webhooks are verified.
7. Redeploy Vercel, then check `/api/health` (Bearer CRON_SECRET): `setup: unified-login`, token ok, ig_user_id_matches true.
8. Public comment→DM for non-testers: App Review (Advanced Access) + Business Verification + app Live.
