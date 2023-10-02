from fastapi import APIRouter, Response

from ..schemas import ReleaseUploadRequest

release_router = APIRouter(prefix='/release', tags=['release'])

@release_router.post('/upload-request')
async def upload(query: ReleaseUploadRequest):
    print(query.model_dump())
