from typing import Literal, Optional, List, Union
from pydantic import BaseModel
from pydantic.alias_generators import to_camel, to_snake

from .user_data import RuPassportData, KzPassportData, ByPassportData, ForeignPassportData


class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = to_camel


class TrackFilesMixin(CamelCaseModel):
    wav_file_id: str
    text_file_id: Optional[str]


class CoverFileMixin(CamelCaseModel):
    cover_file_id: str


class VideoFileMixin(CamelCaseModel):
    video_file_id: str


class CloudLinkMixin(CamelCaseModel):
    cloud_link: str


class NewMusicTrackBaseUpload(CamelCaseModel):
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


class NewMusicTrackFilesUpload(NewMusicTrackBaseUpload, TrackFilesMixin):
    pass


class BackCatalogTrackBaseUpload(NewMusicTrackBaseUpload):
    isrc: str


class BackCatalogTrackFileUpload(BackCatalogTrackBaseUpload, TrackFilesMixin):
    pass


class NewMusicReleaseBaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    

class NewMusicReleaseFileUpload(CoverFileMixin, NewMusicReleaseBaseUpload):
    tracks: List[NewMusicTrackFilesUpload]


class NewMusicReleaseCloudUpload(NewMusicReleaseBaseUpload):
    tracks: List[NewMusicTrackBaseUpload]


class BackCatalogReleaseBaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    upc: str
    date: str
    

class BackCatalogReleaseFileUpload(CoverFileMixin, BackCatalogReleaseBaseUpload):
    tracks: List[BackCatalogTrackFileUpload]


class BackCatalogReleaseCloudUpload(BackCatalogReleaseBaseUpload):
    tracks: List[BackCatalogTrackBaseUpload]


class ClipReleaseBaseUpload(CamelCaseModel):
    performers: str
    title: str
    version: Optional[str]
    genre: str
    explicit: bool
    performers_names: str
    music_authors_names: str
    lyricists_names: Optional[str]
    phonogram_producers_names: str
    directors_names: str


class ClipReleaseFileUpload(CoverFileMixin, VideoFileMixin, ClipReleaseBaseUpload):
    pass


class ClipReleaseCloudUpload(ClipReleaseBaseUpload):
    pass


class AuthorDocs(CamelCaseModel):
    license_or_alienation: bool
    payment_type: Literal['royalty', 'free', 'sum', 'other']
    payment_value: str
    passport_type: Literal['foreign', 'kz', 'ru', 'by']
    passport: Union[ForeignPassportData, KzPassportData, RuPassportData, ByPassportData]


class Author(CamelCaseModel):
    full_name: str
    data: Union[AuthorDocs, str]


class ReleaseBaseUploadRequest(CamelCaseModel):
    username: str
    date: str = ''
    imprint: str = ''
    in_delivery_sheet: bool = False
    in_docs_sheet: bool = False
    status: Literal['pending', 'accepted', 'error'] = 'pending'
    type: Literal["new-music", "back-catalog", "clip"]
    cloud_link: Optional[str]
    authors: list[Author]


class ReleaseFileUploadRequest(ReleaseBaseUploadRequest):
    data: Union[BackCatalogReleaseFileUpload, NewMusicReleaseFileUpload, ClipReleaseFileUpload]


class ReleaseCloudUploadRequest(ReleaseBaseUploadRequest):
    data: Union[BackCatalogReleaseCloudUpload, NewMusicReleaseCloudUpload, ClipReleaseCloudUpload]
    cloud_link: str

class ReleaseFileRequestOut(ReleaseFileUploadRequest):
    id: str


class ReleaseCloudRequestOut(ReleaseCloudUploadRequest):
    id: str


class ReleaseRequestUpdate(CamelCaseModel):
    date: Optional[str]
    imprint: Optional[str]
    cloud_link: Optional[str]
    data: Union[BackCatalogReleaseFileUpload, NewMusicReleaseFileUpload, ClipReleaseFileUpload, BackCatalogReleaseCloudUpload, NewMusicReleaseCloudUpload, ClipReleaseCloudUpload]
