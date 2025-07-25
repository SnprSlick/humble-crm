import sys
import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# 🧠 Adjust paths
project_root = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(project_root, ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

print("👀 MAIN STARTUP in:", os.getcwd())
print("🧠 PYTHONPATH includes:", sys.path)

# ⏰ Fix timezone path for zoneinfo
os.environ["PYTHONTZPATH"] = os.path.join(sys.prefix, "lib", "tzdata")

# 🔐 Load .env when not in Railway
from dotenv import load_dotenv
if not os.getenv("RAILWAY_ENVIRONMENT"):
    env_path = os.path.join(os.path.dirname(__file__), "..", "key.env")
    if os.path.exists(env_path):
        print("✅ Loading .env from:", env_path)
        load_dotenv(env_path)
        print("🐛 DEBUG: WAVE_API_TOKEN =", os.getenv("WAVE_API_TOKEN"))
    else:
        print("⚠️ key.env not found at:", env_path)
else:
    print("🚀 Running in Railway (using injected env vars)")

# 🧩 Import routers
from app.api import portal_auth
from app.api.customer import router as customer_router
from app.api.order import router as order_router
from app.api.todo import router as todo_router
from app.api.appointment import router as appointment_router
from app.routes.drop_ship_routes import router as drop_ship_router
from app.api.google_calendar import router as google_calendar_router
from app.api.dashboard import router as dashboard_router
from app.api.service_jobs import router as service_jobs_router

# ⚙️ Sync on startup
from app.sync import sync_customers
from app.models.customer import Base
from app.models import line_item  # ✅ Registers LineItem model
from app.core.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        now_cst = datetime.now(ZoneInfo("America/Chicago"))
        print(f"🕒 CST Time at startup: {now_cst}")
    except Exception as e:
        print("❌ Timezone loading failed:", e)

    print("[STARTUP] Creating tables if missing...")
    Base.metadata.create_all(bind=engine)

    print("[STARTUP] Syncing customers and orders...")
    sync_customers.run_all_syncs()
    yield

app = FastAPI(lifespan=lifespan)

# 🌐 CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧩 Register all routes
app.include_router(portal_auth.router)
app.include_router(customer_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(drop_ship_router, prefix="/api")
app.include_router(todo_router, prefix="/api")
app.include_router(appointment_router, prefix="/api")
app.include_router(google_calendar_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(service_jobs_router)

# 🔍 Health check
@app.get("/")
def health_check():
    return {"status": "ok"}
