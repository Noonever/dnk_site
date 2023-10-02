from typing import Literal, Optional, List, Union
from pydantic import BaseModel, Field


class NewMusicTrackUpload(BaseModel):
    performers: str = Field(alias="performers")
    title: str = Field(alias="title")
    version: str = Field(alias="version")
    explicit: bool = Field(alias="explicit", description="Explicit content flag")
    preview: str = Field(alias="preview", description="Preview URL")
    is_cover: bool = Field(alias="isCover", description="Is a cover version")
    wav_file_id: str = Field(alias="wavFileId", description="WAV audio file id")
    text_file_id: str = Field(alias="textFileId", description="Text file id")
    performers_names: str = Field(alias="performersNames")
    music_authors_names: str = Field(alias="musicAuthorsNames")
    lyricists_names: str = Field(alias="lyricistsNames")
    phonogram_producers_names: str = Field(alias="phonogramProducersNames")


class BackCatalogTrackUpload(NewMusicTrackUpload):
    isrc: str = Field(alias="ISRC")


class NewMusicReleaseUpload(BaseModel):
    performers: str = Field(alias="performers")
    title: str = Field(alias="title")
    version: str = Field(alias="version")
    genre: str = Field(alias="genre")
    cover_file_id: bytes = Field(alias="coverFileId", description="Cover image file id")
    tracks: List[NewMusicTrackUpload] = Field(alias="tracks")


class BackCatalogReleaseUpload(BaseModel):
    performers: str = Field(alias="performers")
    title: str = Field(alias="title")
    version: str = Field(alias="version")
    genre: str = Field(alias="genre")
    cover_file_id: bytes = Field(alias="coverFileId", description="Cover image file id")
    upc: str = Field(alias="UPC")
    date: str = Field(alias="date")
    source: str = Field(alias="source")
    tracks: List[BackCatalogTrackUpload] = Field(alias="tracks")


class ClipReleaseUpload(BaseModel):
    performers: str = Field(alias="performers")
    title: str = Field(alias="title")
    version: str = Field(alias="version")
    genre: str = Field(alias="genre")
    cover_file_id: bytes = Field(alias="coverFileId", description="Cover image file id")
    release_link: str = Field(alias="releaseLink")
    performers_names: str = Field(alias="performersNames")
    music_authors_names: str = Field(alias="musicAuthorsNames")
    lyricists_names: str = Field(alias="lyricistsNames")
    phonogram_producers_names: str = Field(alias="phonogramProducersNames")
    directors_names: str = Field(alias="directorsNames")


class ReleaseUploadRequest(BaseModel):
    user_id: str = Field(alias="userId")
    type: Literal["new-music", "back-catalog", "clip"]
    data: Union[NewMusicReleaseUpload, BackCatalogReleaseUpload, ClipReleaseUpload] = Field(alias="releaseData")
