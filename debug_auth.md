# Debug Authentication Issues - Step by Step Guide

## 🔍 **Debug Steps to Fix 401 Unauthorized Errors**

### **Step 1: Check if User is Logged In**

Open your browser's Developer Tools (F12) and run this in the Console:

```javascript
// Check if user has a token stored
console.log('Token:', localStorage.getItem('vg_token'));

// If token exists, check its content (don't run this in production)
const token = localStorage.getItem('vg_token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires:', new Date(payload.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Token expired:', payload.exp * 1000 < Date.now());
  } catch (e) {
    console.log('Invalid token format');
  }
}
```

### **Step 2: Test Login Process**

1. **Go to login page**: `http://localhost:3000/login`
2. **Try to login** with your credentials
3. **Check console** for any errors during login
4. **Check if token is saved** after successful login

### **Step 3: Test Backend Directly**

Test if the backend authentication is working:

```bash
# Test login directly
curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your-email@example.com&password=your-password"

# This should return: {"access_token": "...", "token_type": "bearer"}
```

### **Step 4: Test API with Valid Token**

If you get a token from Step 3, test it:

```bash
# Replace YOUR_TOKEN with the actual token from Step 3
curl -X GET "http://localhost:8000/api/chat/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Step 5: Check CORS**

Make sure your backend CORS settings allow the frontend:

```python
# In backend/app/main.py - should be:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 **Common Solutions**

### **Solution 1: User Not Logged In**

If there's no token in localStorage:
1. Go to `/login` page
2. Register a new account or login with existing credentials
3. Check if token appears in localStorage after login

### **Solution 2: Token Expired**

If token is expired:
1. Clear localStorage: `localStorage.clear()`
2. Go to `/login` and login again

### **Solution 3: JWT Secret Mismatch**

Check if JWT secret in backend env matches what was used to create tokens:
```bash
# In backend/env file:
JWT_SECRET_KEY=change_me_long_random
```

### **Solution 4: Backend Database Issue**

Check if MongoDB is running and has user data:
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/virtual_g

# Check users collection
db.users.find()
```

## 🚨 **Quick Fix Script**

Run this in your browser console to force re-login:

```javascript
// Clear all auth data and redirect to login
localStorage.clear();
window.location.href = '/login';
```

## 🔍 **Additional Debug Information**

Check these in browser Network tab:
1. **Request URL**: Should be `http://localhost:8000/api/...`
2. **Request Headers**: Should include `Authorization: Bearer ...`
3. **Response Status**: 401 means unauthorized, 500 means server error
4. **CORS Errors**: Look for CORS-related error messages

## 📞 **Need Help?**

If you're still getting 401 errors after these steps, please share:
1. **Console output** from Step 1 (token check)
2. **Network tab screenshot** showing the failed request
3. **Backend logs** when the request is made
4. **Whether login process works** (Step 2)
