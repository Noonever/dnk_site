from bson import ObjectId
from .client import db
from .utils import change_mongo_id_to_str

release_requests = db['release_requests']
processed_requests = db['processed_requests']


async def add_release_request(release_request: dict):
    result = await release_requests.insert_one(release_request)
    return result.inserted_id


async def add_processed_request(release_request: dict):
    result = await processed_requests.insert_one(release_request)
    return result.inserted_id


async def get_processed_requests(username: str):
    result = await processed_requests.find({"username": username}).to_list(None)
    requests = change_mongo_id_to_str(result)
    return requests


async def get_processed_request(id: str):
    result = await processed_requests.find_one({"_id": id})
    if result is None:
        return None
    request = change_mongo_id_to_str([result])
    return request[0]


async def get_release_requests():
    result = await release_requests.find().to_list(None)
    requests = change_mongo_id_to_str(result)
    return requests


async def get_release_request_by_id(id: str) -> dict | None:
    result = await release_requests.find_one({"_id": ObjectId(id)})
    if result is None:
        return None
    request = change_mongo_id_to_str([result])
    return request[0]


async def update_release_request(id: str, data: dict) -> dict | None:
    request = await get_release_request_by_id(id)
    if request is None:
        return None
    
    new_date: str = data.get('date', request.get('date'))
    new_imprint: str = data.get('imprint', request.get('imprint'))
    new_data: dict = data.get('data', request.get('data'))
    in_delivery_sheet: bool = data.get('in_delivery_sheet', request.get('in_delivery_sheet'))
    in_docs_sheet: bool = data.get('in_docs_sheet', request.get('in_docs_sheet'))
    new_cloud_link: str = data.get('cloud_link', request.get('cloud_link'))

    request['date'] = new_date
    request['imprint'] = new_imprint
    request['data'] = new_data
    request['in_delivery_sheet'] = in_delivery_sheet
    request['in_docs_sheet'] = in_docs_sheet
    request['cloud_link'] = new_cloud_link
    del request['id']

    await release_requests.replace_one({"_id": ObjectId(id)}, request)
    updated_release_request = await get_release_request_by_id(id)

    return updated_release_request
