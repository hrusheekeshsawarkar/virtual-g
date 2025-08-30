import asyncio
import logging
from typing import Dict, Any
from livekit import api, rtc
from livekit.agents import JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent as VoiceAgent
from livekit.plugins import openai
from ..config import settings
from .openrouter_service import fetch_openrouter_chat_completion
from dotenv import load_dotenv
load_dotenv()
logger = logging.getLogger(__name__)

class PernillaVoiceAgent:
    """Voice AI agent for Pernilla virtual girlfriend"""
    
    def __init__(self):
        # Don't initialize the LiveKit API here to avoid async issues
        self._api_config = {
            "url": settings.livekit_ws_url,
            "api_key": settings.livekit_api_key,
            "api_secret": settings.livekit_api_secret,
        }
        self.room_service = None
    
    def _get_room_service(self):
        """Get or create LiveKit API service"""
        if self.room_service is None:
            self.room_service = api.LiveKitAPI(**self._api_config)
        return self.room_service
    
    async def create_access_token(self, room_name: str, participant_name: str) -> str:
        """Create access token for LiveKit room"""
        token = api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        token.with_identity(participant_name).with_name(participant_name)
        token.with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        ))
        return token.to_jwt()
    
    async def create_room(self, room_name: str) -> Dict[str, Any]:
        """Create or get existing LiveKit room"""
        try:
            room_service = self._get_room_service()
            
            # Try to get existing room first
            rooms = await room_service.room.list_rooms(api.ListRoomsRequest())
            for room in rooms.rooms:
                if room.name == room_name:
                    return {"name": room.name, "sid": room.sid, "exists": True}
            
            # Create new room if it doesn't exist
            room = await room_service.room.create_room(api.CreateRoomRequest(
                name=room_name,
                empty_timeout=60 * 10,  # 10 minutes
                max_participants=2,     # Just user and AI agent
            ))
            return {"name": room.name, "sid": room.sid, "exists": False}
        except Exception as e:
            logger.error(f"Failed to create/get room {room_name}: {e}")
            raise

async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice agent"""
    logger.info(f"Starting voice agent for room: {ctx.room.name}")
    
    # Initialize the voice agent with OpenAI components
    # This follows the pattern from LiveKit Agents documentation
    agent = VoiceAgent(
        stt=openai.STT(),
        llm=openai.LLM(
            model="gpt-4o-mini"  # Using a cost-effective model
        ),
        tts=openai.TTS(),
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=settings.system_prompt
        )
    )
    
    # Start the agent - this connects it to the room
    agent.start(ctx.room)
    
    logger.info("Voice agent started successfully and listening for audio")
    
    # Wait for the agent to finish (this keeps the process alive)
    await agent.aclose()

def start_agent_worker():
    """Start the LiveKit agent worker"""
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            ws_url=settings.livekit_ws_url,
            api_key=settings.livekit_api_key,
            api_secret=settings.livekit_api_secret,
        )
    )

# Voice agent service for room management
voice_agent_service = PernillaVoiceAgent()
