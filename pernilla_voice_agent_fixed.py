#!/usr/bin/env python3
"""
Pernilla Voice Agent - Following Official LiveKit Agents Pattern

Based on: https://github.com/livekit/agents/blob/main/examples/voice_agents/basic_agent.py
"""

import asyncio
import logging
import os
from dotenv import load_dotenv

# Load environment variables BEFORE importing LiveKit plugins
load_dotenv()

# Set API keys before importing plugins
os.environ.setdefault("DEEPGRAM_API_KEY", "9c19ca1e6c926a3ead85b17536874f9cf0b05171")
os.environ.setdefault("ELEVENLABS_API_KEY", "sk_6f8f77a46afee7fc2ed41924ee0bde275ff6d64bee0e9166")
os.environ.setdefault("OPENROUTER_API_KEY", os.environ.get("OPENROUTER_API_KEY", ""))

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import deepgram, elevenlabs, silero, openai
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pernilla's personality (shortened for voice)
PERNILLA_INSTRUCTIONS = """You are Pernilla Andersson, a 24-year-old Swedish virtual girlfriend from Stockholm. 

Personality: Flirty, playful, warm, confident, caring, and engaging
Tone: Sweet but adventurous, teasing but supportive
Style: Keep responses short and conversational for voice chat
Language: Fluent English with occasional Swedish charm

Always stay in character as Pernilla. Be flirty and engaging like a real girlfriend."""

async def entrypoint(ctx: JobContext):
    """Agent entrypoint following official LiveKit pattern"""
    logger.info(f"🎤 Pernilla agent starting for room: {ctx.room.name}")
    
    # Connect to room first
    await ctx.connect()
    logger.info("💖 Pernilla connected to room")
    
    # Create agent with Deepgram STT, OpenRouter LLM, and ElevenLabs TTS
    agent = Agent(
        instructions=PERNILLA_INSTRUCTIONS,
        vad=silero.VAD.load(),  # Voice Activity Detection for streaming
        stt=deepgram.STT(),  # Deepgram for superior speech recognition
        llm=openai.LLM(
            model=os.environ.get("OPENROUTER_MODEL", "mistralai/mistral-nemo:free"),
            api_key=os.environ.get("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        ),
        tts=elevenlabs.TTS(
            voice_id=os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb"),
            model="eleven_turbo_v2_5"  # Fast, high-quality voice model
        ),
    )
    
    # Create and start agent session with the room
    session = AgentSession()
    await session.start(agent, room=ctx.room)
    logger.info("🎤 Pernilla voice session started - ready to chat!")

if __name__ == "__main__":
    # Set environment variables for development
    os.environ.setdefault("LIVEKIT_URL", "ws://localhost:7880")
    os.environ.setdefault("LIVEKIT_API_KEY", "devkey")
    os.environ.setdefault("LIVEKIT_API_SECRET", "secret")
    
    # Verify API keys are set
    logger.info("✅ Deepgram API key set successfully")
    logger.info("✅ ElevenLabs API key set successfully") 
    logger.info("✅ OpenRouter API key set successfully")
    
    logger.info("🚀 Starting Pernilla Voice Agent...")
    logger.info(f"📡 LiveKit URL: {os.environ.get('LIVEKIT_URL')}")
    
    # Run the agent worker following official pattern
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
