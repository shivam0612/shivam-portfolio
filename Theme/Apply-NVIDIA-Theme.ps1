$ErrorActionPreference = "Stop"

# Run this script from the portfolio project root.
$ProjectRoot = (Get-Location).Path
$TokenFile = Join-Path $ProjectRoot "client\src\styles\tokens.css"

if (-not (Test-Path -LiteralPath $TokenFile)) {
    Write-Host "ERROR: Could not find client\src\styles\tokens.css." -ForegroundColor Red
    Write-Host "Run this script from the shivam-portfolio project root." -ForegroundColor Yellow
    exit 1
}

$Content = Get-Content -LiteralPath $TokenFile -Raw
$Backup = "$TokenFile.backup-nvidia-theme-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $TokenFile -Destination $Backup

# Convert the previously used dark, Google-light, or Apple-light palette
# into a restrained NVIDIA-inspired dark green palette.
$Palette = [ordered]@{
    # Existing dark theme -> NVIDIA
    "#080B12" = "#080B0A"
    "#0D1320" = "#111713"
    "#111827" = "#171F19"
    "#38BDF8" = "#76B900"
    "#8B5CF6" = "#A3D65C"
    "#A78BFA" = "#B5CC8A"
    "#F8FAFC" = "#F5F7F5"
    "#94A3B8" = "#A7B0A8"
    "#34D399" = "#76B900"

    # Google light theme -> NVIDIA
    "#FFFFFF" = "#0B0F0C"
    "#F8F9FA" = "#141A16"
    "#1A73E8" = "#76B900"
    "#34A853" = "#8BC34A"
    "#202124" = "#F5F7F5"
    "#5F6368" = "#A7B0A8"
    "#D93025" = "#FF6B6B"
    "#FBBC05" = "#C5D86D"

    # Apple light theme -> NVIDIA (if that palette was applied)
    "#F5F5F7" = "#141A16"
    "#0071E3" = "#76B900"
    "#248A3D" = "#8BC34A"
    "#1D1D1F" = "#F5F7F5"
    "#6E6E73" = "#A7B0A8"
    "#D70015" = "#FF6B6B"
    "#BF8F00" = "#C5D86D"
}

$ChangedCount = 0
foreach ($OldColor in $Palette.Keys) {
    $NewColor = $Palette[$OldColor]
    $Before = $Content
    $Content = $Content.Replace($OldColor, $NewColor)
    if ($Content -ne $Before) { $ChangedCount++ }
}

Set-Content -LiteralPath $TokenFile -Value $Content -Encoding UTF8

Write-Host ""
Write-Host "NVIDIA-inspired theme applied successfully." -ForegroundColor Green
Write-Host "Updated: $TokenFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "Main background: near-black green (#0B0F0C)"
Write-Host "Surfaces:        dark charcoal green (#141A16)"
Write-Host "Primary accent:  NVIDIA green (#76B900)"
Write-Host "Main text:       soft white (#F5F7F5)"
Write-Host "Secondary text: muted grey-green (#A7B0A8)"
Write-Host ""
Write-Host "No deployment was started. Preview locally before deploying."
