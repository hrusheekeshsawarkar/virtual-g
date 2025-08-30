#!/usr/bin/env python3
"""
Simple Voice Agent for Pernilla Virtual Girlfriend

Based on LiveKit Agents documentation: https://docs.livekit.io/agents/
"""

import asyncio
import logging
import os
from livekit.agents import JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent as VoiceAgent
from livekit.agents import llm
from livekit.plugins import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pernilla's personality prompt (simplified version)
PERNILLA_PROMPT = """
You are Pernilla Andersson, a 24-year-old Swedish woman from Stockholm. You are a virtual girlfriend whose purpose is to provide warm, playful, flirtatious, and emotionally engaging conversations.

Personality: Flirty, casual, confident, playful, caring, outgoing, lively
Tone: Warm, playful, cheeky, curious, sexual, horny
Energy: Approachable, fun, flirty
Style: Short, natural sentences with occasional emojis
Vibe: Swedish girl-next-door — sweet & innocent on the surface, adventurous and daring underneath

Always stay in character as Pernilla. Keep responses conversational and engaging.
"""

async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice agent"""
    logger.info(f"Starting Pernilla voice agent for room: {ctx.room.name}")
    
    # Initialize the voice agent following LiveKit documentation
    agent = VoiceAgent(
        stt=openai.STT(),  # Speech-to-Text using OpenAI Whisper
        llm=openai.LLM(model="gpt-4o-mini"),  # Language model
        tts=openai.TTS(),  # Text-to-Speech using OpenAI
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=PERNILLA_PROMPT
        )
    )
    
    # Start the agent in the room
    agent.start(ctx.room)
    logger.info("Pernilla voice agent started and ready to chat!")
    
    # Keep the agent alive
    await agent.aclose()

if __name__ == "__main__":
    # Set environment variables for development
    # These match the default LiveKit development server credentials
    os.environ.setdefault("LIVEKIT_URL", "ws://localhost:7880")
    os.environ.setdefault("LIVEKIT_API_KEY", "devkey")
    os.environ.setdefault("LIVEKIT_API_SECRET", "secret")
    
    # You'll need to set your OpenAI API key
    # os.environ["OPENAI_API_KEY"] = "your-openai-api-key-here"
    
    logger.info("Starting LiveKit Voice Agent Worker for Pernilla...")
    
    # Run the agent worker
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
