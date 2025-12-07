#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="$ROOT/config.env"
TEMPLATE="$ROOT/config.env.example"

echo "--------------------------------------------------"
echo "  🔐 GodShitEater — Config / Secret Setup"
echo "--------------------------------------------------"
echo "Root : $ROOT"

if [ -f "$CONF" ]; then
  echo "✅ config.env already exists. Nothing to do."
  exit 0
fi

if [ -f "$TEMPLATE" ]; then
  cp "$TEMPLATE" "$CONF"
  echo "✍️  Edit this file with real tokens:"
  echo "   $CONF"
else
  cat > "$CONF" << EOC
HF_USERNAME=your-hf-username
HF_SPACE_NAME=GodShitEater_v4_0
HF_TOKEN=hf_xxx

GITHUB_REPO=your-github-username/GodShitEater_v4_0
GITHUB_TOKEN=ghp_xxx
EOC
  echo "⚠️ Template missing, generated minimal config.env."
fi

echo "Done. Open config.env in a text editor and fill secrets."
