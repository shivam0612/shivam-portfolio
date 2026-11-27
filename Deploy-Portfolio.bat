@echo off
setlocal
title Shivam Portfolio - Safe Deployment Manager

set "SCRIPT=%~dp0Deploy-Portfolio.ps1"

if not exist "%SCRIPT%" (
    echo.
    echo ERROR: Deploy-Portfolio.ps1 was not found.
    echo Expected location:
    echo %SCRIPT%
    echo.
    pause
    endlocal
    exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"

set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
    echo.
    echo Deployment manager ended with an error.
    echo Exit code: %EXITCODE%
    pause
)

endlocal & exit /b %EXITCODE%
