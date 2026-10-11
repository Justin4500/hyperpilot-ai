Write-Host "Starting HyperPilot AI Backend..." -ForegroundColor Green
$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $CurrentDir
$env:PYTHONPATH = "$CurrentDir;$CurrentDir\backend"
& "$CurrentDir\.venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir "$CurrentDir\backend" --host 127.0.0.1 --port 8000 --reload