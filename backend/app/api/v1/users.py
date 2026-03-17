"""users.py"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.schemas.schemas import UserResponse, UserUpsertRequest
from app.services.user_service import user_service

router = APIRouter(prefix="/users")


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UserUpsertRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.upsert_user(db, current_user["clerk_user_id"], body)
    return user
