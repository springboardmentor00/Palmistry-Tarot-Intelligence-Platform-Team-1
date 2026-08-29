from fastapi import APIRouter, Depends, HTTPException
import json

from database import db
from schemas import ReadingCreate
from routers.profile import get_user_id  # Reusing the auth helper we just made!

router = APIRouter(prefix="/api/readings", tags=["Readings"])


@router.post("/")
async def save_reading(data: ReadingCreate, user_id: str = Depends(get_user_id)):
    # Save the reading to PostgreSQL
    reading = await db.reading.create(
        data={
            "userId": user_id,
            "readingType": data.readingType,
            "summary": data.summary,
            "personalitySynthesis": data.personalitySynthesis,
            "rawData": json.dumps(
                data.rawData
            ),  # Stores the complex nested CV/Tarot data safely as a JSON string
        }
    )
    return reading


@router.get("/")
async def get_history(user_id: str = Depends(get_user_id)):
    # Fetch all past readings for this user, newest first
    readings = await db.reading.find_many(
        where={"userId": user_id}, order={"createdAt": "desc"}
    )
    return readings
