from typing import Optional, List
from pydantic import BaseModel, Field


class Track(BaseModel):
    performer: str = Field(alias="performer")
    title: str = Field(alias="title")
    version: Optional[str] = Field(alias="version")
    music_author: str = Field(alias="musicAuthor")
    lyricist: Optional[str] = Field(alias="lyricist")
    phonogram_producer: str = Field(alias="phonogramProducer")
    explicit: bool = Field(alias="explicit")
    preview: str = Field(alias="preview")
    is_cover: bool = Field(alias="isCover")
    file: list[int] = Field(alias="file")

class AlbumReleaseIn(BaseModel):
    user_id: str = Field(alias="userId")
    type: str
    genre: str
    performer: str
    title: str
    version: Optional[str]
    tracks: List[Track] = Field(..., alias="tracks")

class AlbumReleaseUpdate(BaseModel):
    type: Optional[str]
    performer: Optional[str]
    title: Optional[str]
# class SingleReleaseIn(BaseModel):
#     genre: str = Field(alias="genre")
#     tracks: List[Track] = Field(alias="tracks")


