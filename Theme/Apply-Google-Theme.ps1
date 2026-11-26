$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\Admin\Documents\AWS-DEVOPS-PROJECT\development\shivam-portfolio"
$TokenFile = Join-Path $ProjectRoot "client\src\styles\tokens.css"

if (-not (Test-Path -LiteralPath $TokenFile)) {
    Write-Host "ERROR: Theme file not found: $TokenFile" -ForegroundColor Red
    Write-Host "Open this script and confirm the project path." -ForegroundColor Yellow
    exit 1
}

$Backup = "$TokenFile.backup-google-theme-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $TokenFile -Destination $Backup

$NewTokens = @'
/* Google-inspired light theme palette */
:root {
  --bg: #ffffff;
  --bg-2: #f8f9fa;
  --card: #ffffff;

  /* Google brand palette */
  --accent: #1a73e8;
  --accent-2: #34a853;
  --accent-2-text: #188038;
  --google-blue: #4285f4;
  --google-red: #ea4335;
  --google-yellow: #fbbc05;
  --google-green: #34a853;

  --success: #188038;
  --danger: #d93025;
  --text: #202124;
  --muted: #5f6368;

  --line: rgba(60, 64, 67, 0.12);
  --line-strong: rgba(60, 64, 67, 0.24);
  --glow: rgba(26, 115, 232, 0.10);

  --font-display: 'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-body:
    'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;

  --fs-body: 1.0625rem;
  --fs-small: 0.875rem;
  --fs-title: clamp(2.5rem, 1.4rem + 4.6vw, 4.9rem);
  --fs-page: clamp(2.5rem, 1.4rem + 4.4vw, 4.5rem);
  --fs-section: clamp(1.9rem, 1.2rem + 2.6vw, 3.25rem);

  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 22px;

  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --container: 1200px;
  --gutter: clamp(1.25rem, 4vw, 2.5rem);
  --nav-h: 72px;
  --space-section: clamp(4.5rem, 9vw, 8rem);
}
'@

Set-Content -LiteralPath $TokenFile -Value $NewTokens -Encoding utf8

Write-Host ""
Write-Host "Google-inspired theme applied successfully." -ForegroundColor Green
Write-Host "Updated: $TokenFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "Main colors:" -ForegroundColor Cyan
Write-Host "Background: White (#FFFFFF)"
Write-Host "Surface:    Google light grey (#F8F9FA)"
Write-Host "Primary:    Google blue (#1A73E8)"
Write-Host "Secondary:  Google green (#34A853)"
Write-Host "Text:       Google dark grey (#202124)"
Write-Host ""
Write-Host "No deployment was started. Review locally, then run your normal Deploy-Portfolio.bat when ready." -ForegroundColor Yellow
