import sys
import os
from datetime import datetime
from zoneinfo import ZoneInfo

# Force import of all models so SQLAlchemy registers relationships
from app.models import customer, order, appointment
from app.api.google_calendar import router as google_calendar_router

# 🛠️ Ensure the backend/ folder is on sys.path
project_root = os.path.dirname(os.path.abspath(__file__))  # /backend/app
backend_root = os.path.abspath(os.path.join(project_root, ".."))  # /backend
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

print("👀 MAIN STARTUP in:", os.getcwd())
print("🧠 PYTHONPATH includes:", sys.path)

# ⏰ Fix tzdata for Windows
os.environ["PYTHONTZPATH"] = os.path.join(sys.prefix, "lib", "tzdata")

from dotenv import load_dotenv

# ✅ Load .env only if it exists (for local dev)
env_path = os.path.join(os.path.dirname(__file__), "key.env")
if os.path.exists(env_path):
    print("✅ Loading .env from:", env_path)
    load_dotenv(env_path)
else:
    print("⚠️ key.env not found at:", env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.todo import router as todo_router
from app.api.customer import router as customer_router
from app.api.order import router as order_router
from app.api.appointment import router as appointment_router
from app.routes.drop_ship_routes import router as drop_ship_router
from app.sync import sync_customers

# ✅ For full DB reset (used only once initially if needed)
from app.models.customer import Base
from app.core.database import engine

# Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        now_cst = datetime.now(ZoneInfo("America/Chicago"))
        print(f"🕒 CST Time at startup: {now_cst}")
    except Exception as e:
        print("❌ Timezone loading failed:", e)

    print("[STARTUP] Syncing customers and orders...")
    sync_customers.run_all_syncs()
    yield

# FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

# CORS for local + production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://frontend-production-a27c.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(customer_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(drop_ship_router, prefix="/api")
app.include_router(todo_router, prefix="/api")
app.include_router(appointment_router, prefix="/api")
app.include_router(google_calendar_router, prefix="/api")  # ✅ Added Google Calendar API

# Optional root check
@app.get("/")
def health_check():
    return {"status": "ok"}
