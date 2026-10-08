$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server 3000
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server 3000
} else {
  throw 'Python is required for the local static test server.'
}
