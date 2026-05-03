# Download @imgly/background-removal model files for self-hosting
# Run once: .\scripts\download-bg-models.ps1

$version   = "1.7.0"
$baseUrl   = "https://staticimgly.com/@imgly/background-removal-data/$version/dist"
$destDir   = Join-Path $PSScriptRoot "..\public\models\bg-removal"

New-Item -ItemType Directory -Force -Path $destDir | Out-Null

function Download-File($url, $dest) {
    Write-Host "  Downloading: $url"
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 120
        Write-Host "  -> OK ($([Math]::Round((Get-Item $dest).Length/1KB)) KB)"
    } catch {
        Write-Warning "  -> FAILED: $_"
    }
}

# Step 1: Get the resource manifest
$manifestPath = Join-Path $destDir "resources.json"
Download-File "$baseUrl/resources.json" $manifestPath

if (-not (Test-Path $manifestPath)) {
    Write-Error "Could not download resources.json. Check your internet connection."
    exit 1
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# Step 2: Download every chunk listed in resources.json
Write-Host "`nDownloading model chunks..."
$manifest.PSObject.Properties | ForEach-Object {
    $resource = $_.Value
    foreach ($chunk in $resource.chunks) {
        $chunkName = $chunk.name
        $chunkDest = Join-Path $destDir $chunkName
        $chunkDir  = Split-Path $chunkDest -Parent
        New-Item -ItemType Directory -Force -Path $chunkDir | Out-Null

        if (-not (Test-Path $chunkDest)) {
            Download-File "$baseUrl/$chunkName" $chunkDest
        } else {
            Write-Host "  -> SKIP (exists): $chunkName"
        }
    }
}

Write-Host "`nDone! Model files saved to: $destDir"
Write-Host "Set publicPath to: /models/bg-removal/"
