from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..db import get_db
from ..schemas import ChatRequest, ChatResponse, ChatHistoryResponse, ChatMessage
from ..utils.credits import count_words
from ..services.openrouter_service import fetch_openrouter_chat_completion


router = APIRouter()


async def _get_or_create_session(db, user_id: str):
    session = await db["chat_sessions"].find_one({"user_id": user_id})
    if session:
        return session
    doc = {"user_id": user_id, "messages": []}
    result = await db["chat_sessions"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.get("/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(current_user=Depends(get_current_user)):
    db = get_db()
    session = await _get_or_create_session(db, current_user["email"])
    messages = [
        ChatMessage(
            role=m.get("role", "user"),
            content=m.get("content", ""),
            timestamp=m.get("timestamp", datetime.now(timezone.utc)),
            type=m.get("type", "text"),
        )
        for m in session.get("messages", [])
    ]
    return {"session_id": str(session.get("_id", "")), "messages": messages}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest, session_id: str = None, current_user=Depends(get_current_user)):
    if not payload.text and not payload.image_url:
        raise HTTPException(status_code=400, detail="Provide text or image_url")

    db = get_db()
    
    # Check if user has sufficient credits
    user_credits_available = current_user.get("credits_available", 0)
    user_input_words = count_words(payload.text) + count_words(payload.image_url)
    
    # Estimate AI response words (rough estimate based on input)
    estimated_ai_words = min(max(user_input_words * 2, 50), 500)  # 2x input, min 50, max 500
    estimated_total_words = user_input_words + estimated_ai_words
    
    if user_credits_available < estimated_total_words:
        # Calculate how many credits are needed
        credits_needed = estimated_total_words - user_credits_available
        # Round up to nearest 1000 for payment
        credits_to_purchase = ((credits_needed - 1) // 1000 + 1) * 1000
        
        raise HTTPException(
            status_code=402,  # Payment Required
            detail={
                "error": "insufficient_credits",
                "message": f"You need {credits_needed} more credits to continue. Consider purchasing {credits_to_purchase} credits.",
                "current_balance": user_credits_available,
                "required": estimated_total_words,
                "suggested_purchase": credits_to_purchase
            }
        )
    
    if session_id:
        # Use specific session
        from bson import ObjectId
        try:
            object_id = ObjectId(session_id)
            session = await db["chat_sessions"].find_one({
                "_id": object_id,
                "user_id": current_user["email"]
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid session ID")
    else:
        # Get or create default session
        session = await _get_or_create_session(db, current_user["email"])

    now = datetime.now(timezone.utc)
    user_message: dict = {
        "role": "user",
        "content": payload.text or payload.image_url or "",
        "timestamp": now,
        "type": "image" if payload.image_url and not payload.text else "text",
    }
    # Append user message
    await db["chat_sessions"].update_one(
        {"_id": session["_id"]},
        {"$push": {"messages": user_message}},
    )

    # Build chat history messages for LLM
    history = session.get("messages", []) + [user_message]
    llm_messages = []
    for m in history:
        content = m.get("content", "")
        if m.get("type") == "image":
            content = f"[User sent an image at {content}]. Provide a flirty, friendly response describing what you might say."
        llm_messages.append({"role": "user" if m.get("role") == "user" else "assistant", "content": content})

    ai_text = await fetch_openrouter_chat_completion(llm_messages)

    ai_message: dict = {
        "role": "ai",
        "content": ai_text,
        "timestamp": datetime.now(timezone.utc),
        "type": "text",
    }

    await db["chat_sessions"].update_one(
        {"_id": session["_id"]},
        {"$push": {"messages": ai_message}},
    )

    # Credits: words in user input + AI output
    user_words = count_words(payload.text) + count_words(payload.image_url)
    ai_words = count_words(ai_text)
    total_increment = user_words + ai_words
    
    # Deduct from available credits and track usage
    await db["users"].update_one(
        {"email": current_user["email"]},
        {
            "$inc": {
                "credits_used": total_increment,
                "credits_available": -total_increment
            }
        },
    )

    reply = ChatMessage(**ai_message)
    return {"reply": reply, "session_id": str(session.get("_id", ""))}


