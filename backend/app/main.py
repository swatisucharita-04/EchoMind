from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import os

from app.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.api.v1 import auth, chat, mood, journal, analytics, music, tts, users

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 EchoMind API starting — env={settings.APP_ENV}")
    os.makedirs("static/audio", exist_ok=True)
    
    from app.db.base import engine
    from app.models.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    logger.info("🛑 EchoMind API shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="EchoMind API",
        version=settings.APP_VERSION,
        description="AI Mental Wellness Assistant — production API",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── Middleware ──────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limiting ───────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Exception handlers ──────────────────────────────────
    register_exception_handlers(app)

    # ── Static files (TTS audio) ────────────────────────────
    os.makedirs("static/audio", exist_ok=True)
    app.mount("/static", StaticFiles(directory="static"), name="static")

    # ── Routers ─────────────────────────────────────────────
    PREFIX = "/api/v1"
    app.include_router(auth.router,      prefix=PREFIX, tags=["Auth"])
    app.include_router(users.router,     prefix=PREFIX, tags=["Users"])
    app.include_router(chat.router,      prefix=PREFIX, tags=["Chat"])
    app.include_router(mood.router,      prefix=PREFIX, tags=["Mood"])
    app.include_router(journal.router,   prefix=PREFIX, tags=["Journal"])
    app.include_router(analytics.router, prefix=PREFIX, tags=["Analytics"])
    app.include_router(music.router,     prefix=PREFIX, tags=["Music"])
    app.include_router(tts.router,       prefix=PREFIX, tags=["TTS"])

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "version": settings.APP_VERSION, "env": settings.APP_ENV}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
