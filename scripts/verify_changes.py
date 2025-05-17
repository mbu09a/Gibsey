#!/usr/bin/env python3
"""
Verify that our code changes are being picked up by the interpreter.
"""
import os
import sys
from pathlib import Path

# Add the backend directory to the path before importing
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "backend"))

# Now import the app

try:

    # Print a success message
    print("✅ Successfully imported the FastAPI app!")

    # Print the current working directory
    print(f"\n📂 Current working directory: {os.getcwd()}")

    # Print the Python path
    print("\n🐍 Python path:")
    for p in sys.path:
        print(f"  - {p}")

    # Check if we can find the main.py file
    main_py = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "..", "apps", "backend", "app", "main.py"
        )
    )
    print(f"\n🔍 Looking for main.py at: {main_py}")

    if os.path.exists(main_py):
        print("✅ Found main.py!")

        # Print the first few lines of main.py
        print("\n📝 Contents of main.py (first 50 lines):")
        with open(main_py, "r") as f:
            for i, line in enumerate(f):
                if i < 50:  # Print first 50 lines
                    print(f"{i+1}: {line.rstrip()}")
                else:
                    print("...")
                    break
    else:
        print("❌ Could not find main.py!")

except ImportError as e:
    print(f"❌ Error importing the app: {e}")
    print("\nThis could be due to:")
    print("1. Missing dependencies (run 'pip install -e .' in the backend directory)")
    print("2. Incorrect Python environment (check with 'which python')")
    print("3. Incorrect PYTHONPATH (check sys.path above)")
