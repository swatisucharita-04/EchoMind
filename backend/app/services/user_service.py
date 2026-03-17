from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User
from app.schemas.schemas import UserUpsertRequest
from loguru import logger


class UserService:
    async def upsert_user(self, db: AsyncSession, clerk_user_id: str, data: UserUpsertRequest) -> User:
        """Create or update a user based on their Clerk ID."""
        result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                clerk_user_id=clerk_user_id,
                email=data.email,
                display_name=data.display_name,
                avatar_url=data.avatar_url,
            )
            db.add(user)
            await db.flush()
            logger.info(f"New user created: clerk_id={clerk_user_id}")
        else:
            if data.display_name is not None:
                user.display_name = data.display_name
            if data.avatar_url is not None:
                user.avatar_url = data.avatar_url

        return user

    async def get_by_clerk_id(self, db: AsyncSession, clerk_user_id: str) -> User | None:
        result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
        return result.scalar_one_or_none()

    async def require_user(self, db: AsyncSession, clerk_user_id: str) -> User:
        """Get user or raise 401 — use in protected routes."""
        from fastapi import HTTPException, status
        user = await self.get_by_clerk_id(db, clerk_user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found. Please complete sign-up."
            )
        return user


user_service = UserService()
