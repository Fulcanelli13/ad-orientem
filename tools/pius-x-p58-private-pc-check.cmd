@echo off
setlocal EnableExtensions DisableDelayedExpansion
rem SPX P2.58 — private Windows-only report. Never downloads or installs anything.
rem Double-click: hardware-only, NO network. "--benchmark" needs an explicitly
rem running localhost model plus AO_SPX_LOCAL_PILOT_MODE, and tests only 127.0.0.1.
pushd "%~dp0\.." || (
 echo Could not open the Ad Orientem repository folder.
 exit /b 1
)
where node.exe >nul 2>nul
if errorlevel 1 (
 echo Node.js is not installed or not on PATH.
 echo No changes were made. Use the existing offline visual novel instead.
 pause
 popd
 exit /b 1
)
if "%~1"=="" (
 node "tools\pius-x-p58-device-report.mjs"
 set "CODE=%ERRORLEVEL%"
 echo.
 echo The report was saved locally under artifacts\pius-x-private-device-reports.
 echo No file was uploaded.
 pause
) else (
 node "tools\pius-x-p58-device-report.mjs" %*
 set "CODE=%ERRORLEVEL%"
)
popd
exit /b %CODE%
