import subprocess
import sys
import time

# Start uvicorn as a subprocess
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
    cwd="C:/Users/Shahzad/Desktop/PRO/backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    env={**dict(__import__('os').environ), "PATH": r"C:\Users\Shahzad\Desktop\PRO\backend\.venv\Scripts;" + __import__('os').environ.get("PATH", "")}
)

# Wait a bit for startup
time.sleep(3)

# Read first 500 chars of output
output = proc.stdout.read(500).decode("utf-8", errors="replace")
print("Uvicorn output:")
print(output)

# Check if process is still running
print(f"Process running: {proc.poll() is None}")

# Keep reference so process doesn't exit immediately
import atexit
atexit.register(lambda: proc.terminate())