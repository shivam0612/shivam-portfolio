@echo off
setlocal
title Shivam Portfolio - Full Deployment
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-Portfolio.ps1"
if errorlevel 1 (
  echo.
  echo Deployment script ended with an error.
)
endlocal
