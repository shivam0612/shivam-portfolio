$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Location).Path
$TokenFile = Join-Path $ProjectRoot "client\src\styles\tokens.css"

if (-not (Test-Path -LiteralPath $TokenFile)) {
    Write-Host "ERROR: tokens.css not found. Run from the shivam-portfolio project root." -ForegroundColor Red
    exit 1
}

$Content = Get-Content -LiteralPath $TokenFile -Raw
$Backup = "$TokenFile.backup-contrast-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $TokenFile -Destination $Backup

# Set the NVIDIA dark palette directly by CSS variable name.
$Variables = [ordered]@{
    "--bg"            = "#080C08"
    "--bg-2"          = "#101810"
    "--card"          = "#172117"
    "--accent"        = "#76B900"
    "--accent-2"      = "#A3E635"
    "--accent-2-text" = "#A3E635"
    "--google-blue"   = "#76B900"
    "--google-red"    = "#FF7777"
    "--google-yellow" = "#A3E635"
    "--google-green"  = "#76B900"
    "--success"       = "#A3E635"
    "--danger"        = "#FF7777"
    "--text"          = "#F5F7F5"
    "--muted"         = "#C2CCC2"
    "--line"          = "rgba(190, 220, 180, 0.18)"
    "--line-strong"   = "rgba(190, 220, 180, 0.32)"
    "--glow"          = "rgba(118, 185, 0, 0.18)"
}

foreach ($Name in $Variables.Keys) {
    $Value = $Variables[$Name]
    $Pattern = "(?m)^(\s*" + [regex]::Escape($Name) + "\s*:\s*)[^;]+(;)"
    if ([regex]::IsMatch($Content, $Pattern)) {
        $Content = [regex]::Replace($Content, $Pattern, ('$1' + $Value + '$2'), 1)
    }
}

# Keep secondary text readable and ensure the file ends cleanly.
Set-Content -LiteralPath $TokenFile -Value $Content -Encoding UTF8

Write-Host ""
Write-Host "NVIDIA theme contrast updated successfully." -ForegroundColor Green
Write-Host "Updated: $TokenFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "Main text:       #F5F7F5"
Write-Host "Secondary text:  #C2CCC2 (brighter for phone numbers, skills and labels)"
Write-Host "Accent:          NVIDIA green #76B900"
Write-Host "Background:      deep tech black #080C08"
Write-Host ""
Write-Host "No deployment was started. Review locally before deploying."
