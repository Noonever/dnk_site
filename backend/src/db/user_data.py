from pprint import pprint
from .client import db
from ..schemas.user_data import initial_user_data
user_data = db['user_data']


async def initialize_user_data(username: str):
    user_data_entry = await get_user_data(username=username)
    if user_data_entry is None:
        new_user_data = initial_user_data.model_dump()
        new_user_data['_id'] = username
        result = await user_data.insert_one(new_user_data)
        return str(result.inserted_id)


async def update_user_data(username: str, data: dict):
    data['_id'] = username
    result = await user_data.replace_one({"_id": username}, data)
    return str(result.upserted_id)


async def get_user_data(username: str) -> dict | None:
    result = await user_data.find_one({"_id": username})
    if result is None:
        return None
    user_data_dict = dict(result)
    del user_data_dict["_id"]
    return user_data_dict

