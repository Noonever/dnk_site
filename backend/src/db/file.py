from bson import ObjectId
from .utils import change_mongo_id_to_str
from .client import db
files = db['files']


async def add_file(file: dict) -> str:
    result = await files.insert_one(file)
    return str(result.inserted_id)


async def get_file_by_id(id: str) -> dict | None:
    try:
        result = await files.find_one({"_id": ObjectId(id)})
    except:
        return None
    if result is None:
        return None
    file = change_mongo_id_to_str([result])
    return file[0]
