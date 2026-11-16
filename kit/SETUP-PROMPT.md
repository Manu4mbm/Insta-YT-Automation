# Setup prompt — paste this into Claude Code (opened in this kit folder)

```
Setup this kit for me. Read CLAUDE.md, automation/CLAUDE.md and automation/docs/*.md first, then do every step below in order.
After each step, tick it in automation/docs/STATUS.md. Skip anything STATUS.md already marks done.
Never show, print or ask me to paste any secret/token in chat — when a secret is needed, tell me exactly where to put it (.env / Vercel / Supabase) and wait.

STEP 0 — Ask me once, in one message (then fill every {{PLACEHOLDER}} in CLAUDE.md, automation/CLAUDE.md, automation/public/*.html, automation/public/guides/*.html and skills/reel-content-workflow/CONTENT-STRATEGY.md):
  owner name, business name, Instagram handle, contact email, niche, audience, language for scripts (Hinglish/Hindi/English), voice (ElevenLabs voice name or "I record"), preferred app name for the Vercel URL.

STEP 1 — Skills: copy skills/* into ./.claude/skills/ (and also ~/.claude/skills/ if I say yes). Install the official Remotion skills too:
  `npx skills add remotion-dev/skills` (if that CLI is missing: clone github.com/remotion-dev/skills and copy its skills/* the same way).
  Then show me a table: skill → what it makes → what input it needs.

STEP 2 — Tools: check/install node 20+, python 3.11+, ffmpeg, git, gh. Python (CPU is fine): torch torchaudio, faster-whisper, soundfile, numpy, uroman.
  Run `npm install` in video-studio/engine, video-studio/templates/avatar-explainer and video-studio/animo-kit.
  Do one test render with video-studio/engine (5-second still or short clip) and show me the frame.

STEP 3 — Automation backend (automation/):
  a) GitHub: create a private repo from automation/ (gh repo create) and push. .env must stay ignored.
  b) Supabase: create a project (Supabase MCP if connected, else tell me the clicks). Run supabase/schema.sql. Create a PUBLIC storage bucket named "reels".
  c) Vercel: create the project from the GitHub repo (Vercel MCP/CLI if connected, else tell me the clicks). Generate CRON_SECRET and WEBHOOK_VERIFY_TOKEN yourself (long random strings) and write them into .env without printing them.
     Give me the list of env vars from .env.example; I add the Instagram/Supabase/Razorpay secrets myself in Vercel. Deploy, then check https://<app>/api/health.
  d) Meta / Instagram: walk me through automation/docs/META-SETUP.md one step at a time (Professional account, Meta app, permissions, long-lived token, webhook URL = https://<app>/api/webhook with my verify token, subscribe "comments").
  e) Run supabase/cron.sql with my app URL and the CRON_SECRET from .env (via Vault — never echo the value).
  f) Optional: YouTube Shorts (automation/docs/YOUTUBE.md) and paid guides with Razorpay — ask me if I want them.

STEP 4 — Test end to end: queue one test reel (scripts/queue-reel.ts or an insert in posts + dm_rules), confirm it publishes, comment the keyword from a second account, confirm the DM arrives. Fix only what blocks this.

STEP 5 — Show me: what is live, my URLs (app, /guides), the daily workflow ("make a reel about X" → script → voice → reel → approval → schedule), and the 5 rules from automation/CLAUDE.md "Hard rules".
```

## After setup — everyday prompts
- `Reel banao: <topic>. Mera niche <niche>. Script pehle dikhao.`
- `Ye reference reel dekho aur iska formula use karke meri reel banao (video copy nahi).` (attach the reel)
- `Is reel ka lead magnet guide banao, keyword GUIDE, aur kal 13:30 pe trial reel ki tarah schedule karo.`
- `Mere competitors ki sabse viral reels dhundho (outlier method) aur 3 hooks do.`
- `Last 10 reels ka audit karo — kya chal raha hai, kya band karna hai.`
