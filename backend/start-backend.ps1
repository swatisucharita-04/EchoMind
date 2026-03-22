#!/usr/bin/env pwsh
# start-backend.ps1 — Run from d:\echomind\backend
# Usage: .\start-backend.ps1

$ErrorActionPreference = 'Stop'

Write-Host "--- Backend" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray

# Verify .env exists
if (-not (Test-Path ".env")) {
    Write-Host "x  .env not found. Copy .env.example and fill in your keys." -ForegroundColor Red
    exit 1
}

# Activate venv
$activate = ".\venv\Scripts\Activate.ps1"
if (-not (Test-Path $activate)) {
    Write-Host "x  Virtual env not found. Run: python -m venv venv && .\venv\Scripts\pip.exe install -r requirements.txt" -ForegroundColor Red
    exit 1
}
. $activate

Write-Host "Venv activated" -ForegroundColor Green
Write-Host "Starting FastAPI on http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
