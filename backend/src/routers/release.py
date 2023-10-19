import pprint
from typing_extensions import Annotated
from fastapi import APIRouter, Body, HTTPException, Response
from loguru import logger

from ..schemas import ReleaseUploadRequest, ReleaseRequestOut, ReleaseRequestUpdate

from ..db.release_requests import add_release_request, get_release_requests, get_release_request_by_id, update_release_request
from ..db.user import get_user_by_username
from ..db.user_data import get_user_data

from .utils import convert_keys_to_camel_case
from ..utils.wavFile import get_wav_duration, convert_wav_to_mp3
from ..utils.google_sheets import write_rows_to_google_sheet
from ..utils.yandex_disk import get_yadisk_api
from ..config import download_dir

release_router = APIRouter(prefix='/release', tags=['release'])
yadisk = get_yadisk_api()


@release_router.post('/request')
async def upload(request: ReleaseUploadRequest):
    user = await get_user_by_username(request.username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    release_request = request.model_dump()
    release_request['user_data'] = await get_user_data(username=request.username)
    release_id = await add_release_request(release_request=release_request)
    return {"id": str(release_id)}


@release_router.get('/request', response_model=ReleaseRequestOut)
async def get_request(id: str):
    request = await get_release_request_by_id(id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return convert_keys_to_camel_case(request)


@release_router.put('/request')
async def update_request(id: str, request: ReleaseRequestUpdate):
    request = await update_release_request(id, request.model_dump())
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return convert_keys_to_camel_case(request)


@release_router.get('/requests', response_model=list[ReleaseRequestOut])
async def get_requests():
    requests = await get_release_requests()
    return convert_keys_to_camel_case(requests)


@release_router.post('/requests')
async def upload_request(id: str):
    request = await get_release_request_by_id(id)
    print(request)


@release_router.post('/add-to-docs')
async def add_to_docs(id: str):
    data_rows = []

    request = await get_release_request_by_id(id)
    logger.debug(pprint.pformat(request))
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    request_data = request.get('data')
    release_title = request_data.get('title')
    release_imprint = request.get('imprint')
    release_date = request.get('date')

    if release_date is None or release_imprint is None:
        raise HTTPException(status_code=400, detail="Delivery date and imprint are required")
    
    tracks: list = request_data.get('tracks')

    username = request.get('username')
    user = await get_user_by_username(username)
    user_nickname = user.get('nickname')

    if len(tracks) ==  1:
        release_type = 'Single'
    elif 1 <= len(tracks) <= 6:
        release_type = 'EP'
    else:
        release_type = 'Full Length'

    artist_path = f'requests-media/{user_nickname}'
    source_path = f'{artist_path}/{release_title}'
    yadisk.create_service_dir(artist_path)
    yadisk.create_service_dir(source_path)
    source_public_link = yadisk.publish(source_path)

    cover_file_id = request_data['cover_file_id']
    yadisk.upload_file(download_dir / f'{cover_file_id}.jpg', f'{source_path}/cover.jpg')
    cover_public_link = yadisk.publish(f'{source_path}/cover.jpg')

    if release_type != 'Single':
        yadisk_media_dirs = {
            "wav": f'{source_path}/wav',
            "mp3": f'{source_path}/mp3',
            "lyrics": f'{source_path}/lyrics',
        }
        yadisk.create_service_dir(yadisk_media_dirs['wav'])
        yadisk.create_service_dir(yadisk_media_dirs['mp3'])
        yadisk.create_service_dir(yadisk_media_dirs['lyrics'])
    else:
        yadisk_media_dirs = {
            "wav": source_path,
            "mp3": source_path,
            "lyrics": source_path,
        }

    for index, track in enumerate(tracks):
        data_row = ["" for _ in range(44)]

        track_version_alias = f" ({track.get('version')})" if track.get('version') else ""
        track_title = f"{index+1:02}. {track.get('performers')} -{track.get('title')}{track_version_alias}"

        wav_file_id = track.get('wav_file_id')
        wav_file_path =  f"{yadisk_media_dirs['wav']}/{track_title}.wav"
        yadisk.upload_file(download_dir/f'{wav_file_id}.wav', wav_file_path)

        mp3_file_path = f"{yadisk_media_dirs['mp3']}/{track_title}.mp3"
        yadisk.upload_file(convert_wav_to_mp3(wav_file_id), mp3_file_path)

        text_file_id = track.get('text_file_id')
        if text_file_id is not None:
            text_file_path = f"{yadisk_media_dirs['lyrics']}/{track_title}.docx"
            yadisk.upload_file(download_dir/f'{text_file_id}.docx', text_file_path)

        if release_type != 'Single':
            wav_public_link = yadisk.publish(yadisk_media_dirs['wav'])
            mp3_public_link = yadisk.publish(yadisk_media_dirs['mp3'])
        else:
            wav_public_link = yadisk.publish(wav_file_path)
            mp3_public_link = yadisk.publish(mp3_file_path)
        
        data_row[0] = request.get('data').get('performers')
        data_row[1] = track.get('title')
        data_row[2] = track.get('version')
        data_row[3] = index + 1
        data_row[4] = request_data.get('title')
        data_row[5] = release_type
        data_row[6] = get_wav_duration(wav_file_id)
        data_row[7] = request.get('date')
        data_row[9] = track.get('music_authors_names')
        data_row[10] = track.get('lyricists_names', '')
        data_row[11] = 'Yes' if track.get('explicit') else 'No'
        data_row[14] = request_data.get('genre')
        data_row[15] = request_data.get('genre')
        data_row[16] = request.get('imprint')
        data_row[18] = wav_public_link
        data_row[19] = cover_public_link
        data_row[20] = mp3_public_link
        data_row[21] = source_public_link
        data_row[26] = track.get('preview')
        data_row[38] = '0' if track.get('is_cover') else '100'
        
        data_rows.append(data_row)

    write_rows_to_google_sheet(data_rows)
    await update_release_request(id, {'in_delivery_sheet': True})
    
    return Response(status_code=200)