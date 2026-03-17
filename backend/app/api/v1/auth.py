"""
Auth router — POST /api/v1/auth/sync
Called by the frontend after Clerk login to upsert the user in our database.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.schemas.schemas import UserUpsertRequest, UserResponse
from app.services.user_service import user_service

router = APIRouter(prefix="/auth")


@router.post("/sync", response_model=UserResponse)
async def sync_user(
    body: UserUpsertRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """
    Upsert the authenticated Clerk user into our database.
    Call this once after every Clerk login so our DB stays in sync.
    """
    user = await user_service.upsert_user(
        db, clerk_user_id=current_user["clerk_user_id"], data=body
    )
    return user
