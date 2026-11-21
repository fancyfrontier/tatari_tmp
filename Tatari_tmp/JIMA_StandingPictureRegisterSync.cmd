@echo off
setlocal DisableDelayedExpansion
set "JIMA_REGISTER_SCRIPT=%~dp0tools\JIMA_StandingPictureRegisterSync\register-sync.ps1"
if not exist "%JIMA_REGISTER_SCRIPT%" (
  echo Missing tools\JIMA_StandingPictureRegisterSync\register-sync.ps1
  echo Extract the entire ZIP to the project folder containing game.rmmzproject.
  pause
  exit /b 1
)
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%JIMA_REGISTER_SCRIPT%" -ProjectRoot "%~dp0."
set "JIMA_REGISTER_EXIT=%ERRORLEVEL%"
pause
exit /b %JIMA_REGISTER_EXIT%
