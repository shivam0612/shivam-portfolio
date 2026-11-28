#requires -Version 5.1
$ErrorActionPreference = "Stop"

# ================= CONFIGURATION =================
$ProjectRoot = "C:\Users\Admin\Documents\AWS-DEVOPS-PROJECT\development\shivam-portfolio"
$GitBranch = "main"
$GitRemote = "origin"
$GitHubRepo = "shivam0612/shivam-portfolio"

$AwsProfile = "portfolio-admin"
$AwsRegion = "ca-central-1"
$AwsAccount = "316356967320"
$EcrRepository = "shivam-portfolio-api"

$SshTarget = "ubuntu@15.156.221.182"
$SshKey = "$env:USERPROFILE\.ssh\LightsailKey.pem"
$RemoteProject = "/home/ubuntu/shivam-portfolio"

$WebsiteUrl = "https://shivampatel.site"
# =================================================

function Stop-Now($Message) {
    Write-Host "`nERROR: $Message" -ForegroundColor Red
    throw $Message
}

function Require-Command($Name) {
    if (!(Get-Command $Name -ErrorAction SilentlyContinue)) {
        Stop-Now "Required command missing: $Name"
    }
}

function Run-Checked($File, [string[]]$Arguments, $Label) {
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan
    & $File @Arguments

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "$Label failed. Exit code: $LASTEXITCODE"
    }
}

function Run-SSH($Command, $Label) {
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan

    & ssh -i $SshKey `
        -o BatchMode=yes `
        -o ConnectTimeout=15 `
        -o StrictHostKeyChecking=accept-new `
        $SshTarget $Command

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "$Label failed."
    }
}

function Check-Project {
    Run-Checked "npm" @("run", "test", "-w", "client") "CLIENT TESTS"
    Run-Checked "npm" @("run", "test", "-w", "server") "SERVER TESTS"
    Run-Checked "npm" @("run", "build", "-w", "client") "CLIENT BUILD"
    Run-Checked "npm" @("run", "build", "-w", "server") "SERVER BUILD"
}

function Check-Repository {
    $remote = (& git remote get-url $GitRemote).Trim()

    if (
        $LASTEXITCODE -ne 0 -or
        $remote -notmatch '^(https://github\.com/|git@github\.com:)shivam0612/shivam-portfolio(\.git)?$'
    ) {
        Stop-Now "Unexpected GitHub remote."
    }
}

# =================================================
# OPTION 1 - PREPARE GITHUB PULL REQUEST
# =================================================

function Prepare-PR {

    Write-Host "`nOPTION 1: PREPARE GITHUB PULL REQUEST" -ForegroundColor Green

    # Ensure we are working from main.
    $branch = (& git branch --show-current).Trim()

    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
        Stop-Now "Could not determine the current Git branch."
    }

    if ($branch -ne "main") {
        $trackedChanges = @(& git status --porcelain --untracked-files=no)

        if ($LASTEXITCODE -ne 0) {
            Stop-Now "Could not inspect tracked Git changes."
        }

        if ($trackedChanges.Count -gt 0) {
            Stop-Now "Cannot switch branches because tracked changes exist."
        }

        Run-Checked "git" @("switch", "main") "SWITCH TO MAIN"

        $mainChanges = @(& git status --porcelain --untracked-files=no)

        if ($LASTEXITCODE -ne 0 -or $mainChanges.Count -gt 0) {
            Stop-Now "Main is not clean. Stopping safely."
        }
    }

    Run-Checked "git" @("fetch", "origin") "FETCH GITHUB"

    $counts = (& git rev-list --left-right --count "origin/main...HEAD").Trim() -split '\s+'

    if ($LASTEXITCODE -ne 0 -or $counts.Count -ne 2) {
        Stop-Now "Could not compare local main with GitHub."
    }

    if ([int]$counts[1] -gt 0) {
        Stop-Now "Local main has commits not on GitHub."
    }

    if ([int]$counts[0] -gt 0) {
        Run-Checked "git" @("pull", "--ff-only", "origin", "main") "UPDATE MAIN"
    }

    # Collect tracked changes.
    $stagedFiles = @(& git diff --cached --name-only)

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Could not inspect staged files."
    }

    $modifiedFiles = @(& git diff --name-only)

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Could not inspect modified files."
    }

    $untrackedFiles = @(& git ls-files --others --exclude-standard)

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Could not inspect untracked files."
    }

    $trackedFiles = @(
        @($stagedFiles) + @($modifiedFiles) |
        Where-Object { ![string]::IsNullOrWhiteSpace($_) } |
        Sort-Object -Unique
    )

    # Reject unsafe paths.
    function Test-UnsafeSubmissionFile([string]$File) {
        $normalized = $File -replace '\\', '/'

        return $normalized -match '(?i)(^|/)[^/]*backup[^/]*(/|$)|\.backup(?:-|$)|(^|/)\.env(?:$|\.)|\.pem$|(^|/)(node_modules|dist|coverage|\.next)(/|$)|(^|/)(secrets?|credentials?)(/|$)|(^|/)[^/]*(secret|credential)[^/]*$'
    }

    $unsafeTracked = @(
        $trackedFiles | Where-Object { Test-UnsafeSubmissionFile $_ }
    )

    if ($unsafeTracked.Count -gt 0) {
        Write-Host "`nUNSAFE TRACKED FILES DETECTED:" -ForegroundColor Red
        $unsafeTracked | ForEach-Object { Write-Host "  $_" }
        Stop-Now "Resolve unsafe tracked changes before preparing a PR."
    }

    # Exclude unsafe untracked files automatically.
    $safeUntracked = @(
        $untrackedFiles |
        Where-Object {
            ![string]::IsNullOrWhiteSpace($_) -and
            !(Test-UnsafeSubmissionFile $_)
        } |
        Sort-Object -Unique
    )

    $excludedUntracked = @(
        $untrackedFiles | Where-Object { Test-UnsafeSubmissionFile $_ }
    )

    if ($excludedUntracked.Count -gt 0) {
        Write-Host "`nAutomatically excluded backup/sensitive files:" -ForegroundColor Yellow
        $excludedUntracked | ForEach-Object { Write-Host "  $_" }
    }

    if ($trackedFiles.Count -eq 0 -and $safeUntracked.Count -eq 0) {
        Stop-Now "No eligible changes were found."
    }

    # Show tracked changes.
    Write-Host "`nTRACKED FILES PROPOSED FOR STAGING:" -ForegroundColor Cyan

    if ($trackedFiles.Count -eq 0) {
        Write-Host "  None"
    }
    else {
        $trackedFiles | ForEach-Object { Write-Host "  $_" }
    }

    # Ask individually about untracked files.
    $approvedUntracked = @()

    foreach ($file in $safeUntracked) {
        Write-Host "`nNew untracked file: $file" -ForegroundColor Yellow
        $answer = Read-Host "Include this file? Type YES to include"

        if ($answer -ceq "YES") {
            $approvedUntracked += $file
        }
        else {
            Write-Host "Excluded: $file" -ForegroundColor DarkYellow
        }
    }

    $approvedFiles = @(
        @($trackedFiles) + @($approvedUntracked) |
        Sort-Object -Unique
    )

    if ($approvedFiles.Count -eq 0) {
        Stop-Now "No files were approved."
    }

    Write-Host "`nFINAL FILE LIST:" -ForegroundColor Green
    $approvedFiles | ForEach-Object { Write-Host "  $_" }

    $confirm = Read-Host "`nType STAGE to stage exactly these files"

    if ($confirm -cne "STAGE") {
        Stop-Now "Cancelled. No files were staged by this workflow."
    }

    # Stage only approved files.
    Run-Checked "git" (@("add", "--") + $approvedFiles) "STAGE APPROVED FILES"

    # Validate staging.
    $remainingModified = @(& git diff --name-only)

    if ($LASTEXITCODE -ne 0 -or $remainingModified.Count -gt 0) {
        Write-Host "`nRemaining unstaged tracked changes:" -ForegroundColor Yellow
        $remainingModified | ForEach-Object { Write-Host "  $_" }
        Stop-Now "Unexpected unstaged tracked changes remain."
    }

    $files = @(& git diff --cached --name-only)

    if ($LASTEXITCODE -ne 0 -or $files.Count -eq 0) {
        Stop-Now "No staged changes were found."
    }

    $unsafeStaged = @($files | Where-Object { Test-UnsafeSubmissionFile $_ })

    if ($unsafeStaged.Count -gt 0) {
        Stop-Now "Unsafe file detected in staged changes."
    }

    Run-Checked "git" @("diff", "--cached", "--check") "CHECK STAGED PATCH"

    Write-Host "`nVERIFIED STAGED FILES:" -ForegroundColor Green
    $files | ForEach-Object { Write-Host "  $_" }

    Run-Checked "git" @("diff", "--cached", "--stat") "STAGED CHANGE SUMMARY"

    # Confirm before tests and builds.
    $confirm = Read-Host "`nType YES to run all tests and production builds"

    if ($confirm -cne "YES") {
        Stop-Now "Cancelled before validation."
    }

    Check-Project

    # Ensure builds did not introduce additional tracked changes.
    $remainingModified = @(& git diff --name-only)

    if ($LASTEXITCODE -ne 0 -or $remainingModified.Count -gt 0) {
        Write-Host "`nUnexpected changes after validation:" -ForegroundColor Yellow
        $remainingModified | ForEach-Object { Write-Host "  $_" }
        Stop-Now "Builds introduced unstaged changes. Review before continuing."
    }

    Run-Checked "git" @("diff", "--cached", "--check") "FINAL PATCH VALIDATION"

    # Create branch only after successful validation.
    $featureBranch = "feature/portfolio-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

    Run-Checked "git" @("switch", "-c", $featureBranch) "CREATE FEATURE BRANCH"

    $message = Read-Host "Enter commit message"

    if ([string]::IsNullOrWhiteSpace($message)) {
        Stop-Now "Commit message is required."
    }

    $confirm = Read-Host "`nType COMMIT to create the commit"

    if ($confirm -cne "COMMIT") {
        Stop-Now "Cancelled before commit."
    }

    Run-Checked "git" @("commit", "-m", $message) "COMMIT CHANGES"

    $confirm = Read-Host "`nType PUSH to push the feature branch to GitHub"

    if ($confirm -cne "PUSH") {
        Stop-Now "Commit created locally. Push was cancelled."
    }

    Run-Checked "git" @("push", "-u", "origin", $featureBranch) "PUSH FEATURE BRANCH"

    $prTitle = Read-Host "`nEnter a clear GitHub Pull Request title"

    if ([string]::IsNullOrWhiteSpace($prTitle)) {
        Stop-Now "Pull request title cannot be empty."
    }

    Write-Host "`nPull request title: $prTitle" -ForegroundColor Cyan
    $titleConfirmation = Read-Host "Type CREATE to confirm this title"

    if ($titleConfirmation -cne "CREATE") {
        Stop-Now "Pull request creation cancelled."
    }

    Write-Host "`nCreating GitHub pull request..." -ForegroundColor Yellow

    Run-Checked "gh" @(
        "pr", "create",
        "--repo", $GitHubRepo,
        "--base", "main",
        "--head", $featureBranch,
        "--title", $prTitle,
        "--body", "Prepared by the portfolio deployment manager. Local project checks completed before PR creation."
    ) "CREATE PULL REQUEST"

    $prNumber = (& gh pr view $featureBranch `
        --repo $GitHubRepo `
        --json number `
        --jq ".number").Trim()

    if ($LASTEXITCODE -ne 0 -or !$prNumber) {
        Stop-Now "Could not retrieve the created PR number."
    }

    Write-Host "Created PR number: $prNumber" -ForegroundColor Green

        Write-Host "`nWaiting for GitHub Actions checks..." -ForegroundColor Yellow

    $checksComplete = $false
    $maxAttempts = 36

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {

        $json = & gh pr view $prNumber `
            --repo $GitHubRepo `
            --json statusCheckRollup

        if ($LASTEXITCODE -ne 0) {
            Stop-Now "Unable to retrieve pull request checks."
        }

        $prData = $json | ConvertFrom-Json
        $checks = @($prData.statusCheckRollup)

        if ($checks.Count -eq 0) {
            Write-Host "No checks registered yet. Waiting... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        }
        else {
            $pendingChecks = @()
            $failedChecks = @()

            foreach ($check in $checks) {

                if ($check.__typename -eq "CheckRun") {

                    if ($check.status -ne "COMPLETED") {
                        $pendingChecks += $check.name
                    }
                    elseif ($check.conclusion -notin @("SUCCESS", "SKIPPED", "NEUTRAL")) {
                        $failedChecks += "$($check.name): $($check.conclusion)"
                    }
                }
                elseif ($check.__typename -eq "StatusContext") {

                    if ($check.state -eq "PENDING") {
                        $pendingChecks += $check.context
                    }
                    elseif ($check.state -ne "SUCCESS") {
                        $failedChecks += "$($check.context): $($check.state)"
                    }
                }
                else {
                    $pendingChecks += "Unknown check type"
                }
            }

            if ($failedChecks.Count -gt 0) {
                Stop-Now "Pull request checks failed: $($failedChecks -join '; ')"
            }

            if ($pendingChecks.Count -eq 0) {
                $checksComplete = $true
                Write-Host "`nAll $($checks.Count) pull request checks passed." -ForegroundColor Green
                break
            }

            Write-Host "Checks still running: $($pendingChecks -join ', ')" -ForegroundColor Yellow
        }

        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 10
        }
    }

    if (-not $checksComplete) {
        Stop-Now "Pull request checks did not complete successfully within 6 minutes."
    }

    Run-Checked "gh" @(
        "pr", "view", $prNumber,
        "--repo", $GitHubRepo,
        "--json", "url,state,mergeStateStatus"
    ) "PULL REQUEST STATUS"

    # Merge automatically, but only the exact commit that was checked.
    $headCommit = (& git rev-parse HEAD).Trim()

    if ($LASTEXITCODE -ne 0 -or !$headCommit) {
        Stop-Now "Could not determine the commit to merge."
    }

    Run-Checked "gh" @(
        "pr", "merge", $prNumber,
        "--repo", $GitHubRepo,
        "--merge",
        "--match-head-commit", $headCommit
    ) "MERGE PULL REQUEST"

    $prState = (& gh pr view $prNumber `
        --repo $GitHubRepo `
        --json state `
        --jq ".state").Trim()

    if ($LASTEXITCODE -ne 0 -or $prState -ne "MERGED") {
        Stop-Now "Pull request is not merged yet. Check it on GitHub."
    }

    # Return to an up-to-date main, ready for option 2.
    Run-Checked "git" @("switch", "main") "SWITCH TO MAIN"
    Run-Checked "git" @("pull", "--ff-only", "origin", "main") "UPDATE MAIN"

    Write-Host "`nOPTION 1 COMPLETED." -ForegroundColor Green
    Write-Host "PR $prNumber is merged and you are on main. Run option 2 to deploy."
}

# =================================================
# OPTION 2 - DEPLOY APPROVED MAIN TO AWS
# =================================================

function Deploy-Main {

    Write-Host "`nOPTION 2: DEPLOY APPROVED MAIN TO AWS" -ForegroundColor Green

    $trackedChanges = & git status --porcelain --untracked-files=no

    if ($trackedChanges) {
        Stop-Now "Tracked local changes exist. Commit or resolve them first."
    }

    $branch = "$(& git branch --show-current)".Trim()

    if ($branch -ne "main") {
        Run-Checked "git" @("switch", "main") "SWITCH TO MAIN"
    }

    Run-Checked "git" @("fetch", "origin") "FETCH MAIN"

    $counts = (& git rev-list --left-right --count "origin/main...HEAD").Trim() -split '\s+'

    if ($LASTEXITCODE -ne 0 -or $counts.Count -ne 2) {
        Stop-Now "Could not compare local main with GitHub."
    }

    if ([int]$counts[1] -gt 0) {
        Stop-Now "Local main is ahead of GitHub."
    }

    if ([int]$counts[0] -gt 0) {
        Run-Checked "git" @("pull", "--ff-only", "origin", "main") "UPDATE MAIN"
    }

    $commit = (& git rev-parse HEAD).Trim()

    # Verify GitHub Actions for the exact commit.
    Write-Host "`n===== VERIFY GITHUB ACTIONS =====" -ForegroundColor Cyan

    $json = & gh run list `
        --repo $GitHubRepo `
        --branch main `
        --commit $commit `
        --limit 20 `
        --json databaseId,status,conclusion,workflowName

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Unable to retrieve GitHub Actions."
    }

    # Wait for GitHub Actions workflows to appear for this exact commit.
    $runs = @()
    $maxAttempts = 12

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        $json = & gh run list `
            --repo $GitHubRepo `
            --branch main `
            --commit $commit `
            --limit 20 `
            --json databaseId,status,conclusion,workflowName

        if ($LASTEXITCODE -ne 0) {
            Stop-Now "Unable to retrieve GitHub Actions."
        }

        if ($json) {
            $runs = @($json | ConvertFrom-Json)
        }

        if ($runs.Count -gt 0) {
            break
        }

        if ($attempt -lt $maxAttempts) {
            Write-Host "No workflow runs found yet. Checking again in 5 seconds ($attempt/$maxAttempts)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }

    if ($runs.Count -eq 0) {
        Stop-Now "No GitHub Actions runs found for this exact commit after 60 seconds."
    }

    foreach ($run in $runs) {
        if ($run.status -ne "completed") {
            Run-Checked "gh" @(
                "run", "watch",
                "$($run.databaseId)",
                "--repo", $GitHubRepo,
                "--exit-status"
            ) "WAIT FOR $($run.workflowName)"
        }
    }

    $json = & gh run list `
        --repo $GitHubRepo `
        --branch main `
        --commit $commit `
        --limit 20 `
        --json databaseId,status,conclusion,workflowName

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Could not verify final Actions status."
    }

    $runs = @($json | ConvertFrom-Json)

    $failed = @($runs | Where-Object {
        $_.status -ne "completed" -or $_.conclusion -ne "success"
    })

    if ($failed.Count -gt 0) {
        Stop-Now "One or more GitHub Actions workflows failed."
    }

    Write-Host "GitHub Actions checks passed." -ForegroundColor Green

    # SSH preflight BEFORE Docker build and ECR push.
    if (!(Test-Path -LiteralPath $SshKey -PathType Leaf)) {
        Stop-Now "SSH private key does not exist: $SshKey"
    }

    $sshCheck = "test -d '$RemoteProject' && cd '$RemoteProject' && docker compose config --quiet && echo SSH_AND_COMPOSE_OK"

    Run-SSH $sshCheck "SSH AUTHENTICATION AND COMPOSE CHECK"

    # AWS session.
    Write-Host "`n===== AWS SESSION =====" -ForegroundColor Cyan

    & aws sts get-caller-identity --profile $AwsProfile

    if ($LASTEXITCODE -ne 0) {
        Run-Checked "aws" @("login", "--profile", $AwsProfile) "AWS LOGIN"
        Run-Checked "aws" @("sts", "get-caller-identity", "--profile", $AwsProfile) "VERIFY AWS"
    }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $tag = "deploy-$($commit.Substring(0,7))-$stamp"

    $ecrHost = "$AwsAccount.dkr.ecr.$AwsRegion.amazonaws.com"
    $image = "$ecrHost/$EcrRepository`:$tag"
    $localImage = "shivam-portfolio:$tag"

    # Build.
    Run-Checked "docker" @(
        "build",
        "--platform", "linux/amd64",
        "-t", $localImage,
        "."
    ) "BUILD PRODUCTION IMAGE"

    # Login.
    $password = & aws ecr get-login-password `
        --region $AwsRegion `
        --profile $AwsProfile

    if ($LASTEXITCODE -ne 0 -or !$password) {
        Stop-Now "Could not obtain ECR login token."
    }

    $password | & docker login --username AWS --password-stdin $ecrHost
    $password = $null

    if ($LASTEXITCODE -ne 0) {
        Stop-Now "Docker ECR login failed."
    }

    Run-Checked "docker" @("tag", $localImage, $image) "TAG IMAGE"

    Run-Checked "docker" @("push", $image) "PUSH IMAGE TO ECR"

    Run-Checked "aws" @(
        "ecr", "describe-images",
        "--repository-name", $EcrRepository,
        "--image-ids", "imageTag=$tag",
        "--region", $AwsRegion,
        "--profile", $AwsProfile,
        "--output", "table"
    ) "VERIFY ECR IMAGE"

    Write-Host "`nCommit: $commit" -ForegroundColor Yellow
    Write-Host "Image: $image" -ForegroundColor Yellow

    $confirm = Read-Host "`nDeploy to production? Type DEPLOY"

    if ($confirm -cne "DEPLOY") {
        Stop-Now "Cancelled. Image remains safely in ECR."
    }

    # Remote deployment: app only, preserve DB and Caddy.
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
  local original_status=$?
  trap - ERR
  set +e

  echo "DEPLOYMENT FAILED - attempting application-only rollback"

  cp -p "$BACKUP" docker-compose.yml

  if [ $? -ne 0 ]; then
    echo "CRITICAL: Could not restore the previous Compose file."
    exit "$original_status"
  fi

  docker compose config --quiet

  if [ $? -ne 0 ]; then
    echo "CRITICAL: Restored Compose configuration is invalid."
    exit "$original_status"
  fi

  docker compose up -d --no-deps app

  if [ $? -ne 0 ]; then
    echo "WARNING: Application rollback command failed."
  else
    echo "Application rollback command completed."
  fi

  echo "Previous Compose file: $BACKUP"
  exit "$original_status"
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
  echo "Application health check failed: $STATUS"
  false
fi

test "$DB_BEFORE" = "$(docker compose ps -q db)"
test "$CADDY_BEFORE" = "$(docker compose ps -q caddy)"

docker compose ps

echo "===== DEPLOYED IMAGE ====="
docker inspect shivam-portfolio-app --format '{{.Config.Image}}'

echo "===== APP HEALTH ====="
docker inspect shivam-portfolio-app --format '{{.State.Health.Status}}'

echo "DB and Caddy container IDs unchanged."

trap - ERR
echo "DEPLOYMENT_SUCCESS"
'@

    # Bash requires Unix LF line endings, not Windows CRLF.
    $remoteScript = $remoteScript -replace '\r\n?', "`n"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($remoteScript)
    $base64 = [Convert]::ToBase64String($bytes)

    $remoteCommand = "echo '$base64' | base64 -d | bash -s -- '$image'"

    # Obtain a fresh ECR token for the Lightsail server.
    $remoteEcrPassword = & aws ecr get-login-password `
        --region $AwsRegion `
        --profile $AwsProfile

    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteEcrPassword)) {
        Stop-Now "Could not obtain a fresh ECR token for Lightsail."
    }

    # Authenticate remote Docker using SSH standard input.
    # The ECR token is never included in the SSH command.
    $remoteCommand = "DOCKER_CONFIG=`$(mktemp -d) && export DOCKER_CONFIG && trap 'rm -rf `"`$DOCKER_CONFIG`"' EXIT && docker login --username AWS --password-stdin $ecrHost && echo '$base64' | base64 -d | bash -s -- '$image'"

    Write-Host "`n===== LIGHTSAIL ECR AUTHENTICATION AND DEPLOYMENT =====" -ForegroundColor Cyan

    $remoteEcrPassword | & ssh -i $SshKey `
        -o BatchMode=yes `
        -o ConnectTimeout=15 `
        -o StrictHostKeyChecking=accept-new `
        $SshTarget $remoteCommand

    $sshExitCode = $LASTEXITCODE
    $remoteEcrPassword = $null

    if ($sshExitCode -ne 0) {
        Stop-Now "Lightsail ECR authentication or deployment failed."
    }

    # Public health checks.
    Write-Host "`n===== PUBLIC WEBSITE CHECKS =====" -ForegroundColor Cyan

    foreach ($path in @("/", "/api/health", "/api/health/ready")) {
        $url = "$WebsiteUrl$path"

        try {
            $response = Invoke-WebRequest `
                -Uri $url `
                -Method Get `
                -TimeoutSec 30 `
                -UseBasicParsing

            Write-Host "$url -> HTTP $([int]$response.StatusCode)"

            if ([int]$response.StatusCode -lt 200 -or [int]$response.StatusCode -ge 400) {
                Stop-Now "Website health check failed: $url"
            }
        }
        catch {
            Stop-Now "Public health check failed: $url"
        }
    }

    Write-Host "`nDEPLOYMENT COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "Commit: $commit"
    Write-Host "Image: $image"
    Write-Host "Website: $WebsiteUrl"
}

# =================================================
# MAIN MENU
# =================================================

try {

    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host " SHIVAM PORTFOLIO - DEPLOYMENT MANAGER" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green

    if (!(Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
        Stop-Now "Project folder not found."
    }

    Set-Location $ProjectRoot

    foreach ($cmd in @("git", "node", "npm", "docker", "aws", "ssh", "gh")) {
        Require-Command $cmd
    }

    Check-Repository

    Run-Checked "gh" @("auth", "status") "VERIFY GITHUB AUTHENTICATION"

    Write-Host "`n1. PREPARE GITHUB PULL REQUEST" -ForegroundColor Yellow
    Write-Host "2. DEPLOY APPROVED MAIN TO AWS" -ForegroundColor Yellow
    Write-Host "3. EXIT" -ForegroundColor Yellow

    $choice = Read-Host "`nSelect option"

    switch ($choice) {
        "1" { Prepare-PR }
        "2" { Deploy-Main }
        "3" { Write-Host "Exiting." }
        default { Stop-Now "Invalid option." }
    }

}
catch {
    Write-Host "`nPROCESS STOPPED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Write-Host "`nPress Enter to close..."
    [void](Read-Host)
}
