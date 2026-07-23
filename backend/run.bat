@echo off
REM Start backend server shortcut for Windows CMD/PowerShell
.\venv\Scripts\python -m uvicorn src.main:asgi_app --host localhost --port 8000 --reload
