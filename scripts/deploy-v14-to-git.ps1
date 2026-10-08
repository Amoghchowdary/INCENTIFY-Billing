param(
  [string]$Source = "C:\Users\MYPC\Desktop\Incentify_EMS\V14\INCENTIFY_EMS_V14_GitHub_Frontend",
  [string]$DeployRepo = "C:\Users\MYPC\Desktop\Incentify_EMS\Deployment_Folder\INCENTIFY-Billing"
)
$ErrorActionPreference = 'Stop'

if (!(Test-Path $Source)) { throw "Source folder not found: $Source" }
if (!(Test-Path (Join-Path $DeployRepo '.git'))) { throw "Deployment folder is not the cloned Git repository: $DeployRepo" }

Write-Host "1/4 Verifying V14 source..." -ForegroundColor Cyan
Push-Location $Source
try {
  node .\scripts\verify-v14.mjs
  if ($LASTEXITCODE -ne 0) { throw 'V14 verification failed.' }
} finally { Pop-Location }

Write-Host "2/4 Mirroring V14 into Git deployment folder (preserving .git)..." -ForegroundColor Cyan
& robocopy $Source $DeployRepo /MIR /XD .git /R:2 /W:1
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "Robocopy failed with exit code $rc" }

Write-Host "3/4 Git status..." -ForegroundColor Cyan
Push-Location $DeployRepo
try {
  git status --short
  Write-Host ""
  Write-Host "Review the changes above. If correct, run:" -ForegroundColor Yellow
  Write-Host 'git add -A'
  Write-Host 'git commit -m "Deploy INCENTIFY EMS V14"'
  Write-Host 'git push origin main'
} finally { Pop-Location }

Write-Host "4/4 Copy complete. Nothing was pushed automatically." -ForegroundColor Green
