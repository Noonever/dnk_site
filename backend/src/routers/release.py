import pprint
import re
from fastapi import APIRouter, HTTPException, Response
from loguru import logger

from ..schemas import ReleaseUploadRequest, ReleaseRequestOut, ReleaseRequestUpdate

from ..db.release_requests import add_release_request, get_processed_requests, get_release_requests, get_release_request_by_id, update_release_request, add_processed_request
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
    pprint.pprint(request.model_dump())
    request = await update_release_request(id, request.model_dump())
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return convert_keys_to_camel_case(request)


@release_router.get('/requests', response_model=list[ReleaseRequestOut])
async def get_requests():
    requests = await get_release_requests()
    return convert_keys_to_camel_case(requests)


@release_router.get('/processed-requests')
async def get_processed(username: str):
    requests = await get_processed_requests(username=username)
    return convert_keys_to_camel_case(requests)


@release_router.post('/requests')
async def upload_request(id: str):
    request = await get_release_request_by_id(id)
    print(request)


@release_router.post('/add-to-delivery')
async def add_to_docs(id: str):
    data_rows = []

    request = await get_release_request_by_id(id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    request_data = request.get('data')
    release_type = request.get('type')
    release_title = request_data.get('title')
    release_imprint = request.get('imprint')
    release_date = request.get('date')

    release_upc = request_data.get('upc', '')

    logger.info(f'release_type: {release_type}')

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

    processed_tracks = []

    for index, track in enumerate(tracks):
        processed_track = track

        data_row = ["" for _ in range(44)]

        track_version_alias = f" ({track.get('version')})" if track.get('version') else ""
        track_title = f"{index+1:02}. {track.get('performers')} - {track.get('title')}{track_version_alias}"

        wav_file_id = track.get('wav_file_id')
        wav_file_path =  f"{yadisk_media_dirs['wav']}/{track_title}.wav"
        yadisk.upload_file(download_dir/f'{wav_file_id}.wav', wav_file_path)

        processed_track['wavLink'] = yadisk.publish(wav_file_path)
        del processed_track['wav_file_id']

        mp3_file_path = f"{yadisk_media_dirs['mp3']}/{track_title}.mp3"
        yadisk.upload_file(convert_wav_to_mp3(wav_file_id), mp3_file_path)

        text_file_id = track.get('text_file_id')
        del processed_track['text_file_id']
        processed_track['textLink'] = ''
        if text_file_id is not None:
            text_file_path = f"{yadisk_media_dirs['lyrics']}/{track_title}.docx"

            yadisk.upload_file(download_dir/f'{text_file_id}.docx', text_file_path)
            processed_track['textLink'] = yadisk.publish(text_file_path)
        
        if release_type != 'Single':
            wav_public_link = yadisk.publish(yadisk_media_dirs['wav'])
            mp3_public_link = yadisk.publish(yadisk_media_dirs['mp3'])
        else:
            wav_public_link = yadisk.publish(wav_file_path)
            mp3_public_link = yadisk.publish(mp3_file_path)
        
        splitted_date = request.get('date').split('-')
        actual_date = f'{splitted_date[2]}.{splitted_date[1]}.{splitted_date[0]}'

        data_row[0] = request.get('data').get('performers')
        data_row[1] = track.get('performers')
        data_row[2] = track.get('title')
        data_row[3] = track.get('version')
        data_row[4] = index + 1
        data_row[5] = request_data.get('title')
        data_row[6] = release_type
        data_row[7] = get_wav_duration(wav_file_id)
        data_row[8] = actual_date
        data_row[10] = track.get('music_authors_names')
        data_row[11] = track.get('lyricists_names', '')
        data_row[12] = 'Yes' if track.get('explicit') else 'No'
        data_row[13] = track.get('isrc', '')
        data_row[14] = release_upc
        data_row[15] = request_data.get('genre')
        data_row[16] = request_data.get('genre')
        data_row[17] = request.get('imprint')
        data_row[19] = wav_public_link
        data_row[20] = cover_public_link
        data_row[21] = mp3_public_link
        data_row[22] = source_public_link
        data_row[27] = track.get('preview', '0:00')
        data_row[39] = '0' if track.get('is_cover') else '100'
        
        data_rows.append(data_row)
        
        processed_tracks.append(processed_track)

    processed_request = request
    processed_request['data']['tracks'] = processed_tracks
    processed_request['data']['coverLink'] = cover_public_link
    del processed_request['data']['cover_file_id']

    pprint.pprint(processed_request)

    write_rows_to_google_sheet(data_rows)
    
    await add_processed_request(processed_request)
    await update_release_request(id, {'in_delivery_sheet': True})
    
    return Response(status_code=200)
