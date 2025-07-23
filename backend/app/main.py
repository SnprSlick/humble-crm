import sys
import os
from datetime import datetime
from zoneinfo import ZoneInfo

from app.models import customer, order, appointment
from app.api.google_calendar import router as google_calendar_router

project_root = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(project_root, ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

print("👀 MAIN STARTUP in:", os.getcwd())
print("🧠 PYTHONPATH includes:", sys.path)

os.environ["PYTHONTZPATH"] = os.path.join(sys.prefix, "lib", "tzdata")

from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), ".env")
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
from app.models.customer import Base
from app.core.database import engine

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

app = FastAPI(lifespan=lifespan)

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

app.include_router(customer_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(drop_ship_router, prefix="/api")
app.include_router(todo_router, prefix="/api")
app.include_router(appointment_router, prefix="/api")
app.include_router(google_calendar_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok"}
