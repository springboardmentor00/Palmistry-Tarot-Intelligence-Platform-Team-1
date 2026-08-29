from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
import bcrypt
from datetime import datetime, timedelta

# Import from our other files
from database import db
from schemas import UserRegister, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = "your-super-secret-jwt-key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    # 1. Check if email exists
    existing_user = await db.user.find_unique(where={"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # 2. Hash the password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    # 3. Save to PostgreSQL
    new_user = await db.user.create(
        data={
            "name": user.name,
            "email": user.email.lower(),
            "passwordHash": hashed_password,
            "role": user.role,
        }
    )

    # 4. Generate JWT
    token_data = {
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.user.find_unique(where={"email": form_data.username.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.checkpw(
        form_data.password.encode("utf-8"), user.passwordHash.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # 1. Decode the token to get the user ID (sub)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        # 2. Fetch the fresh user data directly from PostgreSQL
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found in database")

        # 3. Return the exact shape the frontend AuthUser interface expects
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            }
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
