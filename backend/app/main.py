from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from .routes.auth import router as auth_router
from .routes.chat import router as chat_router
from .routes.usage import router as usage_router
from .routes.upload import router as upload_router
from .routes.sessions import router as sessions_router
from .routes.payments import router as payments_router
from .db import init_indexes
from pathlib import Path


def create_app() -> FastAPI:
    app = FastAPI(title="Virtual-G API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth_router, prefix="/api", tags=["auth"])
    app.include_router(chat_router, prefix="/api", tags=["chat"])
    app.include_router(usage_router, prefix="/api", tags=["usage"])
    app.include_router(upload_router, prefix="/api", tags=["upload"])
    app.include_router(sessions_router, prefix="/api", tags=["sessions"])
    app.include_router(payments_router, prefix="/api", tags=["payments"])

    # Static uploads (resolve relative to this file)
    uploads_dir = Path(__file__).parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    @app.on_event("startup")
    async def on_startup() -> None:
        await init_indexes()

    return app


app = create_app()


