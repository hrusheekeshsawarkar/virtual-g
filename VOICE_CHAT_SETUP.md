# 🎤 Pernilla Voice Chat Setup Guide

This guide will help you set up the LiveKit WebRTC voice chat integration for your Pernilla virtual girlfriend application.

## 📋 Prerequisites

1. **OpenAI API Key** - Required for speech-to-text, text-to-speech, and language model
2. **LiveKit Server** - For WebRTC communication
3. **Python 3.13+** with virtual environment
4. **Node.js** for the frontend

## 🚀 Quick Setup (Development)

### 1. Install LiveKit Server

```bash
# macOS (using Homebrew)
brew install livekit

# Or download from https://github.com/livekit/livekit/releases
```

### 2. Start LiveKit Development Server

```bash
# Start LiveKit in development mode (provides default credentials)
livekit-server --dev
```

This starts the server on:
- **WebSocket**: `ws://localhost:7880`
- **HTTP**: `http://localhost:7880`
- **API Key**: `devkey`
- **API Secret**: `secret`

### 3. Set Environment Variables

Add to your `backend/env` file:

```bash
# LiveKit Configuration (Development)
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_WS_URL=ws://localhost:7880

# Required: OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies  
cd ../frontend
npm install
```

### 5. Start the Voice Agent

```bash
# Option 1: Standalone Pernilla agent (recommended for testing)
cd /path/to/virtual-g
OPENAI_API_KEY=your-key python pernilla_voice_agent.py dev

# Option 2: Integrated with your app
cd backend
python run_voice_agent.py dev
```

### 6. Start Your Application

```bash
# Backend (in one terminal)
cd backend
python -m uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm run dev
```

## 🎯 How It Works

### Architecture Overview

```
User Frontend ← WebRTC → LiveKit Server ← WebRTC → Pernilla Voice Agent
                            ↕
                      Your FastAPI Backend
```

### Voice Chat Flow

1. **User clicks "🎤 Voice Chat"** in your app
2. **Backend creates room** and generates access token
3. **Frontend connects** to LiveKit room via WebRTC
4. **Voice agent joins** the same room automatically
5. **Real-time conversation** begins:
   - User speaks → STT (Whisper) → LLM (GPT-4o-mini) → TTS (OpenAI) → User hears Pernilla

### API Endpoints

Your FastAPI backend now includes:

- `POST /api/voice/create-room` - Create voice chat room
- `GET /api/voice/rooms` - List available rooms  
- `POST /api/voice/end-session` - End voice session

## 🎨 Frontend Integration

The voice chat button is automatically added to your existing chat interface:

```tsx
// Already integrated in ChatWindow.tsx
<Button onClick={() => setShowVoiceChat(true)}>
  🎤 Voice Chat
</Button>
```

## 💰 Credit System Integration

Voice chat is integrated with your existing credit system:

- **100 credits minimum** to start voice chat
- **50 credits deducted** when session begins
- **Additional credits** based on conversation length
- **Same payment modal** as text chat

## 🔧 Advanced Configuration

### Custom System Prompt

The voice agent uses the same Pernilla personality from your `config.py`. To customize:

```python
# In backend/app/config.py
PROMPT = """
Your Pernilla character prompt here...
"""
```

### Production Deployment

For production, replace development credentials:

```bash
# Production LiveKit configuration
LIVEKIT_API_KEY=your-production-api-key
LIVEKIT_API_SECRET=your-production-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.com
```

Consider using [LiveKit Cloud](https://cloud.livekit.io) for production.

### Voice Customization

```python
# In your voice agent, you can customize:
agent = VoiceAgent(
    stt=openai.STT(),
    llm=openai.LLM(model="gpt-4"),  # Use GPT-4 for better responses
    tts=openai.TTS(voice="alloy"),  # Choose voice: alloy, echo, fable, onyx, nova, shimmer
    # ... rest of config
)
```

## 🧪 Testing

### Test Voice Agent Standalone

```bash
# Test the agent CLI
OPENAI_API_KEY=your-key python pernilla_voice_agent.py --help

# Start in development mode
OPENAI_API_KEY=your-key python pernilla_voice_agent.py dev

# Test with console (text-based testing)
OPENAI_API_KEY=your-key python pernilla_voice_agent.py console
```

### Test Complete Flow

1. Start LiveKit server: `livekit-server --dev`
2. Start voice agent: `python pernilla_voice_agent.py dev`
3. Start your backend: `uvicorn app.main:app --reload`
4. Start your frontend: `npm run dev`
5. Open browser, login, click "🎤 Voice Chat"

## 🐛 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Ensure you're in the virtual environment
source .venv/bin/activate
pip install -r requirements.txt
```

**2. "OpenAI API key required"**
```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-key-here
```

**3. "Connection refused" to LiveKit**
```bash
# Make sure LiveKit server is running
livekit-server --dev
```

**4. "No audio in browser"**
- Check browser microphone permissions
- Use HTTPS in production (required for WebRTC)

### Debug Mode

```bash
# Run with debug logging
LIVEKIT_LOG_LEVEL=debug python pernilla_voice_agent.py dev
```

## 📚 Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit Voice AI Quickstart](https://docs.livekit.io/agents/quickstart/)
- [OpenAI Voice API](https://platform.openai.com/docs/guides/text-to-speech)
- [WebRTC troubleshooting](https://docs.livekit.io/guides/troubleshooting/)

## 🎉 Next Steps

Once voice chat is working:

1. **Customize Pernilla's voice** with different TTS options
2. **Add voice commands** and tool calling
3. **Implement session recording** for conversation history
4. **Deploy to production** using LiveKit Cloud
5. **Add video chat** capabilities

---

**Note**: This integration maintains the same Pernilla personality and character from your text chat, ensuring a consistent experience across both modalities.
