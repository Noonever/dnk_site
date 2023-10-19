from pprint import pprint
from unittest import result
from fastapi import APIRouter, HTTPException
from fastapi.params import Body

from passlib.context import CryptContext

from ..schemas import UserAdd, UserLogin, UserOut
from ..db.user import add_user, get_user_by_username, get_all, delete_user, change_link_upload_permission

from .utils import convert_keys_to_camel_case

user_router = APIRouter(prefix="/user", tags=["user"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


@user_router.post("/")
async def add(user: UserAdd):
    user_to_add = {
        "_id": user.username,
        "nickname": user.nickname,
        "password_hash": hash_password(user.password),
        "is_verified": False,
        "is_admin": False,
        "link_upload": False
    }

    try:
        username = await add_user(user_to_add)
    except:
        raise HTTPException(status_code=400, detail="User already exists")

    return {"username": username}


@user_router.post("/login", response_model=UserOut)
async def login(user_data: UserLogin):

    user = await get_user_by_username(user_data.username)

    if user is None or not verify_password(user_data.password, user.get("password_hash")):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return convert_keys_to_camel_case(user)
    

@user_router.get("/", response_model=UserOut)
async def get_by_id(username: str):

    user = await get_user_by_username(username)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return convert_keys_to_camel_case(user)


@user_router.get('s', response_model=list[UserOut])
async def get():

    users = convert_keys_to_camel_case(await get_all())
    return users


@user_router.delete("/")
async def delete(username: str):
    result = await delete_user(username)
    if result == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@user_router.put("/link-permission")
async def change_link_permission(username: str):
    result = await change_link_upload_permission(username)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result
