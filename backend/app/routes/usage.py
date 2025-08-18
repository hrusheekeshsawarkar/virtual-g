from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..schemas import UsageResponse


router = APIRouter()


@router.get("/usage", response_model=UsageResponse)
async def get_usage(current_user=Depends(get_current_user)):
    return {
        "credits_used": int(current_user.get("credits_used", 0)),
        "credits_available": int(current_user.get("credits_available", 0)),
        "total_credits_purchased": int(current_user.get("total_credits_purchased", 0))
    }


