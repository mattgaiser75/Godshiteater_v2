import os
from huggingface_hub import HfApi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONF = os.path.join(ROOT, "config.env")

if not os.path.exists(CONF):
    print("❌ config.env missing")
    raise SystemExit(1)

env = {}
with open(CONF) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

user = env.get("HF_USERNAME")
space_name = env.get("HF_SPACE_NAME")
token = env.get("HF_TOKEN")

if not (user and space_name and token):
    print("❌ HF variables missing in config.env")
    raise SystemExit(1)

repo_id = f"{user}/{space_name}"

api = HfApi(token=token)
print(f"[HF] Checking runtime for {repo_id}…")
info = api.get_space_runtime(repo_id)

print("stage     :", info.stage)
print("hardware  :", getattr(info.hardware, "current", None))
print("requested :", getattr(info.hardware, "requested", None))
