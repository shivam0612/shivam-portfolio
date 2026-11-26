$ErrorActionPreference = "Stop"

# Run from the shivam-portfolio project root.
$ProjectRoot = (Get-Location).Path
$TokenFile = Join-Path $ProjectRoot "client\src\styles\tokens.css"

if (-not (Test-Path -LiteralPath $TokenFile)) {
    Write-Host "ERROR: Cannot find client\src\styles\tokens.css." -ForegroundColor Red
    Write-Host "Open PowerShell in the shivam-portfolio project root and run this script again." -ForegroundColor Yellow
    exit 1
}

$Content = Get-Content -LiteralPath $TokenFile -Raw
$Backup = "$TokenFile.backup-nvidia-tech-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $TokenFile -Destination $Backup

# Replace colours from the previously discussed dark, Google-light, Apple-light,
# and first NVIDIA palettes. Replacement is limited to this theme token file.
$Palette = [ordered]@{
    # Earlier dark theme
    "#080B12" = "#080C08"
    "#0D1320" = "#101810"
    "#111827" = "#172117"
    "#38BDF8" = "#76B900"
    "#8B5CF6" = "#A3E635"
    "#A78BFA" = "#A1ADA1"
    "#F8FAFC" = "#F5F7F5"
    "#94A3B8" = "#A1ADA1"
    "#34D399" = "#76B900"

    # Google light theme
    "#FFFFFF" = "#080C08"
    "#F8F9FA" = "#101810"
    "#1A73E8" = "#76B900"
    "#34A853" = "#8BC34A"
    "#202124" = "#F5F7F5"
    "#5F6368" = "#A1ADA1"
    "#D93025" = "#FF7777"
    "#FBBC05" = "#A3E635"

    # Apple light theme
    "#F5F5F7" = "#101810"
    "#0071E3" = "#76B900"
    "#248A3D" = "#8BC34A"
    "#1D1D1F" = "#F5F7F5"
    "#6E6E73" = "#A1ADA1"
    "#D70015" = "#FF7777"
    "#BF8F00" = "#A3E635"

    # First NVIDIA palette
    "#0B0F0C" = "#080C08"
    "#141A16" = "#101810"
    "#171F19" = "#172117"
    "#A7B0A8" = "#A1ADA1"
    "#C5D86D" = "#A3E635"
    "#FF6B6B" = "#FF7777"
}

$ReplacementCount = 0
foreach ($OldColor in $Palette.Keys) {
    $Before = $Content
    $Content = $Content.Replace($OldColor, $Palette[$OldColor])
    if ($Content -ne $Before) { $ReplacementCount++ }
}

# Remove an earlier copy of this script's background block, if rerun.
$MarkerStart = "/* NVIDIA_TECH_BACKGROUND_START */"
$MarkerEnd = "/* NVIDIA_TECH_BACKGROUND_END */"
$StartIndex = $Content.IndexOf($MarkerStart)
if ($StartIndex -ge 0) {
    $EndIndex = $Content.IndexOf($MarkerEnd, $StartIndex)
    if ($EndIndex -ge 0) {
        $Content = $Content.Remove($StartIndex, ($EndIndex + $MarkerEnd.Length) - $StartIndex)
    }
}

$TechBackground = @'

/* NVIDIA_TECH_BACKGROUND_START */
/* Subtle futuristic green glow and technical grid. */
html {
  background-color: #080C08;
}

body {
  background-color: #080C08 !important;
  background-image:
    radial-gradient(ellipse at 15% 8%, rgba(118, 185, 0, 0.16) 0%, transparent 34%),
    radial-gradient(ellipse at 88% 28%, rgba(118, 185, 0, 0.09) 0%, transparent 30%),
    linear-gradient(rgba(118, 185, 0, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(118, 185, 0, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, #080C08 0%, #0B120B 52%, #080C08 100%) !important;
  background-size: auto, auto, 44px 44px, 44px 44px, auto;
  background-attachment: fixed;
}
/* NVIDIA_TECH_BACKGROUND_END */
'@

$Content = $Content.TrimEnd() + "`r`n" + $TechBackground + "`r`n"
Set-Content -LiteralPath $TokenFile -Value $Content -Encoding UTF8

Write-Host ""
Write-Host "NVIDIA-inspired technology theme applied." -ForegroundColor Green
Write-Host "Updated: $TokenFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "Background: deep tech black with subtle green glow and grid"
Write-Host "Surfaces:   dark charcoal green"
Write-Host "Accent:     NVIDIA green (#76B900)"
Write-Host "Text:       soft white and muted grey-green"
Write-Host ""
Write-Host "No deployment was started. Start the local preview and inspect it before deploying."
