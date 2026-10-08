param(
  [Parameter(Mandatory=$true)][string]$Url
)
$ErrorActionPreference = 'Stop'
$url = $Url.Trim()
if (-not ($url -match '^https://script\.google\.com/macros/s/.+/exec$')) {
  throw 'Use the NEW V14 Google Apps Script Web App URL ending in /exec.'
}
Write-Host '1/2 Testing V14 health endpoint...' -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri $url -Method Get
$health | Format-List
if (-not $health.success -or $health.version -ne '14.0.0' -or $health.status -ne 'ONLINE') {
  throw 'V14 backend is not ONLINE. Run runInitialSetup() and verify the new deployment.'
}
Write-Host '2/2 Testing browser JSONP transport...' -ForegroundColor Cyan
$callback = '__incentify_ems_v14_cb_POWERSHELLTEST'
$json = '{"action":"health"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$payload = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
$testUrl = "${url}?api=1&callback=$callback&payload=$payload&v=14.0.0"
$r = Invoke-WebRequest -Uri $testUrl -UseBasicParsing
if ($r.StatusCode -ne 200) { throw "JSONP endpoint returned HTTP $($r.StatusCode)." }
if ($r.Content -notmatch [regex]::Escape($callback + '(')) { throw 'JSONP callback was not returned by Apps Script.' }
if ($r.Content -notmatch 'INCENTIFY EMS V14 Cloud API') { throw 'JSONP response is not the INCENTIFY EMS V14 API.' }
Write-Host 'PASS: V14 backend health + JSONP browser transport are working.' -ForegroundColor Green
