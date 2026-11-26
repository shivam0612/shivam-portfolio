#requires -Version 5.1
$ErrorActionPreference = "Stop"

# ================= USER CONFIGURATION =================
$ProjectRoot = "C:\Users\Admin\Documents\AWS-DEVOPS-PROJECT\development\shivam-portfolio"
$GitBranch = "main"
$GitRemote = "origin"

$AwsProfile = "portfolio-admin"
$AwsRegion = "ca-central-1"
$AwsAccount = "316356967320"
$EcrRepository = "shivam-portfolio-api"

$SshTarget = "ubuntu@15.156.221.182"
$SshKey = ""   # Optional: enter a full .pem path here, or leave blank to use ssh-agent/default SSH config.
$RemoteProject = "/home/ubuntu/shivam-portfolio"

$WebsiteUrl = "https://shivampatel.site"
# ======================================================

function Stop-WithMessage([string]$Message) {
    Write-Host "`nERROR: $Message" -ForegroundColor Red
    throw $Message
}
function Invoke-Checked([string]$File, [string[]]$Arguments, [string]$Label) {
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "$Label failed (exit $LASTEXITCODE)." }
}
function Invoke-Ssh([string]$RemoteCommand, [string]$Label) {
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan
    if ($SshKey.Trim()) {
        & ssh -i $SshKey -o BatchMode=yes -o StrictHostKeyChecking=accept-new $SshTarget $RemoteCommand
    } else {
        & ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new $SshTarget $RemoteCommand
    }
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "$Label failed (exit $LASTEXITCODE)." }
}

try {
    Write-Host "`n===============================================" -ForegroundColor Green
    Write-Host " SHIVAM PORTFOLIO - BUILD, GITHUB, ECR & DEPLOY" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green

    if (!(Test-Path $ProjectRoot)) { Stop-WithMessage "Project folder not found: $ProjectRoot" }
    Set-Location $ProjectRoot

    foreach ($cmd in @("git", "node", "npm", "docker", "aws", "ssh")) {
        if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) { Stop-WithMessage "Required command not found: $cmd" }
    }

    # Validate repository and branch before touching files.
    $branch = (& git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne $GitBranch) {
        Stop-WithMessage "Expected Git branch '$GitBranch', found '$branch'. Switch branches manually and rerun."
    }
    $remoteUrl = (& git remote get-url $GitRemote).Trim()
    if ($LASTEXITCODE -ne 0 -or $remoteUrl -notmatch "shivam0612/shivam-portfolio") {
        Stop-WithMessage "Git remote '$GitRemote' is not the expected shivam0612/shivam-portfolio repository."
    }

    # Run the same client/server checks used for the project.
    Invoke-Checked "npm" @("run", "test", "-w", "client") "CLIENT TESTS"
    Invoke-Checked "npm" @("run", "test", "-w", "server") "SERVER TESTS"
    Invoke-Checked "npm" @("run", "build", "-w", "client") "CLIENT PRODUCTION BUILD"
    Invoke-Checked "npm" @("run", "build", "-w", "server") "SERVER PRODUCTION BUILD"

    # Stage project changes but exclude timestamped scratch/backup files.
    Write-Host "`n===== REVIEWING CHANGES =====" -ForegroundColor Cyan
    & git add -A -- . ":(exclude)**/*.backup-*" ":(exclude)**/*backup-*"
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Git staging failed." }

    & git status --short
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Could not read Git status." }

    $staged = (& git diff --cached --name-only)
    if ($staged) {
        Write-Host "`nStaged files:" -ForegroundColor Yellow
        $staged | ForEach-Object { Write-Host "  $_" }
        Write-Host "`nReview staged changes carefully. .env files should remain ignored and must never be committed."
        $confirmCommit = Read-Host "Commit and push these staged changes to GitHub? Type YES"
        if ($confirmCommit -cne "YES") { Stop-WithMessage "Stopped before commit/push. No deployment performed." }

        $commitMessage = Read-Host "Commit message (leave blank for automatic message)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Deploy portfolio $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        Invoke-Checked "git" @("commit", "-m", $commitMessage) "GIT COMMIT"
    } else {
        Write-Host "No new staged changes; using current commit."
    }

    Invoke-Checked "git" @("push", $GitRemote, $GitBranch) "PUSH TO GITHUB"

    $commit = (& git rev-parse --short HEAD).Trim()
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Could not determine Git commit." }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $tag = "deploy-$commit-$stamp"
    $ecrHost = "$AwsAccount.dkr.ecr.$AwsRegion.amazonaws.com"
    $image = "$ecrHost/$EcrRepository`:$tag"
    $localImage = "shivam-portfolio:$tag"

    # Ensure the AWS session is valid; invoke interactive AWS login only if needed.
    Write-Host "`n===== CHECK AWS SESSION =====" -ForegroundColor Cyan
    & aws sts get-caller-identity --profile $AwsProfile --output json
    if ($LASTEXITCODE -ne 0) {
        Write-Host "AWS session needs login. Complete the AWS browser/device login if prompted." -ForegroundColor Yellow
        Invoke-Checked "aws" @("login", "--profile", $AwsProfile) "AWS LOGIN"
        Invoke-Checked "aws" @("sts", "get-caller-identity", "--profile", $AwsProfile) "VERIFY AWS SESSION"
    }

    # Confirm immutable tag is unused.
    & aws ecr describe-images --repository-name $EcrRepository --image-ids "imageTag=$tag" --region $AwsRegion --profile $AwsProfile 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { Stop-WithMessage "ECR tag $tag already exists. Rerun to generate a new timestamped tag." }

    Invoke-Checked "docker" @("build", "--platform", "linux/amd64", "-t", $localImage, ".") "BUILD PRODUCTION DOCKER IMAGE"

    Write-Host "`n===== LOGIN TO ECR =====" -ForegroundColor Cyan
    $password = & aws ecr get-login-password --region $AwsRegion --profile $AwsProfile
    if ($LASTEXITCODE -ne 0 -or !$password) { Stop-WithMessage "Could not obtain ECR login token." }
    $password | & docker login --username AWS --password-stdin $ecrHost
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Docker ECR login failed." }

    Invoke-Checked "docker" @("tag", $localImage, $image) "TAG IMAGE FOR ECR"
    Invoke-Checked "docker" @("push", $image) "PUSH IMAGE TO ECR"

    # Verify exact immutable tag in ECR.
    Invoke-Checked "aws" @("ecr", "describe-images", "--repository-name", $EcrRepository, "--image-ids", "imageTag=$tag", "--region", $AwsRegion, "--profile", $AwsProfile, "--output", "table") "VERIFY ECR IMAGE"

    # SSH connectivity check. Configure $SshKey above if the key is not in ssh-agent/default config.
    $sshCheck = "test -d '$RemoteProject' && cd '$RemoteProject' && docker compose config --quiet && echo SSH_AND_COMPOSE_OK"
    Invoke-Ssh $sshCheck "CHECK LIGHTSAIL SSH AND COMPOSE"

    Write-Host "`nReady to deploy this image:" -ForegroundColor Yellow
    Write-Host $image -ForegroundColor Yellow
    $deployConfirm = Read-Host "Deploy to production Lightsail now? Type DEPLOY"
    if ($deployConfirm -cne "DEPLOY") { Stop-WithMessage "Stopped before production deployment. Image is safely stored in ECR; website unchanged." }

    # Remote deployment script: backup Compose, change app image only, pull, update app only,
    # verify DB/Caddy container IDs, health-check, and automatically roll back on failure.
    $remoteScript = @'
#!/usr/bin/env bash
set -Eeuo pipefail
NEW_IMAGE="$1"
cd /home/ubuntu/shivam-portfolio

BACKUP="docker-compose.yml.autobackup-$(date +%Y%m%d-%H%M%S)"
cp -p docker-compose.yml "$BACKUP"
DB_BEFORE="$(docker compose ps -q db)"
CADDY_BEFORE="$(docker compose ps -q caddy)"

rollback() {
  echo "DEPLOYMENT FAILED - attempting application-only rollback"
  cp -p "$BACKUP" docker-compose.yml
  docker compose config --quiet
  docker compose up -d --no-deps app || true
  echo "Rollback attempted. Backup: $BACKUP"
}
trap rollback ERR

python3 - "$NEW_IMAGE" <<'PY'
from pathlib import Path
import sys

path = Path("docker-compose.yml")
new_image = sys.argv[1]
lines = path.read_text().splitlines(keepends=True)

service_start = None
for i, line in enumerate(lines):
    if line.rstrip("\r\n") == "  app:":
        service_start = i
        break
if service_start is None:
    raise SystemExit("Could not locate app service.")

service_end = len(lines)
for i in range(service_start + 1, len(lines)):
    if lines[i].startswith("  ") and not lines[i].startswith("    ") and lines[i].strip().endswith(":"):
        service_end = i
        break

image_line = None
for i in range(service_start + 1, service_end):
    if lines[i].startswith("    image:"):
        image_line = i
        break
if image_line is None:
    raise SystemExit("Could not locate app image line.")

indent = lines[image_line][:len(lines[image_line]) - len(lines[image_line].lstrip())]
lines[image_line] = f"{indent}image: {new_image}\n"
path.write_text("".join(lines))
print("Updated only the app image reference.")
PY

docker compose config --quiet
docker compose pull app
docker compose up -d --no-deps app

for n in $(seq 1 30); do
  STATUS="$(docker inspect shivam-portfolio-app --format '{{.State.Health.Status}}' 2>/dev/null || true)"
  if [ "$STATUS" = "healthy" ]; then break; fi
  sleep 5
done

STATUS="$(docker inspect shivam-portfolio-app --format '{{.State.Health.Status}}')"
if [ "$STATUS" != "healthy" ]; then
  docker compose logs --tail=100 app
  echo "Application did not become healthy (status: $STATUS)"
  false
fi

test "$DB_BEFORE" = "$(docker compose ps -q db)"
test "$CADDY_BEFORE" = "$(docker compose ps -q caddy)"

echo "===== PRODUCTION CONTAINERS ====="
docker compose ps
echo "===== DEPLOYED APP IMAGE ====="
docker inspect shivam-portfolio-app --format '{{.Config.Image}}'
echo "===== APP HEALTH ====="
docker inspect shivam-portfolio-app --format '{{.State.Health.Status}}'
echo "===== DATABASE AND CADDY PRESERVED ====="
echo "DB and Caddy container IDs unchanged."

trap - ERR
echo "DEPLOYMENT_SUCCESS"
'@

    $remoteBytes = [System.Text.Encoding]::UTF8.GetBytes($remoteScript)
    $remoteBase64 = [Convert]::ToBase64String($remoteBytes)
    $remoteCommand = "echo '$remoteBase64' | base64 -d | bash -s -- '$image'"

    Invoke-Ssh $remoteCommand "DEPLOY TO LIGHTSAIL (APP SERVICE ONLY)"

    # Public HTTPS checks after successful remote health check.
    Write-Host "`n===== PUBLIC WEBSITE HEALTH CHECKS =====" -ForegroundColor Cyan
    foreach ($path in @("/", "/api/health", "/api/health/ready")) {
        $url = "$WebsiteUrl$path"
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 30 -UseBasicParsing
            Write-Host "$url -> HTTP $([int]$response.StatusCode)"
            if ([int]$response.StatusCode -lt 200 -or [int]$response.StatusCode -ge 400) {
                Stop-WithMessage "Health check failed for $url"
            }
        } catch {
            Stop-WithMessage "Public health check failed for $url : $($_.Exception.Message)"
        }
    }

    Write-Host "`n===============================================" -ForegroundColor Green
    Write-Host " DEPLOYMENT COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "Git commit: $commit" -ForegroundColor Green
    Write-Host "ECR image:  $image" -ForegroundColor Green
    Write-Host "Website:    $WebsiteUrl" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
}
catch {
    Write-Host "`nPROCESS STOPPED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Review the error above. The script stops at the first failed check." -ForegroundColor Yellow
    exit 1
}
finally {
    Write-Host "`nPress Enter to close this window..."
    [void](Read-Host)
}
