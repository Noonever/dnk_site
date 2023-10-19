from typing import Literal, Optional, List, Union
from pydantic import BaseModel
from pydantic.alias_generators import to_camel, to_snake

from .user_data import RuPassportData, KzPassportData, ByPassportData, ForeignPassportData


class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = to_camel


class NewMusicTrackUpload(CamelCaseModel):
    title: str 
    performers: str 
    version: Optional[str]
    explicit: bool
    preview: str
    is_cover: bool
    performers_names: str
    music_authors_names: str
    lyricists_names: Optional[str]
    phonogram_producers_names: str
    wav_file_id: str
    text_file_id: Optional[str]


class BackCatalogTrackUpload(NewMusicTrackUpload):
    isrc: str


class NewMusicReleaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    tracks: List[NewMusicTrackUpload]
    cover_file_id: str


class BackCatalogReleaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    upc: str
    date: str
    source: str
    tracks: List[BackCatalogTrackUpload]
    cover_file_id: str


class ClipReleaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    release_link: str
    performers_names: str
    music_authors_names: str
    lyricists_names: Optional[str]
    phonogram_producers_names: str
    directors_names: str
    cover_file_id: str


class AuthorDocs(CamelCaseModel):
    license_or_alienation: bool
    payment_type: Literal['royalty', 'free', 'sum', 'other']
    payment_value: str
    passport_type: Literal['foreign', 'kz', 'ru', 'by']
    passport: Union[ForeignPassportData, KzPassportData, RuPassportData, ByPassportData]


class Author(CamelCaseModel):
    full_name: str
    data: Union[AuthorDocs, str]


class ReleaseUploadRequest(CamelCaseModel):
    username: str
    date: str = ''
    imprint: str = ''
    in_delivery_sheet: bool = False
    status: Literal['pending', 'accepted', 'error'] = 'pending'
    type: Literal["new-music", "back-catalog", "clip"]
    data: Union[NewMusicReleaseUpload, BackCatalogReleaseUpload, ClipReleaseUpload]
    authors: list[Author]


class ReleaseRequestOut(ReleaseUploadRequest):
    id: str


class ReleaseRequestUpdate(CamelCaseModel):
    date: str
    imprint: str
    data: Union[NewMusicReleaseUpload, BackCatalogReleaseUpload, ClipReleaseUpload]
