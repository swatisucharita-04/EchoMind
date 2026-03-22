from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from app.config import get_settings

settings = get_settings()

# SQLAlchemy async engine requires the asyncpg driver scheme.
# Auto-convert plain postgresql:// → postgresql+asyncpg:// so the .env
# value works whether or not the user added the driver prefix.
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgres://"):
    # Heroku / Supabase sometimes emit postgres:// shorthand
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

kwargs = {
    "echo": not settings.is_production,
    "pool_pre_ping": True,
}
if "sqlite" not in _db_url:
    kwargs["pool_size"] = 10
    kwargs["max_overflow"] = 20

engine = create_async_engine(_db_url, **kwargs)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
