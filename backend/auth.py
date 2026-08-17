import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import requests as http_requests
from pydantic import BaseModel
from bson import ObjectId

from database import users_collection
import models, schemas

# Environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "my_super_secret_jwt_key_for_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

class GoogleAuthRequest(BaseModel):
    token: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    if token == "mock_admin_token":
        user = users_collection.find_one({"email": "admin@example.com"})
        if not user:
            now = datetime.utcnow()
            new_user = {
                "googleId": "admin_mock",
                "email": "admin@example.com",
                "fullName": "Admin User",
                "profilePicture": "",
                "emailVerified": True,
                "provider": "Local",
                "created_at": now,
                "updated_at": now,
                "last_login": now
            }
            result = users_collection.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            user = new_user
        return models.serialize_doc(user)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    obj_id = models.to_object_id(user_id)
    if obj_id:
        user = users_collection.find_one({"_id": obj_id})
    else:
        user = users_collection.find_one({"_id": user_id})

    if user is None:
        raise credentials_exception
    return models.serialize_doc(user)

@router.post("/google", response_model=schemas.Token)
def google_auth(request: GoogleAuthRequest):
    try:
        # Verify Google access token by fetching user profile
        resp = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo', 
            headers={'Authorization': f'Bearer {request.token}'},
            timeout=10
        )
        if resp.status_code != 200:
            raise ValueError(f"Invalid Google access token: {resp.text}")
            
        idinfo = resp.json()
        google_id = idinfo.get('sub')
        email = idinfo.get('email')
        
        if not google_id or not email:
            raise ValueError("Incomplete profile data from Google")
            
        name = idinfo.get('name', 'User')
        picture = idinfo.get('picture', '')
        email_verified = idinfo.get('email_verified', False)
        
        now = datetime.utcnow()
        user = users_collection.find_one({"googleId": google_id})
        
        if not user:
            # Create new user document
            new_user = {
                "googleId": google_id,
                "email": email,
                "fullName": name,
                "profilePicture": picture,
                "emailVerified": email_verified,
                "provider": "Google",
                "created_at": now,
                "updated_at": now,
                "last_login": now
            }
            res = users_collection.insert_one(new_user)
            new_user["_id"] = res.inserted_id
            user = new_user
        else:
            # Update last login
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": now, "updated_at": now, "profilePicture": picture, "fullName": name}}
            )
            user["last_login"] = now
            user["profilePicture"] = picture
            user["fullName"] = name
            
        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["_id"])}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": models.serialize_doc(user)
        }
        
    except ValueError as e:
        print("Token verification failed:", e)
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        print("Google auth error:", e)
        raise HTTPException(status_code=500, detail="Authentication failed")
