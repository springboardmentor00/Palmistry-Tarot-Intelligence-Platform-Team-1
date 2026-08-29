from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class ProfileUpdate(BaseModel):
    birthDate: Optional[str] = None  # Expecting ISO string like "1998-05-23T00:00:00Z"
    zodiacSign: Optional[str] = None
    relationshipStatus: Optional[str] = None
    primaryGoal: Optional[str] = None
    bio: Optional[str] = None


class ReadingCreate(BaseModel):
    readingType: str
    summary: str
    personalitySynthesis: Optional[str] = None
    rawData: Dict[str, Any]
