#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="$ROOT/config.env"

echo "--------------------------------------------------"
echo "  📦 Pushing GodShitEater to GitHub"
echo "--------------------------------------------------"
echo "Root : $ROOT"
echo "Conf : $CONF"
echo "--------------------------------------------------"

if [ ! -f "$CONF" ]; then
  echo "❌ config.env not found in project root."
  exit 1
fi

GITHUB_REPO=""
GITHUB_TOKEN=""
while IFS='=' read -r k v; do
  case "$k" in
    GITHUB_REPO) GITHUB_REPO="$v" ;;
    GITHUB_TOKEN) GITHUB_TOKEN="$v" ;;
  esac
done < "$CONF"

if [ -z "$GITHUB_REPO" ]; then
  echo "❌ GITHUB_REPO missing in config.env"
  exit 1
fi

cd "$ROOT"

if [ ! -d .git ]; then
  git init
fi

git config user.name "AgentHubBot"
git config user.email "agenthub@example.com"

git add .
if ! git diff --cached --quiet; then
  git commit -m "GodShitEater auto-commit $(date +%Y-%m-%d_%H-%M-%S)"
fi

git branch -M main

URL="https://github.com/${GITHUB_REPO}.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$URL"

echo "Pushing to $URL …"
git push -u origin main
