param(
  [string]$Url = "https://script.google.com/macros/s/AKfycbxXvyGi6PCfBMC0Tza9FK_s6P4ii6vRXJlRZR2o1iaJd5Hu00VCCefABW0Tca_kSlM8/exec"
)
$ErrorActionPreference='Stop'
$url=$Url.Trim()
if(-not($url -match '^https://script\.google\.com/macros/s/.+/exec$')){throw 'Use the V16 Apps Script /exec URL.'}
function Invoke-WithRetry([scriptblock]$Action,[string]$Name){
  $last=$null
  for($i=1;$i -le 4;$i++){
    try{return & $Action}catch{$last=$_;if($i -lt 4){Write-Host "$Name transient failure $i/4; retrying..." -ForegroundColor Yellow;Start-Sleep -Milliseconds (250*$i)}}
  }
  throw $last
}
Write-Host '1/3 Health...' -ForegroundColor Cyan
$h=Invoke-WithRetry { Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop } 'Health'
if(-not $h.success -or $h.version -ne '16.0.0' -or $h.status -ne 'ONLINE'){throw 'V16 backend is not ONLINE.'}
Write-Host 'PASS: Health' -ForegroundColor Green
$json='{"action":"health","requestId":"ems16_2_POWERSHELL_BACKEND_TEST_1234567890"}'
$bytes=[System.Text.Encoding]::UTF8.GetBytes($json)
$payload=[Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
Write-Host '2/3 JSONP primary...' -ForegroundColor Cyan
$cb="__incentify_ems_v16_cb_TEST_$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
$r=Invoke-WithRetry { Invoke-WebRequest -Uri "${url}?api=1&callback=$cb&payload=$payload&v=16.0.0&transport=jsonp&_=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -UseBasicParsing -ErrorAction Stop } 'JSONP'
if($r.StatusCode -ne 200){throw ('V16 JSONP transport returned HTTP ' + $r.StatusCode + '.')}; if($r.Content -notmatch [regex]::Escape($cb+'(')){Write-Host ('JSONP RESPONSE: ' + $r.Content) -ForegroundColor Yellow; throw 'V16 JSONP callback contract failed.'}; if($r.Content -notmatch 'INCENTIFY EMS V16 Cloud API'){Write-Host ('JSONP RESPONSE: ' + $r.Content) -ForegroundColor Yellow; throw 'V16 JSONP payload validation failed.'}
Write-Host 'PASS: JSONP primary' -ForegroundColor Green
Write-Host '3/3 JSON fallback...' -ForegroundColor Cyan
$j=Invoke-WithRetry { Invoke-RestMethod -Uri "${url}?api=1&payload=$payload&v=16.0.0&transport=json&_=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -ErrorAction Stop } 'JSON'
if(-not $j.success -or $j.version -ne '16.0.0'){throw 'V16 JSON transport failed.'}
Write-Host 'PASS: JSON fallback' -ForegroundColor Green
Write-Host ''
Write-Host 'INCENTIFY EMS V16.2 FRONTEND / V16 BACKEND VERIFIED' -ForegroundColor Green
