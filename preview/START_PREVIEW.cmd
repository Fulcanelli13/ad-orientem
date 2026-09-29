@echo off
setlocal
cd /d "%~dp0"
set "PORT=8765"
echo Starting Ad Orientem preview at http://127.0.0.1:%PORT%/
echo Keep the server window open while testing.
start "Ad Orientem Preview Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0PREVIEW_SERVER.ps1" -Port %PORT%
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/index.html"
exit /b
