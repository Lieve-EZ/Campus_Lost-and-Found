from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re

class MatchOut(BaseModel):
    item_id: str
    score: float

class UserLogin(BaseModel):
    username: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=200)

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    phone: str = Field(min_length=7, max_length=30)
    password: str = Field(min_length=8, max_length=200)

    @field_validator('username')
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r'[A-Za-z0-9_.-]{3,80}', value):
            raise ValueError('Username can use letters, numbers, dots, hyphens, and underscores.')
        return value

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', value):
            raise ValueError('Enter a valid email address.')
        return value

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str) -> str:
        value = value.strip()
        digits = re.sub(r'\D', '', value)
        if not re.fullmatch(r'\+?[0-9 ()-]{7,30}', value) or len(digits) < 7 or len(digits) > 15:
            raise ValueError('Enter a valid phone number.')
        return value

class UserOut(BaseModel):
    id: str
    username: str
    role: str

class UserSessionOut(BaseModel):
    token: str
    user: UserOut

class ItemCreate(BaseModel):
    kind: str = Field(pattern="^(lost|found)$")
    title: str = Field(min_length=1, max_length=160)
    desc: str = Field(min_length=1, max_length=5000)
    location: str | None = Field(default=None, max_length=200)
    reporter: str | None = Field(default=None, max_length=120)
    contact: str | None = Field(default=None, max_length=240)
    photo_key: str | None = Field(default=None, max_length=500)

class ItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    desc: str | None = Field(default=None, min_length=1, max_length=5000)
    location: str | None = Field(default=None, max_length=200)
    reporter: str | None = Field(default=None, max_length=120)
    contact: str | None = Field(default=None, max_length=240)
    kind: str | None = Field(default=None, pattern="^(lost|found)$")

class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    kind: str
    title: str
    description: str
    location: str | None
    reporter: str | None
    contact: str | None
    photo_key: str | None
    photo_url: str | None = None
    created_by: str | None = None
    posted_by: str | None = None
    created_at: datetime
    matches: list[MatchOut] = []
