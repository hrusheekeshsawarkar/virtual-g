import stripe
from typing import Dict, Any
from ..config import settings

# Configure Stripe
stripe.api_key = settings.stripe_secret_key


async def create_payment_intent(amount_gbp: float, user_email: str, credits_to_purchase: int) -> Dict[str, Any]:
    """
    Create a Stripe PaymentIntent for purchasing credits.
    
    Args:
        amount_gbp: Amount in GBP (e.g., 1.0 for £1)
        user_email: User's email address
        credits_to_purchase: Number of credits being purchased
    
    Returns:
        Dictionary containing PaymentIntent data
    """
    try:
        # Convert GBP to pence (Stripe expects amounts in smallest currency unit)
        amount_pence = int(amount_gbp * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=amount_pence,
            currency='gbp',
            metadata={
                'user_email': user_email,
                'credits_to_purchase': str(credits_to_purchase),
                'type': 'credit_purchase'
            },
            description=f'Purchase of {credits_to_purchase} credits for {user_email}'
        )
        
        return {
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'amount': amount_pence,
            'currency': intent.currency
        }
    except stripe.error.StripeError as e:
        raise RuntimeError(f"Stripe error: {str(e)}")


async def verify_payment_webhook(payload: bytes, signature: str) -> Dict[str, Any]:
    """
    Verify and process Stripe webhook events.
    
    Args:
        payload: Raw webhook payload
        signature: Stripe signature header
    
    Returns:
        Event data if verification successful
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, settings.stripe_webhook_secret
        )
        return event
    except ValueError:
        raise RuntimeError("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise RuntimeError("Invalid signature")


def calculate_credit_price(credits: int) -> float:
    """
    Calculate the price for a given number of credits.
    Based on 1000 credits = £1.00
    
    Args:
        credits: Number of credits to purchase
    
    Returns:
        Price in GBP
    """
    return credits / 1000.0


def get_credit_packages() -> list[Dict[str, Any]]:
    """
    Get available credit packages.
    
    Returns:
        List of credit packages with pricing
    """
    packages = [
        {"credits": 1000, "price_gbp": 1.0, "popular": False},
        {"credits": 5000, "price_gbp": 4.5, "popular": True, "discount": "10% off"},
        {"credits": 10000, "price_gbp": 8.0, "popular": False, "discount": "20% off"},
        {"credits": 25000, "price_gbp": 18.75, "popular": False, "discount": "25% off"},
    ]
    
    return packages
