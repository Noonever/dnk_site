from pydantic import BaseModel


class UserIn(BaseModel):
    username: str
    password: str
    

class UserOut(BaseModel):
    id: int
    username: str
    is_verified: bool
    is_admin: bool
