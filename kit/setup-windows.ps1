# AI Reels Automation Kit - Windows setup (run once)
# Right-click Start > "Terminal (Admin)" or PowerShell, then:
#   cd "C:\Users\Admin\Downloads\AI-Reels-Automation-Kit\AI-Reels-Automation-Kit"
#   Set-ExecutionPolicy -Scope Process Bypass -Force
#   .\setup-windows.ps1            (add -SkipPython to skip the ~2 GB caption/AI packages)
param([switch]$SkipPython)
$ErrorActionPreference = "Continue"
$kit = Split-Path -Parent $MyInvocation.MyCommand.Path

function Have($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function RefreshPath { $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User") }
function Need($cmd, $wingetId) {
  if (Have $cmd) { Write-Host "OK  $cmd already installed" -ForegroundColor Green }
  else { Write-Host ">>  Installing $wingetId ..." -ForegroundColor Yellow
         winget install --id $wingetId -e --accept-source-agreements --accept-package-agreements --silent; RefreshPath }
}

Write-Host "`n=== 1/5 Tools ===" -ForegroundColor Cyan
Need node   "OpenJS.NodeJS.LTS"
Need git    "Git.Git"
Need gh     "GitHub.cli"
Need ffmpeg "Gyan.FFmpeg"
if (-not $SkipPython) { Need python "Python.Python.3.11" }
RefreshPath
node -v; git --version; ffmpeg -version | Select-Object -First 1

Write-Host "`n=== 2/5 Skills (project + global) ===" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$kit\.claude\skills","$HOME\.claude\skills" | Out-Null
Copy-Item "$kit\skills\*" "$kit\.claude\skills" -Recurse -Force
Copy-Item "$kit\.claude\skills\*" "$HOME\.claude\skills" -Recurse -Force
Write-Host ("OK  " + (Get-ChildItem "$kit\.claude\skills" -Directory).Count + " skills installed")

Write-Host "`n=== 3/5 npm install (video studio + automation) ===" -ForegroundColor Cyan
foreach ($p in "video-studio\animo-kit","video-studio\engine","video-studio\templates\avatar-explainer","automation") {
  Write-Host ">>  $p"; Push-Location "$kit\$p"; npm install --no-audit --no-fund; Pop-Location
}

if (-not $SkipPython) {
  Write-Host "`n=== 4/5 Python (captions / timing, CPU) ===" -ForegroundColor Cyan
  python -m pip install --upgrade pip
  python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  python -m pip install faster-whisper soundfile numpy uroman
} else { Write-Host "`n=== 4/5 Python skipped ===" }

Write-Host "`n=== 5/5 Test render ===" -ForegroundColor Cyan
Push-Location "$kit\video-studio\animo-kit"
npx remotion still Demo out\test-frame.png --frame=90
if ($LASTEXITCODE -eq 0) { Write-Host "OK  Test frame: $kit\video-studio\animo-kit\out\test-frame.png" -ForegroundColor Green
  Write-Host "    Full demo video:  npm run demo   (writes out\Demo.mp4)" }
else { Write-Host "Render failed - run: npx remotion still Demo out\test-frame.png --browser-executable=`"C:\Program Files\Google\Chrome\Application\chrome.exe`"" -ForegroundColor Red }
Pop-Location
Write-Host "`nDone. Next: open Claude Code in this folder and paste the prompt from SETUP-PROMPT.md" -ForegroundColor Cyan
