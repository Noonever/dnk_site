from pprint import pprint
from fastapi import APIRouter, HTTPException, Response
from ..db.user_data import update_user_data, get_user_data
from ..db.user import get_user_by_username, verify_user
from ..schemas.user_data import UserData
from .utils import convert_keys_to_camel_case

user_data_router = APIRouter(prefix='/user-data', tags=['user-data'])


@user_data_router.get("/", response_model=UserData)
async def get(username: str):
    user_data_dict = await get_user_data(username=username)
    if user_data_dict is None:
        raise HTTPException(status_code=404, detail="User not found")
    return convert_keys_to_camel_case(user_data_dict)


@user_data_router.put("/")
async def update(username: str, data: UserData):
    user = await get_user_by_username(username=username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await update_user_data(username=username, data=data.model_dump())
    new_user_data = await get_user_data(username=username)
    user_passports = [
        new_user_data['ru_passport'],
        new_user_data['by_passport'],
        new_user_data['kz_passport'],
        new_user_data['foreign_passport'],
    ]

    user_legal_entities = [
        new_user_data['self_employed_legal_entity'],
        new_user_data['individual_entrepreneur_legal_entity'],
        new_user_data['ooo_legal_entity'],
    ]

    for passport in user_passports:
        passport_filled = True
        pprint(passport)
        print('\n')
        data = passport['data']
        for value in passport.values():
            if value == '':
                passport_filled = False
                break
        for value in data.values():
            if value == '':
                passport_filled = False
                break
        if passport_filled:
            break
    
    print('passport_filled', passport_filled)

    for legal_entity in user_legal_entities:
        legal_entity_filled = True
        pprint(legal_entity)
        print('\n')
        for value in legal_entity.values():
            if value == '':
                legal_entity_filled = False
                break
        if legal_entity_filled:
            break
    
    print('legal_entity_filled', legal_entity_filled)

    if passport_filled and legal_entity_filled:
        await verify_user(username=username)

    return Response(status_code=200)
