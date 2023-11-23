from PIL import Image
from datetime import datetime
import shutil
from typing import Literal
from fastapi import APIRouter, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse

from ..db.file import add_file, get_file_by_id
from ..config import download_dir


file_router = APIRouter(prefix="/file", tags=["file"])


@file_router.post('/')
async def upload(file: UploadFile):
    upload_datetime = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")
    file_extension = file.filename.split(".")[-1]
    file_id = await add_file({'upload_datetime': upload_datetime, 'name': file.filename, 'extension': file_extension})
    
    try:
        download_dir.mkdir(parents=True, exist_ok=True)

        # Check if the file is an image
        if file_extension.lower() in ['jpeg', 'png', 'bmp', 'tiff', 'gif']:
            # Convert image to jpg
            image = Image.open(file.file)
            image = image.convert("RGB")
            filename = f'{file_id}.jpg'  # Change the file extension to jpg
            with open(download_dir/filename, 'wb') as buffer:
                image.save(buffer, format="JPEG")
        else:
            # Save the file as it is
            filename = f'{file_id}.{file_extension}'
            with open(download_dir/filename, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)

        return {"id": file_id}
    
    except:
        raise HTTPException(status_code=400, detail="Something went wrong")


@file_router.get('/')
async def download(id: str):
    file = await get_file_by_id(id)
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    file_name = f'{file.get("id")}.{file.get("extension")}'
    file_path = download_dir/file_name
    print(file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, headers={"Content-Disposition": f"attachment; filename={file_name}"})
