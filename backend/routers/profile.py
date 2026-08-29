from fastapi import APIRouter, Depends, HTTPException
import jwt
from datetime import datetime

from database import db
from schemas import ProfileUpdate
from routers.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/profile", tags=["Profile"])


# Helper dependency to extract user_id from the Next.js JWT token
async def get_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/")
async def get_profile(user_id: str = Depends(get_user_id)):
    profile = await db.profile.find_unique(where={"userId": user_id})
    if not profile:
        # Return empty template if they haven't filled it out yet
        return {
            "birthDate": None,
            "zodiacSign": None,
            "relationshipStatus": None,
            "primaryGoal": None,
            "bio": None,
        }
    return profile


@router.post("/")
async def update_profile(data: ProfileUpdate, user_id: str = Depends(get_user_id)):
    # Parse date if provided
    parsed_date = None
    if data.birthDate:
        try:
            # Handle Next.js ISO strings
            parsed_date = datetime.fromisoformat(data.birthDate.replace("Z", "+00:00"))
        except ValueError:
            pass

    # Prisma Upsert: Create it if it doesn't exist, update it if it does
    profile = await db.profile.upsert(
        where={"userId": user_id},
        data={
            "create": {
                "userId": user_id,
                "birthDate": parsed_date,
                "zodiacSign": data.zodiacSign,
                "relationshipStatus": data.relationshipStatus,
                "primaryGoal": data.primaryGoal,
                "bio": data.bio,
            },
            "update": {
                "birthDate": parsed_date,
                "zodiacSign": data.zodiacSign,
                "relationshipStatus": data.relationshipStatus,
                "primaryGoal": data.primaryGoal,
                "bio": data.bio,
            },
        },
    )
    return profile
