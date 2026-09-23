from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import settings
from app.database.init_db import init_db

app = FastAPI(title=settings.app_name)
@app.get("/health")
def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": f"Bienvenue sur {settings.app_name}"}
