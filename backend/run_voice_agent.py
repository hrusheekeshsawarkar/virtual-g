#!/usr/bin/env python3
"""
Voice Agent Worker for Virtual Girlfriend Chat

This script runs the LiveKit voice agent worker that handles voice interactions
with Pernilla. Run this separately from the main FastAPI server.

Usage:
    python run_voice_agent.py dev
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables manually
env_file = Path(__file__).parent / "env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

# Import after setting environment
from app.services.livekit_service import start_agent_worker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting LiveKit Voice Agent Worker for Pernilla...")
    logger.info(f"LiveKit URL: {os.environ.get('LIVEKIT_WS_URL', 'ws://localhost:7880')}")
    
    try:
        start_agent_worker()
    except KeyboardInterrupt:
        logger.info("Voice agent worker stopped by user")
    except Exception as e:
        logger.error(f"Voice agent worker failed: {e}")
        raise
