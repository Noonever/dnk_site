from fastapi import APIRouter, UploadFile


file_router = APIRouter(prefix="/file", tags=["file"])

@file_router.post('/upload')
async def upload(file: UploadFile):
    file_id = "123"
    return file_id
