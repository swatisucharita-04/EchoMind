"""
Chat router
POST /api/v1/chat/message  — single-turn REST (easier for mobile / testing)
WS   /api/v1/chat/ws/{session_id}  — streaming WebSocket chat
GET  /api/v1/chat/conversations  — list user's conversations
GET  /api/v1/chat/conversations/{id}/messages  — message history
"""
import json
import uuid
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.core.auth import CurrentUser, verify_clerk_token
from app.db.base import get_db
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse, ConversationResponse, MessageResponse
from app.services.user_service import user_service
from app.services.conversation_service import conversation_service, mood_service
from app.services.ai_service import ai_service
from app.models.models import Conversation, Message
from sqlalchemy import select, func, desc

router = APIRouter(prefix="/chat")


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    body: ChatMessageRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Process a chat message through the full AI pipeline."""
    user = await user_service.require_user(db, current_user["clerk_user_id"])

    # 1 — Get or create conversation
    conv = await conversation_service.get_or_create_conversation(db, user.id, body.session_id)

    # 2 — Fetch conversation history for context
    history = await conversation_service.get_history(db, conv.id)

    # 3 — Classify mood from user message
    mood_analysis = await ai_service.classify_mood(body.message)

    # 4 — Generate AI response
    ai_reply = await ai_service.generate_response(body.message, mood_analysis, history)

    # 5 — Persist user message
    await conversation_service.add_message(
        db, conv.id, role="user", content=body.message,
        mood=mood_analysis.mood, mood_score=mood_analysis.mood_score
    )

    # 6 — Persist assistant message
    ai_msg = await conversation_service.add_message(
        db, conv.id, role="assistant", content=ai_reply
    )

    # 7 — Record mood entry
    await mood_service.record_mood(
        db, user.id, mood_analysis,
        source_message=body.message, ai_insight=ai_reply[:200]
    )

    return ChatMessageResponse(
        reply=ai_reply,
        mood_analysis=mood_analysis,
        session_id=conv.session_id,
        message_id=ai_msg.id,
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, le=50),
    offset: int = 0,
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(desc(Conversation.updated_at))
        .offset(offset)
        .limit(limit)
    )
    convs = result.scalars().all()

    # Attach message count
    responses = []
    for c in convs:
        count_result = await db.execute(
            select(func.count(Message.id)).where(Message.conversation_id == c.id)
        )
        responses.append(ConversationResponse(
            id=c.id,
            session_id=c.session_id,
            title=c.title,
            created_at=c.created_at,
            message_count=count_result.scalar() or 0,
        ))
    return responses


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=200),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])

    # Verify ownership
    conv_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
        )
    )
    if not conv_result.scalar_one_or_none():
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(limit)
    )
    return list(result.scalars().all())


# ─── WebSocket ───────────────────────────────────────────────
@router.websocket("/ws/{session_id}")
async def websocket_chat(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...),  # ?token=<clerk_jwt>
):
    """
    WebSocket endpoint for real-time chat.
    Client must pass Clerk JWT as ?token= query param.

    Message format (client → server):  JSON { "message": "..." }
    Message format (server → client):  JSON { "type": "...", "data": {...} }
    """
    await websocket.accept()

    # Verify JWT
    try:
        payload = await verify_clerk_token(token)
        clerk_user_id = payload.get("sub")
        if not clerk_user_id:
            await websocket.send_json({"type": "error", "data": {"message": "Unauthorized"}})
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.send_json({"type": "error", "data": {"message": "Invalid token"}})
        await websocket.close(code=4001)
        return

    logger.info(f"WS connected: clerk={clerk_user_id} session={session_id}")

    try:
        while True:
            raw = await websocket.receive_text()

            # Ping/pong keepalive
            if raw == "__ping__":
                await websocket.send_text("__pong__")
                continue

            # Parse message
            try:
                data = json.loads(raw)
                user_message = data.get("message", "").strip()
            except json.JSONDecodeError:
                user_message = raw.strip()

            if not user_message:
                continue

            # Send typing indicator
            await websocket.send_json({"type": "typing", "data": {}})

            # Run through AI pipeline (creates its own DB session per message)
            async with __import__("app.db.base", fromlist=["AsyncSessionLocal"]).AsyncSessionLocal() as db:
                try:
                    user = await user_service.get_by_clerk_id(db, clerk_user_id)
                    if not user:
                        await websocket.send_json({"type": "error", "data": {"message": "User not found"}})
                        continue

                    conv = await conversation_service.get_or_create_conversation(db, user.id, session_id)
                    history = await conversation_service.get_history(db, conv.id)
                    mood_analysis = await ai_service.classify_mood(user_message)
                    ai_reply = await ai_service.generate_response(user_message, mood_analysis, history)

                    await conversation_service.add_message(db, conv.id, "user", user_message, mood_analysis.mood, mood_analysis.mood_score)
                    ai_msg = await conversation_service.add_message(db, conv.id, "assistant", ai_reply)
                    await mood_service.record_mood(db, user.id, mood_analysis, user_message)
                    await db.commit()

                    await websocket.send_json({
                        "type": "message",
                        "data": {
                            "reply": ai_reply,
                            "mood": mood_analysis.mood,
                            "mood_score": mood_analysis.mood_score,
                            "emotion": mood_analysis.emotion,
                            "session_id": conv.session_id,
                            "message_id": ai_msg.id,
                        }
                    })
                except Exception as e:
                    logger.exception(f"WS pipeline error: {e}")
                    await websocket.send_json({"type": "error", "data": {"message": "Processing error. Try again."}})

    except WebSocketDisconnect:
        logger.info(f"WS disconnected: clerk={clerk_user_id}")
    except Exception as e:
        logger.exception(f"WS unhandled: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
