from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from ..auth import get_current_user
from ..services.livekit_service import voice_agent_service
from ..utils.credits import count_words, update_user_credits
from ..db import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class VoiceRoomRequest(BaseModel):
    room_name: str

class VoiceRoomResponse(BaseModel):
    room_name: str
    room_sid: str
    token: str
    ws_url: str

@router.post("/voice/create-room", response_model=VoiceRoomResponse)
async def create_voice_room(
    request: VoiceRoomRequest,
    current_user=Depends(get_current_user)
):
    """Create a voice chat room and return access token"""
    try:
        # Check if user has sufficient credits for voice chat
        # Voice chat is more expensive - minimum 100 credits per session
        db = get_db()
        user_credits_available = current_user.get("credits_available", 0)
        
        if user_credits_available < 100:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "insufficient_credits",
                    "message": "Voice chat requires at least 100 credits. Please purchase more credits.",
                    "current_balance": user_credits_available,
                    "required": 100,
                    "suggested_purchase": 1000
                }
            )
        
        # Create/get room
        room = await voice_agent_service.create_room(request.room_name)
        
        # Create access token for user
        user_token = await voice_agent_service.create_access_token(
            room_name=request.room_name,
            participant_name=current_user["email"]
        )
        
        # Deduct initial credits for starting voice session
        await update_user_credits(current_user["email"], 50)  # 50 credits to start
        
        logger.info(f"Created voice room {request.room_name} for user {current_user['email']}")
        
        return VoiceRoomResponse(
            room_name=room["name"],
            room_sid=room["sid"],
            token=user_token,
            ws_url=voice_agent_service._api_config["url"]
        )
        
    except Exception as e:
        logger.error(f"Failed to create voice room: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create voice room: {str(e)}")

@router.get("/voice/rooms")
async def list_voice_rooms(current_user=Depends(get_current_user)):
    """List available voice rooms for the user"""
    try:
        # For now, we'll create a personal room for each user
        personal_room = f"pernilla-{current_user['email'].replace('@', '-').replace('.', '-')}"
        
        return {
            "rooms": [
                {
                    "name": personal_room,
                    "display_name": "Chat with Pernilla",
                    "description": "Private voice chat with your virtual girlfriend"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Failed to list rooms: {e}")
        raise HTTPException(status_code=500, detail="Failed to list rooms")

@router.post("/voice/end-session")
async def end_voice_session(
    request: VoiceRoomRequest,
    current_user=Depends(get_current_user)
):
    """End voice chat session and calculate final credits"""
    try:
        # In a real implementation, you'd track session duration and usage
        # For now, we'll just acknowledge the session end
        logger.info(f"Ended voice session for room {request.room_name}, user {current_user['email']}")
        
        return {"message": "Voice session ended successfully"}
        
    except Exception as e:
        logger.error(f"Failed to end voice session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end voice session")
