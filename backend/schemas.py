from pydantic import BaseModel


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict
