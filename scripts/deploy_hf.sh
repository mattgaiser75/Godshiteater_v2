#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="$ROOT/config.env"

echo "--------------------------------------------------"
echo "  🚀 Deploying GodShitEater to Hugging Face"
echo "--------------------------------------------------"
echo "Root : $ROOT"
echo "Conf : $CONF"
echo "--------------------------------------------------"

if [ ! -f "$CONF" ]; then
  echo "❌ config.env not found in project root."
  echo "   Copy config.env.example → config.env and fill values."
  exit 1
fi

python3 - << 'EOF'
import os
from huggingface_hub import HfApi, HfFolder, upload_folder

root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
conf_path = os.path.join(root, "config.env")

env = {}
with open(conf_path) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

user = env["HF_USERNAME"]
space_name = env["HF_SPACE_NAME"]
token = env["HF_TOKEN"]
repo_id = f"{user}/{space_name}"

print(f"[HF] Using repo_id: {repo_id}")
print(f"[HF] Project root: {root}")

HfFolder.save_token(token)
api = HfApi()

print("[HF] Ensuring space exists…")
api.create_repo(repo_id=repo_id, repo_type="space", space_sdk="docker", exist_ok=True, token=token)

print("[HF] Uploading folder…")
upload_folder(repo_id=repo_id, repo_type="space", folder_path=root, token=token)

print("[HF] ✅ Upload complete.")
EOF
