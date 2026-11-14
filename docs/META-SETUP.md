# Meta / Instagram setup 

Keep every value in `.env` on your laptop / Vercel env vars. **Never paste tokens in chat.**

1. **Instagram account → Professional** (Creator or Business): Instagram app → Settings → Account type and tools → Switch to professional. Account must be **public**.
2. **Meta developer account + app:** developers.facebook.com → My Apps → Create App → use case "Manage messaging & content on Instagram" (Instagram API with Instagram Login). Note the **App ID** and **App Secret** (→ `META_APP_SECRET`).
3. **Add your Instagram account** to the app (App roles / Instagram testers) and accept the invite in Instagram.
4. **Permissions** to request: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_messages`.
5. **Generate token** in the app dashboard (Instagram → API setup → Generate token) → long-lived token (~60 days) → `IG_ACCESS_TOKEN`; your IG user ID → `IG_USER_ID`.
6. **Webhooks** (after Vercel deploy): callback URL `https://{{APP_DOMAIN}}/api/webhook`, verify token = `WEBHOOK_VERIFY_TOKEN`, subscribe field **comments**.
7. **For comment→DM from the public (not just testers):** App Review for Advanced Access on the comments/messages permissions + **Business Verification**, then switch app to **Live**. Takes days–weeks. Until then use ManyChat or test with tester accounts.

Posting your own reels works with your own account as an app role user (no review needed for that path — confirm in dashboard).
