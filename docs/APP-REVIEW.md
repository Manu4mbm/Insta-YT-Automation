# Meta App Review — submission pack (Reels Automation)

Submit after: app is **Published** + Business verification ({{BUSINESS_NAME}}) is **Verified**.
Dashboard → App Review → Permissions and features → "Request advanced access" for each permission below.

Common fields
- App: Reels Automation (Instagram API with Instagram login)
- Business: {{BUSINESS_NAME}} · Instagram account: @{{IG_HANDLE}}
- Privacy policy: https://{{APP_DOMAIN}}/privacy
- Data deletion: https://{{APP_DOMAIN}}/data-deletion
- Platform: server-to-server (no end-user login UI). Only our own account is connected.

---

## instagram_business_basic
**How we use it:** We read basic profile info (user ID, username) of our own professional account @{{IG_HANDLE}} to identify the account our backend publishes to and to ignore our own comments in webhook events.
**Value to users:** Ensures replies and posts come only from the verified owner account.

## instagram_business_content_publish
**How we use it:** Our backend publishes reels we create to our own account @{{IG_HANDLE}} on a schedule (create media container → check status → media_publish). We never publish to anyone else's account.
**Value to users:** Followers receive consistent, scheduled educational reels about AI tools.

## instagram_business_manage_comments
**How we use it:** We receive comment webhooks on our own reels. When a viewer comments the keyword shown in the reel (e.g. "GUIDE"), we post one public reply on that comment ("DM check karo 📩"). Comments without the keyword are ignored. We do not hide, delete or moderate other users' comments.
**Value to users:** Viewers get a confirmation that the guide they asked for has been sent.

## instagram_business_manage_messages
**How we use it:** Only for Private Replies: when a viewer comments the keyword on our reel, we send exactly ONE private reply message to that comment (within 7 days) containing the free guide link they requested. We never message people who did not comment the keyword, never send bulk or promotional messages, and only follow up if the user replies (within 24h).
**Value to users:** The viewer instantly receives the resource they explicitly asked for in the reel's call to action.

---

## Screencast script (one video, ~2 min, screen record with voice or captions)
1. Show Meta dashboard → app → Instagram API → connected account @{{IG_HANDLE}} (basic).
2. Show a reel published by the app on @{{IG_HANDLE}} (open the post) and the scheduler row in our database (posts table: queued → published) (content_publish).
3. From a **second (tester) Instagram account**, open that reel and comment the keyword, e.g. `GUIDE`.
4. Within seconds show: public reply "DM check karo 📩" under the comment (manage_comments).
5. Switch to the tester account inbox → show the one DM with the guide link (manage_messages).
6. Comment something without the keyword → show nothing is sent.
7. End on the privacy policy page.

Tips: English captions on screen; keep account names visible; don't show any tokens/secrets.

## Notes for reviewer (paste in "notes")
Test flow: comment the word GUIDE on the latest reel of @{{IG_HANDLE}}. You will receive one private reply with a link and a public reply on your comment. The app only acts on comments containing the keyword on our own posts.
