#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "--------------------------------------------------"
echo " 🤖 GodShitEater · AgentHub Pro v3.6"
echo "     Termux Auto‑Installer + Widgets"
echo "--------------------------------------------------"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHORTCUT_DIR="$HOME/.shortcuts"
mkdir -p "$SHORTCUT_DIR"

echo "[*] Using project root:"
echo "    $PROJECT_ROOT"

CONF="$PROJECT_ROOT/config.env"

if [ ! -f "$CONF" ]; then
  echo "[*] No config.env found, creating from template (if any)…"
  if [ -f "$PROJECT_ROOT/config.env.example" ]; then
    cp "$PROJECT_ROOT/config.env.example" "$CONF"
    echo "    → Copied config.env.example → config.env"
  else
    cat > "$CONF" << EOC
HF_USERNAME=your-hf-username
HF_SPACE_NAME=GodShitEater_v4_0
HF_TOKEN=hf_xxx
GITHUB_REPO=your-github-username/GodShitEater_v4_0
GITHUB_TOKEN=ghp_xxx
EOC
    echo "    → Created minimal config.env"
  fi
fi

echo
echo "[*] Creating Termux widgets in $SHORTCUT_DIR …"

cat << EOW > "$SHORTCUT_DIR/00_GodShitEater_SECRETS.sh"
#!/data/data/com.termux/files/usr/bin/bash
bash "$PROJECT_ROOT/scripts/setup_secrets.sh"
EOW

cat << EOW > "$SHORTCUT_DIR/01_GodShitEater_DEPLOY_HF.sh"
#!/data/data/com.termux/files/usr/bin/bash
bash "$PROJECT_ROOT/scripts/deploy_hf.sh"
EOW

cat << EOW > "$SHORTCUT_DIR/02_GodShitEater_GITHUB_PUSH.sh"
#!/data/data/com.termux/files/usr/bin/bash
bash "$PROJECT_ROOT/scripts/deploy_github.sh"
EOW

cat << EOW > "$SHORTCUT_DIR/03_GodShitEater_STATUS.sh"
#!/data/data/com.termux/files/usr/bin/bash
python3 "$PROJECT_ROOT/scripts/status.py"
EOW

chmod +x "$SHORTCUT_DIR"/0*_GodShitEater_*.sh 2>/dev/null || true

echo "--------------------------------------------------"
echo " ✅ Install complete."
echo "--------------------------------------------------"
echo "Widgets created (Termux:Widget):"
echo "  00_GodShitEater_SECRETS"
echo "  01_GodShitEater_DEPLOY_HF"
echo "  02_GodShitEater_GITHUB_PUSH"
echo "  03_GodShitEater_STATUS"
echo
echo "1) Put your .env values into:"
echo "   $CONF"
echo "2) From Android home screen → Widgets → Termux Widget:"
echo "   add buttons for 00, 01, 02, 03 in that order."
echo "3) Tap in order: 00 → 01 → (02 optional) → 03"
echo "--------------------------------------------------"
