from unittest import result

from ..utils.password import hash_password
from .client import db
from .utils import change_mongo_id_to_str
from .user_data import initialize_user_data

users = db['users']

async def add_user(user: dict) -> str:
    result = await users.insert_one(user)
    username = str(result.inserted_id)
    await initialize_user_data(username=username)
    return str(result.inserted_id)

async def verify_user(username: str):
    user = await get_user_by_username(username=username)
    user['is_verified'] = True
    user['_id'] = username
    del user['username']
    result = await users.replace_one({"_id": username}, user)
    return str(result.upserted_id)

async def get_user_by_username(username: str) -> dict | None:

    result = await users.find_one({"_id": username})
    if result is None:
        return None
    
    user = dict(result)
    user['username'] = str(user["_id"])
    del user["_id"]
    
    return user

async def get_all() -> list[dict]:

    result = users.find()
    data = await result.to_list(length=None)
    for user in data:
        user['username'] = str(user["_id"])
        del user["_id"]
        del user["password_hash"]
    return data


async def delete_user(username: str):
    result = await users.delete_one({"_id": username})
    return result.deleted_count


async def change_link_upload_permission(username: str):
    user = await get_user_by_username(username=username)
    if user is None:
        return
    print('user before', user)
    user['link_upload'] = not user['link_upload']
    user['_id'] = username
    del user['username']
    print('user after', user)
    result = await users.replace_one({"_id": username}, user)
    return str(result.upserted_id)


async def change_password(username: str, password: str):
    user = await get_user_by_username(username=username)
    if user is None:
        return None
    user['password_hash'] = hash_password(password)
    user['_id'] = username
    del user['username']
    result = await users.replace_one({"_id": username}, user)
    return str(result.upserted_id)
