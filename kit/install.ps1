# Copies the kit's skills into this project (.claude\skills) and, with -Global, your global Claude Code skills folder.
param([switch]$Global)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path "$here\.claude\skills" | Out-Null
Copy-Item -Path "$here\skills\*" -Destination "$here\.claude\skills" -Recurse -Force
Write-Host "OK skills -> $here\.claude\skills"
if ($Global) { New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills" | Out-Null; Copy-Item -Path "$here\skills\*" -Destination "$HOME\.claude\skills" -Recurse -Force; Write-Host "OK skills -> $HOME\.claude\skills" }
Write-Host "Done. Claude Code is folder mein kholo aur SETUP-PROMPT.md wala prompt paste karo."
