#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "PC Inventaris stoppen..."
[ -f "$SCRIPT_DIR/logs/backend.pid" ] && kill $(cat "$SCRIPT_DIR/logs/backend.pid") 2>/dev/null && echo "  ✔ Backend gestopt"
[ -f "$SCRIPT_DIR/logs/frontend.pid" ] && kill $(cat "$SCRIPT_DIR/logs/frontend.pid") 2>/dev/null && echo "  ✔ Frontend gestopt"
fuser -k 3001/tcp > /dev/null 2>&1 || true
fuser -k 3000/tcp > /dev/null 2>&1 || true
echo "Klaar."
