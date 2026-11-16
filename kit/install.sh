#!/usr/bin/env bash
# Copies the kit's skills into this project (.claude/skills) and, optionally, your global Claude Code skills folder.
set -e; HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/.claude/skills"; cp -R "$HERE/skills/." "$HERE/.claude/skills/"; echo "✓ skills → $HERE/.claude/skills"
if [ "$1" = "--global" ]; then mkdir -p "$HOME/.claude/skills"; cp -R "$HERE/skills/." "$HOME/.claude/skills/"; echo "✓ skills → $HOME/.claude/skills"; fi
echo "Done. Claude Code is folder mein kholo aur SETUP-PROMPT.md wala prompt paste karo."
