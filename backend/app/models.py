from datetime import datetime
from typing import Literal, TypedDict, Optional


class UserDocument(TypedDict, total=False):
    _id: str
    email: str
    password_hash: str
    credits_used: int
    credits_available: int  # Available tokens that can be used
    total_credits_purchased: int  # Total credits ever purchased


MessageRole = Literal["user", "ai"]
MessageType = Literal["text", "image"]


class MessageDocument(TypedDict, total=False):
    role: MessageRole
    content: str
    timestamp: datetime
    type: MessageType


class ChatSessionDocument(TypedDict, total=False):
    _id: str
    user_id: str
    messages: list[MessageDocument]


