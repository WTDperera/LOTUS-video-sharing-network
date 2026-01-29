# Ngrok Installation Script for Windows
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ngrok Installation for Jenkins CI/CD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create ngrok directory
$ngrokDir = "C:\ngrok"
Write-Host "Creating directory: $ngrokDir" -ForegroundColor Yellow
if (-not (Test-Path $ngrokDir)) {
    New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
    Write-Host "✅ Directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Directory already exists" -ForegroundColor Green
}

# Step 2: Download ngrok
Write-Host ""
Write-Host "Downloading ngrok..." -ForegroundColor Yellow
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipPath = "$ngrokDir\ngrok.zip"

try {
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "✅ Downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    Write-Host "Please download manually from: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Step 3: Extract ZIP
Write-Host ""
Write-Host "Extracting ngrok..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipPath -DestinationPath $ngrokDir -Force
    Remove-Item $zipPath -Force
    Write-Host "✅ Extracted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Add to PATH
Write-Host ""
Write-Host "Adding to System PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$ngrokDir*") {
    try {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ngrokDir", "Machine")
        Write-Host "✅ Added to PATH" -ForegroundColor Green
        Write-Host "⚠️  Please restart PowerShell to use ngrok" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to add to PATH (Admin rights required)" -ForegroundColor Red
        Write-Host "Manual step: Add C:\ngrok to your System PATH" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Already in PATH" -ForegroundColor Green
}

# Step 5: Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
if (Test-Path "$ngrokDir\ngrok.exe") {
    Write-Host "✅ ngrok.exe found at: $ngrokDir\ngrok.exe" -ForegroundColor Green
} else {
    Write-Host "❌ ngrok.exe not found" -ForegroundColor Red
    exit 1
}

# Step 6: Configure authtoken
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Close and reopen PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure your authtoken:" -ForegroundColor White
Write-Host "   ngrok config add-authtoken KIY4V3RMYP55HFAMXKK2JWJYPP2HJLXM" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Start ngrok tunnel:" -ForegroundColor White
Write-Host "   ngrok http 8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
