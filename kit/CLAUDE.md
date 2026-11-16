# AI Reels Automation Kit — read me first (instructions for Claude)

This folder is a complete kit: Instagram/YouTube auto-posting + comment-to-DM funnel, a Remotion video studio, and 74 video/Instagram skills.

## Layout
- `automation/` — the posting + DM system (Vercel + Supabase + Instagram API with Instagram Login). Its own rules: `automation/CLAUDE.md`.
- `video-studio/` — `engine/` (kinetic-reel Remotion template), `templates/avatar-explainer/` (avatar narrator + app window format), `animo-kit/` (one-line → full reel kit, MIT), `tools/` (mix, stills, upscale helpers).
- `skills/` — skills, one folder each with `SKILL.md`. Setup copies them to `.claude/skills/` so they load automatically.
- `SETUP-PROMPT.md` — the owner pastes this to start setup. `START-HERE.md` — human guide. `LICENSES.md` — third-party credits (keep them).

## If the owner says "setup this kit" (or pastes SETUP-PROMPT.md)
Follow `SETUP-PROMPT.md` step by step. Keep `automation/docs/STATUS.md` updated after every step so a later session can resume.

## Always
- Execution-first; ask only for credentials the owner must create, destructive actions, or real decisions.
- Secrets only in `.env` / Vercel env / Supabase Vault. Never print them, never ask the owner to paste them in chat, never commit them.
- Copy formulas from viral reels, never other creators' videos, scripts, music or artwork. Verify facts the week you publish.
- When the owner asks for a video, start with `skills/ai-video-editor/SKILL.md` — it routes to the right skill.
