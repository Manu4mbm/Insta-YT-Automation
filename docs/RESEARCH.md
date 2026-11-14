# Research (verified 2026-10-23) — re-check before relying on it

## Instagram Content Publishing API
- Needs an Instagram **professional** account. Login options: Instagram Login (`instagram_business_basic` + `instagram_business_content_publish`) or Facebook Login for Business.
- Flow: `POST /{IG_ID}/media` (`media_type=REELS`, `video_url`, `caption`) → poll `GET /{container}?fields=status_code` (IN_PROGRESS / FINISHED / ERROR / EXPIRED / PUBLISHED; poll ~1/min, ≤5 min) → `POST /{IG_ID}/media_publish` (`creation_id`).
- Video must be on a **public URL** at publish time, or use resumable upload (`upload_type=resumable`, rupload.facebook.com — Facebook Login apps only).
- Limit: **100 API-published posts / 24h** (`GET /{IG_ID}/content_publishing_limit`). (Docs also mention 50 in the carousel section — treat 50 as the safe ceiling.)
- Published reel shows `media_type=VIDEO`; check `media_product_type=REELS`.
- Optional trial reels: `trial_params`.
Sources: https://developers.facebook.com/docs/instagram-platform/content-publishing · https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media

## Comment → DM (Private Replies)
- `POST /{IG_ID}/messages` with `recipient: {comment_id}` and `message: {text}`.
- **One** message per comment, within **7 days** of the comment. Follow-ups only if the user replies, within 24h.
- Webhook field: `comments` (posts, reels, stories, ads).
- Receiving comment webhooks from the public requires: app **Live**, **Advanced Access** via **App Review**, verified Business, public account. Without Advanced Access the app receives no webhook notifications.
Sources: https://developers.facebook.com/docs/instagram/messaging-api/private-replies · https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-instagram
- Off-the-shelf alternative: ManyChat (official Meta partner) does comment-keyword → DM; check its current plan limits before recommending a tier.

## AI niche — current state (Oct 2026)
- **Claude Code** (Anthropic): very frequent releases (v2.1.30x in Oct 2026). Recent: auto mode + `/auto-mode-setup`, fork subagents on by default, idle compaction for long chats, plugins/mods official, cloud sessions, sandbox hardening. Changelog: https://code.claude.com/docs/en/changelog
- **Google Antigravity**: launched Nov 2025 as agentic IDE; **Antigravity 2.0** (May 19 2026) = agent-first desktop app; **Antigravity CLI** (`agy`) replaced Gemini CLI (Gemini CLI stopped June 18 2026); Custom Agents, IDE extensions, Remote Control (Aug 2026); Scheduled Tasks, subagents, hooks. Free individual tier; Google AI Pro $19.99/mo. Source: https://www.developersdigest.tech/blog/antigravity-google-editor · https://antigravity.google/docs/changelog/
- **OpenAI Codex**: CLI (open source), cloud tasks, ChatGPT web, desktop app (merged with ChatGPT desktop July 2026), IDE extensions; models GPT-5.3-Codex (Feb 2026), Codex-Spark, GPT-5.4 in Codex; Codex Security. Source: https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)
- Evergreen terms to teach: RAG, MCP, agents/subagents, skills, hooks, context window, tokens, embeddings, vector DB, fine-tuning vs RAG, prompt caching, evals, GEO.
