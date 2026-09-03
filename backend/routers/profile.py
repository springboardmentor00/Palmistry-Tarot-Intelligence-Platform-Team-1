from fastapi import APIRouter, Depends, HTTPException
import jwt
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

from database import db
from routers.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# This Pydantic model perfectly matches Subham's React state!
class ProfilePayload(BaseModel):
    fullName: Optional[str] = ""
    birthDate: Optional[str] = None
    ageGroup: Optional[str] = "18–24"
    zodiacSign: Optional[str] = None
    relationshipStatus: Optional[str] = "Single"
    bio: Optional[str] = ""
    spiritualInterests: List[str] = []
    primaryLifeGoal: Optional[str] = ""
    secondaryGoals: List[str] = []
    guidanceAreas: List[str] = []
    readingDepth: Optional[str] = "standard"
    readingStyle: Optional[str] = "short"
    preferredTopics: List[str] = []
    dailyGuidance: bool = True
    readingReminders: bool = True
    insightUpdates: bool = True
    personalizedRecommendations: bool = True
    saveReadingHistory: bool = True

async def get_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
async def get_profile_data(user_id: str = Depends(get_user_id)):
    # Fetch User, Profile, and Preferences all at once
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"profile": True, "preferences": True}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    p = user.profile
    pref = user.preferences

    bdate = None
    if p and p.birthDate:
        bdate = p.birthDate.strftime("%Y-%m-%d")

    # Combine them back into the flat JSON structure the frontend expects
    return {
        "fullName": user.name,
        "birthDate": bdate,
        "ageGroup": p.ageGroup if p else "18-24",
        "zodiacSign": p.zodiacSign if p else "",
        "relationshipStatus": p.relationshipStatus if p else "Single",
        "bio": p.bio if p else "",
        "spiritualInterests": p.spiritualInterests if p else [],
        "primaryLifeGoal": p.primaryGoal if p else "",
        "secondaryGoals": p.secondaryGoals if p else [],
        "guidanceAreas": p.guidanceAreas if p else [],
        "preferredTopics": p.preferredTopics if p else [],
        "readingDepth": pref.readingDepth if pref else "standard",
        "readingStyle": pref.readingStyle if pref else "short",
        "dailyGuidance": pref.dailyGuidance if pref else True,
        "readingReminders": pref.readingReminders if pref else True,
        "insightUpdates": pref.insightUpdates if pref else True,
        "personalizedRecommendations": pref.personalizedRecommendations if pref else True,
        "saveReadingHistory": pref.saveReadingHistory if pref else True,
    }

@router.post("/")
async def update_profile_data(data: ProfilePayload, user_id: str = Depends(get_user_id)):
    parsed_date = None
    if data.birthDate:
        try:
            parsed_date = datetime.fromisoformat(data.birthDate.replace("Z", "+00:00"))
        except ValueError:
            pass

    # 1. Update User Table (Name syncs everywhere)
    if data.fullName:
        await db.user.update(where={"id": user_id}, data={"name": data.fullName})

    # 2. Update Profile Table
    profile_data = {
        "userId": user_id,
        "birthDate": parsed_date,
        "zodiacSign": data.zodiacSign,
        "relationshipStatus": data.relationshipStatus,
        "primaryGoal": data.primaryLifeGoal,
        "bio": data.bio,
        "ageGroup": data.ageGroup,
        "spiritualInterests": data.spiritualInterests,
        "secondaryGoals": data.secondaryGoals,
        "guidanceAreas": data.guidanceAreas,
        "preferredTopics": data.preferredTopics,
    }
    await db.profile.upsert(
        where={"userId": user_id},
        data={"create": profile_data, "update": profile_data}
    )

    # 3. Update Preferences Table
    pref_data = {
        "userId": user_id,
        "readingDepth": data.readingDepth,
        "readingStyle": data.readingStyle,
        "dailyGuidance": data.dailyGuidance,
        "readingReminders": data.readingReminders,
        "insightUpdates": data.insightUpdates,
        "personalizedRecommendations": data.personalizedRecommendations,
        "saveReadingHistory": data.saveReadingHistory,
    }
    await db.preference.upsert(
        where={"userId": user_id},
        data={"create": pref_data, "update": pref_data}
    )

    return {"success": True}