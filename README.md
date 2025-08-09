# Virtual-G

A chat-based virtual girlfriend application built with modern web technologies.

## Features

- 🤖 **AI-Powered Chat**: Flirty conversations with OpenRouter API integration
- 🔐 **User Authentication**: Secure email/password registration and login
- 💬 **Session Management**: Multiple chat sessions with history
- 🖼️ **Image Support**: Send and receive images in conversations
- 📊 **Usage Tracking**: Word-based credit system
- 📱 **Mobile Responsive**: Beautiful dark theme with purple accents
- 🎨 **Modern UI**: Glass morphism design with smooth animations

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **FastAPI** (Python)
- **MongoDB** with Motor (async driver)
- **JWT Authentication**
- **OpenRouter API** for AI responses
- **Pydantic** for data validation

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB (local or cloud)
- OpenRouter API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp env.example env
   # Edit env file with your settings:
   # - MONGODB_URI=mongodb://localhost:27017
   # - JWT_SECRET_KEY=your-secret-key
   # - OPENROUTER_API_KEY=your-openrouter-key
   ```

5. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Environment Variables

### Backend (`backend/env`)
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=virtual_g
JWT_SECRET_KEY=your-long-random-secret-key
JWT_ALGORITHM=HS256
OPENROUTER_API_KEY=sk-or-your-api-key
OPENROUTER_MODEL=openrouter/auto
```

### Frontend (optional `.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - User login

### Chat
- `GET /api/chat/history` - Get default session history
- `POST /api/chat` - Send message (with optional session_id)

### Sessions
- `GET /api/sessions` - Get user's chat sessions
- `POST /api/sessions` - Create new chat session
- `DELETE /api/sessions/{id}` - Delete session
- `GET /api/sessions/{id}/history` - Get specific session history

### Other
- `GET /api/usage` - Get user's credit usage
- `POST /api/upload` - Upload images

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "credits_used": 150
}
```

### Chat Sessions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "user@example.com",
  "messages": [
    {
      "role": "user|ai",
      "content": "message content",
      "timestamp": "2024-01-01T00:00:00Z",
      "type": "text|image"
    }
  ]
}
```

## Project Structure

```
virtual-g/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Settings
│   │   ├── db.py            # Database connection
│   │   ├── auth.py          # Authentication
│   │   └── schemas.py       # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   └── env                  # Environment variables
├── frontend/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Credits

- Built with ❤️ using modern web technologies
- AI responses powered by OpenRouter
- Icons by Lucide
- UI inspired by modern chat applications
