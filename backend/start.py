import os
import sys
import uvicorn

# Step 1: Add backend folder to sys.path
backend_dir = os.path.dirname(__file__)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Step 2: Set PYTHONPATH for reload subprocess
os.environ["PYTHONPATH"] = backend_dir

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
