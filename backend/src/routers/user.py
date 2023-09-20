from fastapi import Depends, HTTPException, APIRouter, Response

from ..schemas import UserIn, UserOut

user_router = APIRouter()

from ..utils.auth import add_user, login, authenticate

# API endpoints
@user_router.post("/add_user")
def create_user(user: UserIn):
    add_user(user.username, user.password)
    return {"message": "User created"}

@user_router.post("/login")
def user_login(user: UserIn):
    token = login(user.username, user.password)
    print("from login endpoint", user.model_dump(), token)
    if token:
        return token
    raise HTTPException(status_code=401, detail="Invalid credentials")

@user_router.get("/authenticate", response_model=UserOut)
async def get_authenticated_user(user: UserOut = Depends(authenticate)):
    return user

