@echo off
setlocal EnableExtensions DisableDelayedExpansion
rem SPX P2.58 private PC report: NO downloads, installations, cloud API.
rem Double-click hardware-only; --benchmark needs explicit local model consent.
pushd "%~dp0\.." || (
 echo Could not open the Ad Orientem repository folder.
 exit /b 1
)
where node.exe >nul 2>nul
if errorlevel 1 goto NO_NODE
if "%~1"=="" goto HARDWARE
node "tools\pius-x-p58-device-report.mjs" %*
set "CODE=%ERRORLEVEL%"
goto DONE
:HARDWARE
node "tools\pius-x-p58-device-report.mjs"
set "CODE=%ERRORLEVEL%"
echo.
echo Local-only reports are in artifacts\pius-x-private-device-reports.
echo No file was uploaded.
pause
goto DONE
:NO_NODE
echo Node.js is not installed or not on PATH.
echo No changes were made. The authored offline visual novel remains available.
set "CODE=1"
pause
:DONE
popd
exit /b %CODE%
