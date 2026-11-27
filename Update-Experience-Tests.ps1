$ErrorActionPreference = 'Stop'

$root = Get-Location
$testPath = Join-Path $root 'client\src\test\content.test.ts'

if (!(Test-Path $testPath)) {
    throw "Cannot find content.test.ts"
}

$content = Get-Content -Raw -LiteralPath $testPath

# Confirm the expected old test exists before making changes.
$oldStart = "  it('shows employment dates exactly as provided, including the overlap, unchanged', () => {"
$nextTest = "  it('lists education exactly as provided', () => {"

$startIndex = $content.IndexOf($oldStart)
$endIndex = $content.IndexOf($nextTest, $startIndex)

if ($startIndex -lt 0 -or $endIndex -lt 0) {
    throw "Expected old employment tests were not found. No changes made."
}

# Create backup.
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $root "backup-experience-tests-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item -LiteralPath $testPath -Destination $backupDir

# Replace old employment tests.
$replacement = @"
  it('lists professional experience in the requested order with supplied dates', () => {
    expect(experience.map((e) => [e.employer, e.title, e.dates])).toEqual([
      ['Lambton College', 'Software Engineering Team Lead', 'May 2023 – August 2023'],
      ['Matrix Logistics Services', 'Team Member', 'August 2022 – November 2026'],
      ['Bell Canada', 'Team Leader / Sales Supervisor and Sales Associate', 'February 2022 – June 2024'],
      ['Verzeo', 'Web Development Intern', 'March 2021 – August 2021'],
      ['Verzeo', 'Artificial Intelligence Intern', 'October 2020 – December 2020'],
    ]);
  });

  it('keeps role-specific details', () => {
    expect(experience[1]!.employerNote).toBe('DHL Supply Chain');
    expect(experience[1]!.responsibilities).toHaveLength(5);
    expect(experience[1]!.technology).toEqual(['DALLAS']);
    expect(experience[2]!.technology).toEqual(['Salesforce', 'Microsoft Office']);
    expect(experience[0]!.responsibilities).toHaveLength(5);
  });

"@

$content = $content.Substring(0, $startIndex) +
           $replacement +
           $content.Substring($endIndex)

# Replace the obsolete Nestle/Kellogg-specific metric test.
$metricStartText = "  it('only the resume-stated 99% figure appears anywhere in the data, always attributed', () => {"
$metricStart = $content.IndexOf($metricStartText)
$projectStart = $content.IndexOf("describe('project integrity'", $metricStart)

if ($metricStart -lt 0 -or $projectStart -lt 0) {
    throw "Expected obsolete metric test was not found. No changes made."
}

$describeClose = $content.LastIndexOf('});', $projectStart)

if ($describeClose -lt $metricStart) {
    throw "Could not safely locate the old test boundary. No changes made."
}

$newMetricTest = @"
  it('does not include removed Nestle or Kellogg employment', () => {
    expect(JSON.stringify(experience)).not.toMatch(/Nestl[eé]|Kellogg/i);
  });

"@

$content = $content.Substring(0, $metricStart) +
           $newMetricTest +
           $content.Substring($describeClose)

# Save without a UTF-8 BOM.
[System.IO.File]::WriteAllText(
    $testPath,
    $content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "SUCCESS: Experience tests updated." -ForegroundColor Green
Write-Host "Backup: $backupDir"
Write-Host "Updated: $testPath"
