#!/usr/bin/env bash
set -e

echo "[codex-setup] Starting setup"

if [ -f package.json ]; then
  echo "[codex-setup] Frontend package.json detected"
  if command -v npm >/dev/null 2>&1; then
    npm install
  else
    echo "[codex-setup] npm not found; skipping frontend install"
  fi
fi

if [ -d backend ] && [ -f backend/requirements.txt ]; then
  echo "[codex-setup] Backend detected"
  if command -v python3 >/dev/null 2>&1; then
    python3 -m venv backend/.venv || true
    . backend/.venv/bin/activate 2>/dev/null || true
    pip install -r backend/requirements.txt || true
  else
    echo "[codex-setup] python3 not found; skipping backend install"
  fi
fi

echo "[codex-setup] Setup finished"
