Set-Location "C:\Users\Shahzad\Desktop\PRO\backend"
$env:PATH = "C:\Users\Shahzad\Desktop\PRO\backend\.venv\Scripts;" + $env:PATH
$proc = Start-Process python.exe -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -NoNewWindow -PassThru
Write-Host "Started process ID: $($proc.Id)"
Start-Sleep -Seconds 3