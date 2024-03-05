import datetime
import enum
import pprint
from typing import Any, Union
from fastapi import APIRouter, HTTPException, Response
from loguru import logger

from ..schemas import ReleaseFileUploadRequest, ReleaseCloudUploadRequest, ReleaseFileRequestOut, ReleaseCloudRequestOut, ReleaseRequestUpdate

from ..db.release_requests import add_release_request, get_processed_request, get_processed_requests, get_release_requests, get_release_request_by_id, update_release_request, add_processed_request
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
async def upload(request: Union[ReleaseCloudUploadRequest, ReleaseFileUploadRequest]):
    user = await get_user_by_username(request.username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    release_request = request.model_dump()
    release_request['user_data'] = await get_user_data(username=request.username)
    release_id = await add_release_request(release_request=release_request)
    return {"id": str(release_id)}


@release_router.get('/request', response_model=Union[ReleaseFileRequestOut, ReleaseCloudRequestOut])
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


@release_router.get('/requests')
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
async def add_to_delivery(id: str):

    request = await get_release_request_by_id(id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    release_cloud_link: str = request.get('cloud_link')
    request_data = request.get('data')
    release_type = request.get('type')
    release_title = request_data.get('title')
    release_imprint = request.get('imprint')
    release_date = request.get('date')
    release_performers = request_data.get('performers')
    release_version = request_data.get('version')
    release_upc = request_data.get('upc', '')
    logger.info(f'release_type: {release_type}')

    if release_date is None or release_imprint is None:
        raise HTTPException(status_code=400, detail="Delivery date and imprint are required")

    data_rows = []
    processed_request = {}

    if release_type == 'clip':
        logger.debug('Not implemented: clip')
        return
    
    elif release_type == 'new-music' or release_type == 'back-catalog':   
        tracks: list = request_data.get('tracks')

        username = request.get('username')
        user = await get_user_by_username(username)
        user_nickname = user.get('nickname')

        if len(tracks) ==  1:
            release_name_type = 'Single'
        elif 1 <= len(tracks) <= 6:
            release_name_type = 'EP'
        else:
            release_name_type = 'Full Length'

        # cloud upload
        if release_cloud_link == '' or release_cloud_link is None:

            version_string = f' ({release_version})' if release_version else ''
            source_folder_public_name = f'{release_performers} - {release_title}{version_string}'
            
            artist_path = f'requests-media/{user_nickname}'
            source_path = f'{artist_path}/{source_folder_public_name}'
            yadisk.create_service_dir(artist_path)
            yadisk.create_service_dir(source_path)
            source_public_link = yadisk.publish(source_path)

            cover_file_id = request_data['cover_file_id']
            yadisk.upload_file(download_dir / f'{cover_file_id}.jpg', f'{source_path}/{release_performers} - {release_title}.jpg')
            cover_public_link = yadisk.publish(f'{source_path}/{release_performers} - {release_title}.jpg')

            if release_name_type != 'Single':
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
        else:
            source_public_link = release_cloud_link

        processed_tracks = []
        for index, track in enumerate(tracks):
            processed_track = track

            data_row = ["" for _ in range(44)]

            track_version_alias = f" ({track.get('version')})" if track.get('version') else ""
            track_title = f"{index+1:02}. {track.get('performers')} - {track.get('title')}{track_version_alias}"

            # ! cloud upload
            if release_cloud_link == '' or release_cloud_link is None:
                wav_file_id = track.get('wav_file_id')
                wav_file_public_path =  f"{yadisk_media_dirs['wav']}/{track_title}.wav"
                wav_file_local_path = download_dir/f'{wav_file_id}.wav'
                yadisk.upload_file(wav_file_local_path, wav_file_public_path)
                
                processed_track['wavLink'] = yadisk.publish(wav_file_public_path)
                del processed_track['wav_file_id']

                mp3_file_public_path = f"{yadisk_media_dirs['mp3']}/{track_title}.mp3"
                mp3_file_local_path = convert_wav_to_mp3(wav_file_id)
                yadisk.upload_file(mp3_file_local_path, mp3_file_public_path)

                text_file_id = track.get('text_file_id')
                del processed_track['text_file_id']
                processed_track['textLink'] = ''

                if text_file_id is not None:
                    text_file_public_path = f"{yadisk_media_dirs['lyrics']}/{track_title}.docx"
                    text_file_local_path = download_dir/f'{text_file_id}.docx'
                    yadisk.upload_file(text_file_local_path, text_file_public_path)
                    processed_track['textLink'] = yadisk.publish(text_file_public_path)
                    if text_file_local_path:
                        text_file_local_path.unlink(missing_ok=True)
            
                if release_type != 'Single':
                    wav_public_link = yadisk.publish(yadisk_media_dirs['wav'])
                    mp3_public_link = yadisk.publish(yadisk_media_dirs['mp3'])
                else:
                    wav_public_link = yadisk.publish(wav_file_public_path)
                    mp3_public_link = yadisk.publish(mp3_file_public_path)
                
            splitted_date = request.get('date').split('-')
            actual_date = f'{splitted_date[2]}.{splitted_date[1]}.{splitted_date[0]}'

            # ! cloud upload
            if release_cloud_link == '' or release_cloud_link is None:
                data_row[7] = get_wav_duration(wav_file_id)
                data_row[19] = wav_public_link
                data_row[20] = cover_public_link
                data_row[21] = mp3_public_link
                if wav_file_local_path:
                    wav_file_local_path.unlink(missing_ok=True)
                if mp3_file_local_path:
                    mp3_file_local_path.unlink(missing_ok=True)

            data_row[0] = release_performers
            data_row[1] = track.get('performers')
            data_row[2] = track.get('title')
            data_row[3] = track.get('version')
            data_row[4] = index + 1
            data_row[5] = request_data.get('title')
            data_row[6] = release_name_type
            data_row[8] = actual_date
            data_row[10] = track.get('music_authors_names')
            data_row[11] = track.get('lyricists_names', '')
            data_row[12] = 'Yes' if track.get('explicit') else 'No'
            data_row[13] = track.get('isrc', '')
            data_row[14] = release_upc
            data_row[15] = request_data.get('genre')
            data_row[16] = request_data.get('genre')
            data_row[17] = request.get('imprint')
            data_row[22] = source_public_link
            data_row[27] = track.get('preview', '0:00')
            data_row[39] = '0' if track.get('is_cover') else '100'
            
            data_rows.append(data_row)
            
            processed_tracks.append(processed_track)

        processed_request = request
        processed_request['data']['tracks'] = processed_tracks

        # ! cloud upload
        if release_cloud_link == '' or release_cloud_link is None:
            processed_request['data']['coverLink'] = cover_public_link
            del processed_request['data']['cover_file_id']
        
        del processed_request['id']
        processed_request['_id'] = id

        write_rows_to_google_sheet("Test", data_rows)
    
        await add_processed_request(processed_request)
        await update_release_request(id, {'in_delivery_sheet': True})

        return Response(status_code=200)

    else:
        raise HTTPException(status_code=404, detail="Release type") 

@release_router.post('/add-to-docs')
async def add_to_docs(id: str):

    request = await get_release_request_by_id(id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    current_user_data = await get_user_data(username=request.get('username'))

    user_releases_dicts = await get_processed_requests(username=request.get('username'))
    def parse_date(date_string):
    # Example format: "YYYY-MM-DD"
        return datetime.strptime(date_string, "%Y-%m-%d")

    # Assuming 'user_releases' is a list of dictionaries and each dictionary has a 'date' key.
    # We'll use the parse_date function to convert the date string to a datetime object for comparison.
    latest_release = max(user_releases_dicts, key=lambda x: parse_date(x['date'])) if user_releases_dicts else None
    latest_user_data = latest_release.get('user_data') if latest_release else None

    if current_user_data == latest_user_data:
        user_data_changed = False
    else:
        user_data_changed = True
    
    processed_request = await get_processed_request(id)
    if processed_request:
        cover_file_public_link = processed_request.get('data', {}).get('coverLink', "")
    else:
        cover_file_public_link = "Для подгрузки обложки необходимо добавить релиз в таблицу выгрузки"

    def error_response(error: str):
        raise HTTPException(status_code=400, detail=error)
    
    yadisk.create_service_dir('closed_docs')

    data_row: list[str] = ["" for _ in range(350)]

    request_data = request.get('data')
    release_type = request.get('type')
    release_authors = request.get('authors')
    release_date = request.get('date')
    release_performers = request_data.get('performers')

    release_author = request.get('user_data')
    release_author_passport_type = release_author.get('current_passport')
    release_author_legal_entity_type = release_author.get('current_legal_entity')

    match release_author_passport_type:
        case 'ru':
            release_author_passport = release_author.get('ru_passport').get('data')
            release_author_full_name = release_author_passport.get('full_name')
            data_row[82] = release_author_passport.get('full_name')
            data_row[83] = release_author_passport.get('birth_date')
            data_row[84] = release_author_passport.get('number')
            data_row[85] = release_author_passport.get('issued_by')
            data_row[86] = release_author_passport.get('issue_date')
            data_row[87] = release_author_passport.get('code')
            data_row[88] = release_author_passport.get('registration_address')
            data_row[89] = release_author_passport.get('snils')

        case 'kz':
            release_author_passport = release_author.get('kz_passport').get('data')
            release_author_full_name = release_author_passport.get('full_name')
            data_row[92] = release_author_full_name
            data_row[93] = release_author_passport.get('birth_date')
            data_row[94] = release_author_passport.get('number')
            data_row[95] = release_author_passport.get('number_id')
            data_row[96] = release_author_passport.get('issued_by')
            data_row[97] = release_author_passport.get('issue_date')
            data_row[98] = release_author_passport.get('end_date')
            data_row[99] = release_author_passport.get('registration_address')

        case 'by':
            release_author_passport = release_author.get('by_passport').get('data')
            release_author_full_name = release_author_passport.get('full_name')
            data_row[102] = release_author_full_name
            data_row[103] = release_author_passport.get('birth_date')
            data_row[104] = release_author_passport.get('number')
            data_row[105] = release_author_passport.get('issued_by')
            data_row[106] = release_author_passport.get('issue_date')
            data_row[107] = release_author_passport.get('registration_address')

        case 'foreign':
            release_author_passport = release_author.get('foreign_passport').get('data')
            release_author_full_name = release_author_passport.get('full_name')
            data_row[110] = release_author_full_name
            data_row[111] = release_author_passport.get('birth_date')
            data_row[112] = release_author_passport.get('number')
            data_row[113] = release_author_passport.get('number_id')
            data_row[114] = release_author_passport.get('issued_by')
            data_row[115] = release_author_passport.get('issue_date')
            data_row[116] = release_author_passport.get('registration_address')

    edo_dict = {
        "sbis": 'Да, в СБИС',
        "diadok": 'Да, в контур ДИАДОК',
        "both": "Да, в СБИС и ДИАДОК",
        "no": "Нет"
    }

    match release_author_legal_entity_type:
        case 'self':
            data_row[6] = 'Самозанятый'
            release_author_legal_entity = release_author.get('self_employed_legal_entity')
            data_row[17] = release_author_legal_entity.get('bank_name')
            data_row[18] = release_author_legal_entity.get('checking_account')
            data_row[19] = release_author_legal_entity.get('bik')
            data_row[20] = ""
            data_row[21] = release_author_legal_entity.get('correspondent_account')
            data_row[22] = release_author_legal_entity.get('inn')

        case 'individual':
            data_row[6] = 'ИП РФ'
            release_author_legal_entity = release_author.get('individual_entrepreneur_legal_entity')
            data_row[26] = release_author_legal_entity.get('full_name')
            data_row[27] = release_author_legal_entity.get('ogrnip')
            data_row[28] = release_author_legal_entity.get('registration_address')
            data_row[29] = release_author_legal_entity.get('inn')
            data_row[30] = release_author_legal_entity.get('bank_name')
            data_row[31] = release_author_legal_entity.get('checking_account')
            data_row[32] = release_author_legal_entity.get('bik')
            data_row[33] = ""
            data_row[34] = release_author_legal_entity.get('correspondent_account')
            data_row[35] = edo_dict[release_author_legal_entity.get('edo_availability')]

        case 'ooo':
            data_row[6] = 'ООО РФ'
            release_author_legal_entity = release_author.get('ooo_legal_entity')
            data_row[37] = release_author_legal_entity.get('entity_name')
            data_row[38] = release_author_legal_entity.get('director_full_name')
            data_row[39] = release_author_legal_entity.get('ogrn')
            data_row[40] = release_author_legal_entity.get('inn')
            data_row[41] = release_author_legal_entity.get('kpp')
            data_row[42] = release_author_legal_entity.get('legal_address')
            data_row[43] = release_author_legal_entity.get('actual_address')
            data_row[44] = release_author_legal_entity.get('bank_name')
            data_row[45] = release_author_legal_entity.get('checking_account')
            data_row[46] = release_author_legal_entity.get('bik')
            data_row[47] = ""
            data_row[48] = release_author_legal_entity.get('correspondent_account')
            data_row[49] = edo_dict[release_author_legal_entity.get('edo_availability')]

        case 'foreign':
            data_row[6] = 'Иностранное юр. лицо'
            release_author_legal_entity = release_author.get('foreign_legal_entity')
            # TODO
    
    authors_full_names = {
        'performers': set(),
        'music_authors': set(),
        'lyricists': set(),
        'phonogram_producers': set()
    }
    
    if release_type == 'clip':

        release_name_type = 'Видеоклип'
        
        authors_full_names['performers'].update(request_data.get('performers_names').split(', '))
        authors_full_names['music_authors'].update(request_data.get('music_authors_names').split(', '))
        authors_full_names['lyricists'].update(request_data.get('lyricists_names').split(', '))
        authors_full_names['phonogram_producers'].update(request_data.get('phonogram_producers_names').split(', '))

        data_row[139] = request_data.get('performers')
        data_row[140] = request_data.get('title')
        data_row[141] = request_data.get('lyricists_names')
        data_row[142] = request_data.get('music_authors_names')
        data_row[143] = request_data.get('phonogram_producers_names')
        data_row[144] = request_data.get('directors_names')
        data_row[145] = ""
        data_row[146] = release_date

    elif release_type == 'new-music' or release_type == 'back-catalog':

        tracks: list = request_data.get('tracks')
        tracks_enumed_titles = []
        tracks_enumed_durations = []
        tracks_enumed_music_authors = []
        tracks_enumed_lyricists = []
        tracks_enumed_phonogram_producers = []

        for i, track in enumerate(tracks):
            track_performers_names = track.get('performers_names').split(', ')
            track_music_authors_names = track.get('music_authors_names').split(', ')
            track_lyricists_names = track.get('lyricists_names').split(', ')
            track_phonogram_producers_names = track.get('phonogram_producers_names').split(', ')

            authors_full_names['performers'].update(track_performers_names)
            authors_full_names['music_authors'].update(track_music_authors_names)
            authors_full_names['lyricists'].update(track_lyricists_names)
            authors_full_names['phonogram_producers'].update(track_phonogram_producers_names)

            tracks_enumed_titles.append(f"{i + 1}. {track.get('title')}")

            wav_file_id = track.get('wav_file_id')
            if wav_file_id != '':
                track_duration = get_wav_duration(wav_file_id)
                if track_duration is None:
                    track_duration = 0
                tracks_enumed_durations.append(f"{i + 1}. {track_duration}")
            else:
                tracks_enumed_durations.append(f"{i + 1}. -")
            
            tracks_enumed_music_authors.append(f"{i + 1}. {', '.join(track_music_authors_names) if track_music_authors_names else "-"}") 
            tracks_enumed_lyricists.append(f"{i + 1}. {', '.join(track_lyricists_names) if track_lyricists_names else '-'}")
            tracks_enumed_phonogram_producers.append(f"{i + 1}. {', '.join(track_phonogram_producers_names) if track_phonogram_producers_names else '-'}")

        tracks_enumed_titles_string = "\n".join(tracks_enumed_titles)
        tracks_enumed_durations_string = "\n".join(tracks_enumed_durations)
        tracks_enumed_music_authors_string = "\n".join(tracks_enumed_music_authors)
        tracks_enumed_lyricists_string = "\n".join(tracks_enumed_lyricists)
        tracks_enumed_phonogram_producers_string = "\n".join(tracks_enumed_phonogram_producers)

        if len(tracks) ==  1:
            release_name_type = 'Сингл'
            if release_type == 'new-music':
                track = tracks[0]
                data_row[119] = request_data.get('performers')
                data_row[120] = request_data.get('title')
                data_row[121] = track.get('lyricists_names')
                data_row[122] = track.get('music_authors_names')
                data_row[123] = track.get('phonogram_producers_names')
                data_row[124] = track.get('performers_names')
                data_row[125] = get_wav_duration(track.get('wav_file_id'))
                data_row[126] = cover_file_public_link
                data_row[127] = release_date

        else:
            release_name_type = 'Альбом / EP'
            if release_type == 'new-music':
                data_row[129] = request_data.get('performers')
                data_row[130] = request_data.get('title')
                data_row[131] = tracks_enumed_titles_string
                data_row[132] = tracks_enumed_lyricists_string
                data_row[133] = tracks_enumed_music_authors_string
                data_row[134] = tracks_enumed_phonogram_producers_string
                data_row[135] = tracks_enumed_durations_string
                data_row[136] = cover_file_public_link
                data_row[137] = release_date

        if release_type == 'back-catalog':
            data_row[148] = request_data.get('performers')
            data_row[149] = tracks_enumed_titles_string
            data_row[150] = tracks_enumed_lyricists_string
            data_row[151] = tracks_enumed_music_authors_string
            data_row[152] = tracks_enumed_phonogram_producers_string
            data_row[153] = tracks_enumed_durations_string
            data_row[154] = cover_file_public_link
            data_row[155] = release_date 


    specific_authors = {
        "music_authors": {
            "scans": [],
            "ru": [None, None, None],
            "foreign": [None, None, None],
        },
        "lyricists": {
            "scans": [],
            "ru": [None, None, None],
            "foreign": [None, None, None],    
        },
        "phonogram_producers": {
            "scans": [],
            "ru": [None, None],
            "foreign": [None, None],
        }
    }

    def assign_to_none(collection: list, value: Any):
        new_collection = collection
        for index, item in enumerate(collection):
            if item is None:
                new_collection[index] = value
                return new_collection
        error_response(f"Недостаточно места в таблице")

    release_author_roles = []
    for role, names in authors_full_names.items():
        if release_author_full_name in names:
            release_author_roles.append(role)
    
    release_author_data = {
        "license_or_alienation": False,
        "payment_type": "release_author",
        "payment_value": "",
        "passport_type": release_author_passport_type,
        "passport": release_author_passport
    }
    for role in release_author_roles:
        if release_author_passport_type == 'ru':
            specific_authors[role]['ru'] = assign_to_none(specific_authors[role]['ru'], release_author_data)
        else:
            specific_authors[role]['foreign'] = assign_to_none(specific_authors[role]['foreign'], release_author_data)

    for author in release_authors:
        author_fullname = author.get('full_name')
        author_data = author.get('data')
        author_roles = []
        
        for role, names in authors_full_names.items():
            if author_fullname in names:
                author_roles.append(role)

        if not author_roles:
            error_response(f"Не удалось определить роль исполнителя {author_fullname}")

        for role in author_roles:
            if role == 'performers':
                continue

            if type(author_data) == str:
                specific_authors[role]['scans'].append(author_data)
            else:
                passport_type = author_data.get('passport_type')
                if passport_type == 'ru':
                    specific_authors[role]['ru'] = assign_to_none(specific_authors[role]['ru'], author_data)
                else:
                    specific_authors[role]['foreign'] = assign_to_none(specific_authors[role]['foreign'], author_data)

    data_row[0] = release_date
    data_row[1] = release_performers
    data_row[2] = len(authors_full_names.get('performers', []))
    data_row[3] = ", ".join(list(authors_full_names.get('performers')))
    data_row[4] = "Да" if user_data_changed else "Нет"
    data_row[5] = release_name_type
    
    data_row[7] = release_author.get('email')
    data_row[8] = release_author.get('socials')

    def add_scans_authors_sections(col_index: int, scans_ids: list[str]):
        public_paths = []
        for scan_id in scans_ids:
            scan_local_path = download_dir/f'{scan_id}.jpg'
            scan_cloud_path = f'closed_docs/{scan_id}.jpg'
            yadisk.upload_file(scan_local_path, scan_cloud_path)
            public_path = yadisk.publish(scan_cloud_path)
            public_paths.append(public_path)
        data_row[col_index] = ", ".join(public_paths) if public_paths else ""

    payment_type_mapping = {
        "royalty": "Роялти",
        "sum": "Фикс. сумма",
        "free": "Безвозмездно",
        "other": "Другое",
        "release_author": "Автор релиза"
    }

    def add_ru_authors_sections(starting_index: int, specific_authors: list[dict]):
        for specific_author in specific_authors:
            if specific_author is None:
                break
            specific_author_passport = specific_author.get('passport')
            list_to_add = ["" for _ in range(11)]
            list_to_add[0] = specific_author_passport.get('full_name')
            list_to_add[1] = specific_author_passport.get('birth_date')
            list_to_add[2] = specific_author_passport.get('number')
            list_to_add[3] = specific_author_passport.get('issued_by')
            list_to_add[4] = specific_author_passport.get('issue_date')
            list_to_add[5] = specific_author_passport.get('code')
            list_to_add[6] = specific_author_passport.get('registration_address')
            list_to_add[7] = ""
            list_to_add[8] = 'Лицензия' if specific_author['license_or_alienation'] else 'Отчуждение'
            payment_type_string = payment_type_mapping[specific_author.get('payment_type')]
            list_to_add[9] = payment_type_string + ' ' + specific_author.get('payment_value')
            list_to_add[10] = ""

            for element in list_to_add:
                data_row[starting_index] = element
                starting_index += 1


    def add_foreign_authors_sections(starting_index: int, specific_authors: list[dict]):
        for specific_author in specific_authors:
            if specific_author is None:
                break
            specific_author_passport = specific_author.get('passport')
            list_to_add = ["" for _ in range(12)]
            list_to_add[0] = specific_author_passport.get('full_name')
            list_to_add[1] = specific_author_passport.get('birth_date')
            list_to_add[2] = specific_author_passport.get('number')
            list_to_add[3] = specific_author_passport.get('id_number')
            list_to_add[4] = specific_author_passport.get('issued_by')
            list_to_add[5] = specific_author_passport.get('issue_date')
            list_to_add[6] = specific_author_passport.get('end_date')
            list_to_add[7] = specific_author_passport.get('registration_address')
            list_to_add[8] = ""
            list_to_add[9] = 'Лицензия' if specific_author['license_or_alienation'] else 'Отчуждение'
            payment_type_string = payment_type_mapping[specific_author.get('payment_type')]
            list_to_add[10] = payment_type_string + ' ' + specific_author.get('payment_value')
            list_to_add[11] = ""

            for element in list_to_add:
                data_row[starting_index] = element
                starting_index += 1


    add_ru_authors_sections(160, specific_authors['music_authors']['ru'])
    add_foreign_authors_sections(193, specific_authors['music_authors']['foreign'])
    add_scans_authors_sections(158, specific_authors['music_authors']['scans'])

    add_ru_authors_sections(232, specific_authors['lyricists']['ru'])
    add_foreign_authors_sections(265, specific_authors['lyricists']['foreign'])
    add_scans_authors_sections(230, specific_authors['lyricists']['scans'])

    add_ru_authors_sections(304, specific_authors['phonogram_producers']['ru'])
    add_foreign_authors_sections(326, specific_authors['phonogram_producers']['foreign'])
    add_scans_authors_sections(302, specific_authors['phonogram_producers']['scans'])
    
    write_rows_to_google_sheet('Test_Docs', [data_row])
