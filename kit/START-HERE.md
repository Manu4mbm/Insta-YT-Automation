# AI Reels Automation Kit — START HERE

Ek folder jo aapke Claude ko ek poora reels studio + automation bana deta hai:

- 🎬 **Video editing:** script → AI voice → word-synced captions → motion graphics / avatar narrator / effects → render → self-check. 74 skills + Remotion video studio.
- 🤖 **Auto-posting:** Instagram Reels (trial reels bhi) + YouTube Shorts apne aap scheduled time pe.
- 💬 **Comment → DM funnel:** koi "GUIDE" comment kare → follow check → DM mein free guide ka link. Rate limits, cooldowns, spam-safety built in.
- 📊 **Analytics:** har reel ke 1/3/6/24/48 ghante ke numbers + kaunsa posting slot best hai.
- 💳 **Optional:** paid guides/kits with Razorpay payment links + auto email delivery.

## Kya chahiye
- **Claude Code** (desktop app ya terminal) — Claude Pro/Max plan. (claude.ai web chat mein sirf skills chalengi, automation deploy ke liye Claude Code chahiye.)
- Free accounts: **GitHub, Vercel, Supabase, Meta for Developers**. Optional: ElevenLabs (voice), Google Cloud (YouTube), Razorpay.
- Instagram **Professional** account (Creator/Business), public.
- Laptop: Node 20+, Python 3.11+, ffmpeg, git — setup khud install karwa deta hai.

## Setup (3 steps)
1. Zip extract karo, jaise `D:\reels-kit` ya `~/reels-kit`.
2. Claude Code ko is folder mein kholo (Claude desktop → Code → folder select karo, ya terminal mein `cd reels-kit && claude`).
3. `SETUP-PROMPT.md` ka prompt copy karke paste karo. Claude step by step sab set karega aur sirf wahi poochega jo aapko khud karna hai (accounts, tokens).

⏱ Time: 1–2 ghante (Meta App Review alag — public users ko DM bhejne ke liye 1–3 hafte lag sakte hain; tab tak tester accounts pe chalega).

## Security
- Tokens/keys sirf `.env`, Vercel env vars aur Supabase Vault mein. **Kabhi chat mein paste mat karo.**
- `.env` kabhi GitHub pe nahi jaata (`.gitignore` mein hai).

## Folder
| Folder | Kya hai |
|---|---|
| `automation/` | Posting + DM system (Vercel + Supabase + Instagram API) — docs `automation/docs/` |
| `video-studio/` | Remotion engine, avatar-explainer template, animo kit, tools |
| `skills/` | 74 skills — list: `SKILLS-INDEX.md` |
| `SETUP-PROMPT.md` | Ek prompt jo poora setup karwata hai |
| `LICENSES.md` | Credits + commercial-use notes (Remotion licence, music) |

## Rozana use
"Reel banao: <topic>" → Claude script dikhata hai → approve → voice → reel + cover + caption → "kal 13:30 pe schedule karo" → auto-post + DM funnel chalu.
