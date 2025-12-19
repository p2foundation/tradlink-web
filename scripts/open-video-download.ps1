# PowerShell script to open video download pages
# Run with: powershell -ExecutionPolicy Bypass -File scripts/open-video-download.ps1

Write-Host ""
Write-Host "Opening video download pages..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose a source to download from:" -ForegroundColor Yellow
Write-Host ""

$sources = @(
    @{
        Name = "Mixkit - Cargo Ship"
        Url = "https://mixkit.co/free-stock-video/cargo-ship-full-of-containers-4011/"
        Description = "Recommended: High quality, free for commercial use"
    },
    @{
        Name = "Coverr - Shipping Containers"
        Url = "https://coverr.co/videos/shipping-containers"
        Description = "Free stock videos, good quality"
    },
    @{
        Name = "Pixabay - Shipping Containers"
        Url = "https://pixabay.com/videos/search/shipping%20containers/"
        Description = "Large collection of free videos"
    }
)

for ($i = 0; $i -lt $sources.Length; $i++) {
    Write-Host "$($i + 1). $($sources[$i].Name)" -ForegroundColor Green
    Write-Host "   $($sources[$i].Description)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Opening all sources in your browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

foreach ($source in $sources) {
    Start-Process $source.Url
    Start-Sleep -Milliseconds 500
}

$videoPath = Join-Path $PSScriptRoot "..\public\videos\hero-video.mp4"
Write-Host ""
Write-Host "After downloading, save the video as:" -ForegroundColor Yellow
Write-Host "   $videoPath" -ForegroundColor White
Write-Host ""
Write-Host "The video will automatically work once saved!" -ForegroundColor Green
Write-Host ""
