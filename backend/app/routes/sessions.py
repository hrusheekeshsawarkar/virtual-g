from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from ..auth import get_current_user
from ..db import get_db
from ..schemas import ChatHistoryResponse

router = APIRouter()


@router.get("/sessions")
async def get_user_sessions(current_user=Depends(get_current_user)):
    """Get all chat sessions for the current user"""
    db = get_db()
    sessions = await db["chat_sessions"].find({"user_id": current_user["email"]}).to_list(length=None)
    
    result = []
    for session in sessions:
        # Get the last message for preview
        messages = session.get("messages", [])
        last_message = ""
        message_count = len(messages)
        
        if messages:
            last_msg = messages[-1]
            if last_msg.get("type") == "image":
                last_message = "📷 Image"
            else:
                last_message = last_msg.get("content", "")[:100]  # Truncate long messages
        
        # Generate a title based on the first few messages or timestamp
        title = f"Chat Session"
        if messages:
            first_user_msg = next((m for m in messages if m.get("role") == "user"), None)
            if first_user_msg:
                content = first_user_msg.get("content", "")
                if len(content) > 30:
                    title = content[:30] + "..."
                else:
                    title = content or "New Chat"
        
        result.append({
            "id": str(session["_id"]),
            "title": title,
            "lastMessage": last_message,
            "messageCount": message_count,
            "timestamp": session.get("_id").generation_time.isoformat() if session.get("_id") else datetime.now(timezone.utc).isoformat()
        })
    
    # Sort by creation time (most recent first)
    result.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"sessions": result}


@router.post("/sessions")
async def create_new_session(current_user=Depends(get_current_user)):
    """Create a new chat session"""
    db = get_db()
    doc = {"user_id": current_user["email"], "messages": []}
    result = await db["chat_sessions"].insert_one(doc)
    
    return {
        "session_id": str(result.inserted_id),
        "message": "New chat session created"
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user=Depends(get_current_user)):
    """Delete a specific chat session"""
    from bson import ObjectId
    
    try:
        object_id = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    db = get_db()
    result = await db["chat_sessions"].delete_one({
        "_id": object_id,
        "user_id": current_user["email"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}


@router.get("/sessions/{session_id}/history", response_model=ChatHistoryResponse)
async def get_session_history(session_id: str, current_user=Depends(get_current_user)):
    """Get chat history for a specific session"""
    from bson import ObjectId
    
    try:
        object_id = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    db = get_db()
    session = await db["chat_sessions"].find_one({
        "_id": object_id,
        "user_id": current_user["email"]
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    from ..schemas import ChatMessage
    messages = [
        ChatMessage(
            role=m.get("role", "user"),
            content=m.get("content", ""),
            timestamp=m.get("timestamp", datetime.now(timezone.utc)),
            type=m.get("type", "text"),
        )
        for m in session.get("messages", [])
    ]
    
    return {"session_id": session_id, "messages": messages}
