from pydantic import BaseModel
from pydantic.alias_generators import to_camel
    

class UserLogin(BaseModel):
    username: str
    password: str


class UserAdd(UserLogin):
    nickname: str


class UserOut(BaseModel):
    username: str
    nickname: str
    is_verified: bool
    is_admin: bool
    link_upload: bool

    class Config:
        alias_generator = to_camel