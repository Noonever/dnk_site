def change_mongo_id_to_str(obj: list):
    for item in obj:
        item['id'] = str(item['_id'])
        del item['_id']
    return obj