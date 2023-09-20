from fastapi import APIRouter, Response

from ..schemas import AlbumReleaseIn

releases = []

release_router = APIRouter(prefix='/release')

@release_router.post('/')
async def upload_album(album: AlbumReleaseIn):
    album = album.model_dump()
    for track in album["tracks"]:
        del track['file']
    album["id"] = len(releases)
    releases.append(album)
    return Response(status_code=200)

@release_router.delete('/')
async def delete_release():
    pass

@release_router.get('/')
async def get_releases(userId: str):
    return releases
