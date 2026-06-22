param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$GameRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PreferredPort = 8788
$StudioPath = Join-Path $GameRoot "studio.html"

function Test-StudioServer {
  param([int]$Port)
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/studio.html" -TimeoutSec 1
    $status = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/__studio/status" -TimeoutSec 1
    return $response.StatusCode -ge 200 -and $response.Content -like "*MU Idle Studio*" -and $status.Content -like "*`"ok`": true*"
  } catch {
    return $false
  }
}

function Get-PythonCommand {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) { return $python.Source }

  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { return $py.Source }

  throw "Python was not found. Cannot start the local Studio server."
}

if (-not (Test-Path -LiteralPath $StudioPath)) {
  throw "studio.html was not found."
}

$Port = $PreferredPort
foreach ($candidate in $PreferredPort..($PreferredPort + 10)) {
  $busy = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue
  if (-not $busy) {
    $Port = $candidate
    break
  }

  if (Test-StudioServer -Port $candidate) {
    $Port = $candidate
    break
  }
}

if (-not (Test-StudioServer -Port $Port)) {
  $python = Get-PythonCommand
  $serverScript = Join-Path $GameRoot "Tools\mu_idle_studio_server.py"
  $env:MU_IDLE_STUDIO_PORT = "$Port"
  Start-Process -FilePath $python -ArgumentList @("`"$serverScript`"") -WorkingDirectory $GameRoot -WindowStyle Hidden

  $started = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-StudioServer -Port $Port) {
      $started = $true
      break
    }
  }

  if (-not $started) {
    throw "Local Studio server startup timed out."
  }
}

$Url = "http://127.0.0.1:$Port/studio.html?t=$(Get-Date -Format 'yyyyMMddHHmmss')"
if ($NoOpen) {
  Write-Output $Url
} else {
  Start-Process -FilePath "rundll32.exe" -ArgumentList @("url.dll,FileProtocolHandler", $Url)
}
