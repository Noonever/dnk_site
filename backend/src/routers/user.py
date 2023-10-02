from fastapi import Depends, HTTPException, APIRouter, Response

from ..schemas import UserIn, UserOut

user_router = APIRouter(prefix="/user", tags=["user"])

from ..utils.auth import add_user, login, authenticate

# API endpoints
@user_router.post("/add_user")
def create_user(user: UserIn):
    add_user(user.username, user.password)
    return {"message": "User created"}


