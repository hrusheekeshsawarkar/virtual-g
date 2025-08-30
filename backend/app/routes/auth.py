from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from ..db import get_db
from ..schemas import UserCreate, Token
from ..auth import hash_password, verify_password, create_access_token, get_current_user


router = APIRouter()


@router.post("/register", response_model=Token)
async def register_user(user: UserCreate):
    db = get_db()
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": user.email, 
        "password_hash": hash_password(user.password), 
        "credits_used": 0,
        "credits_available": 1000,  # Give new users 1000 free credits
        "total_credits_purchased": 0
    }
    await db["users"].insert_one(doc)
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(subject=form_data.username)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/debug/me")
async def debug_current_user(current_user=Depends(get_current_user)):
    """Debug endpoint to check if authentication is working"""
    return {
        "message": "Authentication working!",
        "user": current_user,
        "timestamp": "2025-01-30"
    }


