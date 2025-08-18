from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    credits_used: int
    credits_available: int
    total_credits_purchased: int


MessageRole = Literal["user", "ai"]
MessageType = Literal["text", "image"]


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime
    type: MessageType


class ChatRequest(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: ChatMessage
    session_id: str


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]


class UsageResponse(BaseModel):
    credits_used: int
    credits_available: int
    total_credits_purchased: int


class CreditPackage(BaseModel):
    credits: int
    price_gbp: float
    popular: bool = False
    discount: Optional[str] = None


class PaymentIntentRequest(BaseModel):
    credits: int


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int  # Amount in pence
    currency: str


class CreditPurchaseResponse(BaseModel):
    success: bool
    credits_added: int
    new_balance: int


