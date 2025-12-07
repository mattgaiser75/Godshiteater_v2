import os

class Settings:
    project_name: str = os.getenv("PROJECT_NAME", "GodShitEater v4.0")
    hf_username: str | None = os.getenv("HF_USERNAME")
    hf_space_name: str | None = os.getenv("HF_SPACE_NAME")
    github_repo: str | None = os.getenv("GITHUB_REPO")

settings = Settings()
