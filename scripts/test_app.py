from pathlib import Path
import sys

# Determine the repository root relative to this script
REPO_ROOT = Path(__file__).resolve().parents[1]

# Path to the backend application directory
BACKEND_DIR = REPO_ROOT / "backend"

# Insert backend path into Python path for module resolution
if BACKEND_DIR.exists():
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    print(f"Backend path: {BACKEND_DIR}")
