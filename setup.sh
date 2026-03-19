#!/bin/bash
set -e

# ============================================================
#  PC Inventaris — Setup Script
#  Installeert alle dependencies en start de applicatie op.
# ============================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOG_DIR="$SCRIPT_DIR/logs"

echo -e "${CYAN}"
echo "  ◈  PC INVENTARIS — Setup"
echo "  ──────────────────────────────────────────"
echo -e "${NC}"

mkdir -p "$LOG_DIR"

# ── Stap 1: Check & installeer Node.js ──────────────────────
echo -e "${YELLOW}[1/5] Node.js controleren...${NC}"
if ! command -v node &>/dev/null; then
  echo "Node.js niet gevonden. Installeren via NodeSource..."
  sudo apt-get update -qq
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > "$LOG_DIR/node_install.log" 2>&1
  sudo apt-get install -y nodejs >> "$LOG_DIR/node_install.log" 2>&1
  echo -e "${GREEN}  ✔ Node.js geïnstalleerd: $(node --version)${NC}"
else
  NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -lt 16 ]; then
    echo "Node.js versie te oud ($NODE_VER). Updaten naar versie 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > "$LOG_DIR/node_install.log" 2>&1
    sudo apt-get install -y nodejs >> "$LOG_DIR/node_install.log" 2>&1
    echo -e "${GREEN}  ✔ Node.js geüpdatet: $(node --version)${NC}"
  else
    echo -e "${GREEN}  ✔ Node.js $(node --version) gevonden${NC}"
  fi
fi

# ── Stap 2: Check curl ───────────────────────────────────────
if ! command -v curl &>/dev/null; then
  echo "curl installeren..."
  sudo apt-get install -y curl > /dev/null 2>&1
fi

# ── Stap 3: Backend dependencies ────────────────────────────
echo -e "${YELLOW}[2/5] Backend dependencies installeren...${NC}"
cd "$BACKEND_DIR"
npm install --silent > "$LOG_DIR/backend_npm.log" 2>&1
echo -e "${GREEN}  ✔ Backend klaar${NC}"

# ── Stap 4: Frontend dependencies ───────────────────────────
echo -e "${YELLOW}[3/5] Frontend dependencies installeren (dit duurt even)...${NC}"
cd "$FRONTEND_DIR"
npm install --silent > "$LOG_DIR/frontend_npm.log" 2>&1
echo -e "${GREEN}  ✔ Frontend klaar${NC}"

# ── Stap 5: .env aanmaken als die er nog niet is ─────────────
echo -e "${YELLOW}[4/5] Configuratie controleren...${NC}"
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
  cat > "$ENV_FILE" <<EOF
PORT=3001
JWT_SECRET=$JWT_SECRET
EOF
  echo -e "${GREEN}  ✔ .env aangemaakt met willekeurige JWT secret${NC}"
else
  echo -e "${GREEN}  ✔ .env al aanwezig${NC}"
fi

# ── Stap 6: Starten ─────────────────────────────────────────
echo -e "${YELLOW}[5/5] Applicatie starten...${NC}"

# Kill eventuele bestaande processen op de poorten
fuser -k 3001/tcp > /dev/null 2>&1 || true
fuser -k 3000/tcp > /dev/null 2>&1 || true
sleep 1

# Start backend
cd "$BACKEND_DIR"
node server.js > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"

# Wacht tot backend klaar is
echo -n "  Wachten op backend"
for i in {1..20}; do
  if curl -s http://localhost:3001/api/stats -H "Authorization: Bearer test" > /dev/null 2>&1 || \
     curl -s http://localhost:3001/api/auth/login -X POST > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
  echo -n "."
done
echo ""
echo -e "${GREEN}  ✔ Backend draait (PID: $BACKEND_PID)${NC}"

# Start frontend
cd "$FRONTEND_DIR"
BROWSER=none npm start > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"

echo -e "${GREEN}  ✔ Frontend wordt gestart (PID: $FRONTEND_PID)${NC}"

# ── Klaar ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ◈  ALLES DRAAIT!${NC}"
echo "  ──────────────────────────────────────────"
echo -e "  ${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "  ${GREEN}Backend:${NC}  http://localhost:3001"
echo ""
echo "  Logs zijn te vinden in: $LOG_DIR/"
echo "  Om te stoppen: ./stop.sh  (of kill de processen handmatig)"
echo ""

# Maak ook een stop script aan
cat > "$SCRIPT_DIR/stop.sh" <<'STOP'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "PC Inventaris stoppen..."
[ -f "$SCRIPT_DIR/logs/backend.pid" ] && kill $(cat "$SCRIPT_DIR/logs/backend.pid") 2>/dev/null && echo "  ✔ Backend gestopt"
[ -f "$SCRIPT_DIR/logs/frontend.pid" ] && kill $(cat "$SCRIPT_DIR/logs/frontend.pid") 2>/dev/null && echo "  ✔ Frontend gestopt"
fuser -k 3001/tcp > /dev/null 2>&1 || true
fuser -k 3000/tcp > /dev/null 2>&1 || true
echo "Klaar."
STOP
chmod +x "$SCRIPT_DIR/stop.sh"

# Wacht op Ctrl+C zodat het script actief blijft
echo -e "  Druk ${YELLOW}Ctrl+C${NC} om te stoppen, of sluit dit venster."
echo ""
wait $FRONTEND_PID
