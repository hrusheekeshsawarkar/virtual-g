from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from ..auth import get_current_user
from ..db import get_db
from ..config import settings
from ..schemas import (
    PaymentIntentRequest, 
    PaymentIntentResponse, 
    CreditPackage,
    CreditPurchaseResponse
)
from ..services.stripe_service import (
    create_payment_intent, 
    verify_payment_webhook,
    calculate_credit_price,
    get_credit_packages
)
import logging
import stripe

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/payments/packages", response_model=list[CreditPackage])
async def get_available_packages():
    """Get available credit packages for purchase."""
    return get_credit_packages()


@router.post("/payments/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent_endpoint(
    request: PaymentIntentRequest,
    current_user=Depends(get_current_user)
):
    """Create a Stripe PaymentIntent for purchasing credits."""
    try:
        # Calculate price based on credits
        price_gbp = calculate_credit_price(request.credits)
        
        # Create PaymentIntent
        intent_data = await create_payment_intent(
            amount_gbp=price_gbp,
            user_email=current_user["email"],
            credits_to_purchase=request.credits
        )
        
        return PaymentIntentResponse(**intent_data)
    
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payments/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events for payment confirmations."""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        # Verify webhook
        event = await verify_payment_webhook(payload, signature)
        
        # Handle successful payment
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            
            # Extract metadata
            user_email = payment_intent["metadata"]["user_email"]
            credits_to_purchase = int(payment_intent["metadata"]["credits_to_purchase"])
            
            # Add credits to user account
            db = get_db()
            
            # Update user's credits
            result = await db["users"].update_one(
                {"email": user_email},
                {
                    "$inc": {
                        "credits_available": credits_to_purchase,
                        "total_credits_purchased": credits_to_purchase
                    }
                }
            )
            
            if result.modified_count == 0:
                logger.error(f"Failed to update credits for user: {user_email}")
                raise HTTPException(status_code=404, detail="User not found")
            
            logger.info(f"Successfully added {credits_to_purchase} credits to user {user_email}")
        
        return JSONResponse(content={"status": "success"})
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payments/confirm")
async def confirm_payment(
    request: dict,
    current_user=Depends(get_current_user)
):
    """Confirm payment and add credits to user account."""
    try:
        payment_intent_id = request.get("payment_intent_id")
        if not payment_intent_id:
            raise HTTPException(status_code=400, detail="payment_intent_id is required")
            
        stripe.api_key = settings.stripe_secret_key
        
        # Retrieve payment intent from Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Check if payment succeeded
        if payment_intent.status != "succeeded":
            raise HTTPException(status_code=400, detail=f"Payment not completed. Status: {payment_intent.status}")
        
        # Check if this payment was already processed
        if payment_intent.metadata.get("processed") == "true":
            raise HTTPException(status_code=400, detail="Payment already processed")
        
        # Extract credits from metadata
        credits_to_purchase = int(payment_intent.metadata["credits_to_purchase"])
        user_email = payment_intent.metadata["user_email"]
        
        # Verify the payment is for the current user
        if user_email != current_user["email"]:
            raise HTTPException(status_code=403, detail="Payment not authorized for this user")
        
        # Add credits to user account
        db = get_db()
        result = await db["users"].update_one(
            {"email": user_email},
            {
                "$inc": {
                    "credits_available": credits_to_purchase,
                    "total_credits_purchased": credits_to_purchase
                }
            }
        )
        
        if result.modified_count == 0:
            logger.error(f"Failed to update credits for user: {user_email}")
            raise HTTPException(status_code=404, detail="User not found")
        
        # Mark payment as processed
        stripe.PaymentIntent.modify(
            payment_intent_id,
            metadata={"processed": "true"}
        )
        
        logger.info(f"Successfully added {credits_to_purchase} credits to user {user_email}")
        
        # Get updated user data
        updated_user = await db["users"].find_one({"email": user_email})
        
        return {
            "success": True,
            "credits_added": credits_to_purchase,
            "new_balance": updated_user.get("credits_available", 0),
            "total_purchased": updated_user.get("total_credits_purchased", 0)
        }
    
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/payments/balance")
async def get_credit_balance(current_user=Depends(get_current_user)):
    """Get user's current credit balance."""
    return {
        "credits_used": current_user.get("credits_used", 0),
        "credits_available": current_user.get("credits_available", 0),
        "total_credits_purchased": current_user.get("total_credits_purchased", 0)
    }
