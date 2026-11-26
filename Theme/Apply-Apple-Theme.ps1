$ErrorActionPreference = "Stop"

# Apply a clean Apple-inspired light palette to the portfolio design tokens.
$ProjectRoot = (Get-Location).Path
$TokenFile = Join-Path $ProjectRoot "client\src\styles\tokens.css"

if (-not (Test-Path $TokenFile)) {
    Write-Host "ERROR: tokens.css was not found." -ForegroundColor Red
    Write-Host "Run this script from the project root: ...\shivam-portfolio" -ForegroundColor Yellow
    exit 1
}

$Content = Get-Content -Raw -Path $TokenFile
$Backup = "$TokenFile.backup-apple-theme-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $TokenFile -Destination $Backup

# Replace the Google-inspired palette currently applied in tokens.css.
$Replacements = [ordered]@{
    "#FFFFFF" = "#FFFFFF"  # Main background
    "#F8F9FA" = "#F5F5F7"  # Apple-style secondary background
    "#1A73E8" = "#0071E3"  # Apple blue
    "#34A853" = "#248A3D"  # Restrained green accent
    "#202124" = "#1D1D1F"  # Apple near-black text
    "#5F6368" = "#6E6E73"  # Secondary text
    "#D93025" = "#D70015"  # Apple-style red
    "#FBBC05" = "#BF8F00"  # Muted warm accent
}

$Changed = 0
foreach ($Old in $Replacements.Keys) {
    if ($Old -ne $Replacements[$Old]) {
        $Before = $Content
        $Content = $Content.Replace($Old, $Replacements[$Old])
        if ($Content -ne $Before) { $Changed++ }
    }
}

# Ensure the file is written as UTF-8 without changing unrelated project files.
Set-Content -LiteralPath $TokenFile -Value $Content -Encoding UTF8

Write-Host ""
Write-Host "Apple-inspired theme applied successfully." -ForegroundColor Green
Write-Host "Updated: $TokenFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "Palette: white, Apple light grey, Apple blue, near-black text."
Write-Host "No deployment was started."
Write-Host "Preview locally before deploying."
