$ErrorActionPreference = 'Stop'
$api = 'https://script.google.com/macros/s/AKfycbzaJhod-iShRt5UFT-Qn81rqsjOLtpH3vCUvXjKPIk-350ey72AkwC4q67DsKkDu0o-/exec'
Write-Host '===== INCENTIFY V6 LIVE BACKEND CHECK ====='
$health = Invoke-RestMethod -Method Post -Uri $api -ContentType 'application/json' -Body '{"action":"health"}'
$health | ConvertTo-Json -Depth 10
if (-not $health.success) { throw 'Backend health returned success=false.' }
if ($health.version -ne '6.0.0') { throw ("Backend version is {0}; expected 6.0.0. Redeploy the V6 Apps Script files first." -f $health.version) }
if ([int]$health.schemaVersion -ne 5) { throw ("Backend schema is {0}; expected 5." -f $health.schemaVersion) }
if ($health.status -ne 'ONLINE') { throw ("Backend status is {0}; expected ONLINE." -f $health.status) }
$channel = 'verify-v6-' + [Guid]::NewGuid().ToString('N')
$bridge = "$api`?bridge=1&v=6.0.0&channel=$channel"
$r = Invoke-WebRequest -Uri $bridge -UseBasicParsing
$checks = [ordered]@{
  HTTP_200 = ($r.StatusCode -eq 200)
  READY = ($r.Content -match 'INCENTIFY_BRIDGE_READY')
  API_REQUEST = ($r.Content -match 'INCENTIFY_API_REQUEST')
  API_RESPONSE = ($r.Content -match 'INCENTIFY_API_RESPONSE')
  MESSAGECHANNEL = ($r.Content -match 'MessageChannel')
  GOOGLE_SCRIPT_RUN = ($r.Content -match 'google\.script\.run')
  RUNTIME_CHANNEL = ($r.Content -match [regex]::Escape($channel))
}
$checks.GetEnumerator() | ForEach-Object { Write-Host ("{0}: {1}" -f $_.Name,$_.Value) }
if ($checks.Values -contains $false) { throw 'Live V6 Apps Script bridge verification failed.' }
Write-Host ''
Write-Host 'INCENTIFY V6 live Apps Script backend and bridge verification passed.'
