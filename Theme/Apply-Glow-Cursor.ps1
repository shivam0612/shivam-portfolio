$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Location).Path
$LayoutFile = Join-Path $ProjectRoot "client\src\styles\layout.css"

if (-not (Test-Path -LiteralPath $LayoutFile)) {
    Write-Host "ERROR: client\src\styles\layout.css was not found." -ForegroundColor Red
    Write-Host "Run this script from the shivam-portfolio project root." -ForegroundColor Yellow
    exit 1
}

$Content = Get-Content -LiteralPath $LayoutFile -Raw
$Marker = "/* ---------- custom cursor"
$Index = $Content.IndexOf($Marker)

if ($Index -lt 0) {
    Write-Host "ERROR: Existing custom cursor CSS section was not found. No changes made." -ForegroundColor Red
    exit 1
}

$Backup = "$LayoutFile.backup-glow-cursor-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $LayoutFile -Destination $Backup

$NewCursorCss = @'
/* ---------- colourful glow cursor (native arrow remains visible) ---------- */
.cursor {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

/* Keep the browser's normal arrow visible; only the decorative glow follows behind it. */
.cursor__dot {
  display: none;
}

.cursor__ring {
  position: fixed;
  left: 0;
  top: 0;
  width: 38px;
  height: 38px;
  margin: -19px 0 0 -19px;
  display: grid;
  place-items: center;
  opacity: 0;
  will-change: transform;
  transition:
    opacity 0.2s,
    filter 0.25s var(--ease);
  filter:
    drop-shadow(0 0 5px rgba(118, 185, 0, 0.55))
    drop-shadow(0 0 12px rgba(0, 212, 255, 0.28));
}
.cursor-visible .cursor__ring {
  opacity: 1;
}
.cursor__ring::before,
.cursor__ring::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
}
.cursor__ring::before {
  padding: 1.5px;
  background: conic-gradient(
    from 35deg,
    #76B900 0deg,
    #00D4FF 115deg,
    #8B5CF6 235deg,
    #76B900 360deg
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  transition:
    transform 0.3s var(--ease),
    opacity 0.3s;
}
.cursor__ring::after {
  inset: 5px;
  background: radial-gradient(
    circle,
    rgba(118, 185, 0, 0.12) 0%,
    rgba(0, 212, 255, 0.06) 45%,
    transparent 72%
  );
  filter: blur(5px);
  opacity: 0.9;
}
.cursor__ring[data-state='link'] {
  filter:
    drop-shadow(0 0 7px rgba(118, 185, 0, 0.7))
    drop-shadow(0 0 16px rgba(0, 212, 255, 0.4));
}
.cursor__ring[data-state='link']::before {
  transform: scale(1.35);
}
.cursor__ring[data-state='button']::before {
  transform: scale(1.55);
}
.cursor__ring[data-state='card']::before {
  transform: scale(1.9);
}
.cursor__ring[data-state='diagram']::before {
  transform: scale(1.55);
}
.cursor__ring[data-state='hidden'] {
  opacity: 0 !important;
}
.cursor__label {
  position: relative;
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--text);
  opacity: 0;
  transition: opacity 0.2s;
}
.cursor__ring[data-state='card'] .cursor__label,
.cursor__ring[data-state='diagram'] .cursor__label {
  opacity: 1;
}
.cursor__ring.is-pulsing::after {
  inset: 0;
  border: 1px solid var(--accent);
  background: transparent;
  filter: none;
  animation: cursor-pulse 0.5s ease-out;
}
@keyframes cursor-pulse {
  from {
    transform: scale(1);
    opacity: 0.8;
  }
  to {
    transform: scale(2.2);
    opacity: 0;
  }
}
'@

$Content = $Content.Substring(0, $Index) + $NewCursorCss + "`r`n"
Set-Content -LiteralPath $LayoutFile -Value $Content -Encoding UTF8

Write-Host ""
Write-Host "Colourful glow cursor applied successfully." -ForegroundColor Green
Write-Host "Updated: $LayoutFile"
Write-Host "Backup:  $Backup"
Write-Host ""
Write-Host "The normal mouse arrow remains visible."
Write-Host "A green, cyan and purple glow ring follows it."
Write-Host "No deployment was started."
