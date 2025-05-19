from pathlib import Path
import sys

# Determine the repository root based on this file location
REPO_ROOT = Path(__file__).resolve().parents[1]

# Backend directory assumed to live at repo_root / "backend"
BACKEND_DIR = REPO_ROOT / "backend"

# Add the backend directory to sys.path if it exists
if BACKEND_DIR.exists():
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    print(f"Backend path: {BACKEND_DIR}")
