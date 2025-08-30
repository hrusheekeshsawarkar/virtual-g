#!/usr/bin/env python3
"""
Pernilla Voice Agent - Following Official LiveKit Agents Pattern

Based on: https://github.com/livekit/agents/blob/main/examples/voice_agents/basic_agent.py
"""

import asyncio
import logging
import os
from dotenv import load_dotenv

# Load environment variables and set OpenAI API key BEFORE importing LiveKit plugins
load_dotenv()

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import openai, silero
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
    
    # Create agent following the official pattern with VAD for streaming STT
    agent = Agent(
        instructions=PERNILLA_INSTRUCTIONS,
        vad=silero.VAD.load(),  # Voice Activity Detection for streaming
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=openai.TTS(voice="nova"),  # Female voice - other options: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
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
    
    # Set OpenAI API key
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    os.environ["OPENAI_API_KEY"] = openai_api_key
    
    logger.info("✅ OpenAI API key set successfully")
    
    logger.info("🚀 Starting Pernilla Voice Agent...")
    logger.info(f"📡 LiveKit URL: {os.environ.get('LIVEKIT_URL')}")
    
    # Run the agent worker following official pattern
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
