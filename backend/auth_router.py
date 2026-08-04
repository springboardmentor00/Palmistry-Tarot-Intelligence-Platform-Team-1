from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import jwt, JWTError

from security import (
    get_password_hash,
    verify_password,
    create_tokens,
    SECRET_KEY,
    ALGORITHM,
)
from database import get_db
from models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterSchema(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class RefreshSchema(BaseModel):
    refresh_token: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    # Check if email already exists in Postgres
    db_user = db.query(User).filter(User.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Save to database
    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        username=data.username,
        email=data.email,
        role=data.role or "user",
        hashed_password=get_password_hash(data.password),
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    # Query Postgres for the user
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Email or Password")

    access_token, refresh_token = create_tokens(user.id, user.role)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },
    }


@router.post("/refresh")
def refresh_token(data: RefreshSchema, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        new_access_token, new_refresh_token = create_tokens(user.id, user.role)
        return {"access_token": new_access_token, "refresh_token": new_refresh_token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.get("/me")
def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid access token")
