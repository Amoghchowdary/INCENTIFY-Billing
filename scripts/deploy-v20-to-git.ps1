param(
  [string]$Source = "C:\Users\MYPC\Desktop\Incentify_EMS\INCENTIFY_EMS_V20_GitHub_Frontend",
  [string]$DeploymentRoot = "C:\Users\MYPC\Desktop\Incentify_EMS\Deployment_Folder"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path "$Source\scripts\verify-v20.mjs")) {
  throw "V20 source not found: $Source"
}
if (-not (Test-Path $DeploymentRoot)) {
  throw "Deployment root not found: $DeploymentRoot"
}

function Resolve-GitDeploymentClone {
  param([string]$Root)

  if (Test-Path "$Root\.git") { return $Root }

  $preferred = @(
    (Join-Path $Root 'INCENTIFY_EMS'),
    (Join-Path $Root 'INCENTIFY-Billing')
  )
  foreach ($candidate in $preferred) {
    if (Test-Path "$candidate\.git") { return $candidate }
  }

  $clones = @(Get-ChildItem -Path $Root -Directory -ErrorAction Stop | Where-Object {
    Test-Path (Join-Path $_.FullName '.git')
  })

  if ($clones.Count -eq 1) { return $clones[0].FullName }
  if ($clones.Count -eq 0) { throw "No Git clone found under: $Root" }
  throw "Multiple Git clones found under $Root. Pass -DeploymentRoot with the exact Git clone path."
}

$Destination = Resolve-GitDeploymentClone $DeploymentRoot
Write-Host "V20 source:      $Source" -ForegroundColor Cyan
Write-Host "Git destination: $Destination" -ForegroundColor Cyan

Push-Location $Source
try {
  node .\scripts\verify-v20.mjs
  if ($LASTEXITCODE -ne 0) { throw 'V20 frontend verification failed.' }
  node .\scripts\test-api-client-v20.mjs
  if ($LASTEXITCODE -ne 0) { throw 'V20 API-client unit tests failed.' }
} finally { Pop-Location }

robocopy $Source $Destination /MIR /XD .git /R:2 /W:1
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "Robocopy failed with exit code $rc" }

Push-Location $Destination
try {
  node .\scripts\verify-v20.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Deployment-copy V20 verification failed.' }
  Write-Host ''
  Write-Host 'Deployment copy verified. Review Git status before committing:' -ForegroundColor Green
  git status
} finally { Pop-Location }

Write-Host ''
Write-Host 'V20 files copied successfully. This script intentionally does NOT git add/commit/push.' -ForegroundColor Green
