param(
  [string]$Source = "C:\Users\MYPC\Desktop\Incentify_EMS\INCENTIFY_EMS_V17_GitHub_Frontend",
  [string]$Destination = "C:\Users\MYPC\Desktop\Incentify_EMS\Deployment_Folder\INCENTIFY-Billing"
)
$ErrorActionPreference='Stop'
if(-not(Test-Path "$Source\scripts\verify-v17.mjs")){throw "V17 source not found: $Source"}
if(-not(Test-Path "$Destination\.git")){throw "Git deployment clone not found: $Destination"}
Push-Location $Source
try{node .\scripts\verify-v17.mjs;if($LASTEXITCODE-ne 0){throw 'V17 frontend verification failed.'}}finally{Pop-Location}
robocopy $Source $Destination /MIR /XD .git /R:2 /W:1
if($LASTEXITCODE-ge 8){throw "Robocopy failed with exit code $LASTEXITCODE"}
Push-Location $Destination
try{node .\scripts\verify-v17.mjs;if($LASTEXITCODE-ne 0){throw 'Deployment-copy V17 verification failed.'};git status}finally{Pop-Location}
