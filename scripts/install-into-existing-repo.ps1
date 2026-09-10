param(
  [Parameter(Mandatory=$true)]
  [string]$TargetRepo
)
$ErrorActionPreference = 'Stop'
$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$TargetRepo = (Resolve-Path $TargetRepo).Path
if (-not (Test-Path (Join-Path $TargetRepo '.git'))) {
  throw "TargetRepo is not an existing Git repository: $TargetRepo"
}
Write-Host "Installing INCENTIFY ERP frontend v5.1.4"
Write-Host "Source: $SourceRoot"
Write-Host "Target: $TargetRepo"
$null = & robocopy $SourceRoot $TargetRepo /E /R:1 /W:1 /XD .git /XF '*.zip'
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "Robocopy failed with exit code $rc" }
Push-Location $TargetRepo
try {
  & node .\scripts\verify-frontend.js
  if ($LASTEXITCODE -ne 0) { throw 'Frontend verification failed.' }
  Write-Host "Install and verification passed. Review with: git status"
} finally {
  Pop-Location
}
