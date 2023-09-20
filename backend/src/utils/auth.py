from typing import Annotated
from fastapi import Cookie, HTTPException, Query
from ..schemas.user import UserOut
import jwt
from passlib.hash import bcrypt
from datetime import datetime, timedelta

# Replace this with your own secret key in production
SECRET_KEY = "mysecretkey"

# Replace this with your own database or storage mechanism
fake_db = []

# Function to hash the password
def hash_password(password):
    return bcrypt.hash(password)

# Function to generate a JWT token
def create_jwt_token(user_id):
    expiration = datetime.utcnow() + timedelta(days=30)
    payload = {
        "user_id": user_id,
        "exp": expiration
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Function to decode and verify JWT token
def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Token decode error")

# Add a user (you can store it in your database)
def add_user(login: str, password: str):
    hashed_password = hash_password(password)
    user = {
        "id": len(fake_db) + 1,
        "username": login,
        "password": hashed_password,
        "is_verified": False,
        "is_admin": False
    }
    fake_db.append(user)
    print(f"User added: {user}")

# Login and generate a JWT token
def login(login: str, password: str):
    print("from login", login, password)
    # Replace this with your own user validation logic
    if login == "admin" and bcrypt.verify(password, fake_db[0]["password"]):
        user_id = fake_db[0]["id"]
        token = create_jwt_token(user_id)
        return token

# Authenticate using JWT token from query parameter
async def authenticate(access_token: str = None):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Token not provided")
    
    payload = decode_jwt_token(access_token)
    user_id = payload["user_id"]

    # Replace this with your own user retrieval logic
    user = next((u for u in fake_db if u["id"] == user_id), None)

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return UserOut(**user)


# Assuming you have a user object with fields 'id' and 'password_hash'
def change_password(user, current_password, new_password):
    # Verify the current password
    if bcrypt.verify(current_password, user.password_hash):
        # Hash the new password
        new_password_hash = bcrypt.hash(new_password)

        # Update the user's password hash in the database
        user.password_hash = new_password_hash
        # Save the user object back to the database

        return True  # Password changed successfully
    else:
        return False  # Current password is incorrect