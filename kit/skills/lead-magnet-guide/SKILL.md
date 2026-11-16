---
name: lead-magnet-guide
description: Make the free guide that gets DMed when someone comments a reel's keyword — a mobile-first HTML page (+ PDF) with setup steps, copy-paste prompts and fixes, deployed under /guides/<slug>. Use when a reel needs its "comment X → guide DM mein" resource, a cheat sheet, prompt pack or guides hub page.
---

# Lead-magnet guide

Examples in `examples/` (claude-effects.html, insta-yt-automation.html, index.html = guides hub). Copy their structure and style.

## Steps
1. Read the reel's script + post.json: what promise did the reel make? The guide must deliver exactly that, nothing generic.
2. Verify every tool fact, install command, price and limit against the official docs **this week**; list sources at the bottom.
3. Write `public/guides/<slug>.html` (inside the automation project):
   - Mobile-first single page, no login, brand colours, big tap targets, fast (no heavy libraries).
   - Top: one-line promise + badge (FREE GUIDE). Then numbered steps (1 Setup, 2 Install, 3 Use, 4 Pro tips).
   - Every prompt/command in a copy-able code block. Short Hinglish sentences.
   - Show what the reel showed (same names/order), then "aur bhi" extras.
   - End: follow CTA + link back to the guides hub; credit original creators of any skill/tool used.
4. Make a PDF version of the same page (headless Chrome print, A4) → `public/guides/<slug>.pdf`.
5. Add a card for it on `public/guides/index.html` (hub for the bio link).
6. `post.json`: `guide_url` = `https://<app>/guides/<slug>`, `dm_text` = 1 line value + link + soft follow CTA.
7. Deploy (push → Vercel) and open the URL on a phone-width viewport to check before the reel is queued.

## Rules
- No fake numbers, no income claims, no copyrighted text pasted in (summarise + link).
- Keyword = short, unique, UPPERCASE, same word the reel says.
