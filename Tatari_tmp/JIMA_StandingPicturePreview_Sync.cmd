@echo off
setlocal DisableDelayedExpansion
set "JIMA_SYNC_PS1=%~dp0tools\JIMA_StandingPicturePreview\preview-sync.ps1"
if not exist "%JIMA_SYNC_PS1%" (
  echo Sync files not found. Extract the complete ZIP into the RPG Maker project folder.
  pause
  exit /b 1
)
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%JIMA_SYNC_PS1%"
if errorlevel 1 pause
exit /b
