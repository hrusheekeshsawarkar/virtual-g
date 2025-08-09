from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings


_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    client = get_client()
    return client[settings.database_name]


async def init_indexes() -> None:
    db = get_db()
    await db["users"].create_index("email", unique=True)
    await db["chat_sessions"].create_index("user_id")


