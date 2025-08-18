# 💳 Stripe Test Payment Guide

## 🔧 Test Mode Setup

Your Stripe integration is currently configured for **TEST MODE** using the test keys:
- **Publishable Key**: `pk_test_51RxVQCIcxomAZY1w...` 
- **Secret Key**: `sk_test_51RxVQCIcxomAZY1wMUk...`

## 💯 Stripe Test Card Numbers

Use these test card numbers to simulate different payment scenarios:

### ✅ **Successful Payments**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/28)
CVC: Any 3 digits (e.g., 123)
Name: Any name
```

### ❌ **Declined Payments**
```
Generic decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
Lost card: 4000 0000 0000 9987
Stolen card: 4000 0000 0000 9979
Expired card: 4000 0000 0000 0069
Incorrect CVC: 4000 0000 0000 0127
Processing error: 4000 0000 0000 0119
```

### 🔐 **3D Secure Authentication**
```
Authentication required: 4000 0025 0000 3155
Authentication fails: 4000 0000 0000 3220
```

## 🧪 Testing Workflow

### 1. **Trigger Payment Modal**
- Start a new chat
- Send multiple messages until credits run low
- Payment modal should appear automatically when credits < estimated usage

### 2. **Test Different Packages**
- 1,000 credits = £1.00
- 5,000 credits = £4.50 (10% off)
- 10,000 credits = £8.00 (20% off)
- 25,000 credits = £18.75 (25% off)

### 3. **Complete Test Payment**
- Select a credit package
- Use test card: `4242 4242 4242 4242`
- Enter any future expiry date
- Enter any CVC code
- Click "Pay"

### 4. **Verify Credit Addition**
- Payment should complete successfully
- Credits should be added to your account
- Credit balance should update in the sidebar
- You should be able to continue chatting

## 🐛 Common Issues & Solutions

### "Invalid Credentials" Error
This usually means:
1. **Webhook not set up** - Payments succeed but credits aren't added
2. **Wrong environment** - Using live keys instead of test keys
3. **Network error** - API call failed

### Fix Steps:
1. **Check your backend env file**:
   ```env

   ```

2. **Restart your backend server** after adding the env variables

3. **Test the payment API directly**:
   ```bash
   curl -X POST http://localhost:8000/api/payments/create-intent \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"credits": 1000}'
   ```

## 📊 Monitoring Test Payments

### Stripe Dashboard
1. Go to [Stripe Test Dashboard](https://dashboard.stripe.com/test/payments)
2. You should see test payments appearing here
3. Check payment status and details

### Backend Logs
Monitor your backend console for:
- Payment intent creation logs
- Webhook processing logs
- Credit update confirmations

## 🔄 Webhook Setup (Optional for Local Testing)

For production, you'll need webhooks. For local testing, credits are added immediately after payment completion.

### Local Webhook Testing with Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:8000/api/payments/webhook
```

## 🚀 Ready to Test!

1. **Make sure both backend and frontend are running**
2. **Use the test card numbers above**
3. **Check the Stripe dashboard for payment confirmations**
4. **Monitor your app for credit updates**

The payment flow should work seamlessly with the dark theme UI! 🎉
