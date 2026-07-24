#!/bin/bash
# Start backend server shortcut for Git Bash/macOS/Linux
./venv/Scripts/python -m uvicorn src.main:asgi_app --host localhost --port 8000 --reload
