#!/usr/bin/env bash
set -e
cd /app
uvicorn backend.app.main:app --host 0.0.0.0 --port 7860
