import re
from ..db import get_db


WORD_PATTERN = re.compile(r"\b\w+\b", re.UNICODE)


def count_words(text: str | None) -> int:
    if not text:
        return 0
    return len(WORD_PATTERN.findall(text))


async def update_user_credits(user_email: str, credits_to_deduct: int) -> bool:
    """
    Deduct credits from user's available balance and update usage tracking.
    
    Args:
        user_email: User's email address
        credits_to_deduct: Number of credits to deduct
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        db = get_db()
        
        # Deduct from available credits and track usage
        result = await db["users"].update_one(
            {"email": user_email},
            {
                "$inc": {
                    "credits_used": credits_to_deduct,
                    "credits_available": -credits_to_deduct
                }
            }
        )
        
        return result.modified_count > 0
        
    except Exception as e:
        print(f"Error updating user credits: {e}")
        return False


