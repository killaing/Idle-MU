param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

$GameRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PreferredPort = 8788
$LogPath = Join-Path $GameRoot "Start-MU-Idle.log"
$IndexPath = Join-Path $GameRoot "index.html"

function Write-LaunchLog {
  param([string]$Message)
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
}

function Test-GameServer {
  param(
    [int]$Port,
    [string]$ExpectedVersion = ""
  )
  $Url = "http://127.0.0.1:$Port/"
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    $ok = $response.StatusCode -ge 200 -and $response.StatusCode -lt 500 -and $response.Content -like "*MU Idle Engine*"
    if (-not $ok) { return $false }
    if ($ExpectedVersion) {
      return $response.Content -like "*app.js?v=$ExpectedVersion*" -and $response.Content -like "*styles.css?v=$ExpectedVersion*"
    }
    return $true
  } catch {
    return $false
  }
}

function Get-GameVersion {
  if (-not (Test-Path -LiteralPath $IndexPath)) { return "dev" }
  $content = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
  $match = [regex]::Match($content, "app\.js\?v=([A-Za-z0-9._-]+)")
  if ($match.Success) { return $match.Groups[1].Value }
  return "dev"
}

function Get-PythonCommand {
  param([int]$Port)
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) { return @($python.Source, @("-m", "http.server", "$Port", "--bind", "127.0.0.1")) }

  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { return @($py.Source, @("-m", "http.server", "$Port", "--bind", "127.0.0.1")) }

  throw "Python was not found. Cannot start the local game server."
}

$Version = Get-GameVersion
$Port = $PreferredPort
foreach ($candidate in $PreferredPort..($PreferredPort + 10)) {
  if (Test-GameServer -Port $candidate -ExpectedVersion $Version) {
    $Port = $candidate
    break
  }

  $busy = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue
  if (-not $busy) {
    $Port = $candidate
    break
  }
}

$Url = "http://127.0.0.1:$Port/?v=$Version&autoEnter=1&t=$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-LaunchLog "Using game root: $GameRoot"
Write-LaunchLog "Using game version: $Version"
Write-LaunchLog "Using URL: $Url"

if (-not (Test-GameServer -Port $Port -ExpectedVersion $Version)) {
  $cmd = Get-PythonCommand -Port $Port
  Write-LaunchLog "Starting server: $($cmd[0]) $($cmd[1] -join ' ')"
  Start-Process -FilePath $cmd[0] -ArgumentList $cmd[1] -WorkingDirectory $GameRoot -WindowStyle Hidden

  $started = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-GameServer -Port $Port -ExpectedVersion $Version) {
      $started = $true
      break
    }
  }

  if (-not $started) {
    Write-LaunchLog "Server startup timed out."
    throw "Local game server startup timed out."
  }
}

if (-not $NoOpen) {
  try {
    Start-Process -FilePath "rundll32.exe" -ArgumentList @("url.dll,FileProtocolHandler", $Url)
  } catch {
    Write-LaunchLog "Protocol launch failed: $($_.Exception.Message)"
    Start-Process $Url
  }
} else {
  Write-Output $Url
}
