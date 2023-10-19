from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, Form
from typing import List
from pydantic import BaseModel, ValidationError

from ..routers import release_router, user_router, file_router, user_data_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(release_router)
app.include_router(user_router)
app.include_router(file_router)
app.include_router(user_data_router)

